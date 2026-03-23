import logging
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from typing import List, Optional

logger = logging.getLogger(__name__)
from datetime import datetime, timedelta

from database.connection import SessionLocal, get_db
from database.models import Admin, AdminSession, Order, OrderStatus, LoginAttempt
from database.schemas import AdminLogin, AdminResponse, AdminToken, AdminRegister, OrderResponse
from api.auth import hash_password, verify_password, create_admin_token, get_current_admin
from api.services.email import email_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Constants for IP blocking
MAX_FAILED_ATTEMPTS = 3
BLOCK_DURATION_MINUTES = 30

def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check for forwarded header (if behind proxy)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def check_ip_blocked(db, ip_address: str) -> bool:
    """Check if IP is blocked"""
    blocked = db.query(LoginAttempt).filter(
        LoginAttempt.ip_address == ip_address,
        LoginAttempt.is_blocked == True
    ).first()
    return blocked is not None

def check_ip_failed_attempts(db, ip_address: str) -> int:
    """Count failed attempts from IP in last hour"""
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    count = db.query(LoginAttempt).filter(
        LoginAttempt.ip_address == ip_address,
        LoginAttempt.success == False,
        LoginAttempt.is_blocked == False,
        LoginAttempt.created_at >= one_hour_ago
    ).count()
    return count

def block_ip(db, ip_address: str, username: str):
    """Block an IP after too many failed attempts"""
    attempt = LoginAttempt(
        ip_address=ip_address,
        username=username,
        success=False,
        is_blocked=True,
        failure_reason="Too many failed login attempts"
    )
    db.add(attempt)
    db.commit()
    logger.warning(f"IP {ip_address} has been BLOCKED due to too many failed attempts")

@router.post("/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin, request: Request, db: SessionLocal = Depends(get_db)):
    """Admin login endpoint with IP blocking"""
    client_ip = get_client_ip(request)
    
    # Check if IP is blocked
    if check_ip_blocked(db, client_ip):
        logger.warning(f"Blocked IP {client_ip} attempted to login")
        raise HTTPException(
            status_code=403, 
            detail="Your IP has been blocked due to too many failed login attempts. Please try again later or contact support."
        )
    
    admin = db.query(Admin).filter(Admin.username == credentials.username).first()
    
    if not admin:
        # Log failed attempt
        attempt = LoginAttempt(
            ip_address=client_ip,
            username=credentials.username,
            success=False,
            failure_reason="User not found"
        )
        db.add(attempt)
        db.commit()
        
        failed_count = check_ip_failed_attempts(db, client_ip)
        if failed_count >= MAX_FAILED_ATTEMPTS:
            block_ip(db, client_ip, credentials.username)
            raise HTTPException(
                status_code=403,
                detail="Too many failed login attempts. Your IP has been blocked."
            )
        
        logger.warning(f"Failed login attempt: user '{credentials.username}' not found from IP {client_ip}")
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not admin.is_active:
        logger.warning(f"Failed login attempt: user '{credentials.username}' is inactive")
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    if admin.locked_until and admin.locked_until > datetime.utcnow():
        logger.warning(f"Failed login attempt: user '{credentials.username}' account is locked")
        raise HTTPException(status_code=423, detail="Account is locked. Try again later.")
    
    if not verify_password(credentials.password, admin.password_hash):
        # Log failed attempt
        attempt = LoginAttempt(
            ip_address=client_ip,
            username=credentials.username,
            success=False,
            failure_reason="Incorrect password"
        )
        db.add(attempt)
        
        admin.failed_login_attempts += 1
        logger.warning(f"Failed login attempt: incorrect password for user '{credentials.username}' from IP {client_ip} (Attempt {admin.failed_login_attempts})")
        
        if admin.failed_login_attempts >= 5:
            logger.warning(f"Account locked due to too many failed attempts: user '{credentials.username}'")
            admin.locked_until = datetime.utcnow() + timedelta(minutes=30)
        
        # Check IP failed attempts
        failed_count = check_ip_failed_attempts(db, client_ip)
        if failed_count >= MAX_FAILED_ATTEMPTS:
            block_ip(db, client_ip, credentials.username)
            db.commit()
            raise HTTPException(
                status_code=403,
                detail="Too many failed login attempts. Your IP has been blocked."
            )
        
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Successful login
    admin.failed_login_attempts = 0
    admin.locked_until = None
    admin.last_login = datetime.utcnow()
    
    # Log successful attempt
    attempt = LoginAttempt(
        ip_address=client_ip,
        username=credentials.username,
        success=True
    )
    db.add(attempt)
    db.commit()
    
    logger.info(f"Successful login for user '{credentials.username}' from IP {client_ip}")
    token = create_admin_token(admin.id, db)
    
    return {
        "access_token": token,
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "role": admin.role
        }
    }


@router.post("/logout")
async def admin_logout(admin: Admin = Depends(get_current_admin)):
    """Admin logout endpoint"""
    db = SessionLocal()
    try:
        sessions = db.query(AdminSession).filter(
            AdminSession.admin_id == admin.id,
            AdminSession.is_active == True
        ).all()
        
        for session in sessions:
            session.is_active = False
        
        db.commit()
    finally:
        db.close()
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(admin: Admin = Depends(get_current_admin)):
    """Get current admin info"""
    return admin


@router.post("/register", response_model=dict)
async def register_admin(
    admin_data: AdminRegister,
    db: SessionLocal = Depends(get_db)
):
    """Register a new admin (first admin only, or by super_admin)"""
    existing = db.query(Admin).filter(
        (Admin.username == admin_data.username) | (Admin.email == admin_data.email)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hash_password(admin_data.password),
        full_name=admin_data.full_name,
        role="admin"
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return {"message": "Admin created successfully", "id": admin.id}

# ============== Protected Admin Data Endpoints ==============

@router.get("/orders", response_model=List[OrderResponse])
async def get_all_orders_admin(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Get all orders (admin only)"""
    query = db.query(Order)
    
    if status:
        try:
            status_enum = OrderStatus(status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            pass
    
    return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order_admin(
    order_id: int,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Get a specific order by ID (admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    new_status: str,
    assigned_truck_id: Optional[int] = None,
    background_tasks: BackgroundTasks = None,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Update order status (admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    previous_status = order.status.value
    
    try:
        order.status = OrderStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    if assigned_truck_id:
        order.assigned_truck_id = assigned_truck_id
    
    order.updated_at = datetime.utcnow()
    db.commit()
    
    # Send email notification if order is completed (in background)
    if new_status == "completed" and previous_status != "completed":
        order_dict = {
            "order_number": order.order_number,
            "customer_name": order.customer_name,
            "email": order.email,
            "phone": order.phone,
            "pickup_location": order.pickup_location,
            "delivery_location": order.delivery_location,
            "goods_type": order.goods_type,
            "cargo_weight": order.cargo_weight,
            "cargo_size": order.cargo_size,
            "preferred_date": order.preferred_date.isoformat() if order.preferred_date else None,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            "status": order.status.value
        }
        if background_tasks:
            background_tasks.add_task(email_service.send_order_completion, order_dict)
        else:
            # Fallback if no background tasks
            try:
                email_service.send_order_completion(order_dict)
            except Exception as e:
                logger.warning(f"Failed to send completion email: {e}")
    
    logger.info(f"Order #{order.order_number} status updated to {new_status} by admin")
    return {"message": "Order status updated", "order": order}


@router.get("/orders/search/{query}")
async def search_orders_admin(
    query: str,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Search orders by order number, customer name, email, or phone (admin only)"""
    search_pattern = f"%{query}%"
    orders = db.query(Order).filter(
        (Order.order_number.ilike(search_pattern)) |
        (Order.customer_name.ilike(search_pattern)) |
        (Order.email.ilike(search_pattern)) |
        (Order.phone.ilike(search_pattern)) |
        (Order.pickup_location.ilike(search_pattern)) |
        (Order.delivery_location.ilike(search_pattern))
    ).order_by(Order.created_at.desc()).limit(20).all()
    
    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "customer_name": order.customer_name,
            "email": order.email,
            "phone": order.phone,
            "pickup_location": order.pickup_location,
            "delivery_location": order.delivery_location,
            "goods_type": order.goods_type,
            "cargo_weight": order.cargo_weight,
            "cargo_size": order.cargo_size,
            "status": order.status.value,
            "preferred_date": order.preferred_date.isoformat() if order.preferred_date else None,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "assigned_truck_id": order.assigned_truck_id
        }
        for order in orders
    ]


# ============== Dashboard Endpoints ==============

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Get dashboard statistics"""
    from database.models import ContactMessage
    
    # Order stats
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).count()
    in_progress_orders = db.query(Order).filter(Order.status == OrderStatus.IN_PROGRESS).count()
    completed_orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()
    cancelled_orders = db.query(Order).filter(Order.status == OrderStatus.CANCELLED).count()
    
    # Customer stats
    unique_customers = db.query(Order.customer_email).distinct().count()
    
    # Contact messages
    unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
    total_messages = db.query(ContactMessage).count()
    
    # Security stats
    from datetime import timedelta
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    failed_logins_today = db.query(LoginAttempt).filter(
        LoginAttempt.success == False,
        LoginAttempt.created_at >= one_day_ago
    ).count()
    
    blocked_ips = db.query(LoginAttempt).filter(LoginAttempt.is_blocked == True).count()
    
    return {
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "in_progress": in_progress_orders,
            "completed": completed_orders,
            "cancelled": cancelled_orders
        },
        "customers": {
            "unique": unique_customers
        },
        "messages": {
            "unread": unread_messages,
            "total": total_messages
        },
        "security": {
            "failed_logins_today": failed_logins_today,
            "blocked_ips": blocked_ips
        }
    }


@router.get("/customers")
async def get_customers(
    skip: int = 0,
    limit: int = 50,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Get all unique customers from orders"""
    from sqlalchemy import func
    
    # Get unique customers from orders
    customers = db.query(
        Order.customer_name,
        Order.customer_email,
        Order.customer_phone,
        func.count(Order.id).label('order_count'),
        func.max(Order.created_at).label('last_order_date')
    ).group_by(
        Order.customer_name,
        Order.customer_email,
        Order.customer_phone
    ).order_by(func.max(Order.created_at).desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "name": c.customer_name,
            "email": c.customer_email,
            "phone": c.customer_phone,
            "order_count": c.order_count,
            "last_order_date": c.last_order_date.isoformat() if c.last_order_date else None
        }
        for c in customers
    ]


@router.get("/security/login-attempts")
async def get_login_attempts(
    limit: int = 50,
    blocked_only: bool = False,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Get login attempts and security info"""
    query = db.query(LoginAttempt)
    
    if blocked_only:
        query = query.filter(LoginAttempt.is_blocked == True)
    
    attempts = query.order_by(LoginAttempt.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": a.id,
            "username": a.username,
            "ip_address": a.ip_address,
            "success": a.success,
            "is_blocked": a.is_blocked,
            "failure_reason": a.failure_reason,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in attempts
    ]


@router.get("/messages")
async def get_messages(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Get contact messages"""
    from database.models import ContactMessage
    
    query = db.query(ContactMessage)
    
    if unread_only:
        query = query.filter(ContactMessage.is_read == False)
    
    messages = query.order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "subject": m.subject,
            "message": m.message,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in messages
    ]


@router.patch("/messages/{message_id}/read")
async def mark_message_read(
    message_id: int,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Mark a message as read"""
    from database.models import ContactMessage
    
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Message marked as read"}


@router.delete("/security/unblock/{ip_address}")
async def unblock_ip(
    ip_address: str,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Unblock an IP address"""
    attempts = db.query(LoginAttempt).filter(
        LoginAttempt.ip_address == ip_address,
        LoginAttempt.is_blocked == True
    ).all()
    
    if not attempts:
        raise HTTPException(status_code=404, detail="IP not found in blocked list")
    
    for attempt in attempts:
        attempt.is_blocked = False
    
    db.commit()
    
    return {"message": f"IP {ip_address} has been unblocked"}


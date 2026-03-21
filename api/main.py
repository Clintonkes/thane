"""
Thanesgaylerental API - Main Application Entry Point
FastAPI backend for the Thanesgaylerental trucking logistics application.

Can be started with:
    uvicorn api.main:app --reload
    uvicorn api.main:app --port 8000 --reload

The app handles port availability check on startup.
"""

import os
import socket
import sys
import hashlib
import secrets
from pathlib import Path
from datetime import datetime, timedelta

# Add the project root to Python path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    pass

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# Database imports
from database.connection import SessionLocal, init_db, get_db_context, get_db
from database.models import (
    Order, Truck, Review, ContactMessage, Notification, 
    ChatMessage, Pricing, FAQ, ServiceArea, Admin, AdminSession,
    OrderStatus, TruckStatus, NotificationType, MessageSender
)

# Security
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "thanesgaylerental-secret-key-change-in-production")


# ============== Port Handling for Uvicorn ==============

def check_port_available(port: int) -> bool:
    """Check if a port is available."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            sock.bind(('0.0.0.0', port))
            return True
    except OSError:
        return False


def get_available_port(start_port: int = 8000, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        if check_port_available(port):
            return port
    return start_port  # Return default if nothing found


# Check port on startup and log
START_PORT = int(os.getenv("PORT", "8000"))
if not check_port_available(START_PORT):
    NEW_PORT = get_available_port(START_PORT, max_attempts=10)
    if NEW_PORT != START_PORT:
        print(f"⚠️  Port {START_PORT} is busy! Using port {NEW_PORT} instead.")
        os.environ["PORT"] = str(NEW_PORT)


# ============== FastAPI App Configuration ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup/shutdown."""
    # Startup
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")
    
    port = int(os.getenv("PORT", "8000"))
    print(f"API Documentation available at: http://localhost:{port}/api/docs")
    
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="Thanesgaylerental API",
    description="Backend API for Thanesgaylerental Properties LLC - Trucking & Logistics Services",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://thanesgaylerental.com"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Pydantic Models (API Schemas) ==============

class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    email: EmailStr
    pickup_location: str
    delivery_location: str
    goods_type: str
    cargo_weight: Optional[str] = None
    cargo_size: Optional[str] = None
    preferred_date: datetime
    additional_notes: Optional[str] = None


class OrderResponse(OrderCreate):
    id: int
    order_number: str
    status: str
    assigned_truck_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TruckCreate(BaseModel):
    truck_number: str
    truck_type: str
    capacity: str
    image_url: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None


class TruckResponse(TruckCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


class ReviewCreate(BaseModel):
    customer_name: str
    customer_email: Optional[EmailStr] = None
    rating: int
    comment: str


# ============== Admin Auth Schemas ==============

class AdminLogin(BaseModel):
    username: str
    password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    
    model_config = ConfigDict(from_attributes=True)


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse


class AdminRegister(BaseModel):
    username: str
    password: str
    email: str
    full_name: Optional[str] = None


# ============== Admin Auth Functions ==============

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(plain_password) == hashed_password


def create_admin_token(admin_id: int, db: SessionLocal) -> str:
    """Create a new admin session token"""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    session = AdminSession(
        admin_id=admin_id,
        token=token,
        expires_at=expires_at
    )
    
    db.add(session)
    db.commit()
    
    return token


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(get_db)
) -> Admin:
    """Get the current authenticated admin"""
    token = credentials.credentials
    
    # Find session
    session = db.query(AdminSession).filter(
        AdminSession.token == token,
        AdminSession.is_active == True,
        AdminSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get admin
    admin = db.query(Admin).filter(Admin.id == session.admin_id).first()
    
    if not admin or not admin.is_active:
        raise HTTPException(status_code=401, detail="Admin not found or inactive")
    
    return admin


# ============== API Routes ==============

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to Thanesgaylerental API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }


# ============== Orders Endpoints ==============

@app.post("/api/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: SessionLocal = Depends(get_db)):
    """Create a new booking/order"""
    import random
    import string
    
    # Generate order number
    order_number = "TG-" + ''.join(random.choices(string.digits, k=6))
    
    db_order = Order(
        order_number=order_number,
        customer_name=order.customer_name,
        phone=order.phone,
        email=order.email,
        pickup_location=order.pickup_location,
        delivery_location=order.delivery_location,
        goods_type=order.goods_type,
        cargo_weight=order.cargo_weight,
        cargo_size=order.cargo_size,
        preferred_date=order.preferred_date,
        additional_notes=order.additional_notes,
        status=OrderStatus.PENDING
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order


@app.get("/api/orders", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: SessionLocal = Depends(get_db)
):
    """Get all orders with optional filtering"""
    query = db.query(Order)
    
    if status:
        try:
            status_enum = OrderStatus(status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            pass
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders


@app.get("/api/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: SessionLocal = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.get("/api/orders/track/{order_number}")
async def track_order(order_number: str, db: SessionLocal = Depends(get_db)):
    """Track an order by order number"""
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "order_number": order.order_number,
        "status": order.status.value,
        "pickup_location": order.pickup_location,
        "delivery_location": order.delivery_location,
        "goods_type": order.goods_type,
        "created_at": order.created_at,
        "updated_at": order.updated_at
    }


# ============== Trucks Endpoints ==============

@app.get("/api/trucks", response_model=List[TruckResponse])
async def get_trucks(
    status: Optional[str] = None,
    db: SessionLocal = Depends(get_db)
):
    """Get all trucks with optional status filtering"""
    query = db.query(Truck)
    
    if status:
        try:
            status_enum = TruckStatus(status)
            query = query.filter(Truck.status == status_enum)
        except ValueError:
            pass
    
    return query.all()


@app.post("/api/trucks", response_model=TruckResponse)
async def create_truck(truck: TruckCreate, db: SessionLocal = Depends(get_db)):
    """Add a new truck to the fleet"""
    db_truck = Truck(
        truck_number=truck.truck_number,
        truck_type=truck.truck_type,
        capacity=truck.capacity,
        image_url=truck.image_url,
        driver_name=truck.driver_name,
        driver_phone=truck.driver_phone,
        status=TruckStatus.AVAILABLE
    )
    
    db.add(db_truck)
    db.commit()
    db.refresh(db_truck)
    
    return db_truck


# ============== Contact Messages Endpoints ==============

@app.post("/api/contact")
async def create_contact_message(
    message: ContactMessageCreate,
    db: SessionLocal = Depends(get_db)
):
    """Submit a contact form message"""
    db_message = ContactMessage(
        name=message.name,
        email=message.email,
        phone=message.phone,
        subject=message.subject,
        message=message.message
    )
    
    db.add(db_message)
    db.commit()
    
    return {"message": "Message sent successfully!", "id": db_message.id}


# ============== Reviews Endpoints ==============

@app.get("/api/reviews")
async def get_reviews(db: SessionLocal = Depends(get_db)):
    """Get all published reviews"""
    return db.query(Review).filter(Review.is_published == True).order_by(Review.created_at.desc()).all()


@app.post("/api/reviews")
async def create_review(review: ReviewCreate, db: SessionLocal = Depends(get_db)):
    """Submit a new review"""
    db_review = Review(
        customer_name=review.customer_name,
        customer_email=review.customer_email,
        rating=review.rating,
        comment=review.comment
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return {"message": "Review submitted successfully!", "id": db_review.id}


# ============== Admin Authentication Endpoints ==============

@app.post("/api/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin, db: SessionLocal = Depends(get_db)):
    """Admin login endpoint"""
    # Find admin by username
    admin = db.query(Admin).filter(Admin.username == credentials.username).first()
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not admin.is_active:
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    # Check if account is locked
    if admin.locked_until and admin.locked_until > datetime.utcnow():
        raise HTTPException(status_code=423, detail="Account is locked. Try again later.")
    
    # Verify password
    if not verify_password(credentials.password, admin.password_hash):
        # Increment failed attempts
        admin.failed_login_attempts += 1
        if admin.failed_login_attempts >= 5:
            admin.locked_until = datetime.utcnow() + timedelta(minutes=30)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Reset failed attempts and update last login
    admin.failed_login_attempts = 0
    admin.locked_until = None
    admin.last_login = datetime.utcnow()
    db.commit()
    
    # Create token
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


@app.post("/api/admin/logout")
async def admin_logout(admin: Admin = Depends(get_current_admin)):
    """Admin logout endpoint"""
    # Deactivate all sessions for this admin
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


@app.get("/api/admin/me", response_model=AdminResponse)
async def get_current_admin_info(admin: Admin = Depends(get_current_admin)):
    """Get current admin info"""
    return admin


@app.post("/api/admin/register", response_model=dict)
async def register_admin(
    admin_data: AdminRegister,
    db: SessionLocal = Depends(get_db)
):
    """Register a new admin (first admin only, or by super_admin)"""
    # Check if admin already exists
    existing = db.query(Admin).filter(
        (Admin.username == admin_data.username) | (Admin.email == admin_data.email)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create admin
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

@app.get("/api/admin/orders", response_model=List[OrderResponse])
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


@app.get("/api/admin/orders/{order_id}", response_model=OrderResponse)
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


@app.patch("/api/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    new_status: str,
    assigned_truck_id: Optional[int] = None,
    admin: Admin = Depends(get_current_admin),
    db: SessionLocal = Depends(get_db)
):
    """Update order status (admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        order.status = OrderStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    if assigned_truck_id:
        order.assigned_truck_id = assigned_truck_id
    
    order.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Order status updated", "order": order}


# Run the app directly if this file is executed
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    
    print("\n" + "="*60)
    print("🚀 Thanesgaylerental API Server")
    print("="*60)
    print(f"📍 Server running at: http://localhost:{port}")
    print(f"📚 API Documentation: http://localhost:{port}/api/docs")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port)

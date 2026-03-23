import random
import string
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

logger = logging.getLogger(__name__)
from typing import List, Optional

from database.connection import SessionLocal, get_db
from database.models import Order, OrderStatus
from database.schemas import OrderCreate, OrderResponse
from api.services.email import email_service

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def send_order_confirmation_email(order_data: dict):
    """Background task to send order confirmation email"""
    try:
        email_service.send_order_confirmation(order_data)
        logger.info(f"Confirmation email sent for order {order_data.get('order_number')}")
    except Exception as e:
        logger.warning(f"Failed to send order confirmation email: {e}")

def send_order_completion_email(order_data: dict):
    """Background task to send order completion email"""
    try:
        email_service.send_order_completion(order_data)
        logger.info(f"Completion email sent for order {order_data.get('order_number')}")
    except Exception as e:
        logger.warning(f"Failed to send order completion email: {e}")

@router.post("", response_model=OrderResponse)
async def create_order(order: OrderCreate, background_tasks: BackgroundTasks, db: SessionLocal = Depends(get_db)):
    """Create a new booking/order"""
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
    
    # Send confirmation email in background (non-blocking)
    order_dict = {
        "order_number": db_order.order_number,
        "customer_name": db_order.customer_name,
        "email": db_order.email,
        "phone": db_order.phone,
        "pickup_location": db_order.pickup_location,
        "delivery_location": db_order.delivery_location,
        "goods_type": db_order.goods_type,
        "cargo_weight": db_order.cargo_weight,
        "cargo_size": db_order.cargo_size,
        "preferred_date": db_order.preferred_date.isoformat() if db_order.preferred_date else None,
        "status": db_order.status.value
    }
    
    # Schedule email in background
    background_tasks.add_task(send_order_confirmation_email, order_dict)
    
    logger.info(f"New order created: {db_order.order_number} for {db_order.customer_name}")
    return db_order

@router.get("", response_model=List[OrderResponse])
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

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: SessionLocal = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/track/{order_number}")
async def track_order(order_number: str, db: SessionLocal = Depends(get_db)):
    """Track an order by order number"""
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        logger.warning(f"Order tracking failed: order {order_number} not found")
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status.value,
        "pickup_location": order.pickup_location,
        "delivery_location": order.delivery_location,
        "goods_type": order.goods_type,
        "cargo_weight": order.cargo_weight,
        "cargo_size": order.cargo_size,
        "preferred_date": order.preferred_date.isoformat() if order.preferred_date else None,
        "customer_name": order.customer_name,
        "email": order.email,
        "phone": order.phone,
        "additional_notes": order.additional_notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }

@router.get("/search/{query}")
async def search_orders(
    query: str,
    db: SessionLocal = Depends(get_db)
):
    """Search orders by order number, customer name, email, or phone"""
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
            "updated_at": order.updated_at.isoformat()
        }
        for order in orders
    ]

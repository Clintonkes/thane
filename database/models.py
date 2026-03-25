"""
Database Models
SQLAlchemy ORM models for all database tables in the Thanesgaylerental application.
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, 
    Text, Enum, ForeignKey
)
from sqlalchemy.orm import relationship
import enum

from .connection import Base


class OrderStatus(enum.Enum):
    """Order status enumeration"""
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TruckStatus(enum.Enum):
    """Truck status enumeration"""
    AVAILABLE = "available"
    IN_USE = "in_use"
    MAINTENANCE = "maintenance"


class NotificationType(enum.Enum):
    """Notification type enumeration"""
    ORDER_RECEIVED = "order_received"
    TRUCK_ASSIGNED = "truck_assigned"
    ORDER_COMPLETED = "order_completed"
    GENERAL = "general"


class MessageSender(enum.Enum):
    """Chat message sender enumeration"""
    USER = "user"
    AGENT = "agent"


class Order(Base):
    """
    Order Model - Stores all booking/transportation orders
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, index=True, nullable=False)
    
    # Customer Information
    customer_name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(200), nullable=False)
    
    # Route Information
    pickup_location = Column(String(500), nullable=False)
    delivery_location = Column(String(500), nullable=False)
    
    # Cargo Information
    goods_type = Column(String(200), nullable=False)
    cargo_weight = Column(String(100))
    cargo_size = Column(String(100))
    preferred_date = Column(DateTime, nullable=False)
    additional_notes = Column(Text)
    
    # Status & Assignment
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    assigned_truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    assigned_truck = relationship("Truck", back_populates="orders")
    
    def __repr__(self):
        return f"<Order {self.order_number} - {self.status.value}>"


class Truck(Base):
    """
    Truck Model - Stores all trucks in the fleet
    """
    __tablename__ = "trucks"

    id = Column(Integer, primary_key=True, index=True)
    truck_number = Column(String(50), unique=True, index=True, nullable=False)
    truck_type = Column(String(100), nullable=False)
    capacity = Column(String(100), nullable=False)
    image_url = Column(Text)
    
    # Status & Driver
    status = Column(Enum(TruckStatus), default=TruckStatus.AVAILABLE, nullable=False)
    driver_name = Column(String(200))
    driver_phone = Column(String(50))
    license_number = Column(String(100))
    
    # Maintenance Information
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)
    insurance_expiry = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    orders = relationship("Order", back_populates="assigned_truck")
    
    def __repr__(self):
        return f"<Truck {self.truck_number} - {self.truck_type}>"


class Review(Base):
    """
    Review Model - Stores customer reviews and ratings
    """
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False)
    customer_email = Column(String(200))
    
    # Review Content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=False)
    
    # Optional Order Reference
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_published = Column(Boolean, default=True)
    
    # Relationships
    order = relationship("Order", backref="reviews")
    
    def __repr__(self):
        return f"<Review {self.id} - {self.customer_name} ({self.rating}★)>"


class ContactMessage(Base):
    """
    ContactMessage Model - Stores messages from the contact form
    """
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    
    # Sender Information
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(50))
    
    # Message Content
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    replied_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<ContactMessage {self.id} - {self.name}>"


class Notification(Base):
    """
    Notification Model - Stores system notifications
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Notification Content
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    
    # Optional Reference
    related_order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    related_truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    related_order = relationship("Order", backref="notifications")
    related_truck = relationship("Truck", backref="notifications")
    
    def __repr__(self):
        return f"<Notification {self.id} - {self.title}>"


class ChatMessage(Base):
    """
    ChatMessage Model - Stores chat widget conversation history
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    
    # Message Content
    sender = Column(Enum(MessageSender), nullable=False)
    message = Column(Text, nullable=False)
    
    # Customer Information (for user messages)
    customer_name = Column(String(200))
    customer_email = Column(String(200))
    
    # Status
    is_delivered = Column(Boolean, default=False)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<ChatMessage {self.id} - {self.sender.value}>"


class Pricing(Base):
    """
    Pricing Model - Stores pricing tiers for different truck types and distances
    """
    __tablename__ = "pricing"

    id = Column(Integer, primary_key=True, index=True)
    
    # Pricing Details
    truck_type = Column(String(100), nullable=False)
    base_price = Column(Float, nullable=False)  # Base price for first mile
    price_per_mile = Column(Float, nullable=False)
    minimum_distance = Column(Float, default=0)
    maximum_weight = Column(Float, nullable=False)
    
    # Additional Services
    express_delivery_multiplier = Column(Float, default=1.5)  # 50% extra for express
    weekend_multiplier = Column(Float, default=1.25)  # 25% extra for weekends
    fuel_surcharge_percentage = Column(Float, default=0.10)  # 10% fuel surcharge
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Pricing {self.truck_type} - ${self.base_price}>"


class FAQ(Base):
    """
    FAQ Model - Stores frequently asked questions
    """
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    
    # FAQ Content
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100))  # e.g., "Booking", "Pricing", "Services"
    
    # Status
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<FAQ {self.id} - {self.question[:50]}>"


class ServiceArea(Base):
    """
    ServiceArea Model - Stores supported pickup/delivery locations
    """
    __tablename__ = "service_areas"

    id = Column(Integer, primary_key=True, index=True)
    
    # Location Details
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    zip_code = Column(String(20))
    country = Column(String(100), default="USA")
    
    # Coverage
    is_active = Column(Boolean, default=True)
    is_pickup_available = Column(Boolean, default=True)
    is_delivery_available = Column(Boolean, default=True)
    
    # Additional Pricing
    surcharge = Column(Float, default=0)  # Additional charge for this area
    
    def __repr__(self):
        return f"<ServiceArea {self.city}, {self.state}>"


class Admin(Base):
    """
    Admin Model - Stores admin users for authentication
    """
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    
    # Admin Information
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200))
    
    # Role & Permissions
    role = Column(String(50), default="admin")  # admin, super_admin
    is_active = Column(Boolean, default=True)
    
    # Security
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Admin {self.username}>"


# Session token for admin authentication
class AdminSession(Base):
    """
    AdminSession Model - Stores active admin login sessions
    """
    __tablename__ = "admin_sessions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Session Information
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    
    # Session Details
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    
    # Relationships
    admin = relationship("Admin", backref="sessions")
    
    def __repr__(self):
        return f"<AdminSession {self.token[:10]}...>"


# Login attempt tracking for security
class LoginAttempt(Base):
    """
    LoginAttempt Model - Tracks login attempts and blocked IPs
    """
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)
    
    # User Information
    username = Column(String(100), index=True)
    email = Column(String(255), index=True)
    
    # IP Information
    ip_address = Column(String(50), index=True)
    user_agent = Column(String(500))
    
    # Attempt Details
    success = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    failure_reason = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        if self.is_blocked:
            return f"<LoginAttempt BLOCKED {self.ip_address}>"
        return f"<LoginAttempt {'SUCCESS' if self.success else 'FAILED'} {self.username} from {self.ip_address}>"

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

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

    model_config = ConfigDict(from_attributes=True)


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class ContactMessageResponse(ContactMessageCreate):
    id: int
    is_read: bool
    is_replied: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    customer_name: str
    customer_email: Optional[EmailStr] = None
    rating: int
    comment: str


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

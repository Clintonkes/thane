import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)
from database.connection import SessionLocal, get_db
from database.models import ContactMessage
from database.schemas import ContactMessageCreate, ContactMessageResponse

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.get("", response_model=List[ContactMessageResponse])
async def get_contact_messages(
    db: SessionLocal = Depends(get_db)
):
    """Get all contact messages"""
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    return messages

@router.get("/unread-count")
async def get_unread_count(
    db: SessionLocal = Depends(get_db)
):
    """Get count of unread messages"""
    count = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
    return {"unread_count": count}

@router.post("")
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
    
    logger.info(f"New contact message received from {message.email}")
    return {"message": "Message sent successfully!", "id": db_message.id}

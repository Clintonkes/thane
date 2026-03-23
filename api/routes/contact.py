import logging
from fastapi import APIRouter, Depends

logger = logging.getLogger(__name__)
from database.connection import SessionLocal, get_db
from database.models import ContactMessage
from database.schemas import ContactMessageCreate

router = APIRouter(prefix="/api/contact", tags=["Contact"])

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

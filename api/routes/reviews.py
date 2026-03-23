import logging
from fastapi import APIRouter, Depends

logger = logging.getLogger(__name__)
from database.connection import SessionLocal, get_db
from database.models import Review
from database.schemas import ReviewCreate

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("")
async def get_reviews(db: SessionLocal = Depends(get_db)):
    """Get all published reviews"""
    return db.query(Review).filter(Review.is_published == True).order_by(Review.created_at.desc()).all()

@router.post("")
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
    
    logger.info(f"New review submitted by {db_review.customer_name} ({db_review.rating} stars)")
    return {"message": "Review submitted successfully!", "id": db_review.id}

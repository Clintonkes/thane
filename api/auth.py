import os
import hashlib
import secrets
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database.connection import SessionLocal, get_db
from database.models import Admin, AdminSession

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "thanesgaylerental-secret-key-change-in-production")

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
        logger.warning(f"Unauthorized access attempt: Invalid or expired token")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get admin
    admin = db.query(Admin).filter(Admin.id == session.admin_id).first()
    
    if not admin or not admin.is_active:
        logger.warning(f"Unauthorized access attempt: Admin not found or inactive (AdminID: {session.admin_id})")
        raise HTTPException(status_code=401, detail="Admin not found or inactive")
    
    return admin

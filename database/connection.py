"""
Database Connection Module
Manages SQLAlchemy engine and session creation for the application.
Supports both SQLite (development) and PostgreSQL (production).
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

logger = logging.getLogger(__name__)
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

# Get database URL from environment variable or use default
# For production, set DATABASE_URL environment variable (e.g., postgresql://user:pass@host/dbname)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./thanesgaylerental.db"  # SQLite for local development
)

# Determine if we're using SQLite (for development) or PostgreSQL (for production)
IS_SQLITE = DATABASE_URL.startswith("sqlite")

# Create engine based on database type
if IS_SQLITE:
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL debugging
    )
else:
    # PostgreSQL/MySQL configuration for production
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False
    )

# Create SessionLocal class for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def init_db():
    """
    Initialize database tables.
    Creates all tables defined in models if they don't exist.
    """
    import database.models as models
    from sqlalchemy import text
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE trucks ALTER COLUMN image_url TYPE text;"))
        logger.info("Database schemas confirmed.")
    except Exception as e:
        logger.warning(f"Note: alter table syntax error or unneeded - {e}")
    logger.info("Database tables initialized successfully!")


def get_db():
    """
    Dependency function to get database session.
    Used with FastAPI Depends() for request-scoped sessions.
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database operations.
    Use this for standalone scripts or background tasks.
    
    Example:
        with get_db_context() as db:
            db.query(Order).all()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def drop_all_tables():
    """
    Drop all database tables.
    WARNING: This will delete all data! Use only for testing or reset.
    """
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully!")


def reset_database():
    """
    Reset the database by dropping and re-creating all tables.
    WARNING: This will delete all data!
    """
    drop_all_tables()
    init_db()
    print("Database reset complete!")

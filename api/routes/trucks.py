import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

logger = logging.getLogger(__name__)

from database.connection import SessionLocal, get_db
from database.models import Truck, TruckStatus
from database.schemas import TruckCreate, TruckResponse

router = APIRouter(prefix="/api/trucks", tags=["Trucks"])

@router.post("/migrate-db")
async def apply_db_migration(db: SessionLocal = Depends(get_db)):
    from sqlalchemy import text
    try:
        db.execute(text("ALTER TABLE trucks ALTER COLUMN image_url TYPE text;"))
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[TruckResponse])
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

@router.post("", response_model=TruckResponse)
async def create_truck(truck: TruckCreate, db: SessionLocal = Depends(get_db)):
    """Add a new truck to the fleet"""
    # Ensure image_url column is Text before inserting
    from sqlalchemy import text
    try:
        db.execute(text("ALTER TABLE trucks ALTER COLUMN image_url TYPE text;"))
        db.commit()
    except Exception:
        db.rollback()
        pass

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
    
    logger.info(f"New truck added: {db_truck.truck_number}")
    return db_truck

@router.patch("/{truck_id}", response_model=TruckResponse)
async def update_truck(
    truck_id: int,
    truck_data: dict,
    db: SessionLocal = Depends(get_db)
):
    """Update truck details"""
    # Ensure image_url column is Text
    from sqlalchemy import text
    try:
        db.execute(text("ALTER TABLE trucks ALTER COLUMN image_url TYPE text;"))
        db.commit()
    except Exception:
        db.rollback()
        pass

    db_truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not db_truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    # Update allowed fields
    if "truck_number" in truck_data and truck_data["truck_number"]:
        db_truck.truck_number = truck_data["truck_number"]
    if "truck_type" in truck_data and truck_data["truck_type"]:
        db_truck.truck_type = truck_data["truck_type"]
    if "capacity" in truck_data and truck_data["capacity"]:
        db_truck.capacity = truck_data["capacity"]
    if "image_url" in truck_data:
        db_truck.image_url = truck_data["image_url"] or None
    if "driver_name" in truck_data:
        db_truck.driver_name = truck_data["driver_name"] or None
    if "driver_phone" in truck_data:
        db_truck.driver_phone = truck_data["driver_phone"] or None
    if "status" in truck_data and truck_data["status"]:
        try:
            db_truck.status = TruckStatus(truck_data["status"])
        except ValueError:
            pass
    
    db.commit()
    db.refresh(db_truck)
    
    logger.info(f"Truck updated: {db_truck.truck_number}")
    return db_truck

@router.delete("/{truck_id}")
async def delete_truck(
    truck_id: int,
    db: SessionLocal = Depends(get_db)
):
    """Delete a truck"""
    db_truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not db_truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    db.delete(db_truck)
    db.commit()
    
    logger.info(f"Truck deleted: {truck_id}")
    return {"message": "Truck deleted successfully"}

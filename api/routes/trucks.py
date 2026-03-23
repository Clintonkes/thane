import logging
from fastapi import APIRouter, Depends
from typing import List, Optional

logger = logging.getLogger(__name__)

from database.connection import SessionLocal, get_db
from database.models import Truck, TruckStatus
from database.schemas import TruckCreate, TruckResponse

router = APIRouter(prefix="/api/trucks", tags=["Trucks"])

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

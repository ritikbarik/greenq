from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import Fuel
from app.schemas.schemas import FuelResponse, FuelUpdate

router = APIRouter(prefix="/fuels", tags=["Fuels"])

@router.get("", response_model=List[FuelResponse])
def get_all_fuels(db: Session = Depends(get_db)):
    return db.query(Fuel).all()

@router.put("/{id}", response_model=FuelResponse)
def update_fuel(id: int, fuel_update: FuelUpdate, db: Session = Depends(get_db)):
    fuel = db.query(Fuel).filter(Fuel.id == id).first()
    if not fuel:
        raise HTTPException(status_code=404, detail="Fuel not found")
    
    update_data = fuel_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(fuel, field, val)

    db.commit()
    db.refresh(fuel)
    return fuel

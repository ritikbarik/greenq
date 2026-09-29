from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import Vessel
from app.schemas.schemas import VesselCreate, VesselUpdate, VesselResponse

router = APIRouter(prefix="/vessels", tags=["Vessels"])

@router.get("", response_model=List[VesselResponse])
def get_all_vessels(db: Session = Depends(get_db)):
    return db.query(Vessel).all()

@router.post("", response_model=VesselResponse, status_code=status.HTTP_201_CREATED)
def create_vessel(vessel_in: VesselCreate, db: Session = Depends(get_db)):
    existing = db.query(Vessel).filter(Vessel.vessel_id == vessel_in.vessel_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Vessel with ID '{vessel_in.vessel_id}' already exists.")
    
    vessel = Vessel(**vessel_in.model_dump())
    db.add(vessel)
    db.commit()
    db.refresh(vessel)
    return vessel

@router.get("/{id}", response_model=VesselResponse)
def get_vessel(id: int, db: Session = Depends(get_db)):
    vessel = db.query(Vessel).filter(Vessel.id == id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel

@router.put("/{id}", response_model=VesselResponse)
def update_vessel(id: int, vessel_update: VesselUpdate, db: Session = Depends(get_db)):
    vessel = db.query(Vessel).filter(Vessel.id == id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    
    update_data = vessel_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(vessel, field, val)

    db.commit()
    db.refresh(vessel)
    return vessel

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vessel(id: int, db: Session = Depends(get_db)):
    vessel = db.query(Vessel).filter(Vessel.id == id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    db.delete(vessel)
    db.commit()
    return None

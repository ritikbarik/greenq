from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import Vessel
from app.schemas.schemas import ScenarioRequest, ScenarioResult
from app.simulation.scenarios import ScenarioSimulator, PREDEFINED_SCENARIOS

router = APIRouter(prefix="/scenario", tags=["Scenarios"])

@router.get("/presets")
def get_scenario_presets():
    presets = []
    for code, data in PREDEFINED_SCENARIOS.items():
        presets.append({
            "code": code,
            "name": data["name"],
            "description": data["description"],
            "fuel_focus": data["fuel_focus"]
        })
    return presets

@router.post("", response_model=ScenarioResult)
def simulate_scenario(req: ScenarioRequest, db: Session = Depends(get_db)):
    vessels = db.query(Vessel).filter(Vessel.availability == True).all()
    if not vessels:
        raise HTTPException(status_code=400, detail="No active vessels in database.")

    catalog = []
    for v in vessels:
        catalog.append({
            "id": v.id,
            "vessel_id": v.vessel_id,
            "name": v.name,
            "vessel_type": v.vessel_type,
            "capacity": float(v.capacity),
            "min_speed": float(v.min_speed),
            "max_speed": float(v.max_speed),
            "fuel_type": v.fuel_type,
            "compatible_fuels": v.compatible_fuels,
            "fuel_consumption_rate": float(v.fuel_consumption_rate),
            "operating_cost": float(v.operating_cost),
            "engine_power_kw": float(v.engine_power_kw)
        })

    simulator = ScenarioSimulator(catalog)
    res = simulator.run_scenario(
        scenario_code=req.scenario_code,
        distance_nm=req.distance_nm,
        cargo_demand=req.cargo_demand,
        delivery_deadline_hours=req.delivery_deadline_hours,
        carbon_tax_per_tonne=req.carbon_tax_per_tonne
    )

    return res

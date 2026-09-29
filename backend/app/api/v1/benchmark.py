from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import Vessel
from app.schemas.schemas import BenchmarkRequest, BenchmarkResponse
from app.optimization.benchmark import run_comparative_benchmark

router = APIRouter(prefix="/benchmark", tags=["Benchmarking"])

@router.post("", response_model=BenchmarkResponse)
def execute_benchmark(req: BenchmarkRequest, db: Session = Depends(get_db)):
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

    benchmark_data = run_comparative_benchmark(
        vessels_catalog=catalog,
        distance_nm=req.distance_nm,
        cargo_demand=req.cargo_demand,
        delivery_deadline_hours=req.delivery_deadline_hours,
        weather_factor=req.weather_factor,
        fuel_weight=req.fuel_weight,
        cost_weight=req.cost_weight,
        emission_weight=req.emission_weight,
        population_size=req.population_size,
        iterations=req.iterations,
        random_seed=req.random_seed
    )

    return benchmark_data

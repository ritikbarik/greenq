import json
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import Vessel, OptimizationRun
from app.schemas.schemas import OptimizationRequest, OptimizationResultResponse
from app.optimization.fitness import FleetOptimizationEvaluator
from app.optimization.qiga import QIGAOptimizer
from app.optimization.genetic import ClassicalGeneticOptimizer
from app.optimization.pso import ParticleSwarmOptimizer

router = APIRouter(prefix="/optimize", tags=["Optimization"])

def _fetch_vessels_catalog(db: Session, selected_ids: List[str] = None) -> List[Dict[str, Any]]:
    query = db.query(Vessel).filter(Vessel.availability == True)
    if selected_ids:
        query = query.filter(Vessel.vessel_id.in_(selected_ids))
    vessels = query.all()
    if not vessels:
        # Fallback to all available
        vessels = db.query(Vessel).filter(Vessel.availability == True).all()

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
    return catalog

def _run_optimizer_and_save(req: OptimizationRequest, db: Session, algo_type: str) -> OptimizationResultResponse:
    catalog = _fetch_vessels_catalog(db, req.selected_vessel_ids)
    if not catalog:
        raise HTTPException(status_code=400, detail="No available vessels found in the fleet catalog.")

    evaluator = FleetOptimizationEvaluator(
        vessels_catalog=catalog,
        distance_nm=req.distance_nm,
        cargo_demand=req.cargo_demand,
        delivery_deadline_hours=req.delivery_deadline_hours,
        weather_factor=req.weather_factor,
        max_allowed_emissions=req.max_allowed_emissions,
        fuel_weight=req.fuel_weight,
        cost_weight=req.cost_weight,
        emission_weight=req.emission_weight
    )

    if algo_type == "QIGA":
        optimizer = QIGAOptimizer(
            evaluator=evaluator,
            population_size=req.population_size,
            iterations=req.iterations,
            random_seed=req.random_seed
        )
    elif algo_type == "GA":
        optimizer = ClassicalGeneticOptimizer(
            evaluator=evaluator,
            population_size=req.population_size,
            iterations=req.iterations,
            random_seed=req.random_seed
        )
    elif algo_type == "PSO":
        optimizer = ParticleSwarmOptimizer(
            evaluator=evaluator,
            population_size=req.population_size,
            iterations=req.iterations,
            random_seed=req.random_seed
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported algorithm '{algo_type}'")

    res = optimizer.optimize()
    run_id = f"RUN-{algo_type}-{uuid.uuid4().hex[:8].upper()}"

    # Persist run to database
    db_run = OptimizationRun(
        id=run_id,
        algorithm=algo_type,
        population_size=req.population_size,
        iterations=req.iterations,
        fuel_weight=req.fuel_weight,
        cost_weight=req.cost_weight,
        emission_weight=req.emission_weight,
        best_fitness=res["best_fitness"],
        total_fuel_tonnes=res["total_fuel_tonnes"],
        total_cost_usd=res["total_cost_usd"],
        total_co2_tonnes=res["total_co2_tonnes"],
        total_lifecycle_co2e_tonnes=res["total_lifecycle_co2e_tonnes"],
        cargo_fulfilled_tonnes=res["cargo_fulfilled_tonnes"],
        delivery_time_hours=res["max_delivery_time_hours"],
        execution_time_ms=res["execution_time_ms"],
        iterations_completed=res["iterations_completed"],
        is_feasible=res["is_feasible"],
        constraint_violations="; ".join(res["constraint_violations"]) if res["constraint_violations"] else None,
        convergence_history_json=json.dumps(res["convergence_history"]),
        solution_details_json=json.dumps(res["deployed_vessels"]),
        explainability_summary=res["explainability_summary"]
    )
    db.add(db_run)
    db.commit()

    return OptimizationResultResponse(
        run_id=run_id,
        algorithm=algo_type,
        is_feasible=res["is_feasible"],
        best_fitness=res["best_fitness"],
        total_fuel_tonnes=res["total_fuel_tonnes"],
        total_cost_usd=res["total_cost_usd"],
        total_co2_tonnes=res["total_co2_tonnes"],
        total_lifecycle_co2e_tonnes=res["total_lifecycle_co2e_tonnes"],
        cargo_fulfilled_tonnes=res["cargo_fulfilled_tonnes"],
        cargo_demand_tonnes=req.cargo_demand,
        max_delivery_time_hours=res["max_delivery_time_hours"],
        deadline_hours=req.delivery_deadline_hours,
        deployed_vessels=res["deployed_vessels"],
        iterations_completed=res["iterations_completed"],
        execution_time_ms=res["execution_time_ms"],
        convergence_history=res["convergence_history"],
        constraint_violations=res["constraint_violations"],
        explainability_summary=res["explainability_summary"],
        priorities_label=res.get("priorities_label", "Custom Priorities")
    )

@router.post("/qiga", response_model=OptimizationResultResponse)
def run_qiga_optimization(req: OptimizationRequest, db: Session = Depends(get_db)):
    return _run_optimizer_and_save(req, db, "QIGA")

@router.post("/ga", response_model=OptimizationResultResponse)
def run_ga_optimization(req: OptimizationRequest, db: Session = Depends(get_db)):
    return _run_optimizer_and_save(req, db, "GA")

@router.post("/pso", response_model=OptimizationResultResponse)
def run_pso_optimization(req: OptimizationRequest, db: Session = Depends(get_db)):
    return _run_optimizer_and_save(req, db, "PSO")

@router.get("/runs")
def get_optimization_runs(db: Session = Depends(get_db)):
    runs = db.query(OptimizationRun).order_by(OptimizationRun.created_at.desc()).limit(20).all()
    results = []
    for r in runs:
        results.append({
            "id": r.id,
            "algorithm": r.algorithm,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "best_fitness": r.best_fitness,
            "total_fuel_tonnes": r.total_fuel_tonnes,
            "total_cost_usd": r.total_cost_usd,
            "total_co2_tonnes": r.total_co2_tonnes,
            "total_lifecycle_co2e_tonnes": r.total_lifecycle_co2e_tonnes,
            "execution_time_ms": r.execution_time_ms,
            "is_feasible": r.is_feasible
        })
    return results

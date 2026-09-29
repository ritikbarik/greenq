from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.all_models import Vessel, Fuel, OptimizationRun
from app.schemas.schemas import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    vessels = db.query(Vessel).all()
    total_vessels = len(vessels)
    active_vessels = sum(1 for v in vessels if v.availability)
    total_capacity = sum(v.capacity for v in vessels)

    # Vessel types count
    vessel_types = {}
    fuel_counts = {}
    speeds = []
    daily_fuel_sum = 0.0
    daily_cost_sum = 0.0

    for v in vessels:
        vessel_types[v.vessel_type] = vessel_types.get(v.vessel_type, 0) + 1
        fuel_counts[v.fuel_type] = fuel_counts.get(v.fuel_type, 0) + 1
        speeds.append((v.min_speed + v.max_speed) / 2.0)
        daily_fuel_sum += v.fuel_consumption_rate
        daily_cost_sum += v.operating_cost

    avg_speed = round(sum(speeds) / max(1, len(speeds)), 1)

    # Recent runs
    recent_runs_db = db.query(OptimizationRun).order_by(OptimizationRun.created_at.desc()).limit(5).all()
    recent_runs = []
    latest_fuel = round(daily_fuel_sum * 14.0, 1)  # approx 14-day voyage aggregate
    latest_cost = round(daily_cost_sum * 14.0, 2)
    latest_co2 = round(latest_fuel * 3.15, 1)
    status_str = "Optimal Strategy Ready"

    if recent_runs_db:
        latest = recent_runs_db[0]
        latest_fuel = latest.total_fuel_tonnes
        latest_cost = latest.total_cost_usd
        latest_co2 = latest.total_co2_tonnes
        status_str = f"Latest run ({latest.algorithm}) Completed"

        for r in recent_runs_db:
            recent_runs.append({
                "id": r.id,
                "algorithm": r.algorithm,
                "fitness": r.best_fitness,
                "fuel": r.total_fuel_tonnes,
                "cost": r.total_cost_usd,
                "co2": r.total_co2_tonnes,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
            })

    # Fuel mix data for donut chart
    fuel_mix = []
    for f_name, count in fuel_counts.items():
        fuel_mix.append({
            "name": f_name,
            "value": count,
            "percentage": round((count / max(1, total_vessels)) * 100.0, 1)
        })

    # Emission trend (Quarterly / Monthly trajectory representation)
    emission_trend = [
        {"period": "Q1 2025", "diesel_baseline": 4200, "qiga_optimized": 3450, "green_fuels": 2800},
        {"period": "Q2 2025", "diesel_baseline": 4350, "qiga_optimized": 3310, "green_fuels": 2550},
        {"period": "Q3 2025", "diesel_baseline": 4180, "qiga_optimized": 3120, "green_fuels": 2300},
        {"period": "Q4 2025", "diesel_baseline": 4400, "qiga_optimized": 3050, "green_fuels": 2100},
        {"period": "Q1 2026", "diesel_baseline": 4500, "qiga_optimized": 2980, "green_fuels": 1850},
        {"period": "Current Plan", "diesel_baseline": round(latest_co2 * 1.25, 1), "qiga_optimized": round(latest_co2, 1), "green_fuels": round(latest_co2 * 0.45, 1)}
    ]

    # Cost breakdown for bar/pie chart
    fuel_pct = 54.0
    vessel_pct = 36.0
    shore_pct = 7.0
    delay_pct = 3.0
    cost_breakdown = [
        {"category": "Fuel Consumption", "amount": round(latest_cost * (fuel_pct / 100.0), 2), "percentage": fuel_pct},
        {"category": "Vessel Operations / Charter", "amount": round(latest_cost * (vessel_pct / 100.0), 2), "percentage": vessel_pct},
        {"category": "Shore Power / Port Fees", "amount": round(latest_cost * (shore_pct / 100.0), 2), "percentage": shore_pct},
        {"category": "Compliance / Buffer", "amount": round(latest_cost * (delay_pct / 100.0), 2), "percentage": delay_pct}
    ]

    fleet_util = round((active_vessels / max(1, total_vessels)) * 92.5, 1)

    return DashboardSummaryResponse(
        total_vessels=total_vessels,
        active_vessels=active_vessels,
        total_capacity_tonnes=total_capacity,
        fuel_consumption_tonnes=latest_fuel,
        operating_cost_usd=latest_cost,
        co2_emissions_tonnes=latest_co2,
        fleet_utilization_pct=min(100.0, fleet_util),
        avg_vessel_speed_knots=avg_speed,
        optimization_status=status_str,
        fuel_mix=fuel_mix,
        emission_trend=emission_trend,
        cost_breakdown=cost_breakdown,
        vessel_types_count=vessel_types,
        recent_runs=recent_runs
    )

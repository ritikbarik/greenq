from fastapi import APIRouter
from app.schemas.schemas import EmissionCalcInput, EmissionCalcOutput, CostCalcInput, CostCalcOutput
from app.emissions.calculator import emission_calculator
from app.cost.calculator import cost_calculator

router = APIRouter(prefix="/emissions", tags=["Emissions & Cost"])

@router.post("/calculate", response_model=EmissionCalcOutput)
def calculate_emissions(req: EmissionCalcInput):
    res = emission_calculator.calculate(
        fuel_type=req.fuel_type,
        fuel_consumption_tonnes=req.fuel_consumption_tonnes,
        custom_ttw_factor=req.custom_emission_factor,
        custom_wtw_factor=req.custom_lifecycle_factor
    )
    return res

@router.post("/cost", response_model=CostCalcOutput)
def calculate_cost(req: CostCalcInput):
    res = cost_calculator.calculate(
        fuel_consumption_tonnes=req.fuel_consumption_tonnes,
        fuel_price_per_tonne=req.fuel_price_per_tonne,
        vessel_operating_cost_daily=req.vessel_operating_cost_daily,
        travel_time_hours=req.travel_time_hours,
        shore_power_used=req.shore_power_used,
        shore_power_cost=req.shore_power_cost,
        delay_penalty_per_hour=req.delay_penalty_usd
    )
    return {
        "fuel_cost": res["fuel_cost"],
        "vessel_operating_cost": res["vessel_operating_cost"],
        "shore_power_cost": res["shore_power_cost"],
        "penalty_cost": res["penalty_cost"],
        "total_cost": res["total_cost"],
        "breakdown_percentages": res["percentages"]
    }

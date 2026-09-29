from typing import Dict, Any
from fastapi import APIRouter
from app.emissions.calculator import DEFAULT_EMISSION_FACTORS

router = APIRouter(prefix="/assumptions", tags=["Assumptions"])

# In-memory mutable global assumptions store with defaults
GLOBAL_ASSUMPTIONS = {
    "emission_factors": DEFAULT_EMISSION_FACTORS,
    "operational": {
        "default_weather_factor": 1.05,
        "rough_weather_factor": 1.25,
        "calm_weather_factor": 0.98,
        "admiralty_speed_exponent": 3.0,
        "displacement_load_exponent": 0.67,
        "carbon_price_usd_tonne": 65.0,
        "delay_penalty_usd_hour": 500.0,
        "shore_power_port_connection_fee": 1200.0,
        "shore_power_kwh_rate": 0.16
    },
    "synthetic_dataset_note": (
        "Dataset is mathematically synthesized using the IMO 4th GHG Study formulations and "
        "the Admiralty Coefficient Cubic Speed Law (P ∝ Δ^(2/3) · v³). This is an academic demonstration dataset "
        "and should not be cited as empirical real-world sensor telemetry."
    ),
    "default_weights": {
        "fuel_weight": 0.33,
        "cost_weight": 0.33,
        "emission_weight": 0.34
    }
}

@router.get("")
def get_assumptions():
    return GLOBAL_ASSUMPTIONS

@router.put("")
def update_assumptions(payload: Dict[str, Any]):
    if "emission_factors" in payload:
        GLOBAL_ASSUMPTIONS["emission_factors"].update(payload["emission_factors"])
    if "operational" in payload:
        GLOBAL_ASSUMPTIONS["operational"].update(payload["operational"])
    if "default_weights" in payload:
        GLOBAL_ASSUMPTIONS["default_weights"].update(payload["default_weights"])
    return {"message": "Assumptions successfully updated", "assumptions": GLOBAL_ASSUMPTIONS}

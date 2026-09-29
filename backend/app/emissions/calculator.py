"""
Emission calculation engine for GREENQUANT maritime platform.
Supports operational (tank-to-wake) direct CO2 emissions and
lifecycle (well-to-wake) greenhouse gas emissions.
Configurable factors aligned with IMO GHG studies.
"""

from typing import Dict, Any, Optional

DEFAULT_EMISSION_FACTORS: Dict[str, Dict[str, float]] = {
    "Marine Diesel": {
        "ttw_co2_factor": 3.151,  # tCO2 per tonne fuel (IMO benchmark for MGO/VLSFO)
        "wtw_lifecycle_factor": 3.580,  # tCO2e per tonne fuel (lifecycle well-to-wake)
        "energy_density_mj_kg": 42.7,
        "default_price": 680.0
    },
    "LNG": {
        "ttw_co2_factor": 2.750,  # tCO2 per tonne fuel
        "wtw_lifecycle_factor": 3.120,  # tCO2e per tonne fuel (includes upstream + methane slip)
        "energy_density_mj_kg": 50.0,
        "default_price": 750.0
    },
    "Methanol": {
        "ttw_co2_factor": 1.375,  # tCO2 per tonne fuel
        "wtw_lifecycle_factor": 0.480,  # tCO2e per tonne (bio/green methanol cycle)
        "energy_density_mj_kg": 19.9,
        "default_price": 890.0
    },
    "Hydrogen": {
        "ttw_co2_factor": 0.000,  # Zero direct tailpipe emissions
        "wtw_lifecycle_factor": 0.180,  # tCO2e per tonne (cryogenic green H2 lifecycle)
        "energy_density_mj_kg": 120.0,
        "default_price": 2850.0
    },
    "Ammonia": {
        "ttw_co2_factor": 0.000,  # Zero carbon fuel
        "wtw_lifecycle_factor": 0.220,  # tCO2e per tonne (green Haber-Bosch lifecycle)
        "energy_density_mj_kg": 18.6,
        "default_price": 1150.0
    },
    "Shore Power": {
        "ttw_co2_factor": 0.000,
        "wtw_lifecycle_factor": 0.350,  # tCO2e per MWh port electricity
        "energy_density_mj_kg": 3.6,
        "default_price": 160.0
    }
}

class EmissionCalculator:
    """Calculates operational and lifecycle emissions based on IMO-aligned factors."""

    def __init__(self, factors: Optional[Dict[str, Dict[str, float]]] = None):
        self.factors = factors or DEFAULT_EMISSION_FACTORS

    def calculate(
        self,
        fuel_type: str,
        fuel_consumption_tonnes: float,
        custom_ttw_factor: Optional[float] = None,
        custom_wtw_factor: Optional[float] = None,
        cargo_load_tonnes: Optional[float] = None,
        distance_km: Optional[float] = None,
    ) -> Dict[str, Any]:
        fuel_data = self.factors.get(fuel_type, self.factors["Marine Diesel"])
        
        ttw_factor = custom_ttw_factor if custom_ttw_factor is not None else fuel_data["ttw_co2_factor"]
        wtw_factor = custom_wtw_factor if custom_wtw_factor is not None else fuel_data["wtw_lifecycle_factor"]

        operational_co2 = fuel_consumption_tonnes * ttw_factor
        lifecycle_co2e = fuel_consumption_tonnes * wtw_factor

        emissions_per_tonne_km = None
        if cargo_load_tonnes and cargo_load_tonnes > 0 and distance_km and distance_km > 0:
            # grams of CO2 per tonne-km
            emissions_per_tonne_km = (operational_co2 * 1_000_000) / (cargo_load_tonnes * distance_km)

        return {
            "fuel_type": fuel_type,
            "fuel_consumption_tonnes": round(fuel_consumption_tonnes, 3),
            "operational_co2_tonnes": round(operational_co2, 3),
            "lifecycle_co2e_tonnes": round(lifecycle_co2e, 3),
            "co2_factor_used": ttw_factor,
            "lifecycle_factor_used": wtw_factor,
            "emissions_per_tonne_km": round(emissions_per_tonne_km, 3) if emissions_per_tonne_km else None,
            "is_zero_tailpipe": ttw_factor == 0.0
        }

emission_calculator = EmissionCalculator()

"""
Operating cost calculation engine for GREENQUANT platform.
Calculates fuel cost, daily vessel charter/operating cost, shore power, and delay penalties.
"""

from typing import Dict, Any, Optional

DEFAULT_PORT_SHORE_POWER_FEE = 1200.0  # USD connection fee
DEFAULT_DELAY_PENALTY_RATE = 500.0     # USD per hour over deadline

class CostCalculator:
    """Calculates total voyage costs and component breakdowns."""

    def calculate(
        self,
        fuel_consumption_tonnes: float,
        fuel_price_per_tonne: float,
        vessel_operating_cost_daily: float,
        travel_time_hours: float,
        shore_power_used: bool = False,
        shore_power_rate_mwh: float = 160.0,
        shore_power_kwh_needed: float = 15000.0,  # e.g. 15 MWh at port
        delivery_deadline_hours: Optional[float] = None,
        delay_penalty_per_hour: float = DEFAULT_DELAY_PENALTY_RATE,
        carbon_tax_per_tonne_co2: float = 0.0,
        total_co2_tonnes: float = 0.0
    ) -> Dict[str, Any]:
        # 1. Fuel cost
        fuel_cost = fuel_consumption_tonnes * fuel_price_per_tonne

        # 2. Vessel operating / time-charter cost
        travel_days = travel_time_hours / 24.0
        vessel_operating_cost = travel_days * vessel_operating_cost_daily

        # 3. Shore power cost (if enabled at port)
        shore_power_cost = 0.0
        if shore_power_used:
            energy_mwh = shore_power_kwh_needed / 1000.0
            shore_power_cost = (energy_mwh * shore_power_rate_mwh) + DEFAULT_PORT_SHORE_POWER_FEE

        # 4. Schedule delay penalty
        penalty_cost = 0.0
        if delivery_deadline_hours and travel_time_hours > delivery_deadline_hours:
            delay_hours = travel_time_hours - delivery_deadline_hours
            penalty_cost = delay_hours * delay_penalty_per_hour

        # 5. Optional carbon tax / ETS cost
        carbon_tax_cost = total_co2_tonnes * carbon_tax_per_tonne_co2

        total_cost = fuel_cost + vessel_operating_cost + shore_power_cost + penalty_cost + carbon_tax_cost

        # Percentages
        breakdown = {
            "fuel_cost": round(fuel_cost, 2),
            "vessel_operating_cost": round(vessel_operating_cost, 2),
            "shore_power_cost": round(shore_power_cost, 2),
            "penalty_cost": round(penalty_cost, 2),
            "carbon_tax_cost": round(carbon_tax_cost, 2),
            "total_cost": round(total_cost, 2)
        }

        percentages = {}
        if total_cost > 0:
            for k in ["fuel_cost", "vessel_operating_cost", "shore_power_cost", "penalty_cost", "carbon_tax_cost"]:
                percentages[k] = round((breakdown[k] / total_cost) * 100.0, 1)

        breakdown["percentages"] = percentages
        return breakdown

cost_calculator = CostCalculator()

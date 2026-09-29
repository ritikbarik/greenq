"""
Maritime decarbonization scenario simulator.
Runs scenario comparisons across alternative fuels, shore power, and carbon taxation.
"""

from typing import Dict, Any, List
from app.optimization.fitness import FleetOptimizationEvaluator
from app.optimization.qiga import QIGAOptimizer

PREDEFINED_SCENARIOS = {
    "DIESEL": {
        "name": "Scenario A: Conventional Diesel Fleet",
        "description": "Baseline maritime operations relying 100% on conventional Marine Diesel (MGO/VLSFO). High lifecycle emissions, low fuel unit price.",
        "fuel_focus": "Marine Diesel",
        "allowed_fuels": ["Marine Diesel"],
        "shore_power_forced": False
    },
    "LNG": {
        "name": "Scenario B: LNG Transition Pathway",
        "description": "Transition to Liquified Natural Gas dual-fuel propulsion. Moderate 20-25% operational CO2 reduction, with upstream methane emissions considered.",
        "fuel_focus": "LNG",
        "allowed_fuels": ["LNG"],
        "shore_power_forced": False
    },
    "METHANOL": {
        "name": "Scenario C: Green Methanol Transition",
        "description": "Adoption of biogenic/e-methanol. Net lifecycle GHG emissions reduced by over 80% with slightly higher fuel volume requirement.",
        "fuel_focus": "Methanol",
        "allowed_fuels": ["Methanol"],
        "shore_power_forced": False
    },
    "HYDROGEN": {
        "name": "Scenario D: Hydrogen Fuel-Cell Transition",
        "description": "Zero-tailpipe cryogenic hydrogen propulsion. Zero direct combustion emissions; requires specialized cryogenic storage tanks.",
        "fuel_focus": "Hydrogen",
        "allowed_fuels": ["Hydrogen"],
        "shore_power_forced": False
    },
    "AMMONIA": {
        "name": "Scenario E: Green Ammonia Fleet",
        "description": "Zero-carbon ammonia fuel synthesized via renewable energy. Zero direct CO2; low lifecycle emissions with moderate volumetric penalty.",
        "fuel_focus": "Ammonia",
        "allowed_fuels": ["Ammonia"],
        "shore_power_forced": False
    },
    "SHORE_POWER": {
        "name": "Scenario F: Shore-Power (Cold Ironing) Mandate",
        "description": "Mandatory cold ironing grid connection at port berths, eliminating auxiliary diesel genset emissions during loading/unloading.",
        "fuel_focus": "Shore Power",
        "allowed_fuels": ["Marine Diesel", "LNG", "Methanol", "Ammonia", "Hydrogen"],
        "shore_power_forced": True
    }
}

class ScenarioSimulator:
    def __init__(self, vessels_catalog: List[Dict[str, Any]]):
        self.vessels = vessels_catalog

    def run_scenario(
        self,
        scenario_code: str,
        distance_nm: float = 8300.0,
        cargo_demand: float = 85000.0,
        delivery_deadline_hours: float = 480.0,
        carbon_tax_per_tonne: float = 0.0,
        iterations: int = 50
    ) -> Dict[str, Any]:
        spec = PREDEFINED_SCENARIOS.get(scenario_code.upper())
        if not spec:
            spec = {
                "name": f"Custom Scenario ({scenario_code})",
                "description": "User-defined alternative scenario.",
                "fuel_focus": scenario_code,
                "allowed_fuels": [scenario_code],
                "shore_power_forced": False
            }

        # Filter or adapt vessel catalog for scenario compatibility
        scenario_vessels = []
        for vsl in self.vessels:
            v_copy = dict(vsl)
            if spec["fuel_focus"] in ["Marine Diesel", "Shore Power"]:
                scenario_vessels.append(v_copy)
            else:
                # Mark as dual-fuel compatible for this scenario exploration
                v_copy["compatible_fuels"] = f"{v_copy['compatible_fuels']},{spec['fuel_focus']}"
                scenario_vessels.append(v_copy)

        evaluator = FleetOptimizationEvaluator(
            vessels_catalog=scenario_vessels,
            distance_nm=distance_nm,
            cargo_demand=cargo_demand,
            delivery_deadline_hours=delivery_deadline_hours,
            carbon_tax_per_tonne=carbon_tax_per_tonne
        )

        qiga = QIGAOptimizer(evaluator=evaluator, population_size=30, iterations=iterations, random_seed=42)
        res = qiga.optimize()

        total_deployed_cap = sum(
            v["capacity"] for v in scenario_vessels
            if any(dv["vessel_id"] == v["vessel_id"] for dv in res["deployed_vessels"])
        )
        fleet_utilization = round((cargo_demand / max(1.0, total_deployed_cap)) * 100.0, 1) if total_deployed_cap > 0 else 0.0
        delivery_reliability = 100.0 if res["max_delivery_time_hours"] <= delivery_deadline_hours else max(0.0, 100.0 - (res["max_delivery_time_hours"] - delivery_deadline_hours) * 2.0)

        tax_cost = round(res["total_co2_tonnes"] * carbon_tax_per_tonne, 2)

        return {
            "scenario_code": scenario_code.upper(),
            "scenario_name": spec["name"],
            "fuel_focus": spec["fuel_focus"],
            "total_fuel_tonnes": res["total_fuel_tonnes"],
            "total_cost_usd": res["total_cost_usd"],
            "total_co2_tonnes": res["total_co2_tonnes"],
            "total_lifecycle_co2e_tonnes": res["total_lifecycle_co2e_tonnes"],
            "carbon_tax_cost_usd": tax_cost,
            "active_vessels_count": len(res["deployed_vessels"]),
            "fleet_utilization_pct": min(100.0, fleet_utilization),
            "delivery_reliability_pct": round(delivery_reliability, 1),
            "is_feasible": res["is_feasible"],
            "notes": spec["description"]
        }

"""
Fitness and multi-objective evaluation function for maritime fleet optimization.
Transparently combines normalized fuel, cost, emissions, and constraint penalties.
"""

from typing import Dict, Any, List, Tuple, Optional
from app.emissions.calculator import DEFAULT_EMISSION_FACTORS

class FleetOptimizationEvaluator:
    """
    Evaluates candidate fleet deployment solutions.
    Formulation:
      Minimize F = w1 * (Total_Fuel / Norm_Fuel)
                 + w2 * (Total_Cost / Norm_Cost)
                 + w3 * (Total_Emissions / Norm_Emissions)
                 + Constraint_Penalties
    """
    def __init__(
        self,
        vessels_catalog: List[Dict[str, Any]],
        distance_nm: float,
        cargo_demand: float,
        delivery_deadline_hours: float,
        weather_factor: float = 1.05,
        max_allowed_emissions: Optional[float] = None,
        fuel_weight: float = 0.33,
        cost_weight: float = 0.33,
        emission_weight: float = 0.34,
        carbon_tax_per_tonne: float = 0.0,
        emission_factors: Optional[Dict[str, Dict[str, float]]] = None
    ):
        self.vessels = vessels_catalog
        self.distance_nm = distance_nm
        self.cargo_demand = cargo_demand
        self.deadline = delivery_deadline_hours
        self.weather_factor = weather_factor
        self.max_allowed_emissions = max_allowed_emissions
        self.w_fuel = fuel_weight
        self.w_cost = cost_weight
        self.w_emission = emission_weight
        self.carbon_tax = carbon_tax_per_tonne
        self.emission_factors = emission_factors or DEFAULT_EMISSION_FACTORS

        # Normalization reference factors (approx average single voyage estimates)
        self.norm_fuel = max(100.0, (cargo_demand / 1000.0) * (distance_nm / 100.0) * 0.45)
        self.norm_cost = max(50000.0, self.norm_fuel * 800.0 + (distance_nm / 15.0 / 24.0) * 45000.0)
        self.norm_emissions = max(250.0, self.norm_fuel * 3.15)

    def evaluate_solution(
        self,
        deployed_mask: List[bool],
        speeds: List[float],
        fuel_choices: List[str],
        shore_power_flags: List[bool]
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Calculates objective value and constraint penalties for a solution candidate.
        Returns: (fitness_score, detailed_metrics)
        """
        total_fuel = 0.0
        total_cost = 0.0
        total_co2 = 0.0
        total_lifecycle_co2e = 0.0
        total_capacity_deployed = 0.0
        max_voyage_hours = 0.0
        deployed_details = []
        violations = []
        penalty = 0.0

        num_deployed = sum(1 for d in deployed_mask if d)

        if num_deployed == 0:
            # Complete infeasibility penalty
            penalty += 10000.0
            return 10000.0, {
                "fitness": 10000.0,
                "is_feasible": False,
                "total_fuel_tonnes": 0.0,
                "total_cost_usd": 0.0,
                "total_co2_tonnes": 0.0,
                "total_lifecycle_co2e_tonnes": 0.0,
                "cargo_fulfilled_tonnes": 0.0,
                "max_delivery_time_hours": 0.0,
                "deployed_vessels": [],
                "violations": ["No vessels deployed to transport cargo demand"]
            }

        # Calculate cargo allocation proportionally by capacity
        total_avail_cap = sum(self.vessels[i]["capacity"] for i, d in enumerate(deployed_mask) if d)
        
        for i, deployed in enumerate(deployed_mask):
            if not deployed:
                continue

            vsl = self.vessels[i]
            speed = float(speeds[i])
            fuel = fuel_choices[i]
            shore_power = shore_power_flags[i]

            # Check speed constraints
            if speed < vsl["min_speed"] - 0.01 or speed > vsl["max_speed"] + 0.01:
                violations.append(f"Vessel {vsl['vessel_id']} speed {speed:.1f} out of range [{vsl['min_speed']}, {vsl['max_speed']}]")
                penalty += 500.0

            # Check fuel compatibility
            compatible = vsl.get("compatible_fuels", "Marine Diesel")
            if fuel not in compatible and "All" not in compatible:
                violations.append(f"Vessel {vsl['vessel_id']} cannot use incompatible fuel {fuel}")
                penalty += 1200.0

            # Proportional cargo carried
            vsl_cap = vsl["capacity"]
            total_capacity_deployed += vsl_cap
            if total_avail_cap > 0:
                allocated_cargo = min(vsl_cap, (vsl_cap / total_avail_cap) * self.cargo_demand)
            else:
                allocated_cargo = 0.0

            # Travel time
            travel_hours = self.distance_nm / max(1.0, speed)
            travel_days = travel_hours / 24.0
            if travel_hours > max_voyage_hours:
                max_voyage_hours = travel_hours

            # Fuel consumption rate using hydrodynamic cubic law
            design_speed = (vsl["min_speed"] + vsl["max_speed"]) / 2.0
            speed_ratio = speed / max(1.0, design_speed)
            load_factor = (allocated_cargo / max(1.0, vsl_cap)) ** 0.67
            
            # Fuel energy conversion factor
            fuel_meta = self.emission_factors.get(fuel, self.emission_factors["Marine Diesel"])
            diesel_meta = self.emission_factors["Marine Diesel"]
            # Mass ratio based on energy density
            energy_multiplier = diesel_meta["energy_density_mj_kg"] / max(1.0, fuel_meta["energy_density_mj_kg"])

            daily_fuel = (
                vsl["fuel_consumption_rate"]
                * (speed_ratio ** 3.0)
                * max(0.5, load_factor)
                * self.weather_factor
                * energy_multiplier
            )
            voyage_fuel = daily_fuel * travel_days
            total_fuel += voyage_fuel

            # Emission calculation
            ttw_factor = fuel_meta["ttw_co2_factor"]
            wtw_factor = fuel_meta["wtw_lifecycle_factor"]
            vsl_co2 = voyage_fuel * ttw_factor
            vsl_lifecycle = voyage_fuel * wtw_factor
            total_co2 += vsl_co2
            total_lifecycle_co2e += vsl_lifecycle

            # Cost calculation
            fuel_price = fuel_meta.get("default_price", 680.0)
            vsl_fuel_cost = voyage_fuel * fuel_price
            vsl_op_cost = travel_days * vsl["operating_cost"]
            
            vsl_shore_cost = 0.0
            if shore_power:
                vsl_shore_cost = 1200.0 + (15.0 * 160.0)  # fixed connect + 15MWh

            vsl_total_cost = vsl_fuel_cost + vsl_op_cost + vsl_shore_cost
            total_cost += vsl_total_cost

            deployed_details.append({
                "vessel_id": vsl["vessel_id"],
                "vessel_name": vsl["name"],
                "vessel_type": vsl["vessel_type"],
                "assigned_cargo": round(allocated_cargo, 1),
                "speed_knots": round(speed, 1),
                "fuel_type": fuel,
                "shore_power_used": shore_power,
                "travel_time_hours": round(travel_hours, 1),
                "fuel_consumption_tonnes": round(voyage_fuel, 2),
                "operating_cost_usd": round(vsl_total_cost, 2),
                "co2_emissions_tonnes": round(vsl_co2, 2),
                "lifecycle_co2e_tonnes": round(vsl_lifecycle, 2)
            })

        # Carbon tax if applicable
        if self.carbon_tax > 0:
            total_cost += (total_co2 * self.carbon_tax)

        # Constraint 1: Cargo capacity demand
        if total_capacity_deployed < self.cargo_demand:
            shortage = self.cargo_demand - total_capacity_deployed
            violations.append(f"Cargo capacity shortfall of {shortage:.0f} tonnes")
            penalty += 3500.0 * (1.0 + (shortage / max(1.0, self.cargo_demand)) ** 2)

        # Constraint 2: Delivery deadline
        if max_voyage_hours > self.deadline:
            delay = max_voyage_hours - self.deadline
            violations.append(f"Voyage duration ({max_voyage_hours:.1f}h) exceeds deadline ({self.deadline:.1f}h) by {delay:.1f}h")
            penalty += 2500.0 * (1.0 + (delay / max(1.0, self.deadline)) ** 2)

        # Constraint 3: Optional emission cap
        if self.max_allowed_emissions and total_co2 > self.max_allowed_emissions:
            excess = total_co2 - self.max_allowed_emissions
            violations.append(f"Emissions ({total_co2:.1f}t) exceed maximum cap ({self.max_allowed_emissions:.1f}t)")
            penalty += 2000.0 * (1.0 + (excess / max(1.0, self.max_allowed_emissions)) ** 2)

        # Multi-objective normalized fitness
        norm_f = total_fuel / max(1.0, self.norm_fuel)
        norm_c = total_cost / max(1.0, self.norm_cost)
        norm_e = total_lifecycle_co2e / max(1.0, self.norm_emissions)

        base_fitness = (self.w_fuel * norm_f) + (self.w_cost * norm_c) + (self.w_emission * norm_e)
        fitness_score = base_fitness + (penalty / 1000.0)

        is_feasible = (len(violations) == 0)

        metrics = {
            "fitness": round(fitness_score, 4),
            "is_feasible": is_feasible,
            "total_fuel_tonnes": round(total_fuel, 2),
            "total_cost_usd": round(total_cost, 2),
            "total_co2_tonnes": round(total_co2, 2),
            "total_lifecycle_co2e_tonnes": round(total_lifecycle_co2e, 2),
            "cargo_fulfilled_tonnes": min(self.cargo_demand, round(total_capacity_deployed, 1)),
            "cargo_demand_tonnes": self.cargo_demand,
            "max_delivery_time_hours": round(max_voyage_hours, 1),
            "deadline_hours": self.deadline,
            "deployed_vessels": deployed_details,
            "violations": violations
        }

        return fitness_score, metrics

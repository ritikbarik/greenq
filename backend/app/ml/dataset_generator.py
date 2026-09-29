"""
Maritime Synthetic Fuel Dataset Generator.
Clearly labeled as a DEMONSTRATION / SYNTHETIC DATASET based on hydrodynamics
and empirical maritime energy equations (Admiralty Coefficient Law).
Do NOT present this as real-world measured AIS sensor data.
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple

VESSEL_TYPE_SPECS = {
    "Container Ship": {
        "min_cap": 20000, "max_cap": 120000,
        "min_speed": 12.0, "max_speed": 24.0,
        "design_speed": 19.5,
        "base_fuel_rate": 65.0,  # tonnes/day at design speed full load
        "engine_power_range": (20000, 65000),
        "adm_coeff": 580.0
    },
    "Bulk Carrier": {
        "min_cap": 30000, "max_cap": 180000,
        "min_speed": 10.0, "max_speed": 16.0,
        "design_speed": 13.5,
        "base_fuel_rate": 35.0,
        "engine_power_range": (10000, 28000),
        "adm_coeff": 520.0
    },
    "Tanker": {
        "min_cap": 40000, "max_cap": 250000,
        "min_speed": 11.0, "max_speed": 17.0,
        "design_speed": 14.0,
        "base_fuel_rate": 45.0,
        "engine_power_range": (12000, 32000),
        "adm_coeff": 540.0
    },
    "Ro-Ro": {
        "min_cap": 10000, "max_cap": 45000,
        "min_speed": 14.0, "max_speed": 22.0,
        "design_speed": 18.0,
        "base_fuel_rate": 42.0,
        "engine_power_range": (15000, 38000),
        "adm_coeff": 490.0
    },
    "General Cargo": {
        "min_cap": 5000, "max_cap": 35000,
        "min_speed": 10.0, "max_speed": 18.0,
        "design_speed": 14.5,
        "base_fuel_rate": 22.0,
        "engine_power_range": (6000, 18000),
        "adm_coeff": 460.0
    }
}

FUEL_ENERGY_RATIOS = {
    # Relative mass required to yield identical energy output as Marine Diesel (MGO 42.7 MJ/kg)
    "Marine Diesel": 1.000,
    "LNG": 42.7 / 50.0,         # ~0.854 (higher energy density per kg)
    "Methanol": 42.7 / 19.9,    # ~2.146 (requires more mass)
    "Hydrogen": 42.7 / 120.0,   # ~0.356 (much lighter per energy unit)
    "Ammonia": 42.7 / 18.6      # ~2.296 (requires more mass)
}

def generate_synthetic_dataset(n_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a physically plausible synthetic dataset for ML model training and evaluation.
    Clearly marks dataset provenance as synthetic demonstration data.
    """
    np.random.seed(random_seed)
    
    records = []
    vessel_types = list(VESSEL_TYPE_SPECS.keys())
    fuel_types = list(FUEL_ENERGY_RATIOS.keys())
    
    for _ in range(n_samples):
        v_type = np.random.choice(vessel_types)
        spec = VESSEL_TYPE_SPECS[v_type]
        
        # Capacity (tonnes DWT)
        capacity = np.round(np.random.uniform(spec["min_cap"], spec["max_cap"]), -2)
        
        # Cargo load as fraction of capacity (typically 40% to 100%)
        load_factor = np.random.uniform(0.35, 0.98)
        cargo_load = np.round(capacity * load_factor, 1)
        
        # Speed (knots)
        speed = np.round(np.random.uniform(spec["min_speed"], spec["max_speed"]), 2)
        
        # Distance (nautical miles)
        distance = np.round(np.random.uniform(300, 12000), 1)
        
        # Fuel type
        fuel = np.random.choice(fuel_types, p=[0.45, 0.20, 0.15, 0.10, 0.10])
        
        # Engine power (kW)
        engine_power = np.round(np.random.uniform(spec["engine_power_range"][0], spec["engine_power_range"][1]), -1)
        
        # Weather factor (1.0 = calm sea, 1.25 = rough sea with head waves)
        weather_factor = np.round(np.random.uniform(0.95, 1.25), 3)
        
        # Hydrodynamic physics-based fuel calculation:
        # P ~ (Displacement)^(2/3) * (Speed)^3
        # Displacement ~ Lightship (0.25*cap) + CargoLoad
        displacement = (0.25 * capacity) + cargo_load
        design_displacement = 1.25 * capacity
        
        speed_ratio = speed / spec["design_speed"]
        disp_ratio = displacement / design_displacement
        
        # Daily fuel consumption rate in tonnes/day (Cubic speed law with displacement weighting)
        base_rate = spec["base_fuel_rate"] * (capacity / ((spec["min_cap"] + spec["max_cap"]) / 2.0)) ** 0.6
        daily_tonnes_diesel = (
            base_rate
            * (speed_ratio ** 3.05)
            * (disp_ratio ** 0.67)
            * weather_factor
        )
        
        # Adjust for fuel energy density
        fuel_energy_mult = FUEL_ENERGY_RATIOS[fuel]
        daily_fuel_rate = daily_tonnes_diesel * fuel_energy_mult
        
        # Travel time in hours and days
        travel_hours = distance / speed
        travel_days = travel_hours / 24.0
        
        # Total voyage fuel consumption
        base_fuel_consumption = daily_fuel_rate * travel_days
        
        # Add realistic sensor/operational variance noise (+- 3.5%)
        noise = np.random.normal(1.0, 0.035)
        total_fuel_consumption = max(1.0, round(base_fuel_consumption * noise, 3))
        
        records.append({
            "vessel_type": v_type,
            "capacity": float(capacity),
            "cargo_load": float(cargo_load),
            "distance": float(distance),
            "speed": float(speed),
            "fuel_type": fuel,
            "engine_power": float(engine_power),
            "weather_factor": float(weather_factor),
            "fuel_consumption": float(total_fuel_consumption),
            "is_synthetic": True,
            "dataset_tag": "GREENQUANT_SYNTHETIC_BENCHMARK_V1"
        })
        
    df = pd.DataFrame(records)
    return df

def save_default_dataset_if_needed(csv_path: str) -> str:
    """Ensures default synthetic dataset exists and returns filepath."""
    if not os.path.exists(csv_path):
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        df = generate_synthetic_dataset(2500, random_seed=42)
        df.to_csv(csv_path, index=False)
        print(f"[Dataset] Generated {len(df)} synthetic records to {csv_path}")
    return csv_path

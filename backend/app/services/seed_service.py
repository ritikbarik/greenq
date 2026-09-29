"""
Database seeding service.
Generates 20 realistic vessels across 5 types, 6 fuels/energy types,
pre-configured global shipping routes with waypoints, and baseline scenarios.
Clearly labeled as realistic demo/benchmark dataset.
"""

import json
from sqlalchemy.orm import Session
from app.models.all_models import Vessel, Fuel, Route, Scenario
from app.emissions.calculator import DEFAULT_EMISSION_FACTORS

DEMO_VESSELS = [
    # Container Ships
    {
        "vessel_id": "VSL-CNT-01", "name": "Pacific Horizon", "vessel_type": "Container Ship",
        "capacity": 85000.0, "current_location": "Singapore Anchorage", "latitude": 1.290270, "longitude": 103.851959,
        "min_speed": 12.0, "max_speed": 22.0, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel,LNG,Methanol",
        "fuel_consumption_rate": 68.0, "fuel_tank_capacity": 4200.0, "operating_cost": 48000.0, "availability": True,
        "engine_power_kw": 52000.0, "build_year": 2020
    },
    {
        "vessel_id": "VSL-CNT-02", "name": "Atlantic Pioneer", "vessel_type": "Container Ship",
        "capacity": 62000.0, "current_location": "Rotterdam Gateway", "latitude": 51.924420, "longitude": 4.477733,
        "min_speed": 12.0, "max_speed": 21.0, "fuel_type": "LNG", "compatible_fuels": "Marine Diesel,LNG",
        "fuel_consumption_rate": 54.0, "fuel_tank_capacity": 3600.0, "operating_cost": 42000.0, "availability": True,
        "engine_power_kw": 44000.0, "build_year": 2021
    },
    {
        "vessel_id": "VSL-CNT-03", "name": "Green Quantum Trader", "vessel_type": "Container Ship",
        "capacity": 55000.0, "current_location": "Shanghai Port", "latitude": 31.230416, "longitude": 121.473701,
        "min_speed": 11.5, "max_speed": 20.5, "fuel_type": "Methanol", "compatible_fuels": "Marine Diesel,Methanol",
        "fuel_consumption_rate": 50.0, "fuel_tank_capacity": 3400.0, "operating_cost": 41000.0, "availability": True,
        "engine_power_kw": 38000.0, "build_year": 2023
    },
    {
        "vessel_id": "VSL-CNT-04", "name": "Ocean Voyager X", "vessel_type": "Container Ship",
        "capacity": 92000.0, "current_location": "Suez Canal Approach", "latitude": 29.976480, "longitude": 32.559895,
        "min_speed": 13.0, "max_speed": 23.5, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel,LNG",
        "fuel_consumption_rate": 72.0, "fuel_tank_capacity": 4800.0, "operating_cost": 54000.0, "availability": True,
        "engine_power_kw": 61000.0, "build_year": 2019
    },
    # Bulk Carriers
    {
        "vessel_id": "VSL-BLK-01", "name": "Iron Sentinel", "vessel_type": "Bulk Carrier",
        "capacity": 120000.0, "current_location": "Port Hedland", "latitude": -20.312841, "longitude": 118.575294,
        "min_speed": 10.0, "max_speed": 15.5, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel,Ammonia",
        "fuel_consumption_rate": 36.0, "fuel_tank_capacity": 3200.0, "operating_cost": 28000.0, "availability": True,
        "engine_power_kw": 22000.0, "build_year": 2017
    },
    {
        "vessel_id": "VSL-BLK-02", "name": "Ceres Titan", "vessel_type": "Bulk Carrier",
        "capacity": 95000.0, "current_location": "Santos Port", "latitude": -23.9618, "longitude": -46.3322,
        "min_speed": 9.5, "max_speed": 14.8, "fuel_type": "LNG", "compatible_fuels": "Marine Diesel,LNG",
        "fuel_consumption_rate": 31.0, "fuel_tank_capacity": 2800.0, "operating_cost": 25000.0, "availability": True,
        "engine_power_kw": 18500.0, "build_year": 2022
    },
    {
        "vessel_id": "VSL-BLK-03", "name": "Grain Vanguard", "vessel_type": "Bulk Carrier",
        "capacity": 75000.0, "current_location": "Singapore Strait", "latitude": 1.2500, "longitude": 103.8000,
        "min_speed": 10.0, "max_speed": 15.0, "fuel_type": "Ammonia", "compatible_fuels": "Marine Diesel,Ammonia",
        "fuel_consumption_rate": 28.0, "fuel_tank_capacity": 2500.0, "operating_cost": 23500.0, "availability": True,
        "engine_power_kw": 16000.0, "build_year": 2024
    },
    {
        "vessel_id": "VSL-BLK-04", "name": "Nordic Giant", "vessel_type": "Bulk Carrier",
        "capacity": 150000.0, "current_location": "Tubarao Port", "latitude": -20.2858, "longitude": -40.2458,
        "min_speed": 10.5, "max_speed": 15.2, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel",
        "fuel_consumption_rate": 42.0, "fuel_tank_capacity": 3800.0, "operating_cost": 33000.0, "availability": True,
        "engine_power_kw": 26000.0, "build_year": 2016
    },
    # Tankers
    {
        "vessel_id": "VSL-TNK-01", "name": "Equator Spirit", "vessel_type": "Tanker",
        "capacity": 110000.0, "current_location": "Ras Tanura", "latitude": 26.6433, "longitude": 50.1583,
        "min_speed": 11.0, "max_speed": 16.0, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel,Methanol",
        "fuel_consumption_rate": 40.0, "fuel_tank_capacity": 3500.0, "operating_cost": 34000.0, "availability": True,
        "engine_power_kw": 24000.0, "build_year": 2018
    },
    {
        "vessel_id": "VSL-TNK-02", "name": "Solaris Chemist", "vessel_type": "Tanker",
        "capacity": 65000.0, "current_location": "Houston Ship Channel", "latitude": 29.7604, "longitude": -95.3698,
        "min_speed": 11.0, "max_speed": 15.5, "fuel_type": "Methanol", "compatible_fuels": "Marine Diesel,Methanol",
        "fuel_consumption_rate": 32.0, "fuel_tank_capacity": 2700.0, "operating_cost": 29000.0, "availability": True,
        "engine_power_kw": 18000.0, "build_year": 2022
    },
    {
        "vessel_id": "VSL-TNK-03", "name": "Blue Horizon LNG", "vessel_type": "Tanker",
        "capacity": 85000.0, "current_location": "Qatar Ras Laffan", "latitude": 25.9080, "longitude": 51.5360,
        "min_speed": 12.0, "max_speed": 18.0, "fuel_type": "LNG", "compatible_fuels": "Marine Diesel,LNG",
        "fuel_consumption_rate": 38.0, "fuel_tank_capacity": 4000.0, "operating_cost": 36000.0, "availability": True,
        "engine_power_kw": 25000.0, "build_year": 2021
    },
    {
        "vessel_id": "VSL-TNK-04", "name": "Arctic Navigator", "vessel_type": "Tanker",
        "capacity": 140000.0, "current_location": "Mongstad Port", "latitude": 60.8122, "longitude": 5.0333,
        "min_speed": 10.5, "max_speed": 16.5, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel",
        "fuel_consumption_rate": 46.0, "fuel_tank_capacity": 4100.0, "operating_cost": 37000.0, "availability": True,
        "engine_power_kw": 28000.0, "build_year": 2017
    },
    # Ro-Ro (Roll-on/Roll-off)
    {
        "vessel_id": "VSL-ROR-01", "name": "Auto Express I", "vessel_type": "Ro-Ro",
        "capacity": 32000.0, "current_location": "Bremerhaven", "latitude": 53.5396, "longitude": 8.5809,
        "min_speed": 14.0, "max_speed": 21.0, "fuel_type": "LNG", "compatible_fuels": "Marine Diesel,LNG",
        "fuel_consumption_rate": 39.0, "fuel_tank_capacity": 2400.0, "operating_cost": 31000.0, "availability": True,
        "engine_power_kw": 29000.0, "build_year": 2021
    },
    {
        "vessel_id": "VSL-ROR-02", "name": "Global Transporter", "vessel_type": "Ro-Ro",
        "capacity": 28000.0, "current_location": "Yokohama Port", "latitude": 35.4437, "longitude": 139.6380,
        "min_speed": 13.5, "max_speed": 20.0, "fuel_type": "Hydrogen", "compatible_fuels": "Marine Diesel,Hydrogen",
        "fuel_consumption_rate": 35.0, "fuel_tank_capacity": 2200.0, "operating_cost": 32000.0, "availability": True,
        "engine_power_kw": 26000.0, "build_year": 2024
    },
    {
        "vessel_id": "VSL-ROR-03", "name": "Viking Carrier", "vessel_type": "Ro-Ro",
        "capacity": 36000.0, "current_location": "Gothenburg Port", "latitude": 57.7089, "longitude": 11.9746,
        "min_speed": 14.0, "max_speed": 21.5, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel,Methanol",
        "fuel_consumption_rate": 41.0, "fuel_tank_capacity": 2800.0, "operating_cost": 33000.0, "availability": True,
        "engine_power_kw": 31000.0, "build_year": 2019
    },
    {
        "vessel_id": "VSL-ROR-04", "name": "Pacific Highway", "vessel_type": "Ro-Ro",
        "capacity": 24000.0, "current_location": "Long Beach Port", "latitude": 33.7701, "longitude": -118.1937,
        "min_speed": 13.0, "max_speed": 19.5, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel",
        "fuel_consumption_rate": 33.0, "fuel_tank_capacity": 2100.0, "operating_cost": 27000.0, "availability": True,
        "engine_power_kw": 23000.0, "build_year": 2018
    },
    # General Cargo
    {
        "vessel_id": "VSL-GEN-01", "name": "Island Trader II", "vessel_type": "General Cargo",
        "capacity": 22000.0, "current_location": "Colombo Port", "latitude": 6.9271, "longitude": 79.8612,
        "min_speed": 10.0, "max_speed": 16.5, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel,LNG",
        "fuel_consumption_rate": 19.0, "fuel_tank_capacity": 1600.0, "operating_cost": 17000.0, "availability": True,
        "engine_power_kw": 12000.0, "build_year": 2017
    },
    {
        "vessel_id": "VSL-GEN-02", "name": "Archipelago Star", "vessel_type": "General Cargo",
        "capacity": 18000.0, "current_location": "Jakarta Tanjung Priok", "latitude": -6.2088, "longitude": 106.8456,
        "min_speed": 9.5, "max_speed": 15.5, "fuel_type": "Methanol", "compatible_fuels": "Marine Diesel,Methanol",
        "fuel_consumption_rate": 16.5, "fuel_tank_capacity": 1400.0, "operating_cost": 16000.0, "availability": True,
        "engine_power_kw": 10500.0, "build_year": 2023
    },
    {
        "vessel_id": "VSL-GEN-03", "name": "Baltic Merchant", "vessel_type": "General Cargo",
        "capacity": 25000.0, "current_location": "Gdansk Port", "latitude": 54.3520, "longitude": 18.6466,
        "min_speed": 10.0, "max_speed": 17.0, "fuel_type": "Marine Diesel", "compatible_fuels": "Marine Diesel",
        "fuel_consumption_rate": 21.0, "fuel_tank_capacity": 1800.0, "operating_cost": 18500.0, "availability": True,
        "engine_power_kw": 13500.0, "build_year": 2018
    },
    {
        "vessel_id": "VSL-GEN-04", "name": "Southern Cross", "vessel_type": "General Cargo",
        "capacity": 15000.0, "current_location": "Auckland Port", "latitude": -36.8485, "longitude": 174.7633,
        "min_speed": 9.0, "max_speed": 15.0, "fuel_type": "Hydrogen", "compatible_fuels": "Marine Diesel,Hydrogen",
        "fuel_consumption_rate": 14.0, "fuel_tank_capacity": 1200.0, "operating_cost": 15000.0, "availability": True,
        "engine_power_kw": 9500.0, "build_year": 2024
    }
]

DEMO_FUELS = [
    {
        "name": "Marine Diesel (MGO/VLSFO)", "code": "DIESEL",
        "price_per_unit": 680.0, "unit": "USD/tonne", "energy_density_mj_kg": 42.7,
        "emission_factor_tco2_t": 3.151, "lifecycle_emission_factor_tco2e_t": 3.580,
        "availability": "High", "is_clean_alternative": False,
        "description": "Standard IMO benchmark marine gasoil/very low sulphur fuel oil."
    },
    {
        "name": "Liquefied Natural Gas (LNG)", "code": "LNG",
        "price_per_unit": 750.0, "unit": "USD/tonne", "energy_density_mj_kg": 50.0,
        "emission_factor_tco2_t": 2.750, "lifecycle_emission_factor_tco2e_t": 3.120,
        "availability": "High", "is_clean_alternative": True,
        "description": "Cryogenic methane dual-fuel option reducing particulate matter and operational CO2."
    },
    {
        "name": "Green E-Methanol", "code": "METHANOL",
        "price_per_unit": 890.0, "unit": "USD/tonne", "energy_density_mj_kg": 19.9,
        "emission_factor_tco2_t": 1.375, "lifecycle_emission_factor_tco2e_t": 0.480,
        "availability": "Medium", "is_clean_alternative": True,
        "description": "Synthetic or biogenic liquid alcohol offering over 80% net well-to-wake decarbonization."
    },
    {
        "name": "Green Hydrogen (LH2)", "code": "HYDROGEN",
        "price_per_unit": 2850.0, "unit": "USD/tonne", "energy_density_mj_kg": 120.0,
        "emission_factor_tco2_t": 0.000, "lifecycle_emission_factor_tco2e_t": 0.180,
        "availability": "Emerging", "is_clean_alternative": True,
        "description": "Zero-tailpipe fuel cell or combustion fuel with very high gravimetric energy density."
    },
    {
        "name": "Green Ammonia (NH3)", "code": "AMMONIA",
        "price_per_unit": 1150.0, "unit": "USD/tonne", "energy_density_mj_kg": 18.6,
        "emission_factor_tco2_t": 0.000, "lifecycle_emission_factor_tco2e_t": 0.220,
        "availability": "Emerging", "is_clean_alternative": True,
        "description": "Carbon-free hydrogen carrier synthesized via renewable Haber-Bosch process."
    },
    {
        "name": "Shore Power (Cold Ironing)", "code": "SHORE_POWER",
        "price_per_unit": 160.0, "unit": "USD/MWh", "energy_density_mj_kg": 3.6,
        "emission_factor_tco2_t": 0.000, "lifecycle_emission_factor_tco2e_t": 0.350,
        "availability": "Port-Dependent", "is_clean_alternative": True,
        "description": "High-voltage shore electrical connection during port berth dwell."
    }
]

DEMO_ROUTES = [
    {
        "name": "Asia-Europe Trunk Route (Singapore to Rotterdam)",
        "origin_port": "Singapore", "destination_port": "Rotterdam",
        "distance_nm": 8300.0, "origin_lat": 1.290270, "origin_lng": 103.851959,
        "dest_lat": 51.924420, "dest_lng": 4.477733,
        "waypoints_json": json.dumps([
            [1.290270, 103.851959],
            [5.95, 95.20],
            [11.80, 52.00],
            [12.50, 43.50],
            [27.80, 34.30],
            [31.25, 32.30],
            [36.50, -5.00],
            [43.80, -9.50],
            [51.924420, 4.477733]
        ]),
        "typical_weather_factor": 1.05
    },
    {
        "name": "Transpacific Eastbound (Shanghai to Los Angeles)",
        "origin_port": "Shanghai", "destination_port": "Los Angeles",
        "distance_nm": 5800.0, "origin_lat": 31.230416, "origin_lng": 121.473701,
        "dest_lat": 33.7405, "dest_lng": -118.2720,
        "waypoints_json": json.dumps([
            [31.230416, 121.473701],
            [34.0, 130.0],
            [38.0, 150.0],
            [40.0, 180.0],
            [38.0, -150.0],
            [34.0, -125.0],
            [33.7405, -118.2720]
        ]),
        "typical_weather_factor": 1.12
    },
    {
        "name": "Middle East Energy Corridor (Ras Tanura to Singapore)",
        "origin_port": "Ras Tanura", "destination_port": "Singapore",
        "distance_nm": 3650.0, "origin_lat": 26.6433, "origin_lng": 50.1583,
        "dest_lat": 1.290270, "dest_lng": 103.851959,
        "waypoints_json": json.dumps([
            [26.6433, 50.1583],
            [25.0, 57.0],
            [20.0, 65.0],
            [8.0, 78.0],
            [5.5, 95.0],
            [1.290270, 103.851959]
        ]),
        "typical_weather_factor": 1.02
    }
]

def seed_database_if_empty(db: Session):
    """Populates initial database records if empty."""
    vessel_count = db.query(Vessel).count()
    if vessel_count == 0:
        for v in DEMO_VESSELS:
            db.add(Vessel(**v))
        print(f"[Seed] Created {len(DEMO_VESSELS)} demo vessels.")

    fuel_count = db.query(Fuel).count()
    if fuel_count == 0:
        for f in DEMO_FUELS:
            db.add(Fuel(**f))
        print(f"[Seed] Created {len(DEMO_FUELS)} standard fuels.")

    route_count = db.query(Route).count()
    if route_count == 0:
        for r in DEMO_ROUTES:
            db.add(Route(**r))
        print(f"[Seed] Created {len(DEMO_ROUTES)} global routes.")

    db.commit()

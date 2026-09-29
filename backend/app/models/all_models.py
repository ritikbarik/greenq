from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(Integer, primary_key=True, index=True)
    vessel_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    vessel_type = Column(String(50), nullable=False)  # Container Ship, Bulk Carrier, Tanker, Ro-Ro, General Cargo
    capacity = Column(Float, nullable=False)  # tonnes / DWT
    current_location = Column(String(100), default="Singapore Anchorage")
    latitude = Column(Float, default=1.290270)
    longitude = Column(Float, default=103.851959)
    max_speed = Column(Float, nullable=False)  # knots
    min_speed = Column(Float, nullable=False)  # knots
    fuel_type = Column(String(50), nullable=False)  # Primary fuel
    compatible_fuels = Column(Text, default="Marine Diesel")  # comma separated
    fuel_consumption_rate = Column(Float, nullable=False)  # tonnes/day at design speed
    fuel_tank_capacity = Column(Float, nullable=False)  # tonnes
    operating_cost = Column(Float, nullable=False)  # USD/day
    availability = Column(Boolean, default=True)
    engine_power_kw = Column(Float, default=15000.0)
    build_year = Column(Integer, default=2018)
    created_at = Column(DateTime, default=datetime.utcnow)


class Fuel(Base):
    __tablename__ = "fuels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    price_per_unit = Column(Float, nullable=False)  # USD per tonne / MWh
    unit = Column(String(20), default="USD/tonne")
    energy_density_mj_kg = Column(Float, nullable=False)  # MJ/kg
    emission_factor_tco2_t = Column(Float, nullable=False)  # Tank-to-Wake tCO2/t fuel
    lifecycle_emission_factor_tco2e_t = Column(Float, nullable=False)  # Well-to-Wake tCO2e/t fuel
    availability = Column(String(50), default="High")  # High, Medium, Low, Port-Dependent
    is_clean_alternative = Column(Boolean, default=False)
    description = Column(Text, nullable=True)


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    origin_port = Column(String(100), nullable=False)
    destination_port = Column(String(100), nullable=False)
    distance_nm = Column(Float, nullable=False)  # Nautical miles
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    waypoints_json = Column(Text, nullable=True)  # JSON list of [lat, lng]
    typical_weather_factor = Column(Float, default=1.0)


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    mission_name = Column(String(150), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    distance_nm = Column(Float, nullable=False)
    cargo_demand = Column(Float, nullable=False)  # Tonnes
    delivery_deadline = Column(Float, nullable=False)  # Hours
    weather_condition = Column(String(50), default="Moderate Sea")
    weather_factor = Column(Float, default=1.05)
    max_allowed_emissions = Column(Float, nullable=True)  # Optional emission cap
    available_vessels_json = Column(Text, nullable=True)
    available_fuels_json = Column(Text, nullable=True)
    status = Column(String(50), default="PLANNED")
    created_at = Column(DateTime, default=datetime.utcnow)


class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(String(50), primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    algorithm = Column(String(50), nullable=False)  # QIGA, GA, PSO
    population_size = Column(Integer, default=50)
    iterations = Column(Integer, default=100)
    mutation_rate = Column(Float, default=0.05)
    fuel_weight = Column(Float, default=0.33)
    cost_weight = Column(Float, default=0.33)
    emission_weight = Column(Float, default=0.34)
    best_fitness = Column(Float, nullable=False)
    total_fuel_tonnes = Column(Float, nullable=False)
    total_cost_usd = Column(Float, nullable=False)
    total_co2_tonnes = Column(Float, nullable=False)
    total_lifecycle_co2e_tonnes = Column(Float, nullable=False)
    cargo_fulfilled_tonnes = Column(Float, nullable=False)
    delivery_time_hours = Column(Float, nullable=False)
    execution_time_ms = Column(Float, nullable=False)
    iterations_completed = Column(Integer, nullable=False)
    is_feasible = Column(Boolean, default=True)
    constraint_violations = Column(Text, nullable=True)
    convergence_history_json = Column(Text, nullable=False)  # list of best fitness per iteration
    solution_details_json = Column(Text, nullable=False)  # deployed vessels with assigned speed, fuel, cost, emissions
    explainability_summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    scenario_code = Column(String(50), unique=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    fuel_focus = Column(String(50), nullable=False)
    carbon_tax_per_tonne = Column(Float, default=0.0)
    result_metrics_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    vessel_type = Column(String(50), nullable=False)
    capacity = Column(Float, nullable=False)
    cargo_load = Column(Float, nullable=False)
    distance = Column(Float, nullable=False)
    speed = Column(Float, nullable=False)
    fuel_type = Column(String(50), nullable=False)
    engine_power = Column(Float, nullable=False)
    weather_factor = Column(Float, default=1.0)
    predicted_fuel = Column(Float, nullable=False)
    model_name = Column(String(100), default="RandomForestRegressor")
    created_at = Column(DateTime, default=datetime.utcnow)

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Vessel schemas
class VesselBase(BaseModel):
    vessel_id: str
    name: str
    vessel_type: str
    capacity: float
    current_location: str = "Singapore Anchorage"
    latitude: float = 1.290270
    longitude: float = 103.851959
    max_speed: float
    min_speed: float
    fuel_type: str
    compatible_fuels: str = "Marine Diesel"
    fuel_consumption_rate: float
    fuel_tank_capacity: float
    operating_cost: float
    availability: bool = True
    engine_power_kw: float = 15000.0
    build_year: int = 2018

class VesselCreate(VesselBase):
    pass

class VesselUpdate(BaseModel):
    name: Optional[str] = None
    vessel_type: Optional[str] = None
    capacity: Optional[float] = None
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_speed: Optional[float] = None
    min_speed: Optional[float] = None
    fuel_type: Optional[str] = None
    compatible_fuels: Optional[str] = None
    fuel_consumption_rate: Optional[float] = None
    fuel_tank_capacity: Optional[float] = None
    operating_cost: Optional[float] = None
    availability: Optional[bool] = None
    engine_power_kw: Optional[float] = None

class VesselResponse(VesselBase):
    id: int

    class Config:
        from_attributes = True

# Fuel schemas
class FuelBase(BaseModel):
    name: str
    code: str
    price_per_unit: float
    unit: str = "USD/tonne"
    energy_density_mj_kg: float
    emission_factor_tco2_t: float
    lifecycle_emission_factor_tco2e_t: float
    availability: str = "High"
    is_clean_alternative: bool = False
    description: Optional[str] = None

class FuelCreate(FuelBase):
    pass

class FuelUpdate(BaseModel):
    price_per_unit: Optional[float] = None
    energy_density_mj_kg: Optional[float] = None
    emission_factor_tco2_t: Optional[float] = None
    lifecycle_emission_factor_tco2e_t: Optional[float] = None
    availability: Optional[str] = None

class FuelResponse(FuelBase):
    id: int

    class Config:
        from_attributes = True

# Prediction schemas
class FuelPredictionInput(BaseModel):
    vessel_type: str = Field(..., example="Container Ship")
    capacity: float = Field(..., example=50000.0)
    cargo_load: float = Field(..., example=42000.0)
    distance: float = Field(..., example=1200.0)
    speed: float = Field(..., example=16.5)
    fuel_type: str = Field(..., example="Marine Diesel")
    engine_power: float = Field(default=18000.0, example=18000.0)
    weather_factor: float = Field(default=1.05, example=1.05)

class FuelPredictionOutput(BaseModel):
    predicted_fuel_tonnes: float
    specific_consumption_per_nm: float
    fuel_cost_estimate_usd: float
    co2_emissions_tonnes: float
    lifecycle_emissions_tonnes: float
    model_used: str
    explanation: Dict[str, Any]

class ModelMetricsResponse(BaseModel):
    model_name: str
    mae: float
    rmse: float
    r2_score: float
    training_samples: int
    testing_samples: int
    feature_importances: Dict[str, float]
    actual_vs_predicted_sample: List[Dict[str, float]]

# Emissions & Cost schemas
class EmissionCalcInput(BaseModel):
    fuel_type: str
    fuel_consumption_tonnes: float
    custom_emission_factor: Optional[float] = None
    custom_lifecycle_factor: Optional[float] = None

class EmissionCalcOutput(BaseModel):
    fuel_type: str
    fuel_consumption_tonnes: float
    operational_co2_tonnes: float
    lifecycle_co2e_tonnes: float
    co2_factor_used: float
    lifecycle_factor_used: float
    emissions_per_tonne_km: Optional[float] = None

class CostCalcInput(BaseModel):
    fuel_consumption_tonnes: float
    fuel_price_per_tonne: float
    vessel_operating_cost_daily: float
    travel_time_hours: float
    shore_power_used: bool = False
    shore_power_cost: float = 0.0
    delay_penalty_usd: float = 0.0

class CostCalcOutput(BaseModel):
    fuel_cost: float
    vessel_operating_cost: float
    shore_power_cost: float
    penalty_cost: float
    total_cost: float
    breakdown_percentages: Dict[str, float]

# Optimization schemas
class DeployedVesselPlan(BaseModel):
    vessel_id: str
    vessel_name: str
    vessel_type: str
    assigned_cargo: float
    speed_knots: float
    fuel_type: str
    shore_power_used: bool
    travel_time_hours: float
    fuel_consumption_tonnes: float
    operating_cost_usd: float
    co2_emissions_tonnes: float
    lifecycle_co2e_tonnes: float

class OptimizationRequest(BaseModel):
    origin: str = "Singapore"
    destination: str = "Rotterdam"
    distance_nm: float = 8300.0
    cargo_demand: float = 85000.0
    delivery_deadline_hours: float = 480.0
    weather_condition: str = "Moderate Sea"
    weather_factor: float = 1.05
    max_allowed_emissions: Optional[float] = None
    selected_vessel_ids: Optional[List[str]] = None
    allowed_fuels: Optional[List[str]] = None
    fuel_weight: float = Field(0.33, ge=0.0, le=1.0)
    cost_weight: float = Field(0.33, ge=0.0, le=1.0)
    emission_weight: float = Field(0.34, ge=0.0, le=1.0)
    algorithm: str = Field("QIGA", example="QIGA")  # QIGA, GA, PSO
    population_size: int = Field(40, ge=10, le=200)
    iterations: int = Field(80, ge=10, le=300)
    random_seed: int = 42

class OptimizationResultResponse(BaseModel):
    run_id: str
    algorithm: str
    is_feasible: bool
    best_fitness: float
    total_fuel_tonnes: float
    total_cost_usd: float
    total_co2_tonnes: float
    total_lifecycle_co2e_tonnes: float
    cargo_fulfilled_tonnes: float
    cargo_demand_tonnes: float
    max_delivery_time_hours: float
    deadline_hours: float
    deployed_vessels: List[DeployedVesselPlan]
    iterations_completed: int
    execution_time_ms: float
    convergence_history: List[float]
    constraint_violations: List[str]
    explainability_summary: str
    priorities_label: str

# Benchmark schemas
class BenchmarkRequest(BaseModel):
    origin: str = "Singapore"
    destination: str = "Rotterdam"
    distance_nm: float = 8300.0
    cargo_demand: float = 85000.0
    delivery_deadline_hours: float = 480.0
    weather_factor: float = 1.05
    fuel_weight: float = 0.33
    cost_weight: float = 0.33
    emission_weight: float = 0.34
    population_size: int = 40
    iterations: int = 80
    random_seed: int = 42

class BenchmarkAlgorithmResult(BaseModel):
    algorithm_name: str
    best_fitness: float
    total_fuel_tonnes: float
    total_cost_usd: float
    total_co2_tonnes: float
    total_lifecycle_co2e_tonnes: float
    execution_time_ms: float
    iterations: int
    is_feasible: bool
    violations_count: int
    convergence_history: List[float]

class BenchmarkResponse(BaseModel):
    results: Dict[str, BenchmarkAlgorithmResult]
    comparison_summary: str
    execution_timestamp: str

# Scenario schemas
class ScenarioRequest(BaseModel):
    scenario_code: str  # DIESEL, LNG, METHANOL, HYDROGEN, AMMONIA, SHORE_POWER, CUSTOM
    distance_nm: float = 8300.0
    cargo_demand: float = 85000.0
    delivery_deadline_hours: float = 480.0
    carbon_tax_per_tonne: float = 0.0

class ScenarioResult(BaseModel):
    scenario_code: str
    scenario_name: str
    fuel_focus: str
    total_fuel_tonnes: float
    total_cost_usd: float
    total_co2_tonnes: float
    total_lifecycle_co2e_tonnes: float
    carbon_tax_cost_usd: float
    active_vessels_count: int
    fleet_utilization_pct: float
    delivery_reliability_pct: float
    is_feasible: bool
    notes: str

# Dashboard schemas
class DashboardSummaryResponse(BaseModel):
    total_vessels: int
    active_vessels: int
    total_capacity_tonnes: float
    fuel_consumption_tonnes: float
    operating_cost_usd: float
    co2_emissions_tonnes: float
    fleet_utilization_pct: float
    avg_vessel_speed_knots: float
    optimization_status: str
    fuel_mix: List[Dict[str, Any]]
    emission_trend: List[Dict[str, Any]]
    cost_breakdown: List[Dict[str, Any]]
    vessel_types_count: Dict[str, int]
    recent_runs: List[Dict[str, Any]]

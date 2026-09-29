export interface Vessel {
  id: number;
  vessel_id: string;
  name: string;
  vessel_type: string;
  capacity: number;
  current_location: string;
  latitude: number;
  longitude: number;
  min_speed: number;
  max_speed: number;
  fuel_type: string;
  compatible_fuels: string;
  fuel_consumption_rate: number;
  fuel_tank_capacity: number;
  operating_cost: number;
  availability: boolean;
  engine_power_kw: number;
  build_year: number;
}

export interface Fuel {
  id: number;
  name: string;
  code: string;
  price_per_unit: number;
  unit: string;
  energy_density_mj_kg: number;
  emission_factor_tco2_t: number;
  lifecycle_emission_factor_tco2e_t: number;
  availability: string;
  is_clean_alternative: boolean;
  description?: string;
}

export interface RouteItem {
  id: number;
  name: string;
  origin_port: string;
  destination_port: string;
  distance_nm: number;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  waypoints: [number, number][];
  typical_weather_factor: number;
}

export interface DeployedVesselPlan {
  vessel_id: string;
  vessel_name: string;
  vessel_type: string;
  assigned_cargo: number;
  speed_knots: number;
  fuel_type: string;
  shore_power_used: boolean;
  travel_time_hours: number;
  fuel_consumption_tonnes: number;
  operating_cost_usd: number;
  co2_emissions_tonnes: number;
  lifecycle_co2e_tonnes: number;
}

export interface OptimizationRequest {
  origin: string;
  destination: string;
  distance_nm: number;
  cargo_demand: number;
  delivery_deadline_hours: number;
  weather_condition: string;
  weather_factor: number;
  max_allowed_emissions?: number | null;
  selected_vessel_ids?: string[];
  fuel_weight: number;
  cost_weight: number;
  emission_weight: number;
  algorithm: 'QIGA' | 'GA' | 'PSO';
  population_size: number;
  iterations: number;
  random_seed: number;
}

export interface OptimizationResult {
  run_id: string;
  algorithm: string;
  is_feasible: boolean;
  best_fitness: number;
  total_fuel_tonnes: number;
  total_cost_usd: number;
  total_co2_tonnes: number;
  total_lifecycle_co2e_tonnes: number;
  cargo_fulfilled_tonnes: number;
  cargo_demand_tonnes: number;
  max_delivery_time_hours: number;
  deadline_hours: number;
  deployed_vessels: DeployedVesselPlan[];
  iterations_completed: number;
  execution_time_ms: number;
  convergence_history: number[];
  constraint_violations: string[];
  explainability_summary: string;
  priorities_label: string;
}

export interface BenchmarkAlgorithmResult {
  algorithm_name: string;
  best_fitness: number;
  total_fuel_tonnes: number;
  total_cost_usd: number;
  total_co2_tonnes: number;
  total_lifecycle_co2e_tonnes: number;
  execution_time_ms: number;
  iterations: number;
  is_feasible: boolean;
  violations_count: number;
  convergence_history: number[];
}

export interface BenchmarkResponse {
  results: Record<string, BenchmarkAlgorithmResult>;
  comparison_summary: string;
  execution_timestamp: string;
}

export interface ScenarioResult {
  scenario_code: string;
  scenario_name: string;
  fuel_focus: string;
  total_fuel_tonnes: number;
  total_cost_usd: number;
  total_co2_tonnes: number;
  total_lifecycle_co2e_tonnes: number;
  carbon_tax_cost_usd: number;
  active_vessels_count: number;
  fleet_utilization_pct: number;
  delivery_reliability_pct: number;
  is_feasible: boolean;
  notes: string;
}

export interface DashboardSummary {
  total_vessels: number;
  active_vessels: number;
  total_capacity_tonnes: number;
  fuel_consumption_tonnes: number;
  operating_cost_usd: number;
  co2_emissions_tonnes: number;
  fleet_utilization_pct: number;
  avg_vessel_speed_knots: number;
  optimization_status: string;
  fuel_mix: { name: string; value: number; percentage: number }[];
  emission_trend: { period: string; diesel_baseline: number; qiga_optimized: number; green_fuels: number }[];
  cost_breakdown: { category: string; amount: number; percentage: number }[];
  vessel_types_count: Record<string, number>;
  recent_runs: { id: string; algorithm: string; fitness: number; fuel: number; cost: number; co2: number; created_at: string }[];
}

export interface FuelPredictionInput {
  vessel_type: string;
  capacity: number;
  cargo_load: number;
  distance: number;
  speed: number;
  fuel_type: string;
  engine_power: number;
  weather_factor: number;
}

export interface FuelPredictionOutput {
  predicted_fuel_tonnes: number;
  specific_consumption_per_nm: number;
  fuel_cost_estimate_usd: number;
  co2_emissions_tonnes: number;
  lifecycle_emissions_tonnes: number;
  model_used: string;
  explanation: {
    speed_cube_impact: string;
    slow_steaming_saving: string;
    displacement_factor: string;
    weather_impact: string;
  };
}

export interface ModelMetrics {
  model_name: string;
  mae: number;
  rmse: number;
  r2_score: number;
  training_samples: number;
  testing_samples: number;
  feature_importances: Record<string, number>;
  actual_vs_predicted_sample: { actual: number; predicted: number; residual: number }[];
}

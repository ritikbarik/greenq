import axios from 'axios';
import {
  Vessel,
  Fuel,
  RouteItem,
  OptimizationRequest,
  OptimizationResult,
  BenchmarkResponse,
  ScenarioResult,
  DashboardSummary,
  FuelPredictionInput,
  FuelPredictionOutput,
  ModelMetrics,
} from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  // Fleet
  getVessels: async (): Promise<Vessel[]> => {
    const res = await apiClient.get<Vessel[]>('/vessels');
    return res.data;
  },
  createVessel: async (data: Omit<Vessel, 'id'>): Promise<Vessel> => {
    const res = await apiClient.post<Vessel>('/vessels', data);
    return res.data;
  },
  updateVessel: async (id: number, data: Partial<Vessel>): Promise<Vessel> => {
    const res = await apiClient.put<Vessel>(`/vessels/${id}`, data);
    return res.data;
  },
  deleteVessel: async (id: number): Promise<void> => {
    await apiClient.delete(`/vessels/${id}`);
  },

  // Fuels
  getFuels: async (): Promise<Fuel[]> => {
    const res = await apiClient.get<Fuel[]>('/fuels');
    return res.data;
  },
  updateFuel: async (id: number, data: Partial<Fuel>): Promise<Fuel> => {
    const res = await apiClient.put<Fuel>(`/fuels/${id}`, data);
    return res.data;
  },

  // Routes
  getRoutes: async (): Promise<RouteItem[]> => {
    const res = await apiClient.get<RouteItem[]>('/routes');
    return res.data;
  },

  // Fuel Prediction
  predictFuel: async (input: FuelPredictionInput): Promise<FuelPredictionOutput> => {
    const res = await apiClient.post<FuelPredictionOutput>('/predict/fuel', input);
    return res.data;
  },
  getModelMetrics: async (): Promise<ModelMetrics> => {
    const res = await apiClient.get<ModelMetrics>('/predict/metrics');
    return res.data;
  },
  retrainModel: async (modelType: string): Promise<ModelMetrics> => {
    const res = await apiClient.post<ModelMetrics>(`/predict/retrain?model_type=${modelType}`);
    return res.data;
  },

  // Optimization
  runOptimization: async (req: OptimizationRequest): Promise<OptimizationResult> => {
    const endpoint = req.algorithm === 'GA' ? '/optimize/ga' : req.algorithm === 'PSO' ? '/optimize/pso' : '/optimize/qiga';
    const res = await apiClient.post<OptimizationResult>(endpoint, req);
    return res.data;
  },
  getRecentOptimizationRuns: async () => {
    const res = await apiClient.get('/optimize/runs');
    return res.data;
  },

  // Benchmark
  runBenchmark: async (req: any): Promise<BenchmarkResponse> => {
    const res = await apiClient.post<BenchmarkResponse>('/benchmark', req);
    return res.data;
  },

  // Scenarios
  getScenarioPresets: async () => {
    const res = await apiClient.get('/scenario/presets');
    return res.data;
  },
  runScenario: async (payload: {
    scenario_code: string;
    distance_nm: number;
    cargo_demand: number;
    delivery_deadline_hours: number;
    carbon_tax_per_tonne: number;
  }): Promise<ScenarioResult> => {
    const res = await apiClient.post<ScenarioResult>('/scenario', payload);
    return res.data;
  },

  // Assumptions
  getAssumptions: async () => {
    const res = await apiClient.get('/assumptions');
    return res.data;
  },
  updateAssumptions: async (payload: any) => {
    const res = await apiClient.put('/assumptions', payload);
    return res.data;
  }
};

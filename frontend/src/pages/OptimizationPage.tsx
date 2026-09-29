import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Cpu,
  Sliders,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Fuel,
  DollarSign,
  CloudFog,
  Ship,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import { OptimizationRequest, OptimizationResult, DeployedVesselPlan } from '../types';

export const OptimizationPage: React.FC = () => {
  const location = useLocation();
  const passedState = location.state as Partial<OptimizationRequest> || {};

  // Form State
  const [origin, setOrigin] = useState(passedState.origin || 'Singapore');
  const [destination, setDestination] = useState(passedState.destination || 'Rotterdam');
  const [distance, setDistance] = useState(passedState.distance_nm || 8300);
  const [cargoDemand, setCargoDemand] = useState(passedState.cargo_demand || 85000);
  const [deliveryDeadline, setDeliveryDeadline] = useState(passedState.delivery_deadline_hours || 480);
  const [weatherFactor, setWeatherFactor] = useState(passedState.weather_factor || 1.05);
  const [maxEmissions, setMaxEmissions] = useState<number | null>(passedState.max_allowed_emissions || null);
  const [selectedVessels, setSelectedVessels] = useState<string[] | undefined>(passedState.selected_vessel_ids);

  // Multi-Objective Priority Weights
  const [fuelWeight, setFuelWeight] = useState(0.33);
  const [costWeight, setCostWeight] = useState(0.33);
  const [emissionWeight, setEmissionWeight] = useState(0.34);

  // Algorithm Controls
  const [algorithm, setAlgorithm] = useState<'QIGA' | 'GA' | 'PSO'>('QIGA');
  const [populationSize, setPopulationSize] = useState(40);
  const [iterations, setIterations] = useState(80);
  const [randomSeed, setRandomSeed] = useState(42);

  // Execution state
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Normalize weights automatically when user moves a slider
  const handleWeightChange = (type: 'fuel' | 'cost' | 'emission', val: number) => {
    if (type === 'fuel') {
      const remaining = 1.0 - val;
      const c = Number((remaining * (costWeight / (costWeight + emissionWeight || 1))).toFixed(2));
      const e = Number((remaining - c).toFixed(2));
      setFuelWeight(val);
      setCostWeight(c);
      setEmissionWeight(e);
    } else if (type === 'cost') {
      const remaining = 1.0 - val;
      const f = Number((remaining * (fuelWeight / (fuelWeight + emissionWeight || 1))).toFixed(2));
      const e = Number((remaining - f).toFixed(2));
      setCostWeight(val);
      setFuelWeight(f);
      setEmissionWeight(e);
    } else {
      const remaining = 1.0 - val;
      const f = Number((remaining * (fuelWeight / (fuelWeight + costWeight || 1))).toFixed(2));
      const c = Number((remaining - f).toFixed(2));
      setEmissionWeight(val);
      setFuelWeight(f);
      setCostWeight(c);
    }
  };

  const handleRunOptimization = async () => {
    setRunning(true);
    setError(null);
    try {
      const req: OptimizationRequest = {
        origin,
        destination,
        distance_nm: distance,
        cargo_demand: cargoDemand,
        delivery_deadline_hours: deliveryDeadline,
        weather_condition: 'Moderate Sea',
        weather_factor: weatherFactor,
        max_allowed_emissions: maxEmissions,
        selected_vessel_ids: selectedVessels,
        fuel_weight: fuelWeight,
        cost_weight: costWeight,
        emission_weight: emissionWeight,
        algorithm,
        population_size: populationSize,
        iterations,
        random_seed: randomSeed,
      };

      const res = await api.runOptimization(req);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Optimization failed to converge.');
    } finally {
      setRunning(false);
    }
  };

  // Run automatically on first mount
  useEffect(() => {
    handleRunOptimization();
  }, []);

  const convergenceChartData = result?.convergence_history.map((fit, idx) => ({
    iteration: idx + 1,
    best_fitness: fit,
  })) || [];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold text-white mb-1">Quantum-Inspired Fleet Optimization</h4>
            <span className="gq-badge gq-badge-cyan">QIGA Primary</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Quantum superposition and rotation gate optimization determining vessel deployment, speed profiles, and fuel allocations
          </span>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={running}
          className="btn-gq-primary py-2 px-4"
          style={{ fontSize: '0.9rem' }}
        >
          {running ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Optimizing Population...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Execute Optimization</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout: Config Controls on Left, Results on Right */}
      <div className="row g-4 mb-4">
        {/* Left Column: Multi-Objective Weights & Algorithm Settings */}
        <div className="col-lg-4">
          <div className="gq-card mb-3">
            <h6 className="fw-bold text-white mb-2 d-flex align-items-center gap-2">
              <Sliders size={17} color="var(--accent-cyan)" />
              <span>Multi-Objective Priorities</span>
            </h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Adjust slider weights to prioritize fuel conservation, voyage cost, or lifecycle emissions.
            </span>

            {/* Sliders */}
            <div className="mt-3">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                  <span className="text-muted">Fuel Conservation Weight (w₁)</span>
                  <strong className="text-info">{(fuelWeight * 100).toFixed(0)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  className="form-range"
                  value={fuelWeight}
                  onChange={(e) => handleWeightChange('fuel', Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                  <span className="text-muted">Operating Cost Weight (w₂)</span>
                  <strong className="text-warning">{(costWeight * 100).toFixed(0)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  className="form-range"
                  value={costWeight}
                  onChange={(e) => handleWeightChange('cost', Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                  <span className="text-muted">Lifecycle Emissions Weight (w₃)</span>
                  <strong className="text-success">{(emissionWeight * 100).toFixed(0)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  className="form-range"
                  value={emissionWeight}
                  onChange={(e) => handleWeightChange('emission', Number(e.target.value))}
                />
              </div>

              <div className="p-2 rounded mt-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                <span className="text-muted">Priority Profile: </span>
                <strong className="text-white">
                  {fuelWeight >= 0.5
                    ? 'Fuel-Conservation Focused'
                    : costWeight >= 0.5
                    ? 'Charter & Fuel Cost Focused'
                    : emissionWeight >= 0.5
                    ? 'Zero-Carbon / Decarbonization Focused'
                    : 'Balanced Multi-Objective Optimization'}
                </strong>
              </div>
            </div>
          </div>

          {/* Algorithm Hyperparameters */}
          <div className="gq-card">
            <h6 className="fw-bold text-white mb-2 d-flex align-items-center gap-2">
              <Cpu size={17} color="var(--accent-green)" />
              <span>Optimization Algorithm Hyperparameters</span>
            </h6>

            <div className="mb-3 mt-3">
              <label className="gq-label">Optimization Method</label>
              <select
                className="gq-select"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as any)}
              >
                <option value="QIGA">Quantum-Inspired Genetic Algorithm (Proposed QIGA)</option>
                <option value="GA">Classical Genetic Algorithm (Baseline GA)</option>
                <option value="PSO">Particle Swarm Optimization (Baseline PSO)</option>
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="gq-label">Population Size</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  className="gq-input"
                  value={populationSize}
                  onChange={(e) => setPopulationSize(Number(e.target.value))}
                />
              </div>

              <div className="col-6">
                <label className="gq-label">Generations / Iterations</label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  className="gq-input"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="gq-label">Deterministic Random Seed</label>
              <input
                type="number"
                className="gq-input"
                value={randomSeed}
                onChange={(e) => setRandomSeed(Number(e.target.value))}
              />
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                Guarantees academic reproducibility across experimental runs.
              </small>
            </div>
          </div>
        </div>

        {/* Right Column: Optimization Summary & Convergence Curve */}
        <div className="col-lg-8">
          {result ? (
            <div className="gq-card h-100">
              {/* Convergence Header */}
              <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom mb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="gq-badge gq-badge-green">
                      <CheckCircle size={13} /> {result.is_feasible ? 'Feasible Pareto Solution' : 'Infeasible Constraint Penalty'}
                    </span>
                    <span className="gq-badge gq-badge-cyan">{result.algorithm}</span>
                  </div>
                  <h5 className="fw-bold text-white mb-0 mt-1">Recommended Solution Under Selected Priorities</h5>
                </div>

                <div className="text-end">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Execution: <strong className="text-white">{result.execution_time_ms} ms</strong> | {result.iterations_completed} Iterations
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Objective Fitness: <strong className="text-info">{result.best_fitness.toFixed(4)}</strong>
                  </div>
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="row g-2 mb-3">
                <div className="col-md-3 col-6">
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--border-cyan)' }}>
                    <span className="metric-label" style={{ fontSize: '0.7rem' }}>Total Voyage Fuel</span>
                    <h5 className="fw-bold text-white mb-0 mt-1">{result.total_fuel_tonnes.toLocaleString()} t</h5>
                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Hydrodynamic Cube Law</small>
                  </div>
                </div>

                <div className="col-md-3 col-6">
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <span className="metric-label" style={{ fontSize: '0.7rem' }}>Total Voyage Cost</span>
                    <h5 className="fw-bold text-white mb-0 mt-1">${result.total_cost_usd.toLocaleString()}</h5>
                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>Fuel + Charter + Shore</small>
                  </div>
                </div>

                <div className="col-md-3 col-6">
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--border-green)' }}>
                    <span className="metric-label" style={{ fontSize: '0.7rem' }}>Lifecycle GHG (WTW)</span>
                    <h5 className="fw-bold text-white mb-0 mt-1">{result.total_lifecycle_co2e_tonnes.toLocaleString()} t</h5>
                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>{result.total_co2_tonnes.toLocaleString()} t direct CO₂</small>
                  </div>
                </div>

                <div className="col-md-3 col-6">
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <span className="metric-label" style={{ fontSize: '0.7rem' }}>Cargo &amp; Schedule</span>
                    <h5 className="fw-bold text-white mb-0 mt-1">{result.cargo_fulfilled_tonnes.toLocaleString()} t</h5>
                    <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                      {result.max_delivery_time_hours}h / {result.deadline_hours}h
                    </small>
                  </div>
                </div>
              </div>

              {/* Explainable Why This Solution Box */}
              <div className="p-3 rounded mb-3" style={{ backgroundColor: 'rgba(6, 11, 20, 0.7)', border: '1px solid var(--border-subtle)' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Sparkles size={16} color="var(--accent-green)" />
                  <strong className="text-white" style={{ fontSize: '0.82rem' }}>Why this solution?</strong>
                </div>
                <p className="mb-0" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {result.explainability_summary}
                </p>
              </div>

              {/* Convergence History Chart */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="metric-label">Convergence Trajectory: Best Population Fitness vs Iteration</span>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Generations: {result.iterations_completed}</span>
                </div>

                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={convergenceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="iteration" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
                      <Line
                        type="monotone"
                        dataKey="best_fitness"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Best Fitness"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="gq-card d-flex align-items-center justify-content-center p-5 text-center h-100">
              <div>
                <RefreshCw size={32} className="animate-spin text-info mb-2" />
                <h6 className="text-white">Executing QIGA Measurement Loop...</h6>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Fleet Plan Table */}
      {result && (
        <div className="gq-card p-0 overflow-hidden mb-4">
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h6 className="fw-bold text-white mb-0">Recommended Deployed Vessel Deployment Plan</h6>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Optimal operational speeds, fuel selections, and individual vessel voyage metrics
              </span>
            </div>

            <span className="gq-badge gq-badge-green">
              {result.deployed_vessels.length} Vessels Deployed
            </span>
          </div>

          <div className="table-responsive">
            <table className="gq-table">
              <thead>
                <tr>
                  <th>Vessel</th>
                  <th>Type</th>
                  <th>Assigned Cargo</th>
                  <th>Optimized Speed</th>
                  <th>Fuel Selection</th>
                  <th>Shore Power</th>
                  <th>Voyage Time</th>
                  <th>Fuel (tonnes)</th>
                  <th>Voyage Cost ($)</th>
                  <th>Emissions (tCO₂e)</th>
                </tr>
              </thead>
              <tbody>
                {result.deployed_vessels.map((v) => (
                  <tr key={v.vessel_id}>
                    <td>
                      <div>
                        <strong className="text-white">{v.vessel_name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{v.vessel_id}</div>
                      </div>
                    </td>
                    <td>
                      <span className="gq-badge gq-badge-cyan" style={{ fontSize: '0.72rem' }}>
                        {v.vessel_type}
                      </span>
                    </td>
                    <td>{v.assigned_cargo.toLocaleString()} t</td>
                    <td>
                      <strong className="text-info">{v.speed_knots}</strong> knots
                    </td>
                    <td>
                      <span className={`gq-badge ${v.fuel_type !== 'Marine Diesel' ? 'gq-badge-green' : 'gq-badge-amber'}`}>
                        {v.fuel_type}
                      </span>
                    </td>
                    <td>
                      {v.shore_power_used ? (
                        <span className="gq-badge gq-badge-green">Enabled</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Off</span>
                      )}
                    </td>
                    <td>{v.travel_time_hours} hrs ({(v.travel_time_hours / 24).toFixed(1)}d)</td>
                    <td className="fw-mono text-white">{v.fuel_consumption_tonnes.toLocaleString()}</td>
                    <td>${v.operating_cost_usd.toLocaleString()}</td>
                    <td className="text-success fw-semibold">{v.lifecycle_co2e_tonnes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

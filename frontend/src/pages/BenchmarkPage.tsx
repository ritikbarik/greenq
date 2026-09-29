import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Cpu,
  Play,
  Clock,
  Fuel,
  DollarSign,
  CloudFog,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';
import { BenchmarkResponse, BenchmarkAlgorithmResult } from '../types';

export const BenchmarkPage: React.FC = () => {
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Benchmarking parameters
  const [distance, setDistance] = useState(8300);
  const [cargoDemand, setCargoDemand] = useState(85000);
  const [deadline, setDeadline] = useState(480);
  const [populationSize, setPopulationSize] = useState(40);
  const [iterations, setIterations] = useState(80);
  const [randomSeed, setRandomSeed] = useState(42);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const data = await api.runBenchmark({
        distance_nm: distance,
        cargo_demand: cargoDemand,
        delivery_deadline_hours: deadline,
        population_size: populationSize,
        iterations: iterations,
        random_seed: randomSeed,
      });
      setBenchmark(data);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  // Format convergence data for multi-line comparison chart
  const gaHist = benchmark?.results?.GA?.convergence_history || [];
  const psoHist = benchmark?.results?.PSO?.convergence_history || [];
  const qigaHist = benchmark?.results?.QIGA?.convergence_history || [];

  const maxLen = Math.max(gaHist.length, psoHist.length, qigaHist.length);
  const convergenceData = [];
  for (let i = 0; i < maxLen; i++) {
    convergenceData.push({
      iteration: i + 1,
      GA: gaHist[i] !== undefined ? gaHist[i] : null,
      PSO: psoHist[i] !== undefined ? psoHist[i] : null,
      QIGA: qigaHist[i] !== undefined ? qigaHist[i] : null,
    });
  }

  // Metrics bar charts data
  const metricsComparisonData = [
    {
      metric: 'Fitness (Lower is Better)',
      GA: benchmark?.results?.GA?.best_fitness || 0,
      PSO: benchmark?.results?.PSO?.best_fitness || 0,
      QIGA: benchmark?.results?.QIGA?.best_fitness || 0,
    },
    {
      metric: 'Fuel Consumption (tonnes)',
      GA: benchmark?.results?.GA?.total_fuel_tonnes || 0,
      PSO: benchmark?.results?.PSO?.total_fuel_tonnes || 0,
      QIGA: benchmark?.results?.QIGA?.total_fuel_tonnes || 0,
    },
    {
      metric: 'Lifecycle GHG (tCO₂e)',
      GA: benchmark?.results?.GA?.total_lifecycle_co2e_tonnes || 0,
      PSO: benchmark?.results?.PSO?.total_lifecycle_co2e_tonnes || 0,
      QIGA: benchmark?.results?.QIGA?.total_lifecycle_co2e_tonnes || 0,
    },
  ];

  const runtimeData = [
    { algorithm: 'Classical GA', runtime_ms: benchmark?.results?.GA?.execution_time_ms || 0 },
    { algorithm: 'PSO', runtime_ms: benchmark?.results?.PSO?.execution_time_ms || 0 },
    { algorithm: 'Proposed QIGA', runtime_ms: benchmark?.results?.QIGA?.execution_time_ms || 0 },
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold text-white mb-1">Empirical Algorithm Benchmarking Suite</h4>
            <span className="gq-badge gq-badge-cyan">Empirical Truth</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Comparative evaluation of GA, PSO, and QIGA under identical problem formulation, population sizes, and random seed
          </span>
        </div>

        <button
          onClick={runBenchmark}
          disabled={loading}
          className="btn-gq-primary py-2 px-3"
          style={{ fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Running Benchmark...' : 'Rerun Benchmark Suite'}</span>
        </button>
      </div>

      {/* Scientific Integrity Note */}
      <div
        className="p-3 rounded-3 mb-4"
        style={{
          backgroundColor: 'rgba(15, 28, 48, 0.7)',
          border: '1px solid var(--border-cyan)',
        }}
      >
        <div className="d-flex align-items-start gap-2">
          <Info size={18} color="var(--accent-cyan)" className="mt-1 flex-shrink-0" />
          <div>
            <strong className="text-white" style={{ fontSize: '0.85rem' }}>Strict Academic Integrity Protocol:</strong>
            <p className="mb-0 mt-1" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              Results displayed below are measured live in real-time on conventional CPU execution using the identical objective
              evaluator, constraint penalty matrices, and random seed. No synthetic advantages or manipulated numbers are applied.
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Controls Bar */}
      <div className="gq-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-2">
            <label className="gq-label">Distance (NM)</label>
            <input
              type="number"
              className="gq-input"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>

          <div className="col-md-2">
            <label className="gq-label">Cargo Demand (t)</label>
            <input
              type="number"
              className="gq-input"
              value={cargoDemand}
              onChange={(e) => setCargoDemand(Number(e.target.value))}
            />
          </div>

          <div className="col-md-2">
            <label className="gq-label">Deadline (Hours)</label>
            <input
              type="number"
              className="gq-input"
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
            />
          </div>

          <div className="col-md-2">
            <label className="gq-label">Population Budget</label>
            <input
              type="number"
              className="gq-input"
              value={populationSize}
              onChange={(e) => setPopulationSize(Number(e.target.value))}
            />
          </div>

          <div className="col-md-2">
            <label className="gq-label">Generations</label>
            <input
              type="number"
              className="gq-input"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
            />
          </div>

          <div className="col-md-2">
            <label className="gq-label">Random Seed</label>
            <input
              type="number"
              className="gq-input"
              value={randomSeed}
              onChange={(e) => setRandomSeed(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison Cards */}
      {benchmark && (
        <div className="row g-3 mb-4">
          {/* Classical GA */}
          <div className="col-md-4">
            <div className="gq-card h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-white mb-0">Classical GA (Baseline)</h6>
                <span className="gq-badge gq-badge-cyan">Binary GA</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Crossover + Bit-flip Mutation</span>

              <div className="mt-3 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Best Fitness:</span>
                  <strong className="text-white fw-mono">{benchmark.results.GA?.best_fitness?.toFixed(4)}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Fuel Consumption:</span>
                  <strong className="text-white">{benchmark.results.GA?.total_fuel_tonnes?.toLocaleString()} t</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Operating Cost:</span>
                  <strong className="text-white">${benchmark.results.GA?.total_cost_usd?.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Lifecycle GHG:</span>
                  <strong className="text-white">{benchmark.results.GA?.total_lifecycle_co2e_tonnes?.toLocaleString()} t</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Execution Time:</span>
                  <strong className="text-info">{benchmark.results.GA?.execution_time_ms} ms</strong>
                </div>
              </div>
            </div>
          </div>

          {/* PSO */}
          <div className="col-md-4">
            <div className="gq-card h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-white mb-0">Particle Swarm (Baseline)</h6>
                <span className="gq-badge gq-badge-amber">Swarm PSO</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Velocity &amp; Inertia Clamping</span>

              <div className="mt-3 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Best Fitness:</span>
                  <strong className="text-white fw-mono">{benchmark.results.PSO?.best_fitness?.toFixed(4)}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Fuel Consumption:</span>
                  <strong className="text-white">{benchmark.results.PSO?.total_fuel_tonnes?.toLocaleString()} t</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Operating Cost:</span>
                  <strong className="text-white">${benchmark.results.PSO?.total_cost_usd?.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Lifecycle GHG:</span>
                  <strong className="text-white">{benchmark.results.PSO?.total_lifecycle_co2e_tonnes?.toLocaleString()} t</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Execution Time:</span>
                  <strong className="text-info">{benchmark.results.PSO?.execution_time_ms} ms</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Proposed QIGA */}
          <div className="col-md-4">
            <div className="gq-card gq-card-green h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-white mb-0">Proposed QIGA (Primary)</h6>
                <span className="gq-badge gq-badge-green">Q-bit Rotation</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Superposition Amplitudes &amp; Pauli-X</span>

              <div className="mt-3 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Best Fitness:</span>
                  <strong className="text-success fw-mono">{benchmark.results.QIGA?.best_fitness?.toFixed(4)}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Fuel Consumption:</span>
                  <strong className="text-white">{benchmark.results.QIGA?.total_fuel_tonnes?.toLocaleString()} t</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Operating Cost:</span>
                  <strong className="text-white">${benchmark.results.QIGA?.total_cost_usd?.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Lifecycle GHG:</span>
                  <strong className="text-white">{benchmark.results.QIGA?.total_lifecycle_co2e_tonnes?.toLocaleString()} t</strong>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Execution Time:</span>
                  <strong className="text-success">{benchmark.results.QIGA?.execution_time_ms} ms</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Algorithm Convergence Curves */}
      <div className="gq-card p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <h6 className="fw-bold text-white mb-0">Convergence Rate Comparison (Best Fitness vs Generation)</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Visualizing how rapidly each optimization method converges towards the Pareto front
            </span>
          </div>

          <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#38bdf8' }}>— Classical GA</span>
            <span style={{ color: '#f59e0b' }}>— Particle Swarm (PSO)</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>— Proposed QIGA</span>
          </div>
        </div>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={convergenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="iteration" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="GA" stroke="#38bdf8" strokeWidth={2} dot={false} name="Classical GA" />
              <Line type="monotone" dataKey="PSO" stroke="#f59e0b" strokeWidth={2} dot={false} name="Particle Swarm (PSO)" />
              <Line type="monotone" dataKey="QIGA" stroke="#10b981" strokeWidth={2.5} dot={false} name="Proposed QIGA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Runtime & Resource Comparison */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Execution Speed / Runtime (Milliseconds)</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wall-clock time to complete {iterations} iterations</span>

            <div style={{ height: 230 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runtimeData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="algorithm" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    formatter={(val) => [`${val} ms`, 'Runtime']}
                    contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }}
                  />
                  <Bar dataKey="runtime_ms" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Runtime (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Empirical Benchmark Summary</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated algorithmic audit conclusion</span>

            <div className="p-3 rounded mt-3" style={{ background: 'rgba(6, 11, 20, 0.7)', border: '1px solid var(--border-subtle)', minHeight: 180 }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Sparkles size={16} color="var(--accent-green)" />
                <strong className="text-white" style={{ fontSize: '0.82rem' }}>Audit Findings:</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                {benchmark?.comparison_summary || 'Evaluating benchmark executions...'}
              </p>
              <div className="d-flex align-items-center gap-2 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={13} />
                <span>Timestamp: {benchmark?.execution_timestamp || 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

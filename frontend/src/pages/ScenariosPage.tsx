import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  Play,
  TrendingDown,
  DollarSign,
  CloudFog,
  ShieldCheck,
  RefreshCw,
  Info,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { ScenarioResult } from '../types';

export const ScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCustom, setRunningCustom] = useState(false);

  // What-If Simulation Parameters
  const [cargoDemand, setCargoDemand] = useState(85000);
  const [distance, setDistance] = useState(8300);
  const [deadline, setDeadline] = useState(480);
  const [carbonTax, setCarbonTax] = useState(50); // $50/tonne CO2 ETS

  const runAllScenarios = async () => {
    setLoading(true);
    try {
      const scenarioCodes = ['DIESEL', 'LNG', 'METHANOL', 'HYDROGEN', 'AMMONIA', 'SHORE_POWER'];
      const promises = scenarioCodes.map((code) =>
        api.runScenario({
          scenario_code: code,
          distance_nm: distance,
          cargo_demand: cargoDemand,
          delivery_deadline_hours: deadline,
          carbon_tax_per_tonne: carbonTax,
        })
      );
      const results = await Promise.all(promises);
      setScenarios(results);
    } catch (err) {
      console.error('Failed to run decarbonization scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAllScenarios();
  }, []);

  const handleRerun = () => {
    runAllScenarios();
  };

  const chartData = scenarios.map((s) => ({
    name: s.fuel_focus,
    co2: s.total_co2_tonnes,
    lifecycle_co2e: s.total_lifecycle_co2e_tonnes,
    cost: Math.round(s.total_cost_usd / 1000), // in $k
    fuel: s.total_fuel_tonnes,
  }));

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">Decarbonization Scenario Simulator &amp; What-If Analysis</h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Comparative evaluation of alternative propulsion pathways, mandatory shore power, and EU ETS / carbon taxation
          </span>
        </div>

        <button
          onClick={handleRerun}
          disabled={loading}
          className="btn-gq-primary py-2 px-3"
          style={{ fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Simulating Scenarios...' : 'Rerun All Scenarios'}</span>
        </button>
      </div>

      {/* What-If Analysis Panel */}
      <div className="gq-card p-3 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Sliders size={18} color="var(--accent-cyan)" />
          <h6 className="fw-bold text-white mb-0">What-If Policy &amp; Operational Controls</h6>
        </div>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="gq-label">Cargo Demand (Tonnes)</label>
            <input
              type="number"
              step={5000}
              className="gq-input"
              value={cargoDemand}
              onChange={(e) => setCargoDemand(Number(e.target.value))}
            />
          </div>

          <div className="col-md-3">
            <label className="gq-label">Voyage Distance (NM)</label>
            <input
              type="number"
              step={200}
              className="gq-input"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>

          <div className="col-md-3">
            <label className="gq-label">Delivery Deadline (Hours)</label>
            <input
              type="number"
              step={24}
              className="gq-input"
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
            />
          </div>

          <div className="col-md-3">
            <label className="gq-label">Carbon Tax / EU ETS ($/tonne CO₂)</label>
            <input
              type="number"
              step={10}
              className="gq-input"
              value={carbonTax}
              onChange={(e) => setCarbonTax(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="row g-3 mb-4">
        {/* Lifecycle Emissions Comparison */}
        <div className="col-lg-6">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Well-to-Wake Lifecycle GHG Emissions (tCO₂e)</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Comprehensive supply-chain emissions across candidate transition fuels
            </span>

            <div style={{ height: 260 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="co2" fill="#38bdf8" name="Operational (TTW) CO₂" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lifecycle_co2e" fill="#10b981" name="Lifecycle (WTW) CO₂e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Total Cost Comparison (including Carbon Tax) */}
        <div className="col-lg-6">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Total Voyage Expenditure ($k USD)</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Bunker Fuel + Charter + Shore Power + Carbon Tax at ${carbonTax}/tonne
            </span>

            <div style={{ height: 260 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    formatter={(val) => [`$${val}k`, 'Expenditure']}
                    contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }}
                  />
                  <Bar dataKey="cost" fill="#f59e0b" name="Voyage Total Cost ($k)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Scenarios Comparison Table */}
      <div className="gq-card p-0 overflow-hidden mb-4">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h6 className="fw-bold text-white mb-0">Decarbonization Scenario Benchmark Matrix</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Measured metrics calculated via QIGA optimization under identical cargo demand and corridor distance
            </span>
          </div>

          <span className="gq-badge gq-badge-green">6 Pathways Evaluated</span>
        </div>

        <div className="table-responsive">
          <table className="gq-table">
            <thead>
              <tr>
                <th>Scenario Name</th>
                <th>Fuel Focus</th>
                <th>Fuel Consumption</th>
                <th>Voyage Total Cost</th>
                <th>Carbon Tax Cost</th>
                <th>Operational CO₂</th>
                <th>Lifecycle CO₂e</th>
                <th>Vessels Deployed</th>
                <th>Fleet Utilization</th>
                <th>Delivery Reliability</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    <RefreshCw className="animate-spin mb-1 text-info" size={20} />
                    <div>Optimizing scenarios with QIGA...</div>
                  </td>
                </tr>
              ) : (
                scenarios.map((s) => (
                  <tr key={s.scenario_code}>
                    <td>
                      <strong className="text-white">{s.scenario_name}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.notes}</div>
                    </td>
                    <td>
                      <span className={`gq-badge ${s.fuel_focus !== 'Marine Diesel' ? 'gq-badge-green' : 'gq-badge-amber'}`}>
                        {s.fuel_focus}
                      </span>
                    </td>
                    <td className="fw-mono text-white">{s.total_fuel_tonnes.toLocaleString()} t</td>
                    <td>
                      <strong className="text-white">${s.total_cost_usd.toLocaleString()}</strong>
                    </td>
                    <td className="text-warning">${s.carbon_tax_cost_usd.toLocaleString()}</td>
                    <td className={s.total_co2_tonnes === 0 ? 'text-success fw-bold' : 'text-white'}>
                      {s.total_co2_tonnes.toLocaleString()} t
                    </td>
                    <td className="text-success fw-semibold">
                      {s.total_lifecycle_co2e_tonnes.toLocaleString()} t
                    </td>
                    <td>{s.active_vessels_count} vessels</td>
                    <td>{s.fleet_utilization_pct}%</td>
                    <td>
                      <span className="gq-badge gq-badge-green">
                        <CheckCircle size={12} /> {s.delivery_reliability_pct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

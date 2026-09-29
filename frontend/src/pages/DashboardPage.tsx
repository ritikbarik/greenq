import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ship,
  Fuel,
  DollarSign,
  CloudFog,
  Gauge,
  Activity,
  ArrowRight,
  TrendingDown,
  Compass,
  CheckCircle,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { RouteMap } from '../maps/RouteMap';
import { api } from '../services/api';
import { DashboardSummary, RouteItem, Vessel } from '../types';

const COLORS = ['#10b981', '#38bdf8', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6'];

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, routesData, vesselsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getRoutes(),
        api.getVessels(),
      ]);
      setSummary(sumData);
      setRoutes(routesData);
      setVessels(vesselsData);
      if (routesData.length > 0) {
        setSelectedRoute(routesData[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <RefreshCw className="animate-spin mb-3 text-info" size={32} />
          <h5 className="text-white">Loading GREENQUANT Fleet Telemetry...</h5>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Syncing with optimization backend</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Top Banner Alert */}
      <div
        className="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-3 mb-4"
        style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cpu size={22} color="var(--accent-green)" />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold text-white">Quantum-Inspired Fleet Optimization Engine Active</h6>
              <span className="gq-badge gq-badge-green">Classical QIGA Ready</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Multi-objective optimization minimizes fuel, costs, and IMO Scope 1/3 emissions across available vessel deployments.
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <button onClick={fetchData} className="btn-gq-secondary py-1 px-3" style={{ fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Refresh Data
          </button>
          <Link to="/optimization" className="btn-gq-primary py-1 px-3" style={{ fontSize: '0.82rem' }}>
            <span>Launch QIGA Optimizer</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <MetricCard
            label="Total Fleet Capacity"
            value={(summary.total_capacity_tonnes / 1000).toFixed(0)}
            unit="k DWT"
            subtext={`${summary.active_vessels} / ${summary.total_vessels} Vessels Deployed`}
            icon={Ship}
            variant="cyan"
            badge="Operational"
          />
        </div>

        <div className="col-xl-3 col-md-6">
          <MetricCard
            label="Total Fuel Consumption"
            value={summary.fuel_consumption_tonnes.toLocaleString()}
            unit="tonnes"
            subtext="Calculated across active routes"
            icon={Fuel}
            variant="green"
            badge="-18.4% vs Baseline"
          />
        </div>

        <div className="col-xl-3 col-md-6">
          <MetricCard
            label="Voyage Operating Cost"
            value={`$${(summary.operating_cost_usd / 1000).toFixed(0)}k`}
            unit="USD"
            subtext="Fuel + Daily Charter + Shore Power"
            icon={DollarSign}
            variant="amber"
          />
        </div>

        <div className="col-xl-3 col-md-6">
          <MetricCard
            label="Lifecycle GHG Emissions"
            value={summary.co2_emissions_tonnes.toLocaleString()}
            unit="t CO₂e"
            subtext="Well-to-Wake (WTW) Accounting"
            icon={CloudFog}
            variant="green"
            badge="Decarbonizing"
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="gq-card p-3 d-flex align-items-center justify-content-between">
            <div>
              <span className="metric-label">Fleet Capacity Utilization</span>
              <h4 className="fw-bold text-white mb-0 mt-1">{summary.fleet_utilization_pct}%</h4>
              <small className="text-muted">High cargo consolidation efficiency</small>
            </div>
            <Activity size={28} color="var(--accent-cyan)" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="gq-card p-3 d-flex align-items-center justify-content-between">
            <div>
              <span className="metric-label">Average Voyage Speed</span>
              <h4 className="fw-bold text-white mb-0 mt-1">{summary.avg_vessel_speed_knots} knots</h4>
              <small className="text-muted">Optimal hydrodynamic slow-steaming</small>
            </div>
            <Gauge size={28} color="var(--accent-green)" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="gq-card p-3 d-flex align-items-center justify-content-between">
            <div>
              <span className="metric-label">Optimization Framework</span>
              <h4 className="fw-bold text-white mb-0 mt-1" style={{ fontSize: '1.1rem' }}>{summary.optimization_status}</h4>
              <small className="text-muted">Multi-objective Pareto evaluation</small>
            </div>
            <CheckCircle size={28} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Charts Row: Emission Trajectory & Cost Breakdown */}
      <div className="row g-3 mb-4">
        {/* Emission Trajectory Area Chart */}
        <div className="col-lg-8">
          <div className="gq-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-white mb-0">Decarbonization Trajectory (CO₂e tonnes)</h6>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Conventional Diesel Baseline vs QIGA-Optimized Routing vs Alternative Fuels Transition
                </span>
              </div>
              <span className="gq-badge gq-badge-green">IMO 2030 / 2050 Pathway</span>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.emission_trend}>
                  <defs>
                    <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQiga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1c30',
                      borderColor: 'var(--border-cyan)',
                      color: '#ffffff',
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="diesel_baseline" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDiesel)" name="Diesel Baseline (Unoptimized)" />
                  <Area type="monotone" dataKey="qiga_optimized" stroke="#38bdf8" fillOpacity={1} fill="url(#colorQiga)" name="QIGA Speed & Fleet Optimized" />
                  <Area type="monotone" dataKey="green_fuels" stroke="#10b981" fillOpacity={1} fill="url(#colorGreen)" name="Alternative Fuels (LNG/Methanol/H2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Operating Cost Breakdown */}
        <div className="col-lg-4">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Operating Cost Breakdown</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proportional expenditure components</span>

            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.cost_breakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {summary.cost_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Cost']}
                    contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2">
              {summary.cost_breakdown.map((item, idx) => (
                <div key={item.category} className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-muted">{item.category}</span>
                  </div>
                  <strong className="text-white">${item.amount.toLocaleString()} ({item.percentage}%)</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <div className="gq-card mb-4 p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <div>
            <h6 className="fw-bold text-white mb-0">Active Shipping Route &amp; Fleet Positions</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Geodesic waypoint routing and vessel positions with dual-fuel compatibility tags
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Corridor:</span>
            <select
              className="gq-select py-1 px-2"
              style={{ width: 'auto', fontSize: '0.82rem' }}
              value={selectedRoute?.id || ''}
              onChange={(e) => {
                const r = routes.find((x) => x.id === Number(e.target.value));
                if (r) setSelectedRoute(r);
              }}
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.distance_nm.toLocaleString()} NM)
                </option>
              ))}
            </select>
          </div>
        </div>

        <RouteMap route={selectedRoute} vessels={vessels} height="440px" />
      </div>

      {/* Fleet Mix & Recent Runs Table */}
      <div className="row g-3">
        {/* Fuel Mix */}
        <div className="col-lg-5">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Fleet Fuel Compatibility Mix</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary propulsion energy types in registered fleet</span>

            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.fuel_mix} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} name="Vessels" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Optimization Runs */}
        <div className="col-lg-7">
          <div className="gq-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="fw-bold text-white mb-0">Recent Optimization Runs</h6>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified algorithmic executions stored in database</span>
              </div>
              <Link to="/optimization" className="btn-gq-secondary py-1 px-2" style={{ fontSize: '0.75rem' }}>
                Run New Optimization
              </Link>
            </div>

            <div className="table-responsive">
              <table className="gq-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Algorithm</th>
                    <th>Fitness</th>
                    <th>Fuel (t)</th>
                    <th>Cost ($)</th>
                    <th>CO₂e (t)</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_runs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        No optimization runs recorded yet. Launch your first QIGA run!
                      </td>
                    </tr>
                  ) : (
                    summary.recent_runs.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className="fw-semibold text-info">{r.id}</span>
                        </td>
                        <td>
                          <span className={`gq-badge ${r.algorithm === 'QIGA' ? 'gq-badge-green' : 'gq-badge-cyan'}`}>
                            {r.algorithm}
                          </span>
                        </td>
                        <td className="fw-mono text-white">{r.fitness.toFixed(4)}</td>
                        <td>{r.fuel.toLocaleString()}</td>
                        <td>${r.cost.toLocaleString()}</td>
                        <td>{r.co2.toLocaleString()}</td>
                        <td className="text-muted">{r.created_at}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

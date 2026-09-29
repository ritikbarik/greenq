import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Gauge,
  Sliders,
  Info,
  Zap,
  Ship,
  CloudFog
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [selectedVesselType, setSelectedVesselType] = useState('Container Ship');
  const [baseDisplacement, setBaseDisplacement] = useState(65000);

  // Speed-Power Curve Data (Cubic Law P ∝ v³)
  const speedPowerData = [];
  for (let s = 10; s <= 24; s += 1) {
    const powerKw = Math.round(18000 * Math.pow(s / 16.0, 3.1));
    const dailyFuel = Math.round(38.0 * Math.pow(s / 16.0, 3.05));
    speedPowerData.push({
      speed: s,
      power_kw: powerKw,
      fuel_t_day: dailyFuel,
    });
  }

  // Displacement vs Fuel Consumption at 16 knots
  const displacementData = [];
  for (let d = 20000; d <= 120000; d += 10000) {
    const fuelRate = Math.round(35 * Math.pow(d / 60000, 0.67));
    displacementData.push({
      displacement: `${d / 1000}k`,
      fuel_rate: fuelRate,
    });
  }

  // Emissions per tonne-km across ship classes (grams CO2 / t-km)
  const shipEfficiencyData = [
    { type: 'Container Ship (Ultra Large)', gCO2_tkm: 8.5, benchmark: 'High Efficiency' },
    { type: 'Container Ship (Feeder)', gCO2_tkm: 24.2, benchmark: 'Regional' },
    { type: 'Bulk Carrier (Capesize)', gCO2_tkm: 4.8, benchmark: 'Most Efficient' },
    { type: 'Tanker (VLCC)', gCO2_tkm: 5.6, benchmark: 'Bulk Liquid' },
    { type: 'Ro-Ro Freight', gCO2_tkm: 36.0, benchmark: 'High Speed' },
    { type: 'General Cargo', gCO2_tkm: 18.4, benchmark: 'Multi-purpose' },
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">Fleet Hydrodynamic &amp; Energy Analytics</h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Naval architecture curves, cubic speed sensitivity, displacement load factors, and carbon transport intensity
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="gq-select py-1 px-2"
            style={{ width: 'auto', fontSize: '0.82rem' }}
            value={selectedVesselType}
            onChange={(e) => setSelectedVesselType(e.target.value)}
          >
            <option value="Container Ship">Container Ships</option>
            <option value="Bulk Carrier">Bulk Carriers</option>
            <option value="Tanker">Tankers</option>
            <option value="Ro-Ro">Ro-Ro</option>
            <option value="General Cargo">General Cargo</option>
          </select>
        </div>
      </div>

      {/* Speed-Power Hydrodynamic Law Card */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="gq-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="fw-bold text-white mb-0">Admiralty Speed-Power &amp; Daily Fuel Curve</h6>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Hydrodynamic relationship illustrating cubic fuel consumption surge at higher speeds (P ∝ v³)
                </span>
              </div>
              <span className="gq-badge gq-badge-cyan">Admiralty Law</span>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={speedPowerData}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="speed" stroke="#64748b" fontSize={11} unit=" kn" />
                  <YAxis stroke="#64748b" fontSize={11} yAxisId="left" unit=" t/d" />
                  <YAxis stroke="#64748b" fontSize={11} yAxisId="right" orientation="right" unit=" kW" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="fuel_t_day"
                    stroke="#10b981"
                    fill="url(#colorFuel)"
                    name="Daily Fuel Rate (t/day)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="power_kw"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    name="Shaft Engine Power (kW)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Slow Steaming Insight */}
        <div className="col-lg-4">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-2">The Slow-Steaming Dividend</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Why speed reduction is maritime shipping's fastest decarbonization lever
            </span>

            <div className="p-3 rounded mt-3 mb-3" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--border-green)' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <Gauge size={16} color="var(--accent-green)" />
                <strong className="text-white" style={{ fontSize: '0.82rem' }}>Cubic Sensitivity Impact:</strong>
              </div>
              <p className="mb-0" style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                Reducing voyage speed by just <strong>10%</strong> (e.g. from 20 to 18 knots) yields an approximate <strong>27% reduction in engine propulsion power</strong> and over <strong>20% net fuel savings</strong> for the entire voyage after adjusting for additional transit days.
              </p>
            </div>

            <div className="p-3 rounded" style={{ background: 'rgba(6, 11, 20, 0.7)', border: '1px solid var(--border-subtle)' }}>
              <span className="metric-label" style={{ fontSize: '0.72rem' }}>Mathematical Proof</span>
              <div className="gq-math-box my-1">
                P₂ / P₁ = (v₂ / v₁)³<br />
                (0.9)³ = 0.729 (-27.1%)
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                QIGA exploits this non-linear property to find schedule-compliant slow-steaming speed vectors.
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Displacement Impact & Energy Efficiency */}
      <div className="row g-4">
        {/* Displacement Loading Curve */}
        <div className="col-lg-6">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Displacement Loading vs Fuel Rate (Δ^0.67 Law)</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fuel consumption increases sub-linearly with total cargo mass, favoring maximum cargo consolidation
            </span>

            <div style={{ height: 260 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displacementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="displacement" stroke="#64748b" fontSize={11} unit=" DWT" />
                  <YAxis stroke="#64748b" fontSize={11} unit=" t/d" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
                  <Area
                    type="monotone"
                    dataKey="fuel_rate"
                    stroke="#38bdf8"
                    fill="rgba(56, 189, 248, 0.15)"
                    name="Daily Fuel at 16kn (t/day)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transport Carbon Intensity by Vessel Type */}
        <div className="col-lg-6">
          <div className="gq-card h-100">
            <h6 className="fw-bold text-white mb-1">Transport Carbon Intensity (g CO₂ / tonne-km)</h6>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              IMO GHG benchmark energy efficiency across commercial vessel classes
            </span>

            <div style={{ height: 260 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shipEfficiencyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} unit=" g" />
                  <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={10} width={135} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1c30', borderColor: 'var(--border-cyan)', borderRadius: 8 }} />
                  <Bar dataKey="gCO2_tkm" fill="#10b981" radius={[0, 4, 4, 0]} name="g CO₂ / tonne-km" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

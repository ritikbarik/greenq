import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Ship,
  Fuel,
  ArrowRight,
  MapPin,
  Clock,
  CloudSun,
  ShieldAlert,
  CheckSquare,
  Square
} from 'lucide-react';
import { RouteMap } from '../maps/RouteMap';
import { api } from '../services/api';
import { RouteItem, Vessel, Fuel as FuelType } from '../types';

export const MissionPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [fuels, setFuels] = useState<FuelType[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  // Form State
  const [origin, setOrigin] = useState('Singapore');
  const [destination, setDestination] = useState('Rotterdam');
  const [distance, setDistance] = useState(8300);
  const [cargoDemand, setCargoDemand] = useState(85000);
  const [deliveryDeadline, setDeliveryDeadline] = useState(480); // 20 days
  const [weatherCondition, setWeatherCondition] = useState('Moderate Sea (Beaufort 4-5)');
  const [weatherFactor, setWeatherFactor] = useState(1.05);
  const [emissionCap, setEmissionCap] = useState<number | ''>('');
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [rData, vData, fData] = await Promise.all([
          api.getRoutes(),
          api.getVessels(),
          api.getFuels(),
        ]);
        setRoutes(rData);
        setVessels(vData);
        setFuels(fData);

        if (rData.length > 0) {
          const first = rData[0];
          setSelectedRoute(first);
          setOrigin(first.origin_port);
          setDestination(first.destination_port);
          setDistance(first.distance_nm);
          setWeatherFactor(first.typical_weather_factor);
        }

        // Default all available vessels selected
        setSelectedVesselIds(vData.filter((v) => v.availability).map((v) => v.vessel_id));
      } catch (err) {
        console.error('Error loading mission planner:', err);
      }
    };
    init();
  }, []);

  const handleRouteChange = (routeId: number) => {
    const r = routes.find((x) => x.id === routeId);
    if (r) {
      setSelectedRoute(r);
      setOrigin(r.origin_port);
      setDestination(r.destination_port);
      setDistance(r.distance_nm);
      setWeatherFactor(r.typical_weather_factor);
    }
  };

  const toggleVessel = (vId: string) => {
    setSelectedVesselIds((prev) =>
      prev.includes(vId) ? prev.filter((id) => id !== vId) : [...prev, vId]
    );
  };

  const selectAllVessels = () => {
    setSelectedVesselIds(vessels.filter((v) => v.availability).map((v) => v.vessel_id));
  };

  const deselectAllVessels = () => {
    setSelectedVesselIds([]);
  };

  const handleLaunchOptimization = () => {
    // Navigate to /optimization with state
    navigate('/optimization', {
      state: {
        origin,
        destination,
        distance_nm: distance,
        cargo_demand: cargoDemand,
        delivery_deadline_hours: deliveryDeadline,
        weather_condition: weatherCondition,
        weather_factor: weatherFactor,
        max_allowed_emissions: emissionCap ? Number(emissionCap) : null,
        selected_vessel_ids: selectedVesselIds,
      },
    });
  };

  const totalCandidateCapacity = vessels
    .filter((v) => selectedVesselIds.includes(v.vessel_id))
    .reduce((acc, curr) => acc + curr.capacity, 0);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">Mission &amp; Voyage Planning</h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configure corridor parameters, bulk cargo demands, delivery deadlines, and candidate fleet assets
          </span>
        </div>

        <button onClick={handleLaunchOptimization} className="btn-gq-primary py-2 px-4" style={{ fontSize: '0.9rem' }}>
          <span>Deploy to QIGA Optimizer</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="row g-4">
        {/* Mission Configuration Inputs */}
        <div className="col-lg-5">
          <div className="gq-card">
            <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <Compass size={18} color="var(--accent-cyan)" />
              <span>Corridor &amp; Voyage Parameters</span>
            </h6>

            {/* Route Preset */}
            <div className="mb-3">
              <label className="gq-label">Select Standard Trade Corridor</label>
              <select
                className="gq-select"
                value={selectedRoute?.id || ''}
                onChange={(e) => handleRouteChange(Number(e.target.value))}
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.distance_nm.toLocaleString()} NM)
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="gq-label">Origin Port</label>
                <div className="position-relative">
                  <MapPin size={15} color="#38bdf8" className="position-absolute" style={{ top: 12, left: 10 }} />
                  <input
                    type="text"
                    className="gq-input"
                    style={{ paddingLeft: '2rem' }}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-6">
                <label className="gq-label">Destination Port</label>
                <div className="position-relative">
                  <MapPin size={15} color="#10b981" className="position-absolute" style={{ top: 12, left: 10 }} />
                  <input
                    type="text"
                    className="gq-input"
                    style={{ paddingLeft: '2rem' }}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="gq-label">Voyage Distance (NM)</label>
                <input
                  type="number"
                  className="gq-input"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                />
              </div>

              <div className="col-6">
                <label className="gq-label">Delivery Deadline (Hours)</label>
                <div className="position-relative">
                  <Clock size={15} color="var(--text-muted)" className="position-absolute" style={{ top: 12, left: 10 }} />
                  <input
                    type="number"
                    className="gq-input"
                    style={{ paddingLeft: '2rem' }}
                    value={deliveryDeadline}
                    onChange={(e) => setDeliveryDeadline(Number(e.target.value))}
                  />
                </div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Approx {(deliveryDeadline / 24).toFixed(1)} days
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label className="gq-label">Cargo Demand (Total Metric Tonnes)</label>
              <input
                type="number"
                step={1000}
                className="gq-input"
                value={cargoDemand}
                onChange={(e) => setCargoDemand(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.72rem' }}>
                <span className="text-muted">Demand: {cargoDemand.toLocaleString()} t</span>
                <span className={totalCandidateCapacity >= cargoDemand ? 'text-success' : 'text-danger'}>
                  Selected Capacity: {totalCandidateCapacity.toLocaleString()} t{' '}
                  {totalCandidateCapacity < cargoDemand && '(Shortfall!)'}
                </span>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="gq-label">Weather Condition</label>
                <select
                  className="gq-select"
                  value={weatherCondition}
                  onChange={(e) => {
                    const cond = e.target.value;
                    setWeatherCondition(cond);
                    if (cond.includes('Calm')) setWeatherFactor(0.98);
                    else if (cond.includes('Moderate')) setWeatherFactor(1.05);
                    else setWeatherFactor(1.22);
                  }}
                >
                  <option value="Calm Sea (Beaufort 0-3)">Calm Sea (Factor 0.98)</option>
                  <option value="Moderate Sea (Beaufort 4-5)">Moderate Sea (Factor 1.05)</option>
                  <option value="Rough Sea (Beaufort 6-8)">Rough Sea (Factor 1.22)</option>
                </select>
              </div>

              <div className="col-6">
                <label className="gq-label">Weather Multiplier</label>
                <input
                  type="number"
                  step={0.01}
                  className="gq-input"
                  value={weatherFactor}
                  onChange={(e) => setWeatherFactor(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="gq-label">Optional Carbon Cap (Max Allowed tCO₂e)</label>
              <input
                type="number"
                placeholder="No hard limit (Uncapped)"
                className="gq-input"
                value={emissionCap}
                onChange={(e) => setEmissionCap(e.target.value ? Number(e.target.value) : '')}
              />
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                Enforces strict constraint penalty during optimization if exceeded.
              </small>
            </div>
          </div>
        </div>

        {/* Map & Candidate Vessel Selector */}
        <div className="col-lg-7">
          {/* Map Preview */}
          <div className="gq-card p-3 mb-4">
            <h6 className="fw-bold text-white mb-2">Simulated Maritime Corridor Route Preview</h6>
            <RouteMap
              route={selectedRoute}
              vessels={vessels.filter((v) => selectedVesselIds.includes(v.vessel_id))}
              height="280px"
            />
          </div>

          {/* Candidate Vessel Pool Selection */}
          <div className="gq-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-white mb-0">Candidate Fleet Selection</h6>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Selected: <strong>{selectedVesselIds.length}</strong> / {vessels.length} vessels
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button onClick={selectAllVessels} className="btn btn-sm btn-link text-info p-0" style={{ fontSize: '0.78rem' }}>
                  Select All
                </button>
                <span className="text-muted">|</span>
                <button onClick={deselectAllVessels} className="btn btn-sm btn-link text-muted p-0" style={{ fontSize: '0.78rem' }}>
                  Clear
                </button>
              </div>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <div className="row g-2">
                {vessels.map((vsl) => {
                  const isChecked = selectedVesselIds.includes(vsl.vessel_id);
                  return (
                    <div key={vsl.id} className="col-md-6">
                      <div
                        onClick={() => toggleVessel(vsl.vessel_id)}
                        className="p-2 rounded cursor-pointer d-flex align-items-center justify-content-between"
                        style={{
                          background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          border: isChecked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {isChecked ? (
                            <CheckSquare size={16} color="var(--accent-green)" />
                          ) : (
                            <Square size={16} color="var(--text-subtle)" />
                          )}
                          <div>
                            <div className="fw-semibold text-white" style={{ fontSize: '0.82rem' }}>
                              {vsl.name}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {vsl.vessel_type} • {vsl.capacity.toLocaleString()} DWT
                            </span>
                          </div>
                        </div>

                        <span className="gq-badge gq-badge-cyan" style={{ fontSize: '0.65rem' }}>
                          {vsl.fuel_type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

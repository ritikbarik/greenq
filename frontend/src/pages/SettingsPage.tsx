import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [assumptions, setAssumptions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchAssumptions = async () => {
    setLoading(true);
    try {
      const data = await api.getAssumptions();
      setAssumptions(data);
    } catch (err) {
      console.error('Error fetching assumptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssumptions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAssumptions(assumptions);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save assumptions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !assumptions) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '60vh' }}>
        <RefreshCw className="animate-spin text-info" size={28} />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">Modeling Assumptions &amp; Parameter Calibration</h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Scientific constants, IMO emissions factors, hydrodynamic exponents, and carbon penalty assumptions
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={fetchAssumptions} className="btn-gq-secondary py-2 px-3" style={{ fontSize: '0.85rem' }}>
            <RotateCcw size={15} /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gq-primary py-2 px-4"
            style={{ fontSize: '0.85rem' }}
          >
            <Save size={15} className={saving ? 'animate-spin' : ''} />
            <span>{saving ? 'Saving Changes...' : 'Save All Assumptions'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
          <CheckCircle size={18} />
          <span>Assumptions successfully persisted to calculation engine!</span>
        </div>
      )}

      {/* Synthetic Dataset Academic Notice */}
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
            <strong className="text-white" style={{ fontSize: '0.85rem' }}>Dataset Academic Provenance Note:</strong>
            <p className="mb-0 mt-1" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              {assumptions.synthetic_dataset_note}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-4">
          {/* Hydrodynamic & Operational Exponents */}
          <div className="col-lg-6">
            <div className="gq-card h-100">
              <h6 className="fw-bold text-white mb-3">Hydrodynamic &amp; Operational Physics Parameters</h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="gq-label">Admiralty Speed Exponent (P ∝ vⁿ)</label>
                  <input
                    type="number"
                    step={0.05}
                    className="gq-input"
                    value={assumptions.operational.admiralty_speed_exponent}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          admiralty_speed_exponent: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Standard naval cubic law = 3.0</small>
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Displacement Load Exponent (Δⁿ)</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.operational.displacement_load_exponent}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          displacement_load_exponent: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Naval wetted surface power law = 0.67</small>
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Moderate Sea Weather Multiplier</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.operational.default_weather_factor}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          default_weather_factor: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Rough Sea Weather Multiplier</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.operational.rough_weather_factor}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          rough_weather_factor: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Carbon ETS Price ($/tonne CO₂)</label>
                  <input
                    type="number"
                    step={5}
                    className="gq-input"
                    value={assumptions.operational.carbon_price_usd_tonne}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          carbon_price_usd_tonne: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Schedule Delay Penalty ($/hour)</label>
                  <input
                    type="number"
                    step={50}
                    className="gq-input"
                    value={assumptions.operational.delay_penalty_usd_hour}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          delay_penalty_usd_hour: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Default Weights & Port Fees */}
          <div className="col-lg-6">
            <div className="gq-card h-100">
              <h6 className="fw-bold text-white mb-3">Default Multi-Objective Weights &amp; Cold Ironing</h6>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="gq-label">Default Fuel Weight (w₁)</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.default_weights.fuel_weight}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        default_weights: {
                          ...assumptions.default_weights,
                          fuel_weight: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="gq-label">Default Cost Weight (w₂)</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.default_weights.cost_weight}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        default_weights: {
                          ...assumptions.default_weights,
                          cost_weight: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="gq-label">Default Emission Weight (w₃)</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.default_weights.emission_weight}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        default_weights: {
                          ...assumptions.default_weights,
                          emission_weight: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-6 mt-3">
                  <label className="gq-label">Port Shore Power Connection Fee ($)</label>
                  <input
                    type="number"
                    step={100}
                    className="gq-input"
                    value={assumptions.operational.shore_power_port_connection_fee}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          shore_power_port_connection_fee: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="col-md-6 mt-3">
                  <label className="gq-label">Port Shore Power Rate ($/kWh)</label>
                  <input
                    type="number"
                    step={0.01}
                    className="gq-input"
                    value={assumptions.operational.shore_power_kwh_rate}
                    onChange={(e) =>
                      setAssumptions({
                        ...assumptions,
                        operational: {
                          ...assumptions.operational,
                          shore_power_kwh_rate: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

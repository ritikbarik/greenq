import React, { useEffect, useState } from 'react';
import {
  Fuel as FuelIcon,
  Flame,
  Zap,
  Info,
  Edit2,
  Save,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { Fuel } from '../types';

export const FuelsPage: React.FC = () => {
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFuel, setEditingFuel] = useState<Fuel | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchFuels = async () => {
    setLoading(true);
    try {
      const data = await api.getFuels();
      setFuels(data);
    } catch (err) {
      console.error('Failed to fetch fuels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuels();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFuel) return;
    try {
      await api.updateFuel(editingFuel.id, {
        price_per_unit: Number(editingFuel.price_per_unit),
        energy_density_mj_kg: Number(editingFuel.energy_density_mj_kg),
        emission_factor_tco2_t: Number(editingFuel.emission_factor_tco2_t),
        lifecycle_emission_factor_tco2e_t: Number(editingFuel.lifecycle_emission_factor_tco2e_t),
        availability: editingFuel.availability,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditingFuel(null);
      fetchFuels();
    } catch (err) {
      alert('Failed to update fuel parameters.');
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">Fuel &amp; Energy Transition Pathways</h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configurable direct combustion (Tank-to-Wake) and lifecycle (Well-to-Wake) GHG factors for maritime decarbonization
          </span>
        </div>

        <button onClick={fetchFuels} className="btn-gq-secondary py-2 px-3" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Refresh Factors
        </button>
      </div>

      {/* Critical Methodology Notice */}
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
            <strong className="text-white" style={{ fontSize: '0.85rem' }}>Methodological Carbon Transparency:</strong>
            <p className="mb-0 mt-1" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              GreenQuant strictly adheres to scientific lifecycle analysis. Alternative fuels like Green Hydrogen and Ammonia exhibit
              <strong> zero direct tailpipe combustion CO₂ emissions (Tank-to-Wake = 0)</strong>, but their
              <strong> Well-to-Wake lifecycle emissions</strong> reflect upstream renewable electrolysis, cryogenic liquefaction, and bunkering energy.
              Factors are entirely editable below to model regional grid carbon intensities or specific fuel supply contracts.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
          <CheckCircle size={18} />
          <span>Fuel parameters and emission factors updated successfully!</span>
        </div>
      )}

      {/* Fuel Cards Grid */}
      <div className="row g-3 mb-4">
        {fuels.map((fuel) => (
          <div key={fuel.id} className="col-lg-4 col-md-6">
            <div className={`gq-card h-100 ${fuel.is_clean_alternative ? 'gq-card-green' : ''}`}>
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: fuel.code === 'DIESEL' ? 'rgba(244, 63, 94, 0.15)' : fuel.code === 'SHORE_POWER' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {fuel.code === 'SHORE_POWER' ? (
                      <Zap size={18} color="var(--accent-cyan)" />
                    ) : (
                      <Flame size={18} color={fuel.is_clean_alternative ? 'var(--accent-green)' : '#f43f5e'} />
                    )}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-white">{fuel.name}</h6>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Code: {fuel.code}</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingFuel(fuel)}
                  className="btn btn-sm btn-link text-info p-1"
                  title="Configure Parameters"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minHeight: 36 }}>
                {fuel.description || 'Maritime propulsion fuel option.'}
              </p>

              {/* Metrics Grid */}
              <div className="row g-2 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Unit Price</span>
                  <strong className="text-white">${fuel.price_per_unit.toLocaleString()}</strong>{' '}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{fuel.unit}</span>
                </div>

                <div className="col-6">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Energy Density</span>
                  <strong className="text-info">{fuel.energy_density_mj_kg}</strong>{' '}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>MJ/kg</span>
                </div>

                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Tank-to-Wake (TTW)</span>
                  <strong className={fuel.emission_factor_tco2_t === 0 ? 'text-success' : 'text-white'}>
                    {fuel.emission_factor_tco2_t.toFixed(3)}
                  </strong>{' '}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>tCO₂/t</span>
                </div>

                <div className="col-6 mt-2">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Well-to-Wake (WTW)</span>
                  <strong className="text-success">{fuel.lifecycle_emission_factor_tco2e_t.toFixed(3)}</strong>{' '}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>tCO₂e/t</span>
                </div>
              </div>

              {/* Footer status */}
              <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Global Bunkering:</span>
                <span
                  className={`gq-badge ${
                    fuel.availability === 'High'
                      ? 'gq-badge-cyan'
                      : fuel.availability === 'Medium'
                      ? 'gq-badge-amber'
                      : 'gq-badge-rose'
                  }`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {fuel.availability}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Fuel Modal */}
      {editingFuel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setEditingFuel(null)}
        >
          <div
            className="gq-card"
            style={{
              maxWidth: 500,
              width: '100%',
              backgroundColor: '#0a1220',
              borderColor: 'var(--border-cyan)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold text-white mb-2">Configure Fuel: {editingFuel.name}</h5>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Modify commercial pricing and verified emission factors
            </span>

            <form onSubmit={handleSave} className="mt-3">
              <div className="mb-3">
                <label className="gq-label">Price per Unit ({editingFuel.unit})</label>
                <input
                  type="number"
                  step={10}
                  required
                  className="gq-input"
                  value={editingFuel.price_per_unit}
                  onChange={(e) => setEditingFuel({ ...editingFuel, price_per_unit: Number(e.target.value) })}
                />
              </div>

              <div className="mb-3">
                <label className="gq-label">Energy Density (MJ/kg)</label>
                <input
                  type="number"
                  step={0.1}
                  required
                  className="gq-input"
                  value={editingFuel.energy_density_mj_kg}
                  onChange={(e) => setEditingFuel({ ...editingFuel, energy_density_mj_kg: Number(e.target.value) })}
                />
              </div>

              <div className="mb-3">
                <label className="gq-label">Tank-to-Wake Operational CO₂ Factor (tCO₂/tonne)</label>
                <input
                  type="number"
                  step={0.001}
                  required
                  className="gq-input"
                  value={editingFuel.emission_factor_tco2_t}
                  onChange={(e) => setEditingFuel({ ...editingFuel, emission_factor_tco2_t: Number(e.target.value) })}
                />
              </div>

              <div className="mb-3">
                <label className="gq-label">Well-to-Wake Lifecycle GHG Factor (tCO₂e/tonne)</label>
                <input
                  type="number"
                  step={0.001}
                  required
                  className="gq-input"
                  value={editingFuel.lifecycle_emission_factor_tco2e_t}
                  onChange={(e) => setEditingFuel({ ...editingFuel, lifecycle_emission_factor_tco2e_t: Number(e.target.value) })}
                />
              </div>

              <div className="mb-3">
                <label className="gq-label">Global Bunkering Availability</label>
                <select
                  className="gq-select"
                  value={editingFuel.availability}
                  onChange={(e) => setEditingFuel({ ...editingFuel, availability: e.target.value })}
                >
                  <option value="High">High (Global Commercial Availability)</option>
                  <option value="Medium">Medium (Key Regional Hubs)</option>
                  <option value="Emerging">Emerging (Pilot &amp; Green Corridors)</option>
                  <option value="Port-Dependent">Port-Dependent (Cold Ironing Infrastructure)</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={() => setEditingFuel(null)} className="btn-gq-secondary py-2 px-3">
                  Cancel
                </button>
                <button type="submit" className="btn-gq-primary py-2 px-4">
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

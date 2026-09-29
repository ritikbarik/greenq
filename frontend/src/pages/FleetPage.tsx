import React, { useEffect, useState } from 'react';
import {
  Ship,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  Fuel,
  Gauge,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { Vessel } from '../types';

export const FleetPage: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fuelFilter, setFuelFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState({
    vessel_id: '',
    name: '',
    vessel_type: 'Container Ship',
    capacity: 50000,
    current_location: 'Singapore Anchorage',
    latitude: 1.29027,
    longitude: 103.851959,
    min_speed: 12.0,
    max_speed: 21.0,
    fuel_type: 'Marine Diesel',
    compatible_fuels: 'Marine Diesel,LNG',
    fuel_consumption_rate: 45.0,
    fuel_tank_capacity: 3000.0,
    operating_cost: 35000.0,
    availability: true,
    engine_power_kw: 30000.0,
    build_year: 2020,
  });

  const fetchVessels = async () => {
    setLoading(true);
    try {
      const data = await api.getVessels();
      setVessels(data);
    } catch (err) {
      console.error('Failed to fetch fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleOpenAdd = () => {
    setEditingVessel(null);
    setFormData({
      vessel_id: `VSL-${Date.now().toString().slice(-4)}`,
      name: '',
      vessel_type: 'Container Ship',
      capacity: 50000,
      current_location: 'Singapore Anchorage',
      latitude: 1.29027,
      longitude: 103.851959,
      min_speed: 12.0,
      max_speed: 21.0,
      fuel_type: 'Marine Diesel',
      compatible_fuels: 'Marine Diesel',
      fuel_consumption_rate: 45.0,
      fuel_tank_capacity: 3000.0,
      operating_cost: 35000.0,
      availability: true,
      engine_power_kw: 30000.0,
      build_year: 2021,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (vsl: Vessel) => {
    setEditingVessel(vsl);
    setFormData({
      vessel_id: vsl.vessel_id,
      name: vsl.name,
      vessel_type: vsl.vessel_type,
      capacity: vsl.capacity,
      current_location: vsl.current_location,
      latitude: vsl.latitude,
      longitude: vsl.longitude,
      min_speed: vsl.min_speed,
      max_speed: vsl.max_speed,
      fuel_type: vsl.fuel_type,
      compatible_fuels: vsl.compatible_fuels,
      fuel_consumption_rate: vsl.fuel_consumption_rate,
      fuel_tank_capacity: vsl.fuel_tank_capacity,
      operating_cost: vsl.operating_cost,
      availability: vsl.availability,
      engine_power_kw: vsl.engine_power_kw,
      build_year: vsl.build_year,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove vessel "${name}" from the active fleet catalog?`)) {
      try {
        await api.deleteVessel(id);
        fetchVessels();
      } catch (err) {
        alert('Failed to delete vessel.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVessel) {
        await api.updateVessel(editingVessel.id, formData);
      } else {
        await api.createVessel(formData);
      }
      setShowModal(false);
      fetchVessels();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving vessel');
    }
  };

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.vessel_id.toLowerCase().includes(search.toLowerCase()) ||
      v.current_location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || v.vessel_type === typeFilter;
    const matchesFuel = fuelFilter === 'ALL' || v.fuel_type === fuelFilter;
    return matchesSearch && matchesType && matchesFuel;
  });

  return (
    <div className="container-fluid p-4">
      {/* Header and Controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">Fleet Asset Management</h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time catalog of commercial vessels with hydrodynamics, dual-fuel capability, and charter rates
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={fetchVessels} className="btn-gq-secondary py-2 px-3" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn-gq-primary py-2 px-3" style={{ fontSize: '0.85rem' }}>
            <Plus size={16} /> Add New Vessel
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="gq-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="position-relative">
              <Search
                size={16}
                color="var(--text-muted)"
                className="position-absolute"
                style={{ top: '50%', transform: 'translateY(-50%)', left: 12 }}
              />
              <input
                type="text"
                className="gq-input"
                placeholder="Search by vessel name, IMO ID, or location..."
                style={{ paddingLeft: '2.2rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="gq-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Vessel Types (All)</option>
              <option value="Container Ship">Container Ships</option>
              <option value="Bulk Carrier">Bulk Carriers</option>
              <option value="Tanker">Tankers</option>
              <option value="Ro-Ro">Ro-Ro</option>
              <option value="General Cargo">General Cargo</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="gq-select"
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
            >
              <option value="ALL">All Primary Fuels</option>
              <option value="Marine Diesel">Marine Diesel</option>
              <option value="LNG">LNG</option>
              <option value="Methanol">Methanol</option>
              <option value="Hydrogen">Hydrogen</option>
              <option value="Ammonia">Ammonia</option>
            </select>
          </div>

          <div className="col-md-1 text-end">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              <strong>{filteredVessels.length}</strong> / {vessels.length}
            </span>
          </div>
        </div>
      </div>

      {/* Vessels Table */}
      <div className="gq-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="gq-table">
            <thead>
              <tr>
                <th>Vessel ID &amp; Name</th>
                <th>Type</th>
                <th>Capacity (DWT)</th>
                <th>Speed (Min-Max)</th>
                <th>Primary Fuel</th>
                <th>Compatible Fuels</th>
                <th>Fuel Rate</th>
                <th>Daily OPEX</th>
                <th>Status</th>
                <th>Location</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVessels.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-muted">
                    No vessels found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVessels.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div>
                        <strong className="text-white">{v.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{v.vessel_id}</div>
                      </div>
                    </td>
                    <td>
                      <span className="gq-badge gq-badge-cyan" style={{ fontSize: '0.72rem' }}>
                        {v.vessel_type}
                      </span>
                    </td>
                    <td>{v.capacity.toLocaleString()} tonnes</td>
                    <td>
                      <span className="text-info fw-semibold">{v.min_speed} - {v.max_speed}</span> kn
                    </td>
                    <td>
                      <span className={`gq-badge ${v.fuel_type !== 'Marine Diesel' ? 'gq-badge-green' : 'gq-badge-amber'}`}>
                        {v.fuel_type}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">{v.compatible_fuels}</small>
                    </td>
                    <td>
                      <span className="fw-mono text-white">{v.fuel_consumption_rate}</span> t/day
                    </td>
                    <td>
                      <strong className="text-white">${v.operating_cost.toLocaleString()}</strong>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>/day</span>
                    </td>
                    <td>
                      {v.availability ? (
                        <span className="gq-badge gq-badge-green">
                          <CheckCircle size={12} /> Available
                        </span>
                      ) : (
                        <span className="gq-badge gq-badge-rose">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">{v.current_location}</small>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="btn btn-sm btn-link text-info p-1"
                          title="Edit Vessel"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          className="btn btn-sm btn-link text-danger p-1"
                          title="Delete Vessel"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vessel Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            className="gq-card"
            style={{
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0a1220',
              borderColor: 'var(--border-cyan)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
              <h5 className="mb-0 fw-bold text-white">
                {editingVessel ? `Edit Vessel: ${editingVessel.name}` : 'Register New Fleet Vessel'}
              </h5>
              <button onClick={() => setShowModal(false)} className="btn btn-sm btn-link text-muted p-0">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="gq-label">Vessel ID (Identifier)</label>
                  <input
                    type="text"
                    required
                    className="gq-input"
                    value={formData.vessel_id}
                    onChange={(e) => setFormData({ ...formData, vessel_id: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Vessel Name</label>
                  <input
                    type="text"
                    required
                    className="gq-input"
                    placeholder="e.g. Pacific Explorer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Vessel Type</label>
                  <select
                    className="gq-select"
                    value={formData.vessel_type}
                    onChange={(e) => setFormData({ ...formData, vessel_type: e.target.value })}
                  >
                    <option value="Container Ship">Container Ship</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Tanker">Tanker</option>
                    <option value="Ro-Ro">Ro-Ro</option>
                    <option value="General Cargo">General Cargo</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Deadweight Capacity (Tonnes DWT)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    className="gq-input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="gq-label">Min Speed (knots)</label>
                  <input
                    type="number"
                    required
                    step={0.5}
                    className="gq-input"
                    value={formData.min_speed}
                    onChange={(e) => setFormData({ ...formData, min_speed: Number(e.target.value) })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="gq-label">Max Speed (knots)</label>
                  <input
                    type="number"
                    required
                    step={0.5}
                    className="gq-input"
                    value={formData.max_speed}
                    onChange={(e) => setFormData({ ...formData, max_speed: Number(e.target.value) })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="gq-label">Fuel Rate (t/day at design speed)</label>
                  <input
                    type="number"
                    required
                    step={0.5}
                    className="gq-input"
                    value={formData.fuel_consumption_rate}
                    onChange={(e) => setFormData({ ...formData, fuel_consumption_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Primary Fuel Type</label>
                  <select
                    className="gq-select"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                  >
                    <option value="Marine Diesel">Marine Diesel</option>
                    <option value="LNG">LNG</option>
                    <option value="Methanol">Methanol</option>
                    <option value="Hydrogen">Hydrogen</option>
                    <option value="Ammonia">Ammonia</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Compatible Alternative Fuels (Comma-Separated)</label>
                  <input
                    type="text"
                    className="gq-input"
                    value={formData.compatible_fuels}
                    onChange={(e) => setFormData({ ...formData, compatible_fuels: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Daily Charter / OPEX ($/day)</label>
                  <input
                    type="number"
                    required
                    step={500}
                    className="gq-input"
                    value={formData.operating_cost}
                    onChange={(e) => setFormData({ ...formData, operating_cost: Number(e.target.value) })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="gq-label">Current Port / Anchorage Location</label>
                  <input
                    type="text"
                    className="gq-input"
                    value={formData.current_location}
                    onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  />
                </div>

                <div className="col-md-12">
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="availSwitch"
                      checked={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    />
                    <label className="form-check-label text-white" htmlFor="availSwitch" style={{ fontSize: '0.85rem' }}>
                      Vessel Available for Immediate Deployment
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 mt-3 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-gq-secondary py-2 px-3">
                  Cancel
                </button>
                <button type="submit" className="btn-gq-primary py-2 px-4">
                  {editingVessel ? 'Update Vessel' : 'Save Vessel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

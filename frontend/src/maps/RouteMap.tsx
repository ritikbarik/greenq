import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ship, Anchor, Navigation, AlertCircle } from 'lucide-react';
import { Vessel, RouteItem } from '../types';

// Fix Leaflet marker icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom ship icon
const createVesselIcon = (fuelType: string) => {
  const isGreen = fuelType !== 'Marine Diesel';
  const color = isGreen ? '#10b981' : '#38bdf8';
  return L.divIcon({
    className: 'custom-ship-marker',
    html: `
      <div style="
        background: #0f1c30;
        border: 2px solid ${color};
        box-shadow: 0 0 10px ${color}88;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
          <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
          <path d="M12 10v4"/>
          <path d="M12 2v3"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createPortIcon = (isOrigin: boolean) => {
  const color = isOrigin ? '#38bdf8' : '#10b981';
  return L.divIcon({
    className: 'custom-port-marker',
    html: `
      <div style="
        background: ${color};
        color: #ffffff;
        font-weight: bold;
        font-size: 11px;
        border: 2px solid #ffffff;
        box-shadow: 0 0 8px ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isOrigin ? 'A' : 'B'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

interface RouteMapProps {
  route?: RouteItem | null;
  vessels?: Vessel[];
  deployedVesselIds?: string[];
  height?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  vessels = [],
  deployedVesselIds = [],
  height = '480px',
}) => {
  const waypoints = route?.waypoints && route.waypoints.length > 0
    ? route.waypoints
    : [
        [1.29027, 103.851959],
        [51.92442, 4.477733],
      ] as [number, number][];

  const originCoord: [number, number] = route ? [route.origin_lat, route.origin_lng] : [1.29027, 103.851959];
  const destCoord: [number, number] = route ? [route.dest_lat, route.dest_lng] : [51.92442, 4.477733];

  const bounds: L.LatLngBoundsExpression = [
    originCoord,
    destCoord,
    ...waypoints,
  ];

  return (
    <div className="position-relative rounded-3 overflow-hidden border" style={{ borderColor: 'var(--border-subtle)', height }}>
      {/* Simulation Watermark Banner */}
      <div
        className="position-absolute px-3 py-1 rounded"
        style={{
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(6, 11, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-cyan)',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <AlertCircle size={14} color="var(--accent-amber)" />
        <span>Demonstration GIS: Simulated Nautical Geodesic Waypoints (Non-Live AIS)</span>
      </div>

      <MapContainer
        center={[20.0, 50.0]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView bounds={bounds} />

        {/* CartoDB Dark Matter tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Polyline Route */}
        {waypoints.length > 1 && (
          <Polyline
            positions={waypoints}
            color="#38bdf8"
            weight={3.5}
            dashArray="6, 8"
            opacity={0.85}
          />
        )}

        {/* Origin Port Marker */}
        <Marker position={originCoord} icon={createPortIcon(true)}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong className="text-info">Origin Port</strong>
              <div>{route?.origin_port || 'Singapore Port'}</div>
              <small className="text-muted">Lat: {originCoord[0].toFixed(2)}, Lng: {originCoord[1].toFixed(2)}</small>
            </div>
          </Popup>
        </Marker>

        {/* Destination Port Marker */}
        <Marker position={destCoord} icon={createPortIcon(false)}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong className="text-success">Destination Port</strong>
              <div>{route?.destination_port || 'Rotterdam Port'}</div>
              <small className="text-muted">Distance: {route?.distance_nm?.toLocaleString() || '8,300'} NM</small>
            </div>
          </Popup>
        </Marker>

        {/* Vessel Markers */}
        {vessels.map((vsl) => {
          const isDeployed = deployedVesselIds.includes(vsl.vessel_id);
          return (
            <Marker
              key={vsl.vessel_id}
              position={[vsl.latitude, vsl.longitude]}
              icon={createVesselIcon(vsl.fuel_type)}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={0.9}>
                <strong>{vsl.name}</strong> ({vsl.vessel_type})
                {isDeployed && <span className="ms-1 text-success fw-bold">[DEPLOYED]</span>}
              </Tooltip>
              <Popup>
                <div style={{ minWidth: 200, padding: 4 }}>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong style={{ color: '#ffffff' }}>{vsl.name}</strong>
                    <span className={`gq-badge ${isDeployed ? 'gq-badge-green' : 'gq-badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                      {isDeployed ? 'Assigned' : 'Available'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <div>Type: <strong>{vsl.vessel_type}</strong></div>
                    <div>Capacity: <strong>{vsl.capacity.toLocaleString()} DWT</strong></div>
                    <div>Speed Range: <strong>{vsl.min_speed} - {vsl.max_speed} knots</strong></div>
                    <div>Primary Fuel: <strong>{vsl.fuel_type}</strong></div>
                    <div>Current Port: <strong>{vsl.current_location}</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

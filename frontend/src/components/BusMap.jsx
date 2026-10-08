import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom divIcon markers (avoids the classic Leaflet + bundler broken
// default-marker-image issue, and lets us color-code stop states).
const busIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:28px; transform: translate(-50%, -90%); filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));">🚌</div>`,
  iconSize: [0, 0],
});

const stopIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4); transform: translate(-50%,-50%);"></div>`,
    iconSize: [0, 0],
  });

const COLORS = {
  passed: '#3f6b47',
  current: '#f97316',
  next: '#2f5537',
  future: '#c2a655',
};

// Recenters the map whenever the bus position changes.
const Recenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

// stops: [{_id, name, latitude, longitude}], state derived via currentStopId/nextStopId/passedStopIds
const BusMap = ({ stops = [], busPosition, currentStopId, nextStopId, passedStopIds = [], height = '420px' }) => {
  const routeLine = stops.map((s) => [s.latitude, s.longitude]);
  const center = busPosition || (stops[0] ? [stops[0].latitude, stops[0].longitude] : [9.9252, 78.1198]);

  const stateFor = (stop) => {
    if (currentStopId && stop._id === currentStopId) return 'current';
    if (nextStopId && stop._id === nextStopId) return 'next';
    if (passedStopIds.includes(stop._id)) return 'passed';
    return 'future';
  };

  return (
    <div style={{ height }} className="rounded-xl2 overflow-hidden shadow-card border border-khaki-200">
      <MapContainer center={center} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeLine.length > 1 && <Polyline positions={routeLine} pathOptions={{ color: '#2f5537', weight: 4, opacity: 0.6 }} />}

        {stops.map((stop) => (
          <Marker key={stop._id} position={[stop.latitude, stop.longitude]} icon={stopIcon(COLORS[stateFor(stop)])}>
            <Popup>
              <strong>{stop.name}</strong>
              <br />
              {stateFor(stop).toUpperCase()}
            </Popup>
          </Marker>
        ))}

        {busPosition && (
          <Marker position={busPosition} icon={busIcon}>
            <Popup>Bus is here</Popup>
          </Marker>
        )}

        {busPosition && <Recenter position={busPosition} />}
      </MapContainer>
    </div>
  );
};

export default BusMap;

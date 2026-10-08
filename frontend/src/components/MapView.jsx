import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const busIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:42px;height:42px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#0ea5e9,#2563eb);
    border:3px solid rgba(255,255,255,0.9);
    box-shadow:0 0 0 8px rgba(14,165,233,0.15),0 0 22px rgba(14,165,233,0.5);
    font-size:20px;">🚌</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function stopIcon(kind) {
  const color = kind === "passed" ? "#22c55e" : kind === "next" ? "#38bdf8" : "#334155";
  const glow = kind === "next" ? "box-shadow:0 0 12px rgba(56,189,248,0.8);" : "";
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #0b1828;${glow}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.panTo([lat, lng], { animate: true });
  }, [lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapView({ stops, data }) {
  if (stops.length === 0) {
    return (
      <section className="card">
        <div className="card-title">
          <h3>🗺️ Live Route</h3>
        </div>
        <div className="map-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#5b7186" }}>
          Loading route...
        </div>
      </section>
    );
  }

  const routeLatLngs = stops.map((s) => [s.lat, s.lng]);
  const center = data?.gpsFix ? [data.latitude, data.longitude] : routeLatLngs[Math.floor(routeLatLngs.length / 2)];
  const nextStopIndex = data?.nextStopIndex ?? 0;

  return (
    <section className="card">
      <div className="card-title">
        <h3>🗺️ Live Route</h3>
        <span>OpenStreetMap</span>
      </div>

      <div className="map-box">
        <MapContainer center={center} zoom={13} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <Polyline positions={routeLatLngs} pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.6 }} />

          {stops.map((s, i) => {
            const kind = i < nextStopIndex ? "passed" : i === nextStopIndex ? "next" : "upcoming";
            return (
              <Marker key={s.name + i} position={[s.lat, s.lng]} icon={stopIcon(kind)}>
                <Popup>{s.name}</Popup>
              </Marker>
            );
          })}

          {data?.gpsFix && (
            <>
              <Marker position={[data.latitude, data.longitude]} icon={busIcon}>
                <Popup>{data.busNumber}</Popup>
              </Marker>
              <Recenter lat={data.latitude} lng={data.longitude} />
            </>
          )}
        </MapContainer>
      </div>
    </section>
  );
}

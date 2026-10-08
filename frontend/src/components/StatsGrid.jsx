export default function StatsGrid({ data, lastUpdatedLabel }) {
  return (
    <section className="card">
      <div className="card-title">
        <h3>📊 Live Status</h3>
        <span>{lastUpdatedLabel}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Speed</div>
          <div className="stat-value">{data ? `${data.speed.toFixed(1)} km/h` : "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Satellites</div>
          <div className="stat-value">{data ? data.satellites : "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">GPS Status</div>
          <div className="stat-value">{data ? (data.gpsFix ? "FIXED" : "SEARCHING") : "--"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Route Progress</div>
          <div className="stat-value">{data ? `${Math.round(data.progress)}%` : "--"}</div>
        </div>
      </div>
    </section>
  );
}

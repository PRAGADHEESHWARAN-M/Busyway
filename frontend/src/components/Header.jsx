export default function Header({ status }) {
  const label = status === "live" ? "● LIVE" : status === "searching" ? "● GPS SEARCH" : "● OFFLINE";
  const cls = status === "live" ? "" : status === "searching" ? "searching" : "offline";

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-icon">🚌</div>
          <div className="brand-text">
            <h1>BUSy Way</h1>
            <p>SMART BUS TRACKING SYSTEM</p>
          </div>
        </div>
        <div className={`status-pill ${cls}`}>{label}</div>
      </div>
    </header>
  );
}

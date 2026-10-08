function formatDistance(m) {
  if (m === null || m === undefined || m < 0) return "--";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function formatETA(seconds) {
  if (seconds === null || seconds === undefined || seconds < 0) return "--";
  if (seconds < 60) return "< 1 min";
  return `${Math.ceil(seconds / 60)} min`;
}

const CONFIDENCE_LABEL = {
  high: "High-confidence ETA (learned from past trips)",
  medium: "Medium-confidence ETA (still learning this route)",
  low: "Low-confidence ETA (based on live speed only)",
  none: "",
};

export default function Hero({ data }) {
  if (!data) {
    return (
      <section className="hero">
        <div className="route-label">LIVE BUS</div>
        <h2>Connecting...</h2>
      </section>
    );
  }

  return (
    <section className="hero">
      <div className="hero-top">
        <div>
          <div className="route-label">LIVE BUS</div>
          <h2>
            <span className="bus-number">{data.busNumber}</span>
          </h2>
          <div className="hero-route">{data.routeName}</div>
        </div>
        <div style={{ fontSize: 22 }}>🛰️</div>
      </div>

      <div className="next-stop">
        <div className="next-label">Next stop</div>
        <div className="next-name">{data.nextStop}</div>

        <div className="next-meta">
          <div className="meta-box">
            <span>Distance</span>
            <strong>{formatDistance(data.distanceToNext)}</strong>
          </div>
          <div className="meta-box">
            <span>ETA</span>
            <strong>{formatETA(data.etaSeconds)}</strong>
          </div>
          <div className="meta-box">
            <span>Passed</span>
            <strong>
              {data.passedStops} / {data.totalStops}
            </strong>
          </div>
        </div>

        {data.etaConfidence && data.etaConfidence !== "none" && (
          <div className="confidence-tag">{CONFIDENCE_LABEL[data.etaConfidence]}</div>
        )}
      </div>
    </section>
  );
}

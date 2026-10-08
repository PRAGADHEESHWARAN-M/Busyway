export default function LocationCard({ data }) {
  return (
    <section className="card">
      <div className="card-title">
        <h3>📍 Current Location</h3>
        <span>GPS</span>
      </div>

      <div className="location">
        Latitude : {data ? data.latitude.toFixed(6) : "--"}
        <br />
        Longitude : {data ? data.longitude.toFixed(6) : "--"}
        <br />
        Speed : {data ? `${data.speed.toFixed(1)} km/h` : "--"}
        <br />
        Satellites : {data ? data.satellites : "--"}
      </div>
    </section>
  );
}

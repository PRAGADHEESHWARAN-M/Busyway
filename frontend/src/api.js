const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const BUS_ID = import.meta.env.VITE_BUS_ID || "BUS-01";

async function get(path) {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const fetchRoute = () => get(`/route?busId=${BUS_ID}`);
export const fetchData = () => get(`/data?busId=${BUS_ID}`);
export const fetchHistory = (limit = 200) => get(`/history?busId=${BUS_ID}&limit=${limit}`);

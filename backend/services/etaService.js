// Shared geo/ETA math used by controllers. Kept simple and honest:
// straight-line (haversine) distance, and ETA = distance / speed.
// No fake precision and no ML claims - this is explicitly a placeholder
// for a future ML-based ETA model (see README "Future Enhancements").

const EARTH_RADIUS_M = 6371000; // meters

// Haversine formula: great-circle distance between two lat/lng points, in meters.
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
};

// Returns { distanceMeters, etaMinutes | null, etaText }.
// If speed is unavailable/zero we do NOT invent a number - we say "Calculating...".
const calculateETA = (currentLat, currentLng, targetLat, targetLng, speedKmh) => {
  const distanceMeters = getDistanceMeters(currentLat, currentLng, targetLat, targetLng);

  if (!speedKmh || speedKmh <= 0) {
    return { distanceMeters: Math.round(distanceMeters), etaMinutes: null, etaText: 'Calculating...' };
  }

  const speedMetersPerMin = (speedKmh * 1000) / 60;
  const etaMinutes = distanceMeters / speedMetersPerMin;

  return {
    distanceMeters: Math.round(distanceMeters),
    etaMinutes: Math.round(etaMinutes * 10) / 10,
    etaText: etaMinutes < 1 ? '< 1 min' : `${Math.round(etaMinutes)} min`,
  };
};

// Given the bus's current position and an ordered list of stops, works out
// which stop is "current" (closest already-reached stop) and which is "next".
// A stop counts as "reached" once the bus comes within REACH_RADIUS_METERS of it,
// walking the stops in route order.
const REACH_RADIUS_METERS = 60;

const getRouteProgress = (currentLat, currentLng, stops) => {
  const sorted = [...stops].sort((a, b) => a.order - b.order);

  let lastReachedIndex = -1;
  for (let i = 0; i < sorted.length; i++) {
    const d = getDistanceMeters(currentLat, currentLng, sorted[i].latitude, sorted[i].longitude);
    if (d <= REACH_RADIUS_METERS) {
      lastReachedIndex = i;
    }
  }

  const currentStop = lastReachedIndex >= 0 ? sorted[lastReachedIndex] : null;
  const nextStop = sorted[lastReachedIndex + 1] || null;

  const passedStops = sorted.slice(0, Math.max(lastReachedIndex, 0)).map((s) => s._id.toString());
  const progressPercent = sorted.length > 1 ? Math.round(((lastReachedIndex + 1) / sorted.length) * 100) : 0;

  return { currentStop, nextStop, passedStopIds: passedStops, progressPercent, sortedStops: sorted };
};

module.exports = { getDistanceMeters, calculateETA, getRouteProgress, REACH_RADIUS_METERS };

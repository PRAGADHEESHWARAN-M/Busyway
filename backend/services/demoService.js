// In-memory interval manager for DEMO / SIMULATION MODE.
// Demo mode simulates GPS pings by walking through a list of route stops
// (in order) and interpolating intermediate points between them, then
// writing to the SAME BusLocation collection real GPS data would use
// (with source: 'demo') so the passenger dashboard needs no special logic.
const BusLocation = require('../models/BusLocation');
const Bus = require('../models/Bus');
const { getDistanceMeters } = require('./etaService');
const { recordLocation } = require('../controllers/locationController');

// Keep interval handles per bus id so admins can start/pause/reset independently.
const runningTimers = new Map();

// Builds a dense path of {lat, lng} points by interpolating between each
// consecutive pair of stops, so the marker appears to move smoothly.
const buildSimulatedPath = (sortedStops, stepsBetweenStops = 8) => {
  const path = [];
  for (let i = 0; i < sortedStops.length - 1; i++) {
    const a = sortedStops[i];
    const b = sortedStops[i + 1];
    for (let s = 0; s <= stepsBetweenStops; s++) {
      const t = s / stepsBetweenStops;
      path.push({
        latitude: a.latitude + (b.latitude - a.latitude) * t,
        longitude: a.longitude + (b.longitude - a.longitude) * t,
        nearestStopOrder: t < 1 ? a.order : b.order,
      });
    }
  }
  if (sortedStops.length === 1) {
    path.push({ latitude: sortedStops[0].latitude, longitude: sortedStops[0].longitude, nearestStopOrder: sortedStops[0].order });
  }
  return path;
};

// Estimates a plausible demo speed (km/h) from the distance covered in one tick.
const estimateSpeedKmh = (prevPoint, nextPoint, tickSeconds) => {
  if (!prevPoint) return 22; // reasonable default city-bus speed
  const meters = getDistanceMeters(prevPoint.latitude, prevPoint.longitude, nextPoint.latitude, nextPoint.longitude);
  const kmh = (meters / tickSeconds) * 3.6;
  // Clamp to a realistic-looking range for demo purposes.
  return Math.max(10, Math.min(35, Math.round(kmh * 20) || 20));
};

const startDemo = async (busId, sortedStops, tickMs = 4000) => {
  stopDemo(busId); // clear any existing timer for this bus first

  const path = buildSimulatedPath(sortedStops);
  const bus = await Bus.findById(busId);
  if (!bus) return;

  bus.demoMode.isRunning = true;
  bus.demoMode.isPaused = false;
  if (bus.demoMode.currentIndex >= path.length) bus.demoMode.currentIndex = 0;
  await bus.save();

  const timer = setInterval(async () => {
    try {
      const freshBus = await Bus.findById(busId);
      if (!freshBus || !freshBus.demoMode.isRunning || freshBus.demoMode.isPaused) return;

      let idx = freshBus.demoMode.currentIndex;
      if (idx >= path.length) {
        // Reached the end of the route - stop automatically.
        freshBus.demoMode.isRunning = false;
        await freshBus.save();
        stopDemo(busId);
        return;
      }

      const point = path[idx];
      const prevPoint = idx > 0 ? path[idx - 1] : null;
      const speed = estimateSpeedKmh(prevPoint, point, tickMs / 1000);

      await recordLocation(freshBus, {
        latitude: point.latitude,
        longitude: point.longitude,
        speed,
        satellites: 9,
        source: 'demo',
        timestamp: new Date(),
      });

      freshBus.demoMode.currentIndex = idx + 1;
      await freshBus.save();
    } catch (e) {
      console.error('Demo tick error:', e.message);
    }
  }, tickMs);

  runningTimers.set(busId.toString(), timer);
};

const pauseDemo = async (busId, paused = true) => {
  const bus = await Bus.findById(busId);
  if (!bus) return;
  bus.demoMode.isPaused = paused;
  await bus.save();
};

const resetDemo = async (busId) => {
  stopDemo(busId);
  const bus = await Bus.findById(busId);
  if (!bus) return;
  bus.demoMode.isRunning = false;
  bus.demoMode.isPaused = false;
  bus.demoMode.currentIndex = 0;
  // A reset starts a fresh demonstration of the same route, including its
  // arrival notifications.
  bus.arrivalState = {
    currentStop: null,
    previousStop: null,
    nextStop: null,
    hasLeftCurrentStop: true,
    routeCompleted: false,
    lastArrival: { eventId: null, stop: null, message: null, arrivedAt: null },
  };
  await bus.save();
};

const stopDemo = (busId) => {
  const key = busId.toString();
  if (runningTimers.has(key)) {
    clearInterval(runningTimers.get(key));
    runningTimers.delete(key);
  }
};

module.exports = { startDemo, pauseDemo, resetDemo, stopDemo, buildSimulatedPath };

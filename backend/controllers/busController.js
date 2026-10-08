// Public + admin bus endpoints, and the bus "full status" endpoint used by
// both the student dashboard and admin tracking page.
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const BusLocation = require('../models/BusLocation');
const { calculateETA } = require('../services/etaService');

const OFFLINE_THRESHOLD_SECONDS = () => Number(process.env.OFFLINE_THRESHOLD_SECONDS || 30);

// Builds the rich status object shared by student + admin views.
const buildBusStatus = async (bus) => {
  const latestLocation = await BusLocation.findOne({ bus: bus._id }).sort({ createdAt: -1 });

  let route = null;
  let stops = [];
  if (bus.route) {
    route = await Route.findById(bus.route);
    stops = await Stop.find({ route: bus.route }).sort({ order: 1 });
  }

  const now = Date.now();
  const secondsSinceUpdate = latestLocation
    ? Math.floor((now - new Date(latestLocation.createdAt).getTime()) / 1000)
    : null;

  const isLive =
    bus.status === 'active' && latestLocation && secondsSinceUpdate <= OFFLINE_THRESHOLD_SECONDS();

  // Arrival state is written only when a 30 m arrival is confirmed, instead
  // of guessing progress from a single GPS reading.
  const state = bus.arrivalState || {};
  const stopFor = (id) => stops.find((stop) => id && stop._id.toString() === id.toString()) || null;
  const currentStop = stopFor(state.currentStop);
  const previousStop = stopFor(state.previousStop);
  const nextStop = stopFor(state.nextStop) || (!state.routeCompleted ? stops[0] || null : null);
  const currentIndex = currentStop ? stops.findIndex((stop) => stop._id.toString() === currentStop._id.toString()) : -1;
  const passedStopIds = currentIndex > 0 ? stops.slice(0, currentIndex).map((stop) => stop._id.toString()) : [];
  const progressPercent = stops.length ? Math.round(((currentIndex + 1) / stops.length) * 100) : 0;
  let eta = { distanceMeters: null, etaMinutes: null, etaText: 'Calculating...' };

  if (latestLocation && nextStop) {
      eta = calculateETA(
        latestLocation.latitude,
        latestLocation.longitude,
        nextStop.latitude,
        nextStop.longitude,
        latestLocation.speed
      );
  }

  return {
    bus: {
      id: bus._id,
      busNumber: bus.busNumber,
      busName: bus.busName,
      registrationNumber: bus.registrationNumber,
      status: bus.status,
    },
    route,
    stops,
    location: latestLocation
      ? {
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          speed: latestLocation.speed,
          satellites: latestLocation.satellites,
          source: latestLocation.source,
          timestamp: latestLocation.timestamp,
          secondsSinceUpdate,
        }
      : null,
    liveStatus: !bus.route || !latestLocation ? 'NO_DATA' : bus.demoMode?.isRunning ? 'DEMO' : isLive ? 'LIVE' : 'OFFLINE',
    demoMode: bus.demoMode,
    currentStop,
    previousStop,
    nextStop,
    passedStopIds,
    progressPercent,
    routeCompleted: Boolean(state.routeCompleted),
    arrivalEvent: state.lastArrival?.eventId ? state.lastArrival : null,
    distanceMeters: eta.distanceMeters,
    etaMinutes: eta.etaMinutes,
    etaText: eta.etaText,
  };
};

// @route GET /api/buses (public)
const getBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find().populate('route', 'name startingPoint destination');
    res.json({ success: true, buses });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/buses/:id (public)
const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('route');
    if (!bus) {
      const err = new Error('Bus not found.');
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, bus });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/buses/:id/location  (public - full live status bundle)
const getBusLocationStatus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      const err = new Error('Bus not found.');
      err.statusCode = 404;
      throw err;
    }
    const status = await buildBusStatus(bus);
    res.json({ success: true, ...status });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBuses, getBusById, getBusLocationStatus, buildBusStatus };

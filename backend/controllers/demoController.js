// Admin controls for DEMO / SIMULATION MODE. Simulated points are written
// through the same BusLocation model as real GPS (tagged source: 'demo'),
// so the passenger dashboard/map consume it exactly like real data - it is
// only ever visually labelled "DEMO MODE - SIMULATED GPS" on the frontend.
const Bus = require('../models/Bus');
const Stop = require('../models/Stop');
const demoService = require('../services/demoService');

// @route POST /api/admin/demo/:busId/start
const startDemo = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) {
      const err = new Error('Bus not found.');
      err.statusCode = 404;
      throw err;
    }
    if (!bus.route) {
      const err = new Error('Assign a route to this bus before starting demo mode.');
      err.statusCode = 400;
      throw err;
    }
    const stops = await Stop.find({ route: bus.route }).sort({ order: 1 });
    if (stops.length < 2) {
      const err = new Error('The assigned route needs at least 2 stops to run a demo.');
      err.statusCode = 400;
      throw err;
    }
    await demoService.startDemo(bus._id, stops);
    res.json({ success: true, message: 'Demo mode started.' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/demo/:busId/pause
const pauseDemo = async (req, res, next) => {
  try {
    await demoService.pauseDemo(req.params.busId, true);
    res.json({ success: true, message: 'Demo mode paused.' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/demo/:busId/resume
const resumeDemo = async (req, res, next) => {
  try {
    await demoService.pauseDemo(req.params.busId, false);
    res.json({ success: true, message: 'Demo mode resumed.' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/demo/:busId/reset
const resetDemo = async (req, res, next) => {
  try {
    await demoService.resetDemo(req.params.busId);
    res.json({ success: true, message: 'Demo mode reset.' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/demo/:busId/next-stop
// Jumps the simulation forward to the next stop instantly (useful for demos
// where you don't want to wait for the full interpolated path).
const nextStop = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) {
      const err = new Error('Bus not found.');
      err.statusCode = 404;
      throw err;
    }
    if (!bus.route) {
      const err = new Error('This bus has no assigned route.');
      err.statusCode = 400;
      throw err;
    }
    const stops = await Stop.find({ route: bus.route }).sort({ order: 1 });
    const path = demoService.buildSimulatedPath(stops);

    // Find the next index in the path whose nearestStopOrder is greater
    // than the stop we're currently closest to, and jump there.
    const currentIdx = bus.demoMode.currentIndex || 0;
    const currentOrder = path[Math.min(currentIdx, path.length - 1)]?.nearestStopOrder;
    let jumpIdx = path.findIndex((p, i) => i > currentIdx && p.nearestStopOrder > currentOrder);
    if (jumpIdx === -1) jumpIdx = path.length - 1;

    bus.demoMode.currentIndex = jumpIdx;
    await bus.save();

    const point = path[jumpIdx];
    const { recordLocation } = require('./locationController');
    await recordLocation(bus, {
      latitude: point.latitude,
      longitude: point.longitude,
      speed: 24,
      satellites: 9,
      source: 'demo',
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Jumped to next stop.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { startDemo, pauseDemo, resumeDemo, resetDemo, nextStop };

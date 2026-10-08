// Receives GPS pings from the ESP32 device.
const Bus = require('../models/Bus');
const BusLocation = require('../models/BusLocation');
const { processArrival } = require('../services/arrivalService');

// Used by both the ESP32 endpoint and the built-in demo service. All location
// sources therefore use exactly the same persistent arrival detection logic.
const recordLocation = async (bus, { latitude, longitude, speed = 0, satellites = 0, source = 'gps', timestamp }) => {
  const recordedAt = timestamp ? new Date(timestamp) : new Date();
  const location = await BusLocation.create({
    bus: bus._id,
    latitude,
    longitude,
    speed: typeof speed === 'number' ? speed : 0,
    satellites: typeof satellites === 'number' ? satellites : 0,
    source,
    timestamp: recordedAt,
  });
  const { arrivalEvent } = await processArrival(bus, latitude, longitude, recordedAt);
  return { location, arrivalEvent };
};

// @route POST /api/location  (used by the ESP32 firmware)
// Body: { busId, latitude, longitude, speed, satellites, timestamp }
const postLocation = async (req, res, next) => {
  try {
    const { busId, latitude, longitude, speed, satellites, timestamp } = req.body;

    if (!busId || latitude === undefined || longitude === undefined) {
      const err = new Error('busId, latitude and longitude are required.');
      err.statusCode = 400;
      throw err;
    }

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      const err = new Error('Invalid GPS coordinates.');
      err.statusCode = 400;
      throw err;
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      const err = new Error('Unknown busId.');
      err.statusCode = 404;
      throw err;
    }

    // If a demo simulation is currently running for this bus, real GPS data
    // is ignored so the demo stays consistent (avoids the two sources fighting).
    if (bus.demoMode?.isRunning) {
      return res.status(202).json({
        success: true,
        message: 'Bus is currently in DEMO MODE. Real GPS ping was received but not stored while demo is active.',
      });
    }

    const { location, arrivalEvent } = await recordLocation(bus, {
      latitude, longitude, speed, satellites, timestamp, source: 'gps',
    });

    res.status(201).json({ success: true, location, arrivalEvent });
  } catch (error) {
    next(error);
  }
};

module.exports = { postLocation, recordLocation };

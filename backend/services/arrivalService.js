// Stop-arrival state machine shared by real GPS and demo location updates.
// It deliberately follows the route order: a later stop cannot be marked as
// reached until the bus has arrived at the preceding stop and left its radius.
const Stop = require('../models/Stop');
const { getDistanceMeters } = require('./etaService');

const ARRIVAL_RADIUS_METERS = 30;
// GPS readings can drift a few metres. A larger exit radius prevents a bus
// parked at a stop from repeatedly arming the same arrival event.
const EXIT_RADIUS_METERS = 45;

const sameId = (left, right) => left && right && left.toString() === right.toString();

const findStop = (stops, id) => stops.find((stop) => sameId(stop._id, id)) || null;

const processArrival = async (bus, latitude, longitude, timestamp = new Date()) => {
  if (!bus.route) return { arrivalEvent: null, stops: [] };

  const stops = await Stop.find({ route: bus.route }).sort({ order: 1 });
  if (!stops.length) return { arrivalEvent: null, stops };

  const state = bus.arrivalState || {};
  let currentStop = findStop(stops, state.currentStop);
  let nextStop = findStop(stops, state.nextStop);

  // Existing buses receive their first target lazily, so no migration is
  // needed when this feature is deployed.
  if (!nextStop && !state.routeCompleted) {
    const currentIndex = currentStop ? stops.findIndex((stop) => sameId(stop._id, currentStop._id)) : -1;
    nextStop = stops[currentIndex + 1] || null;
  }

  let changed = false;
  if (currentStop && !state.hasLeftCurrentStop) {
    const distanceFromCurrent = getDistanceMeters(latitude, longitude, currentStop.latitude, currentStop.longitude);
    if (distanceFromCurrent >= EXIT_RADIUS_METERS) {
      state.hasLeftCurrentStop = true;
      changed = true;
    }
  }

  let arrivalEvent = null;
  const mayReachNext = nextStop && (!currentStop || state.hasLeftCurrentStop);
  if (mayReachNext) {
    const distanceToNext = getDistanceMeters(latitude, longitude, nextStop.latitude, nextStop.longitude);
    if (distanceToNext <= ARRIVAL_RADIUS_METERS) {
      const previousStop = currentStop;
      const followingStop = stops[stops.findIndex((stop) => sameId(stop._id, nextStop._id)) + 1] || null;
      const message = `${bus.busNumber} has reached ${nextStop.name}`;

      state.previousStop = previousStop?._id || null;
      state.currentStop = nextStop._id;
      state.nextStop = followingStop?._id || null;
      state.hasLeftCurrentStop = false;
      state.routeCompleted = !followingStop;
      state.lastArrival = {
        eventId: `${bus._id}-${nextStop._id}-${new Date(timestamp).getTime()}`,
        stop: nextStop._id,
        message,
        arrivedAt: new Date(timestamp),
      };
      arrivalEvent = state.lastArrival;
      currentStop = nextStop;
      nextStop = followingStop;
      changed = true;
    }
  }

  if (changed) {
    bus.arrivalState = state;
    bus.markModified('arrivalState');
    await bus.save();
  }

  return { arrivalEvent, stops };
};

module.exports = { processArrival, ARRIVAL_RADIUS_METERS, EXIT_RADIUS_METERS };

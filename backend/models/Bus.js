// A bus assigned to a route. `status` reflects whether the admin has
// activated the bus; live/offline is derived at read-time from BusLocation.
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    busName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    // Demo/simulation mode state lives on the bus so only one simulation
    // can run per bus at a time.
    demoMode: {
      isRunning: { type: Boolean, default: false },
      isPaused: { type: Boolean, default: false },
      currentIndex: { type: Number, default: 0 }, // index into the simulated coordinate path
    },
    // Persistent arrival state. Keeping this on the bus makes stop detection
    // survive server restarts and prevents the same GPS point from creating
    // repeated arrival alerts.
    arrivalState: {
      currentStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', default: null },
      previousStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', default: null },
      nextStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', default: null },
      hasLeftCurrentStop: { type: Boolean, default: true },
      routeCompleted: { type: Boolean, default: false },
      lastArrival: {
        eventId: { type: String, default: null },
        stop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', default: null },
        message: { type: String, default: null },
        arrivedAt: { type: Date, default: null },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bus', busSchema);

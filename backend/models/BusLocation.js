// Stores every location ping received for a bus. The most recent document
// per bus (by createdAt) represents the bus's current position.
const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema(
  {
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 }, // km/h
    satellites: { type: Number, default: 0 },
    source: { type: String, enum: ['gps', 'demo'], default: 'gps' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

busLocationSchema.index({ bus: 1, createdAt: -1 });

module.exports = mongoose.model('BusLocation', busLocationSchema);

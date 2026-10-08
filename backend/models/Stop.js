// A single bus stop. Stops belong to a Route via the `route` reference and
// are ordered using the `order` field.
const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    order: { type: Number, required: true }, // position of the stop along the route, starting at 1
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  },
  { timestamps: true }
);

stopSchema.index({ route: 1, order: 1 });

module.exports = mongoose.model('Stop', stopSchema);

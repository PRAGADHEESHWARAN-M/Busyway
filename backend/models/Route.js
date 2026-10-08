// A route connects a start point to a destination through an ordered list
// of Stop documents.
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    startingPoint: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);

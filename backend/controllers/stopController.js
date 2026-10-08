// Public stop-reading endpoint.
const Stop = require('../models/Stop');

// @route GET /api/stops (public) - optionally filter with ?route=<id>
const getStops = async (req, res, next) => {
  try {
    const filter = req.query.route ? { route: req.query.route } : {};
    const stops = await Stop.find(filter).sort({ order: 1 });
    res.json({ success: true, stops });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStops };

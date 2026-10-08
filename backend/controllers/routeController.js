// Public route-reading endpoints.
const Route = require('../models/Route');
const Stop = require('../models/Stop');

// @route GET /api/routes (public)
const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find();
    res.json({ success: true, routes });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/routes/:id (public) - includes its ordered stops
const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      const err = new Error('Route not found.');
      err.statusCode = 404;
      throw err;
    }
    const stops = await Stop.find({ route: route._id }).sort({ order: 1 });
    res.json({ success: true, route, stops });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRoutes, getRouteById };

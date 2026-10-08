// All admin-only management endpoints: buses, routes, stops, students,
// and dashboard summary stats. Every function here sits behind
// `protect` + `authorize('admin')` middleware in adminRoutes.js.
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Student = require('../models/Student');
const BusLocation = require('../models/BusLocation');

// ---------- Dashboard ----------

// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalBuses, activeBuses, totalStops, totalStudents] = await Promise.all([
      Bus.countDocuments(),
      Bus.countDocuments({ status: 'active' }),
      Stop.countDocuments(),
      Student.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: { totalBuses, activeBuses, totalStops, registeredStudents: totalStudents },
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Buses ----------

// @route POST /api/admin/buses
const createBus = async (req, res, next) => {
  try {
    const { busNumber, busName, registrationNumber, route, status } = req.body;
    if (!busNumber || !busName || !registrationNumber) {
      const err = new Error('busNumber, busName and registrationNumber are required.');
      err.statusCode = 400;
      throw err;
    }
    const bus = await Bus.create({
      busNumber: busNumber.toUpperCase(),
      busName,
      registrationNumber,
      route: route || null,
      status: status || 'active',
    });
    res.status(201).json({ success: true, bus });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/buses/:id
const updateBus = async (req, res, next) => {
  try {
    const { busNumber, busName, registrationNumber, route, status } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      const err = new Error('Bus not found.');
      err.statusCode = 404;
      throw err;
    }
    if (busNumber) bus.busNumber = busNumber.toUpperCase();
    if (busName) bus.busName = busName;
    if (registrationNumber) bus.registrationNumber = registrationNumber;
    if (route !== undefined) {
      bus.route = route || null;
      // A different route must begin with a clean ordered-arrival state.
      bus.arrivalState = {
        currentStop: null,
        previousStop: null,
        nextStop: null,
        hasLeftCurrentStop: true,
        routeCompleted: false,
        lastArrival: { eventId: null, stop: null, message: null, arrivedAt: null },
      };
    }
    if (status) bus.status = status;
    await bus.save();
    res.json({ success: true, bus });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/buses/:id
const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      const err = new Error('Bus not found.');
      err.statusCode = 404;
      throw err;
    }
    await BusLocation.deleteMany({ bus: bus._id });
    await bus.deleteOne();
    res.json({ success: true, message: 'Bus deleted.' });
  } catch (error) {
    next(error);
  }
};

// ---------- Routes ----------

// @route POST /api/admin/routes
const createRoute = async (req, res, next) => {
  try {
    const { name, startingPoint, destination } = req.body;
    if (!name || !startingPoint || !destination) {
      const err = new Error('name, startingPoint and destination are required.');
      err.statusCode = 400;
      throw err;
    }
    const route = await Route.create({ name, startingPoint, destination });
    res.status(201).json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/routes/:id
const updateRoute = async (req, res, next) => {
  try {
    const { name, startingPoint, destination } = req.body;
    const route = await Route.findById(req.params.id);
    if (!route) {
      const err = new Error('Route not found.');
      err.statusCode = 404;
      throw err;
    }
    if (name) route.name = name;
    if (startingPoint) route.startingPoint = startingPoint;
    if (destination) route.destination = destination;
    await route.save();
    res.json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/routes/:id
const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      const err = new Error('Route not found.');
      err.statusCode = 404;
      throw err;
    }
    await Stop.deleteMany({ route: route._id });
    await Bus.updateMany({ route: route._id }, { $set: { route: null } });
    await route.deleteOne();
    res.json({ success: true, message: 'Route and its stops deleted.' });
  } catch (error) {
    next(error);
  }
};

// ---------- Stops ----------

// @route POST /api/admin/stops
const createStop = async (req, res, next) => {
  try {
    const { name, latitude, longitude, order, route } = req.body;
    if (!name || latitude === undefined || longitude === undefined || !order || !route) {
      const err = new Error('name, latitude, longitude, order and route are required.');
      err.statusCode = 400;
      throw err;
    }
    const stop = await Stop.create({ name, latitude, longitude, order, route });
    res.status(201).json({ success: true, stop });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/stops/:id
const updateStop = async (req, res, next) => {
  try {
    const { name, latitude, longitude, order } = req.body;
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      const err = new Error('Stop not found.');
      err.statusCode = 404;
      throw err;
    }
    if (name) stop.name = name;
    if (latitude !== undefined) stop.latitude = latitude;
    if (longitude !== undefined) stop.longitude = longitude;
    if (order !== undefined) stop.order = order;
    await stop.save();
    res.json({ success: true, stop });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/stops/:id
const deleteStop = async (req, res, next) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      const err = new Error('Stop not found.');
      err.statusCode = 404;
      throw err;
    }
    await stop.deleteOne();
    res.json({ success: true, message: 'Stop deleted.' });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/stops/reorder  Body: { stops: [{id, order}, ...] }
const reorderStops = async (req, res, next) => {
  try {
    const { stops } = req.body;
    if (!Array.isArray(stops)) {
      const err = new Error('stops must be an array of { id, order }.');
      err.statusCode = 400;
      throw err;
    }
    await Promise.all(stops.map((s) => Stop.findByIdAndUpdate(s.id, { order: s.order })));
    res.json({ success: true, message: 'Stops reordered.' });
  } catch (error) {
    next(error);
  }
};

// ---------- Students ----------

// @route GET /api/admin/students
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().select('-password');
    res.json({ success: true, students });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      const err = new Error('Student not found.');
      err.statusCode = 404;
      throw err;
    }
    await student.deleteOne();
    res.json({ success: true, message: 'Student removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createBus,
  updateBus,
  deleteBus,
  createRoute,
  updateRoute,
  deleteRoute,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  getStudents,
  deleteStudent,
};

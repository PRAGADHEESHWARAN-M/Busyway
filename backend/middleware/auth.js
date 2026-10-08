// Authentication + role-based authorization middleware.
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

// Verifies the JWT from the Authorization header and attaches req.user.
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      const err = new Error('Not authorized. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'student') {
      user = await Student.findById(decoded.id).select('-password');
    }

    if (!user) {
      const err = new Error('User no longer exists.');
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = error.message || 'Not authorized. Please log in again.';
    next(error);
  }
};

// Restricts a route to a specific role, e.g. authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      const err = new Error('You do not have permission to perform this action.');
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
};

module.exports = { protect, authorize };

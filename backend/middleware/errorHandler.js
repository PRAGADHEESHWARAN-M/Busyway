// Central error handler. Converts thrown/next(err) errors into a clean
// JSON response and NEVER leaks raw stack traces or DB errors to clients.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Something went wrong. Please try again later.';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists.` : 'Duplicate value entered.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (statusCode === 500) {
    // Never expose raw server/database errors to the client.
    message = 'The server encountered an unexpected error. Please try again later.';
  }

  res.status(statusCode).json({ success: false, message });
};

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };

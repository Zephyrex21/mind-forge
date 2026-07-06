/**
 * Global error handler middleware.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose: malformed ObjectId in a route param, e.g. GET /api/checkins/xyz
  // — this is a client mistake, not a server failure, so it should be a 400.
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  // Mongoose: schema validation failure not already handled by the route.
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // MongoDB duplicate-key error not already handled by the route.
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

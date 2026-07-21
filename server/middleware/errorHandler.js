import { reportError } from '../services/errorReporter.js';

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
  const isDev = process.env.NODE_ENV === 'development';
  const message = status === 500 && !isDev ? 'Internal server error' : err.message;

  // Only genuinely unexpected failures (5xx) go to the error reporter —
  // a 400/401/404 is expected, routine traffic (a bad request, an expired
  // session, a missing record), not something worth alerting on.
  if (status >= 500 && process.env.NODE_ENV !== 'test') {
    reportError(err, { requestId: req.id, method: req.method, path: req.path, userId: req.user?.id });
  }

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack }),
  });
}

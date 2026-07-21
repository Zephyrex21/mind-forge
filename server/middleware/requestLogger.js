import { randomUUID } from 'crypto';

/**
 * Assigns a request ID (reusing an incoming X-Request-Id header if the
 * caller/proxy already set one, so a request can be traced across
 * services rather than just within this one) and logs one line per
 * request on completion: method, path, status, duration, request ID, and
 * the authenticated user's ID if the route required auth.
 *
 * Logged as a single JSON object in production (so a log aggregator can
 * parse/filter/alert on it) and as a compact readable line in development.
 * Silent in the test environment — integration tests fire many requests
 * in quick succession and the resulting log spam adds nothing useful to
 * a test run's output.
 */
export function requestLogger(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);

  if (process.env.NODE_ENV === 'test') return next();

  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    const entry = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      userId: req.user?.id || null,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      console.log(`[${entry.status}] ${entry.method} ${entry.path} — ${entry.durationMs}ms${entry.userId ? ` (user ${entry.userId})` : ''} [${entry.requestId}]`);
    }
  });

  next();
}

export default requestLogger;

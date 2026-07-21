/**
 * Central place for reporting unexpected (5xx) server errors. Currently
 * does structured JSON logging — but this is the one seam where a real
 * error tracker (Sentry, Rollbar, Bugsnag, etc.) belongs. To wire one in:
 *
 *   1. npm install @sentry/node
 *   2. Sentry.init({ dsn: process.env.SENTRY_DSN }) once at boot (index.js)
 *   3. Replace the console.error below with:
 *        Sentry.captureException(err, { extra: context })
 *
 * Deliberately not faking that integration here with an uninstalled
 * package — a stubbed "Sentry.captureException" call that silently does
 * nothing is worse than an honest structured log, since it *looks* like
 * error tracking exists in production when it doesn't.
 */
export function reportError(err, context = {}) {
  const entry = {
    level: 'error',
    message: err.message,
    name: err.name,
    stack: err.stack,
    ...context,
    timestamp: new Date().toISOString(),
  };
  console.error(JSON.stringify(entry));
}

export default reportError;

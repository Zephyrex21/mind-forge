import * as Sentry from '@sentry/node';

/**
 * Central place for reporting unexpected (5xx) server errors.
 *
 * If SENTRY_DSN is set, errors are actually sent to Sentry — this is a
 * real, working integration, not a stubbed placeholder. If it isn't set
 * (e.g. local development, or a deployment that hasn't configured one
 * yet), this silently falls back to structured console logging only, so
 * the app never depends on a third-party service being configured to run.
 *
 * initSentry() is called once at boot (see index.js) — deliberately not
 * using a separate instrument.js/auto-instrumentation setup, since this
 * app only needs manual error capture (via reportError below), not
 * distributed tracing or profiling.
 */
let sentryEnabled = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    // Error tracking only — no performance tracing/profiling. Those are
    // heavier (extra overhead per request, extra Sentry quota) and this
    // app doesn't need them yet; they're a natural next step if it does.
    tracesSampleRate: 0,
  });
  sentryEnabled = true;
  return true;
}

export function isSentryEnabled() {
  return sentryEnabled;
}

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

  if (sentryEnabled) {
    Sentry.captureException(err, { extra: context });
  }
}

export default reportError;

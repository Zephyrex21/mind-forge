/**
 * Graceful shutdown — extracted into its own testable function rather
 * than inlined directly as a `process.on('SIGTERM', ...)` callback, so
 * the actual shutdown *logic* (close the HTTP server, then the DB
 * connection, with a forced-exit safety net) can be unit tested without
 * needing to send real OS signals to a real process.
 *
 * Why this matters in production: most PaaS hosts (Railway, Render, Fly)
 * send SIGTERM to the old process during a deploy, wait a grace period,
 * then SIGKILL if it's still running. Without handling SIGTERM explicitly,
 * Node's default behavior is to exit immediately — dropping any in-flight
 * HTTP requests mid-response and leaving the MongoDB connection unclosed.
 * That's the difference between a deploy that briefly 502s a few
 * in-flight requests and one that doesn't.
 */
export function createShutdownHandler({ server, closeDb, forceExitMs = 10_000, log = console, exit = process.exit }) {
  let shuttingDown = false;

  return function shutdown(signal) {
    // A second SIGTERM (some platforms send more than one) shouldn't
    // restart the drain countdown or double-close things.
    if (shuttingDown) return;
    shuttingDown = true;

    log.log(`[Shutdown] Received ${signal}, closing server gracefully...`);

    const forceTimer = setTimeout(() => {
      log.error('[Shutdown] Forced shutdown after timeout — some connections did not close in time.');
      exit(1);
    }, forceExitMs);
    forceTimer.unref?.(); // don't let this timer itself keep the process alive

    server.close(async (err) => {
      if (err) {
        log.error('[Shutdown] Error while closing HTTP server:', err.message);
      } else {
        log.log('[Shutdown] HTTP server closed (no longer accepting new connections).');
      }

      try {
        await closeDb();
        log.log('[Shutdown] Database connection closed.');
      } catch (dbErr) {
        log.error('[Shutdown] Error closing database connection:', dbErr.message);
      }

      clearTimeout(forceTimer);
      log.log('[Shutdown] Graceful shutdown complete.');
      exit(err ? 1 : 0);
    });
  };
}

export default createShutdownHandler;

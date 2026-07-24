import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb, closeDb } from './db/connection.js';
import { initSentry, reportError } from './services/errorReporter.js';
import { createShutdownHandler } from './shutdown.js';

const sentryActive = initSentry();

const PORT = process.env.PORT || 3001;
const app = createApp();

// --- Start ---
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key] || process.env[key].startsWith('replace-with') || process.env[key].startsWith('your_'));

  if (missing.length > 0) {
    console.error('\n========================================');
    console.error('  MindForge server cannot start');
    console.error('========================================');
    console.error(`  Missing or placeholder values for: ${missing.join(', ')}`);
    console.error('  Copy server/.env.example to server/.env and fill in real values.');
    console.error('  Without these, requests like signup/login/guest will reach the');
    console.error('  server fine but crash mid-request with a generic 500 error —');
    console.error('  which is exactly what a missing JWT_SECRET looks like.');
    console.error('========================================\n');
    process.exit(1);
  }
}

async function start() {
  validateEnv();
  try {
    await connectDb();
    const server = app.listen(PORT, () => {
      console.log(`Mind Forge API is running on port ${PORT}`);
      console.log(`CORS allowed origins: http://localhost:5173, ${process.env.CORS_ORIGIN || '(not set)'}`);
      console.log(`Error tracking (Sentry): ${sentryActive ? 'active' : 'not configured (SENTRY_DSN not set)'}`);
    });

    // Graceful shutdown — see shutdown.js for why this matters. Most
    // PaaS hosts (Railway, Render, Fly) send SIGTERM before killing the
    // process during a deploy; without handling it, in-flight requests
    // get dropped mid-response and the DB connection isn't closed cleanly.
    const shutdown = createShutdownHandler({ server, closeDb });
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // An uncaught exception or unhandled rejection means the process is
    // in an unknown state — the correct response is to report it, then
    // exit and let the process manager restart cleanly, not to keep
    // running in a potentially-corrupted state and hope for the best.
    process.on('uncaughtException', (err) => {
      reportError(err, { fatal: true, kind: 'uncaughtException' });
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason) => {
      const err = reason instanceof Error ? reason : new Error(String(reason));
      reportError(err, { fatal: true, kind: 'unhandledRejection' });
      shutdown('unhandledRejection');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

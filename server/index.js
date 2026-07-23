import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './db/connection.js';
import { initSentry } from './services/errorReporter.js';

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
    app.listen(PORT, () => {
      console.log(`Mind Forge API is running on port ${PORT}`);
      console.log(`CORS allowed origins: http://localhost:5173, ${process.env.CORS_ORIGIN || '(not set)'}`);
      console.log(`Error tracking (Sentry): ${sentryActive ? 'active' : 'not configured (SENTRY_DSN not set)'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

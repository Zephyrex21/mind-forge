import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDb } from './db/connection.js';
import generateRouter from './routes/generate.js';
import checkinsRouter from './routes/checkins.js';
import userRouter from './routes/user.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Minor hardening: don't advertise the framework in every response.
app.disable('x-powered-by');

// Most PaaS hosts (Railway, Render, Fly.io, etc.) sit behind a reverse
// proxy that terminates HTTPS and forwards to the app over plain HTTP,
// adding an X-Forwarded-Proto/X-Forwarded-For header. Without this,
// Express's req.ip resolves to the proxy's internal IP for every request
// — meaning every user shares one rate-limit bucket instead of getting
// their own — and req.secure stays false even though the browser is
// really talking HTTPS, silently breaking the SameSite=None cookie logic
// in sessionManager.js. "1" trusts exactly one hop, matching a standard
// single-proxy PaaS setup (Railway included).
app.set('trust proxy', 1);

// Health check — registered before the rate limiter and CORS on purpose.
// The host (or an external uptime monitor) may ping this frequently to
// keep the instance warm; if it counted against the global rate limit,
// frequent health checks could eat into real users' quota.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Middleware ---
const stripTrailingSlash = (url) => url?.replace(/\/+$/, '');

const allowedOrigins = [
  "http://localhost:5173",
  stripTrailingSlash(process.env.CORS_ORIGIN),
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (Postman, curl, health checks)
    if (!origin) return callback(null, true);

    // Compare with trailing slashes stripped — CORS_ORIGIN set to
    // "https://app.vercel.app/" (trailing slash) would otherwise silently
    // never match the Origin header (which never has one), blocking every
    // request with no indication of why.
    if (allowedOrigins.includes(stripTrailingSlash(origin))) {
      return callback(null, true);
    }

    const err = new Error("Not allowed by CORS");
    err.status = 403;
    callback(err);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50kb' }));

// Global rate limiter: 100 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// --- Routes ---
app.use('/api/auth', authRouter);
app.use('/api/generate', generateRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/user', userRouter);

// --- Error handling (must be last) ---
app.use(errorHandler);

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
      console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

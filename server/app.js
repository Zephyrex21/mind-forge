import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import generateRouter from './routes/generate.js';
import checkinsRouter from './routes/checkins.js';
import goalsRouter from './routes/goals.js';
import userRouter from './routes/user.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

/**
 * Builds the Express app without starting it or connecting to the
 * database — separated from index.js specifically so integration tests
 * can import a real, fully-wired app (real middleware, real auth, real
 * validation) via supertest without needing a live Mongo connection or an
 * open port. index.js is the only thing that actually calls `.listen()`.
 */
export function createApp() {
  const app = express();

  // Minor hardening: don't advertise the framework in every response.
  app.disable('x-powered-by');

  // Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.).
  // CSP is disabled here — this server is a pure JSON API (no HTML/inline
  // scripts to protect), and a strict default CSP would need per-directive
  // tuning to avoid breaking things for no real benefit on an API-only host.
  app.use(helmet({ contentSecurityPolicy: false }));

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

  // Assigns req.id and logs a structured (JSON in production, readable in
  // dev) one-line summary of every request — method, path, status, user
  // (if authenticated), and duration. See middleware/requestLogger.js.
  app.use(requestLogger);

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
    'http://localhost:5173',
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

      const err = new Error('Not allowed by CORS');
      err.status = 403;
      callback(err);
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '50kb' }));

  // Global rate limiter: 100 requests per minute per IP. Skipped in the
  // test environment — integration tests fire many requests in quick
  // succession against a single in-process app instance, which isn't the
  // same threat model an IP-based limiter exists to catch, and would
  // otherwise make test order/count silently affect test outcomes.
  app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    skip: () => process.env.NODE_ENV === 'test',
  }));

  // --- Routes ---
  app.use('/api/auth', authRouter);
  app.use('/api/generate', generateRouter);
  app.use('/api/checkins', checkinsRouter);
  app.use('/api/goals', goalsRouter);
  app.use('/api/user', userRouter);

  // --- Error handling (must be last) ---
  app.use(errorHandler);

  return app;
}

export default createApp;

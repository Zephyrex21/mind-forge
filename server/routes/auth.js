import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { sessionManager } from '../sessionManager.js';
import { UserModel } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Modest rate limit on auth endpoints to slow down credential-stuffing/guessing.
// Skipped in the test environment for the same reason as the global limiter
// in app.js — integration tests fire many auth requests in quick succession
// against one in-process app instance.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again in a few minutes.' },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * True for a MongoDB duplicate-key error (code 11000) on the email field.
 * The emailExists() pre-check has a race window — two registrations for the
 * same email arriving at nearly the same moment can both pass the check —
 * so the unique-index violation is still the real backstop and needs its
 * own clean error instead of falling through as a raw 500.
 */
function isDuplicateEmailError(err) {
  return err?.code === 11000 && Object.keys(err?.keyPattern || {}).includes('email');
}

/**
 * POST /api/auth/register
 * body: { email, password, displayName? }
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    if (await UserModel.emailExists(email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    let user;
    try {
      user = await UserModel.createUser({ email, password, displayName });
    } catch (err) {
      if (isDuplicateEmailError(err)) {
        return res.status(409).json({ error: 'An account with that email already exists.' });
      }
      throw err;
    }
    sessionManager.createSession(user, req, res);

    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user || user.isGuest) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await UserModel.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await UserModel.touchLogin(user.id);
    sessionManager.createSession(user, req, res);

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/guest
 * Creates a throwaway guest account so people can try MindForge with zero
 * signup friction. Guest data lives in Mongo like any other user's, just
 * without an email/password attached.
 */
router.post('/guest', authLimiter, async (req, res, next) => {
  try {
    const user = await UserModel.createGuest();
    sessionManager.createSession(user, req, res);
    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Returns the current user (or null) — safe to call unauthenticated.
 */
router.get('/me', async (req, res, next) => {
  try {
    const session = sessionManager.getSession(req);
    if (!session) return res.json({ user: null });

    const user = await UserModel.findById(session.userId);
    if (!user) return res.json({ user: null });

    sessionManager.refreshSession(session, req, res);
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  sessionManager.destroySession(req, res);
  res.json({ success: true });
});

/**
 * POST /api/auth/upgrade-guest
 * Lets a guest user "claim" their account by adding an email/password,
 * without losing their saved check-ins (same user id throughout).
 */
router.post('/upgrade-guest', requireAuth, async (req, res, next) => {
  try {
    if (!req.user.isGuest) {
      return res.status(400).json({ error: 'This account is not a guest account.' });
    }

    const { email, password, displayName } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (await UserModel.emailExists(email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const passwordHash = await bcrypt.hash(password, 10);
    const { User } = await import('../models/User.js');

    let user;
    try {
      user = await User.findByIdAndUpdate(
        req.user.id,
        {
          email: email.toLowerCase().trim(),
          passwordHash,
          displayName: displayName?.trim() || req.user.displayName,
          isGuest: false,
          plan: 'free',
        },
        { new: true, runValidators: true }
      );
    } catch (err) {
      if (isDuplicateEmailError(err)) {
        return res.status(409).json({ error: 'An account with that email already exists.' });
      }
      throw err;
    }

    sessionManager.createSession(user, req, res);
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

export default router;

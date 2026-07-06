import { sessionManager } from '../sessionManager.js';

/**
 * Requires a valid auth cookie. Rejects with 401 if missing/invalid.
 */
export function requireAuth(req, res, next) {
  const session = sessionManager.getSession(req);

  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  sessionManager.refreshSession(session, res);
  req.user = session.user;
  next();
}

/**
 * Optional auth — never rejects, just attaches req.user if a valid
 * session exists. Not currently used by any route (every endpoint that
 * touches user data or the AI gateway requires auth), kept as a utility
 * for any future endpoint that should behave differently for signed-in
 * vs. anonymous users without blocking anonymous requests outright.
 */
export function optionalAuth(req, res, next) {
  const session = sessionManager.getSession(req);
  if (session) {
    sessionManager.refreshSession(session, res);
    req.user = session.user;
  }
  next();
}

// Back-compat named export (routes previously imported `authMiddleware`)
export const authMiddleware = requireAuth;

export default requireAuth;

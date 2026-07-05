import { signToken, verifyToken } from './utils/jwt.js';

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days, keep in sync with JWT_EXPIRES_IN

/**
 * Stateless, JWT-cookie-based session manager.
 * No session collection in Mongo — the signed cookie *is* the session, so
 * every request is a single DB-free verification (fast, and one less
 * collection to model/clean up).
 */
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    list[key] = decodeURIComponent(parts.join('='));
  });
  return list;
}

function isProdEnv() {
  return process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
}

/**
 * Cookie attributes differ by deployment shape:
 *  - Same-site local dev (localhost frontend + localhost backend): SameSite=Lax
 *    works fine and doesn't require HTTPS.
 *  - Cross-site production (e.g. Vercel frontend + Render backend, different
 *    registrable domains): browsers will silently DROP a SameSite=Lax cookie
 *    on programmatic fetch() calls — it's only sent on top-level navigations.
 *    This must be SameSite=None, which in turn requires Secure (HTTPS).
 * Getting this wrong doesn't error anywhere — it just makes every
 * authenticated request after login look like the user was logged out.
 */
function cookieString(value, maxAgeSec) {
  const prod = isProdEnv();
  const sameSite = prod ? 'None' : 'Lax';
  let str = `${AUTH_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAgeSec}`;
  if (prod) str += '; Secure';
  return str;
}

function clearCookieString() {
  const prod = isProdEnv();
  const sameSite = prod ? 'None' : 'Lax';
  let str = `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=${sameSite}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
  if (prod) str += '; Secure';
  return str;
}

export const sessionManager = {
  /**
   * Sign a JWT for this user and attach it as an httpOnly cookie.
   * @param {import('mongoose').Document} user - a Mongoose User document
   */
  createSession(user, res) {
    const token = signToken({
      sub: user._id.toString(),
      email: user.email || null,
      displayName: user.displayName,
      isGuest: user.isGuest,
      plan: user.plan,
    });
    res.setHeader('Set-Cookie', cookieString(token, COOKIE_MAX_AGE_SEC));
    return token;
  },

  /**
   * Verify the request's auth cookie and return a session-like object,
   * or null if missing/invalid/expired.
   */
  getSession(req) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[AUTH_COOKIE_NAME];
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    return {
      token,
      userId: payload.sub,
      issuedAt: payload.iat,
      user: {
        id: payload.sub,
        email: payload.email,
        displayName: payload.displayName,
        isGuest: payload.isGuest,
        plan: payload.plan,
      },
    };
  },

  /**
   * Re-issue the cookie with a fresh expiry to keep active users signed in.
   * Throttled to once per day (rather than every request) — re-signing a JWT
   * and writing a Set-Cookie header on literally every API call is wasted
   * work when the existing token is nowhere near expiry.
   */
  refreshSession(session, res) {
    if (!session) return;

    const ageSec = session.issuedAt ? Math.floor(Date.now() / 1000) - session.issuedAt : Infinity;
    if (ageSec < 60 * 60 * 24) return; // token is less than a day old, nothing to do

    const token = signToken({
      sub: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      isGuest: session.user.isGuest,
      plan: session.user.plan,
    });
    res.setHeader('Set-Cookie', cookieString(token, COOKIE_MAX_AGE_SEC));
  },

  /**
   * Clear the auth cookie. Stateless tokens can't be revoked server-side;
   * this is sufficient for the app's threat model (no sensitive financial data).
   */
  destroySession(req, res) {
    res.setHeader('Set-Cookie', clearCookieString());
  },
};

export default sessionManager;

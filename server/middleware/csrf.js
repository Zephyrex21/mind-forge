const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-requested-with';
const CSRF_HEADER_VALUE = 'mindforge';

/**
 * CSRF mitigation for a cookie-authenticated, cross-origin API.
 *
 * The threat this actually addresses: in production the auth cookie is
 * `SameSite=None` (see sessionManager.js) — required because the
 * frontend (Vercel) and backend (Railway) are on different domains, so
 * the cookie has to be sendable cross-site at all for normal app usage
 * to work. But `SameSite=None` also means a completely unrelated,
 * malicious website could embed a hidden auto-submitting HTML form
 * pointing at this API, and the victim's browser would attach their real
 * auth cookie to that request automatically — a classic CSRF attack.
 *
 * Why CORS alone doesn't prevent this: CORS only stops *JavaScript on
 * another origin from reading the response* — it does not stop the
 * browser from *sending* a simple cross-site request (e.g. a plain HTML
 * form POST) with cookies attached, and does not stop this server from
 * processing it. Endpoints that need no request body at all (e.g.
 * toggling a favorite, archiving a goal) are the clearest exposure, since
 * an attacker doesn't even need to guess a valid JSON payload.
 *
 * The fix: require a custom header on every state-changing request.
 * Custom headers always force a CORS preflight (`OPTIONS`) first,
 * regardless of method or content-type — and since this server's CORS
 * config only allows the one configured frontend origin, a preflight
 * from any other origin fails before the real request is ever sent. A
 * malicious page's plain form/fetch cannot add this header cross-site;
 * this app's own frontend can (see src/services/api.js), and does, on
 * every request.
 */
export function requireCsrfHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  if (req.headers[CSRF_HEADER] !== CSRF_HEADER_VALUE) {
    return res.status(403).json({ error: 'Missing or invalid CSRF protection header.' });
  }

  next();
}

export { CSRF_HEADER, CSRF_HEADER_VALUE };
export default requireCsrfHeader;

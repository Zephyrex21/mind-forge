/**
 * Base fetch wrapper. The backend uses an httpOnly JWT cookie for auth,
 * so every request needs `credentials: 'include'` — without it, cross-origin
 * requests (frontend on Vercel, backend on Railway) silently drop the cookie.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

// Generous enough to cover a cold-starting backend instance plus
// the backend's own model-fallback retry chain, but bounded — without this,
// a stuck request just hangs forever with the user staring at a spinner.
const REQUEST_TIMEOUT_MS = 45_000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error('This is taking longer than expected. Please try again in a moment.');
      timeoutError.status = 408;
      throw timeoutError;
    }
    const networkError = new Error('Cannot reach the server. Check your connection and try again.');
    networkError.status = 0;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;

    // The client's local "logged in" state can go stale — e.g. the cookie
    // gets cleared, or (rarely) the token actually expires mid-session.
    // Without this, the user just sees a generic auth-error toast and is
    // stuck clicking a button that will keep failing the same way.
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('mindforge:unauthorized'));
    }

    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;

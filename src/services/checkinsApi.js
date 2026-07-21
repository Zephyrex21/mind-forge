import { api } from './api';

/**
 * Check-ins API — matches server/routes/checkins.js.
 * Replaces the old projects.js / authApi project methods.
 */
export const checkinsApi = {
  // Cursor-paginated, full-fidelity check-ins (title, reflection text,
  // everything) — for the "My Check-ins" browsing/search/export page.
  // Returns { items, nextCursor }. Omit `cursor` for the first page;
  // pass the previous page's `nextCursor` to get the next one.
  list: ({ limit, cursor } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (cursor) params.set('cursor', cursor);
    const qs = params.toString();
    return api.get(`/api/checkins${qs ? `?${qs}` : ''}`);
  },
  // The user's *entire* history, but only the lightweight fields needed
  // for dashboard/insights aggregation — see the server route's comment
  // for why this isn't paginated the same way the full list is.
  analytics: () => api.get('/api/checkins/analytics'),
  get: (id) => api.get(`/api/checkins/${id}`),
  // tzOffset (Date.getTimezoneOffset()) lets the server bucket the streak
  // by the user's local calendar day rather than the server's (UTC on
  // most hosts) — without it, a late-evening check-in can appear to break
  // an otherwise-unbroken streak.
  stats: () => api.get(`/api/checkins/stats?tzOffset=${new Date().getTimezoneOffset()}`),
  create: (data) => api.post('/api/checkins', data),
  update: (id, data) => api.put(`/api/checkins/${id}`, data),
  toggleFavorite: (id) => api.post(`/api/checkins/${id}/favorite`),
  remove: (id) => api.delete(`/api/checkins/${id}`),
};

export const usageApi = {
  get: () => api.get(`/api/user/usage?tzOffset=${new Date().getTimezoneOffset()}`),
};

/**
 * Wellness reflection generation — matches server/routes/generate.js.
 * Returns { markdown, usage, cached, safetyFlagged, crisisResources? }.
 * Pass { forceRefresh: true } on explicit regenerate clicks so the server
 * skips its cache and always makes a fresh Gemini call.
 */
export const generateApi = {
  generateReflection: (checkin, options = {}) =>
    api.post('/api/generate', { ...checkin, forceRefresh: !!options.forceRefresh }),
};

export default checkinsApi;

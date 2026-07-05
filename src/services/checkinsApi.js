import { api } from './api';

/**
 * Check-ins API — matches server/routes/checkins.js.
 * Replaces the old projects.js / authApi project methods.
 */
export const checkinsApi = {
  list: () => api.get('/api/checkins'),
  get: (id) => api.get(`/api/checkins/${id}`),
  stats: () => api.get('/api/checkins/stats'),
  create: (data) => api.post('/api/checkins', data),
  update: (id, data) => api.put(`/api/checkins/${id}`, data),
  toggleFavorite: (id) => api.post(`/api/checkins/${id}/favorite`),
  remove: (id) => api.delete(`/api/checkins/${id}`),
};

export const usageApi = {
  get: () => api.get('/api/user/usage'),
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

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
 */
export const generateApi = {
  generateReflection: (checkin) => api.post('/api/generate', checkin),
};

export default checkinsApi;

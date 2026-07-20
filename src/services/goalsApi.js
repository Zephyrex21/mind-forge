import { api } from './api';

/**
 * Goals (habit tracker) API — matches server/routes/goals.js.
 */
export const goalsApi = {
  list: () => api.get('/api/goals'),
  create: (title) => api.post('/api/goals', { title }),
  rename: (id, title) => api.put(`/api/goals/${id}`, { title }),
  archive: (id) => api.post(`/api/goals/${id}/archive`),
  remove: (id) => api.delete(`/api/goals/${id}`),
  // dateKey should be a local 'YYYY-MM-DD' string — see toLocalDateKey in
  // utils/goalStreak.js for why this must be the browser's local date,
  // not `new Date().toISOString()` (which is UTC).
  toggle: (id, dateKey) => api.post(`/api/goals/${id}/toggle`, { date: dateKey }),
};

export default goalsApi;

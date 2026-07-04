import { api } from './api';

/**
 * Auth API — matches server/routes/auth.js (email/password + guest, JWT cookie).
 */
export const authApi = {
  me: () => api.get('/api/auth/me'),
  register: (email, password, displayName) => api.post('/api/auth/register', { email, password, displayName }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  continueAsGuest: () => api.post('/api/auth/guest'),
  logout: () => api.post('/api/auth/logout'),
  upgradeGuest: (email, password, displayName) => api.post('/api/auth/upgrade-guest', { email, password, displayName }),
};

export default authApi;

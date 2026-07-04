/**
 * Cache manager for conversational builder sessions.
 * Implements sessionStorage logic for auto-saving, restoring, and clearing session states.
 */

const SESSION_PREFIX = 'readme_forge_chat_';

export const conversationCache = {
  /**
   * Save conversational progress data to sessionStorage
   * @param {string} type - 'profile' or 'project'
   * @param {Object} data - session data (history, answers, progress state)
   */
  saveSession: (type, data) => {
    try {
      const key = `${SESSION_PREFIX}${type}`;
      window.sessionStorage.setItem(key, JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.error('Failed to save session to cache:', e);
    }
  },

  /**
   * Retrieve conversational progress data from sessionStorage
   * @param {string} type - 'profile' or 'project'
   * @returns {Object|null} Cached session data or null
   */
  loadSession: (type) => {
    try {
      const key = `${SESSION_PREFIX}${type}`;
      const dataStr = window.sessionStorage.getItem(key);
      if (!dataStr) return null;
      return JSON.parse(dataStr);
    } catch (e) {
      console.error('Failed to load session from cache:', e);
      return null;
    }
  },

  /**
   * Check if a valid session cache exists for this builder type
   * @param {string} type - 'profile' or 'project'
   * @returns {boolean}
   */
  hasSession: (type) => {
    try {
      const key = `${SESSION_PREFIX}${type}`;
      return window.sessionStorage.getItem(key) !== null;
    } catch (_) {
      return false;
    }
  },

  /**
   * Clear cache for a specific builder type
   * @param {string} type - 'profile' or 'project'
   */
  clearSession: (type) => {
    try {
      const key = `${SESSION_PREFIX}${type}`;
      window.sessionStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear session from cache:', e);
    }
  }
};

export default conversationCache;

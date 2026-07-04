/**
 * Request deduplication queue.
 * Prevents the same user from running multiple simultaneous generations.
 */

const activeGenerations = new Map(); // clientId -> { startedAt }
const MAX_QUEUE_SIZE = 100;

/**
 * Get a client identifier from the request.
 * Uses authenticated user ID if available, otherwise falls back to IP.
 */
export function getClientId(req) {
  return req.user?.id || req.ip || 'anonymous';
}

/**
 * Check if a generation is already in progress for this client.
 * @param {string} clientId
 * @returns {boolean}
 */
export function isGenerating(clientId) {
  return activeGenerations.has(clientId);
}

/**
 * Mark a generation as started for this client.
 * @param {string} clientId
 * @returns {boolean} false if already generating or queue full
 */
export function acquireSlot(clientId) {
  if (activeGenerations.has(clientId)) {
    return false;
  }

  if (activeGenerations.size >= MAX_QUEUE_SIZE) {
    // Clean up stale entries (older than 2 minutes — safety net)
    const now = Date.now();
    for (const [id, entry] of activeGenerations) {
      if (now - entry.startedAt > 120_000) {
        activeGenerations.delete(id);
      }
    }

    if (activeGenerations.size >= MAX_QUEUE_SIZE) {
      return false;
    }
  }

  activeGenerations.set(clientId, { startedAt: Date.now() });
  return true;
}

/**
 * Mark a generation as complete for this client.
 * @param {string} clientId
 */
export function releaseSlot(clientId) {
  activeGenerations.delete(clientId);
}

/**
 * Get queue statistics.
 */
export function getQueueStats() {
  return {
    activeCount: activeGenerations.size,
    maxSize: MAX_QUEUE_SIZE,
  };
}

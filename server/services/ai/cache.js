/**
 * Server-side in-memory response cache with SHA-256 hashing.
 * Designed for Redis swap later — same interface.
 */

import { createHash } from 'crypto';

const cache = new Map();
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

let hits = 0;
let misses = 0;

/**
 * Generate a SHA-256 hash key from form data and selected sections.
 * @param {object} formData - The user's form data
 * @param {string[]} selectedSections - Ordered list of section keys
 * @returns {string} Hex hash
 */
export function hashKey(formData, selectedSections) {
  const payload = JSON.stringify({ formData: stripEmpty(formData), selectedSections });
  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Get a cached response by hash.
 * @param {string} hash
 * @returns {string|null} Cached markdown or null
 */
export function getCached(hash) {
  const entry = cache.get(hash);

  if (!entry) {
    misses++;
    return null;
  }

  // Check TTL
  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    cache.delete(hash);
    misses++;
    return null;
  }

  hits++;
  return entry.markdown;
}

/**
 * Store a response in the cache.
 * @param {string} hash
 * @param {string} markdown
 */
export function setCache(hash, markdown) {
  // Evict oldest entries if cache gets too large (max 500 entries)
  if (cache.size >= 500) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  cache.set(hash, {
    markdown,
    timestamp: Date.now(),
  });
}

/**
 * Get cache statistics for monitoring.
 */
export function getCacheStats() {
  const total = hits + misses;
  return {
    size: cache.size,
    hits,
    misses,
    hitRate: total > 0 ? ((hits / total) * 100).toFixed(1) + '%' : '0%',
  };
}

/**
 * Clear the entire cache.
 */
export function clearCache() {
  cache.clear();
  hits = 0;
  misses = 0;
}

/**
 * Strip empty/default values from form data to normalize cache keys.
 * Two forms with the same meaningful content should produce the same hash.
 */
function stripEmpty(obj) {
  if (Array.isArray(obj)) {
    const filtered = obj.map(stripEmpty).filter(v => v !== undefined);
    return filtered.length > 0 ? filtered : undefined;
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleaned = stripEmpty(value);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  // Primitives: skip empty strings, false, 0, null, undefined
  if (obj === '' || obj === null || obj === undefined || obj === false) {
    return undefined;
  }
  return obj;
}

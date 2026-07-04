import crypto from 'crypto';

/**
 * Utility functions for generating deterministic hash signatures.
 */

/**
 * Generates a SHA-256 hash from a string or object payload
 * 
 * @param {string|object} data - Data to hash
 * @returns {string} Hexadecimal SHA-256 hash signature
 */
export function generateSha256(data) {
  const hash = crypto.createHash('sha256');
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return hash.update(payload).digest('hex');
}

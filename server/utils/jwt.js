import jwt from 'jsonwebtoken';

/**
 * Thin wrapper around jsonwebtoken so the rest of the app never touches
 * process.env.JWT_SECRET directly.
 */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Add it to your .env file.');
  }
  return secret;
}

export function signToken(payload, options = {}) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    ...options,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

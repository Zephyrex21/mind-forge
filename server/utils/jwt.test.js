import { describe, it, expect, beforeAll } from 'vitest';
import { signToken, verifyToken } from './jwt.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-vitest-only';
});

describe('signToken / verifyToken', () => {
  it('round-trips a payload correctly', () => {
    const token = signToken({ sub: 'user123', plan: 'free' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('user123');
    expect(payload.plan).toBe('free');
  });

  it('includes standard JWT claims (iat, exp)', () => {
    const token = signToken({ sub: 'user123' });
    const payload = verifyToken(token);
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('rejects a garbage token instead of throwing', () => {
    expect(verifyToken('not-a-real-token')).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const token = signToken({ sub: 'user123' });
    // Tamper with the signature
    const tampered = token.slice(0, -5) + 'AAAAA';
    expect(verifyToken(tampered)).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(verifyToken('')).toBeNull();
  });

  it('defaults to a 7-day expiry when JWT_EXPIRES_IN is not set', () => {
    delete process.env.JWT_EXPIRES_IN;
    const token = signToken({ sub: 'user123' });
    const payload = verifyToken(token);
    const diffDays = (payload.exp - payload.iat) / (60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });
});

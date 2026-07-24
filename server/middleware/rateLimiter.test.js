import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signToken } from '../utils/jwt.js';

/**
 * Verifies the global rate limiter actually enforces its configured
 * threshold — not just that it's wired up, but that request N+1 past the
 * limit really gets a 429. Every other integration test runs with
 * NODE_ENV=test specifically to bypass this limiter (see app.js), so this
 * is the one place it's deliberately left active to test it directly.
 */
vi.mock('../models/Goal.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    GoalModel: {
      async getUserGoals() {
        return [];
      },
    },
  };
});

function cookieFor(userId) {
  const token = signToken({ sub: userId, email: `${userId}@example.com`, displayName: 'Test', isGuest: false, plan: 'free' });
  return `auth_token=${token}`;
}

describe('global rate limiter (enforcement, not just configuration)', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let app;

  beforeAll(() => {
    // Deliberately NOT 'test' — that's what makes app.js's limiter skip
    // apply, and this test exists specifically to check what happens when
    // it doesn't.
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'rate-limit-test-secret';
    app = createApp();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('allows requests under the limit and rejects the request past it with 429', async () => {
    const cookie = cookieFor('rate-limit-test-user');
    const LIMIT = 100; // must match the `max` configured in app.js

    const results = [];
    for (let i = 0; i < LIMIT + 5; i += 1) {
      // Sequential on purpose — express-rate-limit's store isn't
      // guaranteed atomic under true concurrency, so firing these one at
      // a time is what makes "request 101 gets rejected" a reliable,
      // non-flaky assertion rather than a race.
      const res = await request(app).get('/api/goals').set('Cookie', cookie);
      results.push(res.status);
    }

    const successCount = results.filter((s) => s === 200).length;
    const limitedCount = results.filter((s) => s === 429).length;

    expect(successCount).toBe(LIMIT);
    expect(limitedCount).toBe(5);
    // The 429s should be exactly the last 5 responses, not scattered —
    // confirms it's a hard cutoff, not something flaky/probabilistic.
    expect(results.slice(0, LIMIT).every((s) => s === 200)).toBe(true);
    expect(results.slice(LIMIT).every((s) => s === 429)).toBe(true);
  }, 20000);

  it('returns a clear error message on the 429 response', async () => {
    // This app instance already has its window's requests exhausted from
    // the previous test (same IP, same rate-limit store) — one more
    // request should immediately 429.
    const cookie = cookieFor('rate-limit-test-user-2');
    const res = await request(app).get('/api/goals').set('Cookie', cookie);
    expect(res.status).toBe(429);
    expect(res.body.error).toBeTruthy();
  });
});

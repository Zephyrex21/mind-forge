import { describe, it, expect, beforeAll, vi } from 'vitest';
import autocannon from 'autocannon';
import { createApp } from '../app.js';
import { signToken } from '../utils/jwt.js';

/**
 * Measured load test — not "should be fine," actual req/sec and latency
 * numbers from actually running traffic against the app.
 *
 * Deliberately NOT part of `npm test` / CI: load tests are noisy on
 * shared CI runners (results vary with whatever else is running on the
 * same box) and slow down every single push. Run manually via
 * `npm run loadtest` when investigating performance, or after a change
 * that might affect it.
 *
 * Scope, stated plainly: this measures the Express/middleware/route
 * layer with the Mongoose model layer swapped for an in-memory fake
 * (same approach as the integration tests) — real MongoDB round-trip
 * latency is NOT part of these numbers. That's a genuine, deliberate
 * limitation: there's no live MongoDB reachable from this environment.
 * What this DOES tell you: how much overhead the app's own code (auth
 * verification, rate limiting, logging, validation) adds on top of
 * whatever the database contributes — which is the part actually in this
 * codebase's control.
 *
 * The global rate limiter is intentionally bypassed here (NODE_ENV=test)
 * — it's a deliberate abuse-prevention ceiling, not a performance ceiling,
 * so measuring "how many requests/sec can we sustain against the limiter"
 * would just measure the limiter's configured number back, not the app's
 * real capacity. See rateLimiter.perf.js for a check that the limiter
 * itself actually enforces its configured threshold.
 */
vi.mock('../models/Checkin.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    CheckinModel: {
      async getUserCheckins() {
        return { items: [], nextCursor: null };
      },
      async getAllForAnalytics() {
        return [];
      },
      async getStats() {
        return { totalCheckins: 0, currentStreak: 0, trend: [] };
      },
    },
  };
});

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
  const token = signToken({ sub: userId, email: `${userId}@example.com`, displayName: 'Load Test', isGuest: false, plan: 'free' });
  return `auth_token=${token}`;
}

function runLoadTest(opts) {
  return new Promise((resolve, reject) => {
    autocannon(opts, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

function summarize(name, result) {
  console.log(`\n--- ${name} ---`);
  console.log(`  requests/sec (avg): ${result.requests.average}`);
  console.log(`  latency p50/p99 (ms): ${result.latency.p50} / ${result.latency.p99}`);
  console.log(`  2xx: ${result['2xx']}  4xx: ${result.non2xx - (result.errors || 0)}  errors: ${result.errors}`);
}

describe('load test (manual — not part of CI)', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // bypasses rate limiting — see file header
    process.env.JWT_SECRET = 'load-test-secret';
    const app = createApp();
    server = app.listen(0);
    const { port } = server.address();
    baseUrl = `http://localhost:${port}`;

    return () => server.close();
  });

  it(
    'GET /api/health (no auth, no DB) — baseline for pure Express+middleware overhead',
    async () => {
      const result = await runLoadTest({ url: `${baseUrl}/api/health`, connections: 20, duration: 5 });
      summarize('GET /api/health', result);

      expect(result.errors).toBe(0);
      expect(result.non2xx).toBe(0);
      // A generous, non-flaky floor — this isn't asserting a specific
      // performance target, just catching a catastrophic regression
      // (e.g. an accidental blocking call added to a hot path).
      expect(result.requests.average).toBeGreaterThan(50);
    },
    15000
  );

  it(
    'GET /api/checkins (authenticated, mocked DB) — realistic authenticated read path',
    async () => {
      const cookie = cookieFor('loadtest-user-1');
      const result = await runLoadTest({
        url: `${baseUrl}/api/checkins`,
        connections: 20,
        duration: 5,
        headers: { cookie },
      });
      summarize('GET /api/checkins', result);

      expect(result.errors).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.average).toBeGreaterThan(50);
    },
    15000
  );

  it(
    'GET /api/checkins/analytics (authenticated, mocked DB)',
    async () => {
      const cookie = cookieFor('loadtest-user-2');
      const result = await runLoadTest({
        url: `${baseUrl}/api/checkins/analytics`,
        connections: 20,
        duration: 5,
        headers: { cookie },
      });
      summarize('GET /api/checkins/analytics', result);

      expect(result.errors).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.average).toBeGreaterThan(50);
    },
    15000
  );
});

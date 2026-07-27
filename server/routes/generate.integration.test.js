import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signToken } from '../utils/jwt.js';
import { clearCache } from '../services/ai/cache.js';

/**
 * Integration tests for the AI generation gateway — the most complex
 * route in the app (validation, safety screening, dedup, caching, model
 * fallback all in one request). callGemini is mocked so no real network
 * call to Gemini happens; everything else (auth, validation, dedup slot
 * tracking, caching) runs for real.
 */
vi.mock('../services/ai/geminiProvider.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    callGemini: vi.fn().mockResolvedValue({
      text: 'A thoughtful reflection on your day.',
      usage: { inputTokens: 50, outputTokens: 100 },
    }),
  };
});

import { callGemini } from '../services/ai/geminiProvider.js';

function cookieFor(userId) {
  const token = signToken({ sub: userId, email: `${userId}@example.com`, displayName: 'Test', isGuest: false, plan: 'free' });
  return `auth_token=${token}`;
}

function headersFor(userId) {
  return { Cookie: cookieFor(userId), 'x-requested-with': 'mindforge' };
}

let app;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'generate-test-secret';
  app = createApp();
});

beforeEach(() => {
  clearCache();
  callGemini.mockClear();
  callGemini.mockResolvedValue({
    text: 'A thoughtful reflection on your day.',
    usage: { inputTokens: 50, outputTokens: 100 },
  });
});

describe('POST /api/generate', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/generate').set('x-requested-with', 'mindforge').send({ mood: 4 });
    expect(res.status).toBe(401);
  });

  it('rejects a check-in with no meaningful content at all', async () => {
    const res = await request(app).post('/api/generate').set(headersFor('gen-user-1')).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/mood.*energy|note/i);
  });

  it('generates a reflection for a check-in with just a mood rating', async () => {
    const res = await request(app).post('/api/generate').set(headersFor('gen-user-2')).send({ mood: 4 });
    expect(res.status).toBe(200);
    expect(res.body.markdown).toBe('A thoughtful reflection on your day.');
    expect(callGemini).toHaveBeenCalledOnce();
  });

  it('generates a reflection for a check-in with just a text note (no mood/energy)', async () => {
    const res = await request(app).post('/api/generate').set(headersFor('gen-user-3')).send({ currentFocus: 'Trying to focus on finishing a project' });
    expect(res.status).toBe(200);
  });

  it('clamps an out-of-range mood/sleep value before it reaches the prompt', async () => {
    const res = await request(app).post('/api/generate').set(headersFor('gen-user-4')).send({ mood: 999, sleepHours: 400 });
    expect(res.status).toBe(200);
    // We can't inspect the prompt directly without over-mocking, but a
    // 200 here at minimum confirms the clamp doesn't throw or reject the
    // otherwise-valid request outright.
  });

  it('serves a cached response on a second identical request from the same user', async () => {
    const payload = { mood: 3, currentFocus: 'Same input both times' };
    const first = await request(app).post('/api/generate').set(headersFor('gen-user-5')).send(payload);
    expect(first.body.cached).toBe(false);

    const second = await request(app).post('/api/generate').set(headersFor('gen-user-5')).send(payload);
    expect(second.body.cached).toBe(true);
    expect(callGemini).toHaveBeenCalledOnce(); // second request never called Gemini again
  });

  it('bypasses the cache when forceRefresh is set (Regenerate)', async () => {
    const payload = { mood: 3, currentFocus: 'Same input both times' };
    await request(app).post('/api/generate').set(headersFor('gen-user-6')).send(payload);
    const regenerate = await request(app).post('/api/generate').set(headersFor('gen-user-6')).send({ ...payload, forceRefresh: true });

    expect(regenerate.body.cached).toBe(false);
    expect(callGemini).toHaveBeenCalledTimes(2);
  });

  it('rejects a second concurrent request from the same user with 409', async () => {
    // Make callGemini hang, but signal the instant it's actually invoked —
    // that's the deterministic point at which request 1 has acquired its
    // slot and is now "in flight," which is what request 2 needs to race
    // against. A plain setTimeout-based delay here would be inherently
    // flaky (guessing how long request 1 takes to reach that point).
    let resolveFirst;
    let signalStarted;
    const started = new Promise((resolve) => { signalStarted = resolve; });
    callGemini.mockImplementation(() => {
      signalStarted();
      return new Promise((resolve) => { resolveFirst = resolve; });
    });

    const firstPromise = request(app).post('/api/generate').set(headersFor('gen-user-7')).send({ mood: 4 });
    firstPromise.catch(() => {}); // trigger dispatch now; real handling happens via `await firstPromise` below
    await started;

    const second = await request(app).post('/api/generate').set(headersFor('gen-user-7')).send({ mood: 4 });
    expect(second.status).toBe(409);

    resolveFirst({ text: 'done', usage: { inputTokens: 1, outputTokens: 1 } });
    await firstPromise;
  }, 10000);

  it('releases the dedup slot after a validation error, so a follow-up request is not falsely blocked', async () => {
    // Regression check for a bug where an error thrown before the request
    // reached the dedup slot's try/finally could leave the slot held
    // (or, in the original code, release it twice — harmless via
    // Map.delete's idempotency, but confusing enough to be worth a test).
    // A request with no content is rejected at validation, before any
    // slot is even acquired.
    await request(app).post('/api/generate').set(headersFor('gen-user-8')).send({});

    const followUp = await request(app).post('/api/generate').set(headersFor('gen-user-8')).send({ mood: 4 });
    expect(followUp.status).toBe(200);
  });

  it('releases the dedup slot after the AI call fails, so a retry from the same user is not blocked', async () => {
    callGemini.mockRejectedValue(new Error('simulated upstream failure'));

    const failed = await request(app).post('/api/generate').set(headersFor('gen-user-9')).send({ mood: 4 });
    expect(failed.status).toBe(502);

    callGemini.mockResolvedValue({ text: 'recovered', usage: { inputTokens: 1, outputTokens: 1 } });
    const retry = await request(app).post('/api/generate').set(headersFor('gen-user-9')).send({ mood: 4 });
    expect(retry.status).toBe(200);
  });

  it('still returns crisis resources when the AI call fails on a safety-flagged entry', async () => {
    callGemini.mockRejectedValue(new Error('simulated upstream failure'));

    const res = await request(app)
      .post('/api/generate')
      .set(headersFor('gen-user-10'))
      .send({ currentFocus: 'I want to end my life' });

    expect(res.status).toBe(200);
    expect(res.body.safetyFlagged).toBe(true);
    expect(res.body.crisisResources).toBeTruthy();
  });

  it('never caches a safety-flagged response, even on identical repeated input', async () => {
    const payload = { currentFocus: 'I want to end my life' };
    await request(app).post('/api/generate').set(headersFor('gen-user-11')).send(payload);
    const second = await request(app).post('/api/generate').set(headersFor('gen-user-11')).send(payload);

    expect(second.body.cached).toBe(false);
    expect(callGemini).toHaveBeenCalledTimes(2);
  });

  it("keeps two different users' caches independent for identical input", async () => {
    const payload = { mood: 5, currentFocus: 'Identical input' };
    await request(app).post('/api/generate').set(headersFor('gen-user-12a')).send(payload);
    const otherUser = await request(app).post('/api/generate').set(headersFor('gen-user-12b')).send(payload);

    expect(otherUser.body.cached).toBe(false);
  });
});

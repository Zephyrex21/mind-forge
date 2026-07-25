import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signToken } from '../utils/jwt.js';

/**
 * Integration tests: exercise the real Express app (real middleware, real
 * auth verification, real route validation, real error handling) via
 * supertest with an in-memory fake standing in for the Goal model at the
 * persistence boundary. This deliberately does NOT spin up a real MongoDB
 * (no `mongodb-memory-server` — that needs to download a real mongod
 * binary, which isn't available in every CI/sandboxed environment) — so
 * it proves the HTTP/auth/validation layer is wired correctly, not that
 * Mongoose itself behaves correctly (that's Goal.test.js's job, against
 * the real schema/statics).
 */
vi.mock('../models/Goal.js', async (importOriginal) => {
  const actual = await importOriginal();
  let goals = [];
  let nextId = 1;

  return {
    ...actual,
    GoalModel: {
      async getUserGoals(userId) {
        return goals.filter((g) => g.userId === userId && g.active);
      },
      async countActiveGoals(userId) {
        return goals.filter((g) => g.userId === userId && g.active).length;
      },
      async createGoal(userId, title) {
        const goal = { _id: String(nextId++), userId, title, active: true, completions: [] };
        goals.push(goal);
        return goal;
      },
      async renameGoal(id, userId, title) {
        const goal = goals.find((g) => g._id === id && g.userId === userId);
        if (!goal) return null;
        goal.title = title;
        return goal;
      },
      async archiveGoal(id, userId) {
        const goal = goals.find((g) => g._id === id && g.userId === userId);
        if (!goal) return null;
        goal.active = false;
        return goal;
      },
      async deleteGoal(id, userId) {
        const idx = goals.findIndex((g) => g._id === id && g.userId === userId);
        if (idx === -1) return null;
        return goals.splice(idx, 1)[0];
      },
      async toggleCompletion(id, userId, dateKey) {
        const goal = goals.find((g) => g._id === id && g.userId === userId);
        if (!goal) return null;
        const i = goal.completions.indexOf(dateKey);
        if (i === -1) goal.completions.push(dateKey);
        else goal.completions.splice(i, 1);
        return goal;
      },
      __reset() {
        goals = [];
        nextId = 1;
      },
    },
  };
});

import { GoalModel } from '../models/Goal.js';

const USER_A = 'user-a-000000000000000000000001';
const USER_B = 'user-b-000000000000000000000002';

function cookieFor(userId) {
  const token = signToken({ sub: userId, email: `${userId}@example.com`, displayName: 'Test User', isGuest: false, plan: 'free' });
  return `auth_token=${token}`;
}

let app;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-for-vitest-only';
  app = createApp();
});

beforeEach(() => {
  GoalModel.__reset();
});

describe('GET /api/goals', () => {
  it('rejects a request with no auth cookie', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(401);
  });

  it('rejects a request with a garbage auth cookie', async () => {
    const res = await request(app).get('/api/goals').set('Cookie', 'auth_token=not-a-real-token').set('x-requested-with', 'mindforge');
    expect(res.status).toBe(401);
  });

  it('returns an empty list for a new user', async () => {
    const res = await request(app).get('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/goals', () => {
  it('creates a goal and returns it', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge')
      .send({ title: 'Meditate 10 minutes' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Meditate 10 minutes');
    expect(res.body.completions).toEqual([]);
  });

  it('rejects an empty title', async () => {
    const res = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('rejects a missing title field entirely', async () => {
    const res = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({});
    expect(res.status).toBe(400);
  });

  it('rejects creating an active 13th goal (over the 12-goal limit)', async () => {
    const agent = request(app);
    for (let i = 0; i < 12; i += 1) {
      const res = await agent.post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: `Goal ${i}` });
      expect(res.status).toBe(201);
    }
    const overLimit = await agent.post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'One too many' });
    expect(overLimit.status).toBe(400);
    expect(overLimit.body.error).toMatch(/12/);
  });

  it('keeps two different users\' goal counts independent', async () => {
    await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'A goal' });
    const res = await request(app).get('/api/goals').set('Cookie', cookieFor(USER_B)).set('x-requested-with', 'mindforge');
    expect(res.body).toEqual([]);
  });
});

describe('PUT /api/goals/:id', () => {
  it('renames a goal the user owns', async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Old name' });
    const res = await request(app)
      .put(`/api/goals/${created.body._id}`)
      .set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge')
      .send({ title: 'New name' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New name');
  });

  it("returns 404 when trying to rename another user's goal", async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Mine' });
    const res = await request(app)
      .put(`/api/goals/${created.body._id}`)
      .set('Cookie', cookieFor(USER_B)).set('x-requested-with', 'mindforge')
      .send({ title: 'Hijacked' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/goals/:id/toggle', () => {
  it('marks a day complete, then un-marks it on a second toggle', async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Drink water' });
    const id = created.body._id;

    const first = await request(app).post(`/api/goals/${id}/toggle`).set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ date: '2026-07-20' });
    expect(first.status).toBe(200);
    expect(first.body.completions).toContain('2026-07-20');

    const second = await request(app).post(`/api/goals/${id}/toggle`).set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ date: '2026-07-20' });
    expect(second.status).toBe(200);
    expect(second.body.completions).not.toContain('2026-07-20');
  });

  it('rejects a malformed date', async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Drink water' });
    const res = await request(app)
      .post(`/api/goals/${created.body._id}/toggle`)
      .set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge')
      .send({ date: 'not-a-date' });

    expect(res.status).toBe(400);
  });

  it("returns 404 when toggling another user's goal", async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Mine' });
    const res = await request(app)
      .post(`/api/goals/${created.body._id}/toggle`)
      .set('Cookie', cookieFor(USER_B)).set('x-requested-with', 'mindforge')
      .send({ date: '2026-07-20' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/goals/:id/archive', () => {
  it('archives a goal so it no longer appears in the list', async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Temporary' });
    await request(app).post(`/api/goals/${created.body._id}/archive`).set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge');

    const list = await request(app).get('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge');
    expect(list.body).toEqual([]);
  });
});

describe('DELETE /api/goals/:id', () => {
  it('permanently deletes a goal the user owns', async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Delete me' });
    const res = await request(app).delete(`/api/goals/${created.body._id}`).set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 deleting another user's goal", async () => {
    const created = await request(app).post('/api/goals').set('Cookie', cookieFor(USER_A)).set('x-requested-with', 'mindforge').send({ title: 'Mine' });
    const res = await request(app).delete(`/api/goals/${created.body._id}`).set('Cookie', cookieFor(USER_B)).set('x-requested-with', 'mindforge');
    expect(res.status).toBe(404);
  });
});

describe('CSRF protection (end-to-end, not just the middleware in isolation)', () => {
  it('blocks a mutating request that has a completely valid auth cookie but no CSRF header — simulating a real cross-site attack', async () => {
    // This is exactly what an attacker's hidden auto-submitting form on
    // an unrelated site would produce: the victim's real, valid auth
    // cookie attached automatically by the browser (SameSite=None in
    // production allows this), but no custom header, since a plain form
    // submission can't add one.
    const res = await request(app)
      .post('/api/goals')
      .set('Cookie', cookieFor(USER_A))
      .send({ title: 'Attacker-created goal' });

    expect(res.status).toBe(403);
  });

  it('allows the identical request through once the CSRF header is present', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Cookie', cookieFor(USER_A))
      .set('x-requested-with', 'mindforge')
      .send({ title: 'Legitimate goal' });

    expect(res.status).toBe(201);
  });

  it('does not require the CSRF header for read-only requests', async () => {
    const res = await request(app).get('/api/goals').set('Cookie', cookieFor(USER_A));
    expect(res.status).toBe(200);
  });
});

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { signToken } from '../utils/jwt.js';

/**
 * Integration tests for the check-ins CRUD routes — same approach as
 * goals.integration.test.js: real Express app, real auth, in-memory fake
 * standing in for the Checkin model at the persistence boundary.
 */
vi.mock('../models/Checkin.js', async (importOriginal) => {
  const actual = await importOriginal();
  let checkins = [];
  let nextId = 1;

  return {
    ...actual,
    CheckinModel: {
      async getUserCheckins(userId, { limit = 30, cursor } = {}) {
        const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
        let mine = checkins.filter((c) => c.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (cursor) {
          const cursorDate = new Date(cursor);
          mine = mine.filter((c) => new Date(c.createdAt) < cursorDate);
        }
        const hasMore = mine.length > safeLimit;
        const items = hasMore ? mine.slice(0, safeLimit) : mine;
        const nextCursor = hasMore ? items[items.length - 1].createdAt : null;
        return { items, nextCursor };
      },
      async getAllForAnalytics(userId) {
        return checkins
          .filter((c) => c.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(({ mood, energy, sleepHours, copingTools, createdAt, isFavorite, _id }) => ({ mood, energy, sleepHours, copingTools, createdAt, isFavorite, _id }));
      },
      async getCheckinById(id, userId) {
        return checkins.find((c) => c._id === id && c.userId === userId) || null;
      },
      async createCheckin(userId, data) {
        const checkin = { _id: String(nextId++), userId, isFavorite: false, createdAt: new Date().toISOString(), ...data };
        checkins.push(checkin);
        return checkin;
      },
      async updateCheckin(id, userId, data) {
        const checkin = checkins.find((c) => c._id === id && c.userId === userId);
        if (!checkin) return null;
        Object.assign(checkin, data);
        return checkin;
      },
      async toggleFavorite(id, userId) {
        const checkin = checkins.find((c) => c._id === id && c.userId === userId);
        if (!checkin) return null;
        checkin.isFavorite = !checkin.isFavorite;
        return checkin;
      },
      async deleteCheckin(id, userId) {
        const idx = checkins.findIndex((c) => c._id === id && c.userId === userId);
        if (idx === -1) return null;
        return checkins.splice(idx, 1)[0];
      },
      async getStats(userId, tzOffsetMinutes) {
        const own = checkins.filter((c) => c.userId === userId);
        return {
          totalCheckins: own.length,
          currentStreak: 0,
          trend: [],
          tzOffsetMinutes,
        };
      },
      __reset() {
        checkins = [];
        nextId = 1;
      },
    },
  };
});

import { CheckinModel } from '../models/Checkin.js';

const USER_A = 'user-a-checkins';
const USER_B = 'user-b-checkins';

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
  CheckinModel.__reset();
});

describe('GET /api/checkins', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/checkins');
    expect(res.status).toBe(401);
  });

  it('returns an empty items array and no cursor for a new user', async () => {
    const res = await request(app).get('/api/checkins').set('Cookie', cookieFor(USER_A));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [], nextCursor: null });
  });

  it('never returns another user\'s check-ins', async () => {
    await request(app).post('/api/checkins').set('Cookie', cookieFor(USER_A)).send({ mood: 4 });
    const res = await request(app).get('/api/checkins').set('Cookie', cookieFor(USER_B));
    expect(res.body.items).toEqual([]);
  });

  it('paginates with a cursor once there are more items than the page size', async () => {
    const cookie = cookieFor(USER_A);
    for (let i = 0; i < 5; i += 1) {
      // Sequential awaits give each check-in a genuinely later createdAt
      // timestamp, so page ordering (and the cursor) is deterministic.
      await request(app).post('/api/checkins').set('Cookie', cookie).send({ mood: i });
    }

    const firstPage = await request(app).get('/api/checkins?limit=2').set('Cookie', cookie);
    expect(firstPage.body.items).toHaveLength(2);
    expect(firstPage.body.nextCursor).not.toBeNull();

    const secondPage = await request(app)
      .get(`/api/checkins?limit=2&cursor=${encodeURIComponent(firstPage.body.nextCursor)}`)
      .set('Cookie', cookie);
    expect(secondPage.body.items).toHaveLength(2);

    // No overlap between pages.
    const firstIds = firstPage.body.items.map((c) => c._id);
    const secondIds = secondPage.body.items.map((c) => c._id);
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
  });

  it('reports nextCursor as null once the last page is reached', async () => {
    const cookie = cookieFor(USER_A);
    await request(app).post('/api/checkins').set('Cookie', cookie).send({ mood: 3 });
    const res = await request(app).get('/api/checkins?limit=100').set('Cookie', cookie);
    expect(res.body.nextCursor).toBeNull();
  });
});

describe('GET /api/checkins/analytics', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/checkins/analytics');
    expect(res.status).toBe(401);
  });

  it("returns the user's full history regardless of page size", async () => {
    const cookie = cookieFor(USER_A);
    for (let i = 0; i < 5; i += 1) {
      await request(app).post('/api/checkins').set('Cookie', cookie).send({ mood: i });
    }
    const res = await request(app).get('/api/checkins/analytics').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
  });

  it('never returns another user\'s check-ins', async () => {
    await request(app).post('/api/checkins').set('Cookie', cookieFor(USER_A)).send({ mood: 4 });
    const res = await request(app).get('/api/checkins/analytics').set('Cookie', cookieFor(USER_B));
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/checkins', () => {
  it('creates a check-in and coerces numeric fields', async () => {
    const res = await request(app)
      .post('/api/checkins')
      .set('Cookie', cookieFor(USER_A))
      .send({ mood: '4', energy: '3', sleepHours: '' });

    expect(res.status).toBe(201);
    expect(res.body.mood).toBe(4);
    expect(res.body.energy).toBe(3);
    expect(res.body.sleepHours).toBeUndefined();
  });

  it('never lets the client inject its own userId or _id into the saved record', async () => {
    const res = await request(app)
      .post('/api/checkins')
      .set('Cookie', cookieFor(USER_A))
      .send({ mood: 3, userId: 'someone-else', _id: 'forged-id' });

    expect(res.body.userId).toBe(USER_A);
    expect(res.body._id).not.toBe('forged-id');
  });
});

describe('GET /api/checkins/:id', () => {
  it('returns 404 for a check-in that does not exist', async () => {
    const res = await request(app).get('/api/checkins/does-not-exist').set('Cookie', cookieFor(USER_A));
    expect(res.status).toBe(404);
  });

  it("returns 404 for another user's check-in (not a 403 — doesn't confirm it exists)", async () => {
    const created = await request(app).post('/api/checkins').set('Cookie', cookieFor(USER_A)).send({ mood: 3 });
    const res = await request(app).get(`/api/checkins/${created.body._id}`).set('Cookie', cookieFor(USER_B));
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/checkins/:id', () => {
  it('updates a check-in the user owns', async () => {
    const created = await request(app).post('/api/checkins').set('Cookie', cookieFor(USER_A)).send({ mood: 2 });
    const res = await request(app)
      .put(`/api/checkins/${created.body._id}`)
      .set('Cookie', cookieFor(USER_A))
      .send({ mood: 5 });

    expect(res.status).toBe(200);
    expect(res.body.mood).toBe(5);
  });
});

describe('POST /api/checkins/:id/favorite', () => {
  it('toggles favorite status on and back off', async () => {
    const created = await request(app).post('/api/checkins').set('Cookie', cookieFor(USER_A)).send({ mood: 4 });
    const id = created.body._id;

    const first = await request(app).post(`/api/checkins/${id}/favorite`).set('Cookie', cookieFor(USER_A));
    expect(first.body.isFavorite).toBe(true);

    const second = await request(app).post(`/api/checkins/${id}/favorite`).set('Cookie', cookieFor(USER_A));
    expect(second.body.isFavorite).toBe(false);
  });
});

describe('DELETE /api/checkins/:id', () => {
  it('deletes a check-in, then 404s on a second delete', async () => {
    const created = await request(app).post('/api/checkins').set('Cookie', cookieFor(USER_A)).send({ mood: 4 });
    const id = created.body._id;

    const first = await request(app).delete(`/api/checkins/${id}`).set('Cookie', cookieFor(USER_A));
    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);

    const second = await request(app).delete(`/api/checkins/${id}`).set('Cookie', cookieFor(USER_A));
    expect(second.status).toBe(404);
  });
});

describe('GET /api/checkins/stats', () => {
  it('defaults tzOffset to 0 when missing or invalid', async () => {
    const res = await request(app).get('/api/checkins/stats').set('Cookie', cookieFor(USER_A));
    expect(res.status).toBe(200);
    expect(res.body.tzOffsetMinutes).toBe(0);
  });

  it('forwards a valid tzOffset query param through to the model', async () => {
    const res = await request(app).get('/api/checkins/stats?tzOffset=-330').set('Cookie', cookieFor(USER_A));
    expect(res.body.tzOffsetMinutes).toBe(-330);
  });
});

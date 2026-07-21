import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

/**
 * Integration tests for the auth flow — arguably the most security-critical
 * path in the app. Exercises the real Express app (real rate limiter
 * config, real cookie handling, real session verification) with an
 * in-memory fake standing in for the User model at the persistence
 * boundary. See goals.integration.test.js for why there's no real MongoDB
 * involved here.
 */
vi.mock('../models/User.js', async (importOriginal) => {
  const actual = await importOriginal();
  const bcrypt = (await import('bcryptjs')).default;

  let users = [];
  let nextId = 1;

  function toSafeJSON(u) {
    return {
      id: u._id,
      email: u.email || null,
      displayName: u.displayName,
      isGuest: u.isGuest,
      plan: u.plan,
      createdAt: u.createdAt,
    };
  }

  function attach(u) {
    return u ? { ...u, toSafeJSON: () => toSafeJSON(u) } : null;
  }

  const UserModel = {
    async findByEmail(email) {
      return attach(users.find((u) => u.email === email.toLowerCase().trim()));
    },
    async findById(id) {
      return attach(users.find((u) => u._id === id));
    },
    async emailExists(email) {
      return users.some((u) => u.email === email.toLowerCase().trim());
    },
    async createUser({ email, password, displayName }) {
      const passwordHash = await bcrypt.hash(password, 4); // low rounds — test speed only
      const u = {
        _id: `user-${nextId++}`,
        email: email.toLowerCase().trim(),
        passwordHash,
        displayName: displayName?.trim() || email.split('@')[0],
        isGuest: false,
        plan: 'free',
        createdAt: new Date().toISOString(),
      };
      users.push(u);
      return attach(u);
    },
    async createGuest() {
      const u = {
        _id: `user-${nextId++}`,
        isGuest: true,
        displayName: 'Guest',
        plan: 'guest',
        createdAt: new Date().toISOString(),
      };
      users.push(u);
      return attach(u);
    },
    async verifyPassword(user, candidatePassword) {
      if (!user?.passwordHash) return false;
      return bcrypt.compare(candidatePassword, user.passwordHash);
    },
    async touchLogin(id) {
      const u = users.find((x) => x._id === id);
      if (u) u.lastLogin = new Date().toISOString();
      return u;
    },
    __reset() {
      users = [];
      nextId = 1;
    },
  };

  const User = {
    async findByIdAndUpdate(id, update) {
      const u = users.find((x) => x._id === id);
      if (!u) return null;
      Object.assign(u, update);
      return attach(u);
    },
  };

  return { ...actual, UserModel, User };
});

import { UserModel } from '../models/User.js';

function extractCookie(res) {
  const raw = res.headers['set-cookie'];
  if (!raw) return null;
  return raw[0].split(';')[0]; // "auth_token=..."
}

let app;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-for-vitest-only';
  app = createApp();
});

beforeEach(() => {
  UserModel.__reset();
});

describe('POST /api/auth/register', () => {
  it('creates an account and sets an auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'new@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new@example.com');
    expect(res.body.user.isGuest).toBe(false);
    expect(extractCookie(res)).toMatch(/^auth_token=/);
  });

  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects registering the same email twice', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dupe@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ email: 'dupe@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('login@example.com');
    expect(extractCookie(res)).toMatch(/^auth_token=/);
  });

  it('rejects the wrong password without revealing whether the account exists', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login2@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login2@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('rejects a login for an email that was never registered', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('rejects logging into a guest account via the password login route', async () => {
    await request(app).post('/api/auth/guest');
    const res = await request(app).post('/api/auth/login').send({ email: 'guest@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/guest', () => {
  it('creates a guest account with no email/password required', async () => {
    const res = await request(app).post('/api/auth/guest');
    expect(res.status).toBe(201);
    expect(res.body.user.isGuest).toBe(true);
    expect(res.body.user.email).toBeNull();
    expect(extractCookie(res)).toMatch(/^auth_token=/);
  });
});

describe('GET /api/auth/me', () => {
  it('returns null when there is no auth cookie (not a 401 — this route is safe to call unauthenticated)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it('returns the current user when a valid cookie is present', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({ email: 'me@example.com', password: 'password123' });
    const cookie = extractCookie(registerRes);

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the auth cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie'][0]).toMatch(/Max-Age=0/);
  });
});

describe('POST /api/auth/upgrade-guest', () => {
  it('rejects the request without an auth cookie', async () => {
    const res = await request(app).post('/api/auth/upgrade-guest').send({ email: 'x@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it("converts a guest account to a full account, keeping the same user id", async () => {
    const guestRes = await request(app).post('/api/auth/guest');
    const cookie = extractCookie(guestRes);
    const guestId = guestRes.body.user.id;

    const res = await request(app)
      .post('/api/auth/upgrade-guest')
      .set('Cookie', cookie)
      .send({ email: 'upgraded@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(guestId);
    expect(res.body.user.isGuest).toBe(false);
    expect(res.body.user.email).toBe('upgraded@example.com');
  });

  it('rejects upgrading an account that is not a guest', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({ email: 'already-full@example.com', password: 'password123' });
    const cookie = extractCookie(registerRes);

    const res = await request(app)
      .post('/api/auth/upgrade-guest')
      .set('Cookie', cookie)
      .send({ email: 'other@example.com', password: 'password123' });

    expect(res.status).toBe(400);
  });
});

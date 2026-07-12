import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.GEMINI_API_KEY = 'test-key';
});

describe('toNumberOrUndefined', () => {
  it('converts a blank string to undefined instead of NaN', async () => {
    const { toNumberOrUndefined } = await import('./checkins.js');
    // This is the exact bug: Mongoose throws a CastError trying to save
    // '' into a Number field. It must become undefined, not pass through.
    expect(toNumberOrUndefined('')).toBeUndefined();
  });

  it('preserves a real 0 value (distinct from "not answered")', async () => {
    const { toNumberOrUndefined } = await import('./checkins.js');
    expect(toNumberOrUndefined(0)).toBe(0);
  });

  it('converts null/undefined to undefined', async () => {
    const { toNumberOrUndefined } = await import('./checkins.js');
    expect(toNumberOrUndefined(null)).toBeUndefined();
    expect(toNumberOrUndefined(undefined)).toBeUndefined();
  });

  it('parses a valid numeric string', async () => {
    const { toNumberOrUndefined } = await import('./checkins.js');
    expect(toNumberOrUndefined('7.5')).toBe(7.5);
  });

  it('converts a non-numeric string to undefined rather than NaN', async () => {
    const { toNumberOrUndefined } = await import('./checkins.js');
    expect(toNumberOrUndefined('not-a-number')).toBeUndefined();
  });
});

describe('sanitizeBody', () => {
  it('coerces blank sleepHours to undefined within the full payload', async () => {
    const { sanitizeBody } = await import('./checkins.js');
    const result = sanitizeBody({ mood: 3, energy: 4, sleepHours: '' });
    expect(result.sleepHours).toBeUndefined();
    expect(result.mood).toBe(3);
    expect(result.energy).toBe(4);
  });

  it('never lets userId, _id, or timestamps through (whitelisting)', async () => {
    const { sanitizeBody } = await import('./checkins.js');
    const result = sanitizeBody({
      mood: 3,
      userId: 'malicious-user-id',
      _id: 'malicious-id',
      createdAt: '2020-01-01',
    });
    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('_id');
    expect(result).not.toHaveProperty('createdAt');
  });

  it('passes through text fields unchanged', async () => {
    const { sanitizeBody } = await import('./checkins.js');
    const result = sanitizeBody({ gratitude: 'my dog', goals: 'sleep more' });
    expect(result.gratitude).toBe('my dog');
    expect(result.goals).toBe('sleep more');
  });

  it('handles an empty body without throwing', async () => {
    const { sanitizeBody } = await import('./checkins.js');
    expect(() => sanitizeBody()).not.toThrow();
    expect(() => sanitizeBody({})).not.toThrow();
  });
});

describe('clamp (generate.js numeric range guarding)', () => {
  it('caps an out-of-range value typed past the input\'s soft HTML limit', async () => {
    const { clamp } = await import('./generate.js');
    expect(clamp(99, 0, 24)).toBe(24);
    expect(clamp(-5, 0, 24)).toBe(0);
  });

  it('leaves valid in-range values untouched', async () => {
    const { clamp } = await import('./generate.js');
    expect(clamp(7.5, 0, 24)).toBe(7.5);
  });

  it('leaves non-numeric values untouched (handled elsewhere as "not answered")', async () => {
    const { clamp } = await import('./generate.js');
    expect(clamp('', 0, 24)).toBe('');
    expect(clamp(undefined, 1, 5)).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { hashKey, getCached, setCache, getCacheStats } from './cache.js';

describe('hashKey', () => {
  it('produces different hashes for different users with identical content', () => {
    // This is the exact bug that let one user's cached reflection get
    // served to a different user — the hash must include the client/user
    // scope, not just the form content.
    const content = { mood: 3, energy: 3 };
    const hashA = hashKey(content, ['ok', 'userA']);
    const hashB = hashKey(content, ['ok', 'userB']);
    expect(hashA).not.toBe(hashB);
  });

  it('produces the same hash for the same user with identical content', () => {
    const content = { mood: 3, energy: 3 };
    const hash1 = hashKey(content, ['ok', 'userA']);
    const hash2 = hashKey(content, ['ok', 'userA']);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for genuinely different content', () => {
    const hashA = hashKey({ mood: 3, gratitude: 'my dog' }, ['ok', 'userA']);
    const hashB = hashKey({ mood: 3, gratitude: 'my friend' }, ['ok', 'userA']);
    expect(hashA).not.toBe(hashB);
  });

  it('does not strip a real 0 value (distinct from "not answered")', () => {
    // sleepHours: 0 is a real answer ("I slept zero hours") and must hash
    // differently from sleepHours being absent entirely.
    const withZero = hashKey({ sleepHours: 0 }, ['ok', 'userA']);
    const withoutField = hashKey({}, ['ok', 'userA']);
    expect(withZero).not.toBe(withoutField);
  });

  it('strips empty strings so blank vs untouched fields hash the same', () => {
    const withEmpty = hashKey({ gratitude: '' }, ['ok', 'userA']);
    const withoutField = hashKey({}, ['ok', 'userA']);
    expect(withEmpty).toBe(withoutField);
  });

  it('returns a hex string (SHA-256 output)', () => {
    const hash = hashKey({ mood: 3 }, ['ok', 'userA']);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('cache get/set', () => {
  it('returns null for a key that was never set', () => {
    expect(getCached('nonexistent-hash-xyz')).toBeNull();
  });

  it('returns the exact value that was set', () => {
    const key = hashKey({ test: 'roundtrip' }, ['test']);
    setCache(key, 'hello world');
    expect(getCached(key)).toBe('hello world');
  });
});

describe('getCacheStats', () => {
  it('reports a size and does not throw', () => {
    const stats = getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(typeof stats.size).toBe('number');
  });
});

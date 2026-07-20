import { describe, it, expect } from 'vitest';
import { sanitizeTitle } from './goals.js';

describe('sanitizeTitle', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeTitle('  Meditate 10 minutes  ')).toBe('Meditate 10 minutes');
  });

  it('returns an empty string for non-string input', () => {
    expect(sanitizeTitle(undefined)).toBe('');
    expect(sanitizeTitle(null)).toBe('');
    expect(sanitizeTitle(42)).toBe('');
  });

  it('returns an empty string for a whitespace-only title', () => {
    expect(sanitizeTitle('   ')).toBe('');
  });

  it('truncates titles longer than 80 characters', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeTitle(long)).toHaveLength(80);
  });

  it('leaves a normal title untouched', () => {
    expect(sanitizeTitle('Drink 8 glasses of water')).toBe('Drink 8 glasses of water');
  });
});

import { describe, it, expect } from 'vitest';
import { isValidDateKey, computeStreak } from './Goal.js';

describe('isValidDateKey', () => {
  it('accepts a well-formed YYYY-MM-DD string', () => {
    expect(isValidDateKey('2026-07-20')).toBe(true);
  });

  it('rejects non-string input', () => {
    expect(isValidDateKey(20260720)).toBe(false);
    expect(isValidDateKey(null)).toBe(false);
    expect(isValidDateKey(undefined)).toBe(false);
  });

  it('rejects a date in the wrong format', () => {
    expect(isValidDateKey('07/20/2026')).toBe(false);
    expect(isValidDateKey('2026-7-20')).toBe(false);
    expect(isValidDateKey('2026-07-20T00:00:00Z')).toBe(false);
  });

  it('rejects a string that looks right but is not a real calendar date', () => {
    expect(isValidDateKey('2026-13-40')).toBe(false);
  });
});

describe('computeStreak', () => {
  it('returns 0 when there are no completions', () => {
    expect(computeStreak([], '2026-07-20')).toBe(0);
  });

  it('returns 0 when today is not marked complete, even with a past streak', () => {
    expect(computeStreak(['2026-07-18', '2026-07-19'], '2026-07-20')).toBe(0);
  });

  it('counts a single day when only today is marked', () => {
    expect(computeStreak(['2026-07-20'], '2026-07-20')).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const completions = ['2026-07-18', '2026-07-19', '2026-07-20'];
    expect(computeStreak(completions, '2026-07-20')).toBe(3);
  });

  it('stops counting at the first gap', () => {
    const completions = ['2026-07-15', '2026-07-19', '2026-07-20'];
    expect(computeStreak(completions, '2026-07-20')).toBe(2);
  });

  it('ignores unrelated/future dates in the completions array', () => {
    const completions = ['2026-07-20', '2026-07-25'];
    expect(computeStreak(completions, '2026-07-20')).toBe(1);
  });
});

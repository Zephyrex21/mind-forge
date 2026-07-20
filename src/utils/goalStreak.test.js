import { describe, it, expect } from 'vitest';
import { computeGoalStreak, toLocalDateKey } from './goalStreak';

describe('toLocalDateKey', () => {
  it('formats a date as YYYY-MM-DD using local time fields', () => {
    const d = new Date(2026, 6, 5); // July 5, 2026 (month is 0-indexed)
    expect(toLocalDateKey(d)).toBe('2026-07-05');
  });

  it('zero-pads single-digit months and days', () => {
    const d = new Date(2026, 0, 9); // January 9, 2026
    expect(toLocalDateKey(d)).toBe('2026-01-09');
  });
});

describe('computeGoalStreak', () => {
  it('returns 0 for no completions', () => {
    expect(computeGoalStreak([], '2026-07-20')).toBe(0);
  });

  it('returns 0 when today is not marked done', () => {
    expect(computeGoalStreak(['2026-07-18', '2026-07-19'], '2026-07-20')).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(computeGoalStreak(['2026-07-18', '2026-07-19', '2026-07-20'], '2026-07-20')).toBe(3);
  });

  it('stops at the first gap going backward', () => {
    expect(computeGoalStreak(['2026-07-15', '2026-07-19', '2026-07-20'], '2026-07-20')).toBe(2);
  });

  it('correctly crosses a month boundary', () => {
    expect(computeGoalStreak(['2026-06-30', '2026-07-01'], '2026-07-01')).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import {
  getSleepMoodBuckets,
  getDayOfWeekPattern,
  getCopingToolEffectiveness,
  getMoodEnergyCorrelation,
} from './emotionAnalytics';

describe('getSleepMoodBuckets', () => {
  it('returns an empty array when there is no sleep/mood data', () => {
    expect(getSleepMoodBuckets([])).toEqual([]);
  });

  it('buckets check-ins by sleep hours and averages mood within each bucket', () => {
    const checkins = [
      { sleepHours: 5, mood: 2 },
      { sleepHours: 5.5, mood: 3 },
      { sleepHours: 7.5, mood: 4 },
    ];
    const buckets = getSleepMoodBuckets(checkins);
    const under6 = buckets.find((b) => b.label === 'Under 6h');
    const bucket78 = buckets.find((b) => b.label === '7-8h');
    expect(under6.count).toBe(2);
    expect(under6.avgMood).toBe(2.5);
    expect(bucket78.count).toBe(1);
    expect(bucket78.avgMood).toBe(4);
  });

  it('omits buckets with no matching check-ins', () => {
    const checkins = [{ sleepHours: 5, mood: 3 }];
    const buckets = getSleepMoodBuckets(checkins);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].label).toBe('Under 6h');
  });

  it('ignores check-ins missing sleepHours or mood', () => {
    const checkins = [{ sleepHours: 7, mood: null }, { sleepHours: null, mood: 4 }];
    expect(getSleepMoodBuckets(checkins)).toEqual([]);
  });
});

describe('getDayOfWeekPattern', () => {
  it('always returns all 7 weekdays, even with no data', () => {
    expect(getDayOfWeekPattern([])).toHaveLength(7);
  });

  it('groups check-ins by day of week and averages mood', () => {
    // 2026-07-20 is a Monday
    const monday = '2026-07-20T10:00:00';
    const checkins = [
      { createdAt: monday, mood: 4 },
      { createdAt: monday, mood: 2 },
    ];
    const pattern = getDayOfWeekPattern(checkins);
    const mon = pattern.find((p) => p.label === 'Mon');
    expect(mon.count).toBe(2);
    expect(mon.avgMood).toBe(3);
  });

  it('leaves avgMood null for days with no check-ins', () => {
    const pattern = getDayOfWeekPattern([{ createdAt: '2026-07-20T10:00:00', mood: 4 }]);
    const sun = pattern.find((p) => p.label === 'Sun');
    expect(sun.count).toBe(0);
    expect(sun.avgMood).toBeNull();
  });
});

describe('getCopingToolEffectiveness', () => {
  it('returns an empty array when no coping tools were ever logged', () => {
    expect(getCopingToolEffectiveness([{ mood: 3, copingTools: [] }])).toEqual([]);
  });

  it('marks a tool used fewer than 3 times as not having enough data', () => {
    const checkins = [
      { mood: 5, copingTools: ['walking'] },
      { mood: 4, copingTools: ['walking'] },
      { mood: 2, copingTools: [] },
    ];
    const result = getCopingToolEffectiveness(checkins);
    const walking = result.find((r) => r.tool === 'walking');
    expect(walking.hasEnoughData).toBe(false);
    expect(walking.delta).toBeNull();
  });

  it('computes a positive delta for a tool associated with a higher mood', () => {
    const checkins = [
      { mood: 5, copingTools: ['journaling'] },
      { mood: 5, copingTools: ['journaling'] },
      { mood: 5, copingTools: ['journaling'] },
      { mood: 1, copingTools: [] },
      { mood: 1, copingTools: [] },
    ];
    const result = getCopingToolEffectiveness(checkins);
    const journaling = result.find((r) => r.tool === 'journaling');
    expect(journaling.hasEnoughData).toBe(true);
    expect(journaling.avgMoodWith).toBe(5);
    expect(journaling.delta).toBe(4);
  });

  it('sorts tools with the highest delta first', () => {
    const checkins = [
      { mood: 5, copingTools: ['a'] }, { mood: 5, copingTools: ['a'] }, { mood: 5, copingTools: ['a'] },
      { mood: 2, copingTools: ['b'] }, { mood: 2, copingTools: ['b'] }, { mood: 2, copingTools: ['b'] },
      { mood: 1, copingTools: [] },
    ];
    const result = getCopingToolEffectiveness(checkins);
    expect(result[0].tool).toBe('a');
  });
});

describe('getMoodEnergyCorrelation', () => {
  it('reports not enough data with fewer than 4 valid pairs', () => {
    const result = getMoodEnergyCorrelation([{ mood: 4, energy: 4 }]);
    expect(result.r).toBeNull();
    expect(result.label).toBe('Not enough data yet');
  });

  it('detects a strong positive correlation', () => {
    const checkins = [
      { mood: 1, energy: 1 },
      { mood: 2, energy: 2 },
      { mood: 3, energy: 3 },
      { mood: 4, energy: 4 },
      { mood: 5, energy: 5 },
    ];
    const result = getMoodEnergyCorrelation(checkins);
    expect(result.r).toBe(1);
    expect(result.label).toMatch(/strong positive/);
  });

  it('detects a strong negative correlation', () => {
    const checkins = [
      { mood: 5, energy: 1 },
      { mood: 4, energy: 2 },
      { mood: 3, energy: 3 },
      { mood: 2, energy: 4 },
      { mood: 1, energy: 5 },
    ];
    const result = getMoodEnergyCorrelation(checkins);
    expect(result.r).toBe(-1);
    expect(result.label).toMatch(/strong negative/);
  });

  it('ignores check-ins missing either mood or energy', () => {
    const checkins = [
      { mood: 4, energy: 4 },
      { mood: 3, energy: null },
      { mood: null, energy: 2 },
      { mood: 2, energy: 2 },
      { mood: 5, energy: 5 },
      { mood: 1, energy: 1 },
    ];
    const result = getMoodEnergyCorrelation(checkins);
    expect(result.count).toBe(4);
  });
});

import { describe, it, expect } from 'vitest';
import { getWeeklyRecap } from './weeklyRecap';

const NOW = new Date('2026-07-20T12:00:00Z');
const daysAgo = (n) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe('getWeeklyRecap', () => {
  it('reports no data when there are no check-ins in the last 7 days', () => {
    const recap = getWeeklyRecap([], NOW);
    expect(recap.hasData).toBe(false);
    expect(recap.count).toBe(0);
  });

  it('ignores check-ins older than 7 days when computing this week', () => {
    const checkins = [
      { _id: '1', createdAt: daysAgo(10), mood: 1 },
    ];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.hasData).toBe(false);
  });

  it('averages mood/energy/sleep across this week only', () => {
    const checkins = [
      { _id: '1', createdAt: daysAgo(1), mood: 4, energy: 3, sleepHours: 7 },
      { _id: '2', createdAt: daysAgo(3), mood: 2, energy: 3, sleepHours: 5 },
      { _id: '3', createdAt: daysAgo(10), mood: 5, energy: 5, sleepHours: 8 }, // outside window
    ];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.hasData).toBe(true);
    expect(recap.count).toBe(2);
    expect(recap.avgMood).toBe(3);
    expect(recap.avgEnergy).toBe(3);
    expect(recap.avgSleep).toBe(6);
  });

  it('identifies the best and toughest day by mood', () => {
    const checkins = [
      { _id: '1', createdAt: daysAgo(1), mood: 5 },
      { _id: '2', createdAt: daysAgo(2), mood: 2 },
      { _id: '3', createdAt: daysAgo(3), mood: 3 },
    ];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.bestDay.mood).toBe(5);
    expect(recap.toughestDay.mood).toBe(2);
  });

  it('does not report a toughest day when only one check-in exists this week', () => {
    const checkins = [{ _id: '1', createdAt: daysAgo(1), mood: 4 }];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.bestDay.mood).toBe(4);
    expect(recap.toughestDay).toBeNull();
  });

  it('computes a mood delta against the prior 7-day window', () => {
    const checkins = [
      { _id: '1', createdAt: daysAgo(1), mood: 4 },
      { _id: '2', createdAt: daysAgo(9), mood: 2 },
    ];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.moodDelta).toBe(2);
  });

  it('returns null moodDelta when there is no prior-week data to compare', () => {
    const checkins = [{ _id: '1', createdAt: daysAgo(1), mood: 4 }];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.moodDelta).toBeNull();
  });

  it('ranks the most-used coping tool this week', () => {
    const checkins = [
      { _id: '1', createdAt: daysAgo(1), copingTools: ['journaling', 'walking'] },
      { _id: '2', createdAt: daysAgo(2), copingTools: ['journaling'] },
    ];
    const recap = getWeeklyRecap(checkins, NOW);
    expect(recap.topCopingTool).toEqual({ tool: 'journaling', count: 2 });
  });
});

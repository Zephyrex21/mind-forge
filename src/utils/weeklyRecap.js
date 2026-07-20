/**
 * Computes a "this week vs last week" recap from a user's check-ins —
 * purely a client-side aggregation over data the app already has (no new
 * backend endpoint or AI call needed), so it's cheap to keep in sync with
 * whatever the person has actually logged.
 *
 * "This week" and "last week" are rolling 7-day windows ending now, not
 * calendar weeks — simpler to reason about and doesn't leave a half-empty
 * "week" right after the app is first used.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

function average(nums) {
  const valid = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (!valid.length) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function topCopingTool(checkins) {
  const counts = new Map();
  for (const c of checkins) {
    for (const tool of c.copingTools || []) {
      counts.set(tool, (counts.get(tool) || 0) + 1);
    }
  }
  let best = null;
  for (const [tool, count] of counts.entries()) {
    if (!best || count > best.count) best = { tool, count };
  }
  return best;
}

export function getWeeklyRecap(checkins = [], now = new Date()) {
  const nowMs = now.getTime();
  const thisWeek = checkins.filter((c) => nowMs - new Date(c.createdAt).getTime() < 7 * DAY_MS);
  const lastWeek = checkins.filter((c) => {
    const age = nowMs - new Date(c.createdAt).getTime();
    return age >= 7 * DAY_MS && age < 14 * DAY_MS;
  });

  if (!thisWeek.length) {
    return { hasData: false, count: 0 };
  }

  const withMood = thisWeek.filter((c) => typeof c.mood === 'number');
  const bestDay = withMood.reduce((best, c) => (!best || c.mood > best.mood ? c : best), null);
  const toughestDay = withMood.reduce((worst, c) => (!worst || c.mood < worst.mood ? c : worst), null);

  const avgMood = average(thisWeek.map((c) => c.mood));
  const avgEnergy = average(thisWeek.map((c) => c.energy));
  const avgSleep = average(thisWeek.map((c) => c.sleepHours));
  const prevAvgMood = average(lastWeek.map((c) => c.mood));

  return {
    hasData: true,
    count: thisWeek.length,
    avgMood,
    avgEnergy,
    avgSleep,
    moodDelta: avgMood != null && prevAvgMood != null ? Math.round((avgMood - prevAvgMood) * 10) / 10 : null,
    bestDay: bestDay ? { date: bestDay.createdAt, mood: bestDay.mood } : null,
    toughestDay:
      toughestDay && (!bestDay || toughestDay._id !== bestDay._id) ? { date: toughestDay.createdAt, mood: toughestDay.mood } : null,
    topCopingTool: topCopingTool(thisWeek),
  };
}

/**
 * Pure, client-side aggregations over a user's own check-ins — no new
 * backend endpoint or AI call, same "quick to compute, always in sync"
 * approach as utils/weeklyRecap.js. These are intentionally simple,
 * explainable statistics (bucketed averages, a Pearson correlation)
 * rather than anything that claims clinical significance.
 */

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SLEEP_BUCKETS = [
  { label: 'Under 6h', test: (h) => h < 6 },
  { label: '6-7h', test: (h) => h >= 6 && h < 7 },
  { label: '7-8h', test: (h) => h >= 7 && h < 8 },
  { label: '8h+', test: (h) => h >= 8 },
];

// Minimum total check-ins before any of this is shown at all — below this,
// bucketed averages are mostly noise dressed up as insight.
export const MIN_CHECKINS_FOR_INSIGHTS = 5;

// Minimum times a specific coping tool must have been logged before its
// "effectiveness" delta is shown as a real number rather than "not enough
// data yet" — a tool used once that happened to coincide with a good mood
// isn't a pattern.
const MIN_TOOL_USAGE = 3;

function average(nums) {
  const valid = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function round1(n) {
  return n == null ? null : Math.round(n * 10) / 10;
}

function pearsonCorrelation(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX === 0 || denomY === 0) return null;
  return num / Math.sqrt(denomX * denomY);
}

function interpretCorrelation(r) {
  if (r === null) return 'Not enough data yet';
  const abs = Math.abs(r);
  const direction = r >= 0 ? 'positive' : 'negative';
  if (abs < 0.1) return 'No clear relationship';
  if (abs < 0.3) return `A weak ${direction} relationship`;
  if (abs < 0.5) return `A moderate ${direction} relationship`;
  return `A strong ${direction} relationship`;
}

/** Average mood/energy bucketed by how many hours of sleep were logged. */
export function getSleepMoodBuckets(checkins) {
  const withData = checkins.filter((c) => typeof c.sleepHours === 'number' && typeof c.mood === 'number');

  return SLEEP_BUCKETS.map((bucket) => {
    const matches = withData.filter((c) => bucket.test(c.sleepHours));
    return {
      label: bucket.label,
      count: matches.length,
      avgMood: matches.length ? round1(average(matches.map((c) => c.mood))) : null,
      avgEnergy: matches.length ? round1(average(matches.map((c) => c.energy))) : null,
    };
  }).filter((b) => b.count > 0);
}

/** Average mood by day of the week (Sun-Sat), in the browser's local time
 * zone — this is a descriptive pattern, not a streak boundary, so it
 * doesn't need the timezone-day-key precision Checkin.js's dayKey uses. */
export function getDayOfWeekPattern(checkins) {
  const withMood = checkins.filter((c) => typeof c.mood === 'number');

  return WEEKDAY_LABELS.map((label, idx) => {
    const matches = withMood.filter((c) => new Date(c.createdAt).getDay() === idx);
    return {
      label,
      count: matches.length,
      avgMood: matches.length ? round1(average(matches.map((c) => c.mood))) : null,
    };
  });
}

/**
 * Ranks each coping tool the user has ever logged by how much higher (or
 * lower) their average mood was on days they used it, versus days they
 * didn't. Sorted best-first. Tools used fewer than MIN_TOOL_USAGE times
 * get `hasEnoughData: false` instead of a delta — a single lucky day
 * isn't a pattern worth acting on.
 */
export function getCopingToolEffectiveness(checkins) {
  const withMood = checkins.filter((c) => typeof c.mood === 'number');
  const overallAvg = average(withMood.map((c) => c.mood));

  const allTools = new Set();
  withMood.forEach((c) => (c.copingTools || []).forEach((t) => allTools.add(t)));

  return Array.from(allTools)
    .map((tool) => {
      const withTool = withMood.filter((c) => (c.copingTools || []).includes(tool));
      const withoutTool = withMood.filter((c) => !(c.copingTools || []).includes(tool));
      const avgWith = average(withTool.map((c) => c.mood));
      const avgWithout = withoutTool.length ? average(withoutTool.map((c) => c.mood)) : overallAvg;
      const hasEnoughData = withTool.length >= MIN_TOOL_USAGE;

      return {
        tool,
        count: withTool.length,
        avgMoodWith: round1(avgWith),
        hasEnoughData,
        delta: hasEnoughData ? round1(avgWith - avgWithout) : null,
      };
    })
    .sort((a, b) => (b.delta ?? -Infinity) - (a.delta ?? -Infinity));
}

/** Pearson correlation between logged mood and energy. */
export function getMoodEnergyCorrelation(checkins) {
  const pairs = checkins.filter((c) => typeof c.mood === 'number' && typeof c.energy === 'number');
  if (pairs.length < 4) {
    return { r: null, label: 'Not enough data yet', count: pairs.length };
  }

  const r = pearsonCorrelation(pairs.map((c) => c.mood), pairs.map((c) => c.energy));
  return {
    r: r != null ? Math.round(r * 100) / 100 : null,
    label: interpretCorrelation(r),
    count: pairs.length,
  };
}

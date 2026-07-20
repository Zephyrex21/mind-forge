/**
 * Mirrors the streak logic in server/models/Goal.js so the UI can show an
 * up-to-date streak immediately after toggling a day, without waiting on
 * a round trip. Kept as a small standalone copy (not imported from the
 * server) since the frontend and backend are separate deployable apps —
 * same pattern as utils/weeklyRecap.js.
 */

/** Today's date as a 'YYYY-MM-DD' string in the *browser's* local
 * timezone. Deliberately not `new Date().toISOString().slice(0, 10)` —
 * that gives the UTC date, which is wrong for roughly half the day for
 * any timezone ahead of UTC (e.g. it would call 11pm IST "yesterday"). */
export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToKey(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

/**
 * Current consecutive-day streak, counting back from `todayKey`
 * ('YYYY-MM-DD', defaults to the browser's local today).
 */
export function computeGoalStreak(completions = [], todayKey = toLocalDateKey()) {
  const done = new Set(completions);
  let streak = 0;
  let cursor = todayKey;

  while (done.has(cursor)) {
    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

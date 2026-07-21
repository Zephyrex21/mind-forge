import { Router } from 'express';
import { CheckinModel } from '../models/Checkin.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every check-in endpoint requires a signed-in (or guest) user.
router.use(requireAuth);

/**
 * GET /api/checkins?limit=<1-100>&cursor=<ISO timestamp>
 * Cursor-paginated list of the authenticated user's saved check-ins,
 * newest first — full-fidelity records (title, reflection text, etc.),
 * intended for the "My Check-ins" browsing/search/export page. `cursor`
 * is the `nextCursor` returned by the previous page; omit it for the
 * first page.
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit, cursor } = req.query;
    const result = await CheckinModel.getUserCheckins(req.user.id, { limit, cursor });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkins/analytics
 * The user's entire check-in history, but stripped to only the fields
 * dashboard/insights aggregation needs (see Checkin.js's
 * getAllForAnalytics for why this is deliberately not paginated the same
 * way — those computations need the full history to be accurate).
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const checkins = await CheckinModel.getAllForAnalytics(req.user.id);
    res.json(checkins);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkins/stats?tzOffset=<minutes>
 * Aggregate data for the custom Mood/Streak/Achievements components:
 * current streak, totals, mood/energy/sleep trend over the last 30 entries.
 * tzOffset should be the browser's `Date.getTimezoneOffset()` value, so the
 * streak's day-boundaries line up with the user's local midnight instead of
 * the server's (UTC on most hosts).
 */
router.get('/stats', async (req, res, next) => {
  try {
    const tzOffsetMinutes = Number(req.query.tzOffset);
    const stats = await CheckinModel.getStats(req.user.id, Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkins/:id
 * NOTE: must stay below the /analytics and /stats routes above — Express
 * matches routes in registration order, and :id would otherwise swallow
 * "analytics"/"stats" as if they were a check-in's ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const checkin = await CheckinModel.getCheckinById(req.params.id, req.user.id);
    if (!checkin) return res.status(404).json({ error: 'Check-in not found' });
    res.json(checkin);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/checkins
 * Save a new check-in (typically called right after /api/generate returns
 * the AI reflection, so the reflection is persisted alongside the inputs).
 */
router.post('/', async (req, res, next) => {
  try {
    const checkin = await CheckinModel.createCheckin(req.user.id, sanitizeBody(req.body));
    res.status(201).json(checkin);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * PUT /api/checkins/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const checkin = await CheckinModel.updateCheckin(req.params.id, req.user.id, sanitizeBody(req.body));
    if (!checkin) return res.status(404).json({ error: 'Check-in not found or unauthorized' });
    res.json(checkin);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/checkins/:id/favorite
 */
router.post('/:id/favorite', async (req, res, next) => {
  try {
    const checkin = await CheckinModel.toggleFavorite(req.params.id, req.user.id);
    if (!checkin) return res.status(404).json({ error: 'Check-in not found or unauthorized' });
    res.json(checkin);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/checkins/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await CheckinModel.deleteCheckin(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Check-in not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * Whitelist writable fields so req.user.id / _id / timestamps can never be
 * overwritten by client input.
 */
function sanitizeBody(body = {}) {
  const {
    title, currentFocus, intention, mood, energy, sleepHours, sleepQuality,
    copingTools, copingNotes, goals, milestones, gratitude, supportContacts,
    customNotes, aiReflection, aiModel, flaggedForSafety,
  } = body;

  return {
    title, currentFocus, intention,
    // Number fields: an empty string (what the frontend sends for a
    // never-filled-in numeric input) must become `undefined`, not be
    // passed straight through — Mongoose throws a CastError trying to
    // coerce '' to a Number, which was silently breaking saves whenever
    // sleep hours was left blank.
    mood: toNumberOrUndefined(mood),
    energy: toNumberOrUndefined(energy),
    sleepHours: toNumberOrUndefined(sleepHours),
    sleepQuality: toNumberOrUndefined(sleepQuality),
    copingTools, copingNotes, goals, milestones, gratitude, supportContacts,
    customNotes, aiReflection, aiModel, flaggedForSafety,
  };
}

function toNumberOrUndefined(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export default router;
export { sanitizeBody, toNumberOrUndefined };

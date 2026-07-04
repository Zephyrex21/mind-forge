import { Router } from 'express';
import { CheckinModel } from '../models/Checkin.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every check-in endpoint requires a signed-in (or guest) user.
router.use(requireAuth);

/**
 * GET /api/checkins
 * List the authenticated user's saved check-ins, newest first.
 */
router.get('/', async (req, res, next) => {
  try {
    const checkins = await CheckinModel.getUserCheckins(req.user.id);
    res.json(checkins);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkins/stats
 * Aggregate data for the custom Mood/Streak/Achievements components:
 * current streak, totals, mood/energy/sleep trend over the last 30 entries.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await CheckinModel.getStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkins/:id
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
    title, currentFocus, intention, mood, energy, sleepHours, sleepQuality,
    copingTools, copingNotes, goals, milestones, gratitude, supportContacts,
    customNotes, aiReflection, aiModel, flaggedForSafety,
  };
}

export default router;

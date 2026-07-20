import { Router } from 'express';
import { GoalModel, isValidDateKey } from '../models/Goal.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every goal endpoint requires a signed-in (or guest) user.
router.use(requireAuth);

// A generous but real ceiling — keeps a single account from creating an
// unbounded number of goals, without being restrictive for genuine use.
const MAX_ACTIVE_GOALS = 12;

/**
 * GET /api/goals
 * List the authenticated user's active (non-archived) goals.
 */
router.get('/', async (req, res, next) => {
  try {
    const goals = await GoalModel.getUserGoals(req.user.id);
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/goals
 * Create a new goal. Body: { title }
 */
router.post('/', async (req, res, next) => {
  try {
    const title = sanitizeTitle(req.body.title);
    if (!title) return res.status(400).json({ error: 'A goal title is required.' });

    const activeCount = await GoalModel.countActiveGoals(req.user.id);
    if (activeCount >= MAX_ACTIVE_GOALS) {
      return res.status(400).json({ error: `You can track up to ${MAX_ACTIVE_GOALS} goals at once. Archive one to add another.` });
    }

    const goal = await GoalModel.createGoal(req.user.id, title);
    res.status(201).json(goal);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    next(err);
  }
});

/**
 * PUT /api/goals/:id
 * Rename a goal. Body: { title }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const title = sanitizeTitle(req.body.title);
    if (!title) return res.status(400).json({ error: 'A goal title is required.' });

    const goal = await GoalModel.renameGoal(req.params.id, req.user.id, title);
    if (!goal) return res.status(404).json({ error: 'Goal not found or unauthorized' });
    res.json(goal);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    next(err);
  }
});

/**
 * POST /api/goals/:id/archive
 * Archive a goal (soft-hide, keeps its history) rather than deleting it.
 */
router.post('/:id/archive', async (req, res, next) => {
  try {
    const goal = await GoalModel.archiveGoal(req.params.id, req.user.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found or unauthorized' });
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/goals/:id
 * Permanently delete a goal and its completion history.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await GoalModel.deleteGoal(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Goal not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/goals/:id/toggle
 * Toggle a single day on/off for this goal. Body: { date: 'YYYY-MM-DD' }
 *
 * The date comes from the client rather than being stamped server-side —
 * see the comment on Goal.js's schema for why (the server doesn't know
 * the user's local "today").
 */
router.post('/:id/toggle', async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!isValidDateKey(date)) {
      return res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required.' });
    }

    const goal = await GoalModel.toggleCompletion(req.params.id, req.user.id, date);
    if (!goal) return res.status(404).json({ error: 'Goal not found or unauthorized' });
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

function sanitizeTitle(title) {
  if (typeof title !== 'string') return '';
  return title.trim().slice(0, 80);
}

export default router;
export { sanitizeTitle, MAX_ACTIVE_GOALS };

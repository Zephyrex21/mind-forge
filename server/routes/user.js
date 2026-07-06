import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { CheckinModel } from '../models/Checkin.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/user/usage
 * Lightweight usage summary for the account (no paid-credits system —
 * this is a free tool, generation is gated only by the per-IP/user rate
 * limiter on /api/generate).
 */
router.get('/usage', async (req, res, next) => {
  try {
    const tzOffsetMinutes = Number(req.query.tzOffset);
    const stats = await CheckinModel.getStats(req.user.id, Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0);
    res.json({
      totalCheckins: stats.totalCheckins,
      currentStreak: stats.currentStreak,
      plan: req.user.plan,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

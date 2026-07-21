import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * A single daily wellness check-in.
 * Structured fields (rather than a JSON blob) so mood/sleep/energy trends
 * can be queried and aggregated cheaply for the Stats/Streak/Trophies views.
 */
const supportContactSchema = new Schema({
  name: { type: String, trim: true },
  relation: { type: String, trim: true },
  contact: { type: String, trim: true },
}, { _id: false });

const checkinSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, default: 'Daily Check-in' },

  // About You
  currentFocus: { type: String, trim: true, maxlength: 300 },
  intention: { type: String, trim: true, maxlength: 300 },

  // Mood & Energy
  mood: { type: Number, min: 1, max: 5 },
  energy: { type: Number, min: 1, max: 5 },
  sleepHours: { type: Number, min: 0, max: 24 },
  sleepQuality: { type: Number, min: 1, max: 5 },

  // Coping Tools & Support Systems
  copingTools: [{ type: String, trim: true }],
  copingNotes: { type: String, trim: true, maxlength: 500 },

  // Current Wellness Goals
  goals: { type: String, trim: true, maxlength: 500 },

  // Wellness Milestones
  milestones: { type: String, trim: true, maxlength: 500 },

  // Gratitude / Reflection
  gratitude: { type: String, trim: true, maxlength: 800 },

  // Support Contacts (private, optional)
  supportContacts: {
    type: [supportContactSchema],
    validate: {
      validator: (arr) => arr.length <= 5,
      message: 'You can add up to 5 support contacts.',
    },
  },

  // Custom Notes
  customNotes: { type: String, trim: true, maxlength: 1000 },

  // AI output
  aiReflection: { type: String },
  aiModel: { type: String },

  // Safety
  flaggedForSafety: { type: Boolean, default: false },

  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

checkinSchema.index({ userId: 1, createdAt: -1 });

const Checkin = mongoose.models.Checkin || model('Checkin', checkinSchema);

export const CheckinModel = {
  /**
   * Cursor-based pagination (not skip/limit) — skip/limit gets slower the
   * deeper a user pages in, since MongoDB still has to walk past every
   * skipped document. The cursor is the `createdAt` of the last item on
   * the previous page; combined with the existing `{userId:1,createdAt:-1}`
   * index, every page is an equally fast indexed range query regardless
   * of how far back it is.
   *
   * Fetches `limit + 1` documents to detect whether another page exists
   * without a separate (and, on a large collection, non-trivial) count
   * query — a classic pagination trick: if the (limit+1)th document came
   * back, there's more; trim it off before returning.
   */
  async getUserCheckins(userId, { limit = 30, cursor } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
    const query = { userId };
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!Number.isNaN(cursorDate.getTime())) {
        query.createdAt = { $lt: cursorDate };
      }
    }

    const docs = await Checkin.find(query).sort({ createdAt: -1 }).limit(safeLimit + 1);
    const hasMore = docs.length > safeLimit;
    const items = hasMore ? docs.slice(0, safeLimit) : docs;
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor };
  },

  async getCheckinById(id, userId) {
    return Checkin.findOne({ _id: id, userId });
  },

  /**
   * Returns the user's *entire* check-in history, but only the handful of
   * fields needed for dashboard aggregation (weekly recap, day-of-week/
   * sleep-mood analytics, "checked in today?" checks) — not the free-text
   * fields (gratitude, goals, milestones, custom notes, the AI reflection
   * itself). Those analyses genuinely need the full history to be
   * accurate (a "day-of-week pattern" computed from only the most recent
   * page would quietly be wrong), but have no reason to pull potentially
   * long reflection text over the wire just to compute an average.
   */
  async getAllForAnalytics(userId) {
    return Checkin.find({ userId })
      .select('mood energy sleepHours copingTools createdAt isFavorite')
      .sort({ createdAt: -1 })
      .lean();
  },

  async createCheckin(userId, data) {
    return Checkin.create({ userId, ...data });
  },

  async updateCheckin(id, userId, data) {
    return Checkin.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });
  },

  async toggleFavorite(id, userId) {
    const doc = await Checkin.findOne({ _id: id, userId });
    if (!doc) return null;
    doc.isFavorite = !doc.isFavorite;
    await doc.save();
    return doc;
  },

  async deleteCheckin(id, userId) {
    return Checkin.findOneAndDelete({ _id: id, userId });
  },

  /**
   * Consecutive-day check-in streak, counting back from today.
   * @param {string} userId
   * @param {number} tzOffsetMinutes - from JS `Date.getTimezoneOffset()`,
   *   i.e. minutes local time is BEHIND UTC (negative if ahead). Without
   *   this, "today" is computed in the server's timezone (UTC on most
   *   hosts), which can silently break a user's streak near midnight in
   *   their own timezone even though they never actually missed a day.
   */
  async getStreak(userId, tzOffsetMinutes = 0) {
    const docs = await Checkin.find({ userId }).sort({ createdAt: -1 }).select('createdAt').lean();
    if (!docs.length) return 0;

    const dayKeys = new Set(docs.map(d => dayKey(d.createdAt, tzOffsetMinutes)));
    let streak = 0;
    const cursor = new Date(); // real "now" — dayKey() alone handles the offset shift

    while (dayKeys.has(dayKey(cursor, tzOffsetMinutes))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1); // step back one real day; dayKey reshifts each time
    }
    return streak;
  },

  /**
   * Mood / energy / sleep trend for the last N check-ins (oldest → newest),
   * used to render the internal trend chart.
   */
  async getTrend(userId, { limit = 14 } = {}) {
    const docs = await Checkin.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('createdAt mood energy sleepHours sleepQuality')
      .lean();
    return docs.reverse();
  },

  /**
   * Frequency-ranked coping tools across the user's check-ins — powers the
   * "what helps you most" dashboard section.
   */
  async getTopCopingTools(userId, { limit = 6 } = {}) {
    const docs = await Checkin.find({ userId }).select('copingTools').lean();
    const counts = new Map();
    for (const doc of docs) {
      for (const tool of doc.copingTools || []) {
        counts.set(tool, (counts.get(tool) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tool, count]) => ({ tool, count }));
  },

  /**
   * Most recent check-in that actually has a generated reflection — used
   * for a "Latest Reflection" preview card on the dashboard.
   */
  async getLatestReflection(userId) {
    return Checkin.findOne({ userId, aiReflection: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .select('createdAt aiReflection mood energy')
      .lean();
  },

  async getStats(userId, tzOffsetMinutes = 0) {
    const [total, streak, trend, topCopingTools, latestReflection] = await Promise.all([
      Checkin.countDocuments({ userId }),
      CheckinModel.getStreak(userId, tzOffsetMinutes),
      CheckinModel.getTrend(userId, { limit: 30 }),
      CheckinModel.getTopCopingTools(userId),
      CheckinModel.getLatestReflection(userId),
    ]);

    const avg = (key) => {
      const vals = trend.map(t => t[key]).filter(v => typeof v === 'number');
      if (!vals.length) return null;
      return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    };

    return {
      totalCheckins: total,
      currentStreak: streak,
      avgMood: avg('mood'),
      avgEnergy: avg('energy'),
      avgSleepHours: avg('sleepHours'),
      avgSleepQuality: avg('sleepQuality'),
      topCopingTools,
      latestReflection,
      trend,
    };
  },
};

/**
 * Shifts a UTC timestamp into the user's local-time-equivalent instant,
 * then truncates to that day's midnight — giving a stable key for "this
 * calendar day in the user's own timezone."
 */
function dayKey(date, tzOffsetMinutes = 0) {
  const shifted = new Date(new Date(date).getTime() - tzOffsetMinutes * 60_000);
  shifted.setUTCHours(0, 0, 0, 0);
  return shifted.getTime();
}

export { Checkin, dayKey };
export default CheckinModel;

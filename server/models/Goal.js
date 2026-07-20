import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * A simple recurring habit/goal the user wants to track (e.g. "Meditate 10
 * minutes", "Drink more water"). Deliberately lightweight compared to
 * Checkin — just a title and a set of days it was marked done.
 *
 * Completions are stored as plain 'YYYY-MM-DD' strings rather than Dates.
 * The client always knows its own local "today"; the server doesn't, so
 * letting the client choose the date key (instead of the server stamping
 * one from its own clock) sidesteps the exact cross-timezone day-boundary
 * bug that the check-in streak logic (see Checkin.js's dayKey) had to be
 * specifically fixed for.
 */
const goalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, required: true, maxlength: 80 },
  active: { type: Boolean, default: true }, // archived goals are kept, just hidden
  completions: { type: [String], default: [] },
}, { timestamps: true });

goalSchema.index({ userId: 1, createdAt: 1 });

const Goal = mongoose.models.Goal || model('Goal', goalSchema);

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A strict 'YYYY-MM-DD' check — rejects anything that isn't exactly that
 * shape, then confirms it parses to a real calendar date. */
export function isValidDateKey(key) {
  if (typeof key !== 'string' || !DATE_KEY_RE.test(key)) return false;
  const d = new Date(`${key}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

/**
 * Current consecutive-day streak, counting back from `todayKey`
 * ('YYYY-MM-DD', defaults to the server's own UTC today). Pass the
 * caller's own local today for an accurate streak from their perspective.
 */
export function computeStreak(completions = [], todayKey = new Date().toISOString().slice(0, 10)) {
  const done = new Set(completions);
  let streak = 0;
  const cursor = new Date(`${todayKey}T00:00:00Z`);

  while (done.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const GoalModel = {
  async getUserGoals(userId) {
    return Goal.find({ userId, active: true }).sort({ createdAt: 1 });
  },

  async countActiveGoals(userId) {
    return Goal.countDocuments({ userId, active: true });
  },

  async createGoal(userId, title) {
    return Goal.create({ userId, title });
  },

  async renameGoal(id, userId, title) {
    return Goal.findOneAndUpdate({ _id: id, userId }, { title }, { new: true, runValidators: true });
  },

  async archiveGoal(id, userId) {
    return Goal.findOneAndUpdate({ _id: id, userId }, { active: false }, { new: true });
  },

  async deleteGoal(id, userId) {
    return Goal.findOneAndDelete({ _id: id, userId });
  },

  async toggleCompletion(id, userId, dateKey) {
    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) return null;

    const idx = goal.completions.indexOf(dateKey);
    if (idx === -1) {
      goal.completions.push(dateKey);
    } else {
      goal.completions.splice(idx, 1);
    }
    await goal.save();
    return goal;
  },
};

export { Goal };

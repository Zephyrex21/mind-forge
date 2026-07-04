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
  supportContacts: [supportContactSchema],

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
  async getUserCheckins(userId, { limit = 100 } = {}) {
    return Checkin.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  },

  async getCheckinById(id, userId) {
    return Checkin.findOne({ _id: id, userId });
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
   */
  async getStreak(userId) {
    const docs = await Checkin.find({ userId }).sort({ createdAt: -1 }).select('createdAt').lean();
    if (!docs.length) return 0;

    const dayKeys = new Set(docs.map(d => dayKey(d.createdAt)));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (dayKeys.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
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

  async getStats(userId) {
    const [total, streak, trend] = await Promise.all([
      Checkin.countDocuments({ userId }),
      CheckinModel.getStreak(userId),
      CheckinModel.getTrend(userId, { limit: 30 }),
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
      trend,
    };
  },
};

function dayKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export { Checkin };
export default CheckinModel;

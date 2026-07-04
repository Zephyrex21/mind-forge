import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

/**
 * User account.
 * Two account types:
 *  - Registered: email + passwordHash set, isGuest: false
 *  - Guest: no email/password, isGuest: true (used for the "Continue as Guest" flow)
 */
const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true, // allows many guest docs with no email without violating uniqueness
  },
  passwordHash: { type: String, select: false },
  displayName: { type: String, default: 'Friend' },
  isGuest: { type: Boolean, default: false },
  plan: { type: String, default: 'free' }, // 'guest' | 'free' | 'premium'
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    email: this.email || null,
    displayName: this.displayName,
    isGuest: this.isGuest,
    plan: this.plan,
    createdAt: this.createdAt,
  };
};

const User = mongoose.models.User || model('User', userSchema);

const SALT_ROUNDS = 10;

export const UserModel = {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  },

  async findById(id) {
    return User.findById(id);
  },

  async emailExists(email) {
    const existing = await User.exists({ email: email.toLowerCase().trim() });
    return !!existing;
  },

  async createUser({ email, password, displayName }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      displayName: displayName?.trim() || email.split('@')[0],
      isGuest: false,
      plan: 'free',
    });
  },

  async createGuest() {
    return User.create({
      isGuest: true,
      displayName: 'Guest',
      plan: 'guest',
    });
  },

  async verifyPassword(user, candidatePassword) {
    if (!user?.passwordHash) return false;
    return bcrypt.compare(candidatePassword, user.passwordHash);
  },

  async touchLogin(id) {
    return User.findByIdAndUpdate(id, { lastLogin: new Date() });
  },
};

export { User };
export default UserModel;

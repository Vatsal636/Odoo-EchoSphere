const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'compliance_assigned',
      'goal_at_risk',
      'challenge_approved',
      'challenge_rejected',
      'badge_earned',
      'policy_pending',
      'reward_redeemed',
      'general'
    ],
    default: 'general'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // e.g. '/governance/compliance' — frontend route to deep-link to
  read: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

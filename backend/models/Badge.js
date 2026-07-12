const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  iconUrl: { type: String },
  unlockType: { type: String, enum: ['xp_threshold', 'challenge_count'], required: true },
  unlockValue: { type: Number, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);

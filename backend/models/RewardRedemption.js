const mongoose = require('mongoose');

const rewardRedemptionSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  redemptionDate: { type: Date, default: Date.now },
  pointsDeducted: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('RewardRedemption', rewardRedemptionSchema);

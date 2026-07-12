const mongoose = require('mongoose');

const challengeParticipationSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  proofUrl: { type: String },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  xpAwarded: { type: Number, default: 0 },
  submissionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ChallengeParticipation', challengeParticipationSchema);

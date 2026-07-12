const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'CsrActivity', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proofUrl: { type: String },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  pointsEarned: { type: Number, default: 0 },
  completionDate: { type: Date },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Participation', participationSchema);

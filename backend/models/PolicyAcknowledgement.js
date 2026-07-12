const mongoose = require('mongoose');

const policyAcknowledgementSchema = new mongoose.Schema({
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acknowledgedDate: { type: Date },
  status: { type: String, enum: ['pending', 'acknowledged'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('PolicyAcknowledgement', policyAcknowledgementSchema);

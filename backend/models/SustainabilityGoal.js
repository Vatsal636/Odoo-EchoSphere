const mongoose = require('mongoose');

const sustainabilityGoalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  targetKg: { type: Number, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  status: { type: String, enum: ['on_track', 'at_risk', 'exceeded'], default: 'on_track' }
}, { timestamps: true });

module.exports = mongoose.model('SustainabilityGoal', sustainabilityGoalSchema);

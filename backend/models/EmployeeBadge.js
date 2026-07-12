const mongoose = require('mongoose');

const employeeBadgeSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  awardedDate: { type: Date, default: Date.now },
  awardedReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeBadge', employeeBadgeSchema);

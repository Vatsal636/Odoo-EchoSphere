const mongoose = require('mongoose');

const complianceIssueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('ComplianceIssue', complianceIssueSchema);

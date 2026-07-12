const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  effectiveDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);

const mongoose = require('mongoose');

const emissionFactorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['energy', 'transport', 'waste', 'water', 'other'], required: true },
  factorValue: { type: Number, required: true },
  unit: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EmissionFactor', emissionFactorSchema);

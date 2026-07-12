const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['raw_materials', 'logistics', 'manufacturing', 'services', 'energy', 'other'], default: 'other' },
  contactEmail: { type: String },
  sustainabilityRating: { type: Number, min: 0, max: 100 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);

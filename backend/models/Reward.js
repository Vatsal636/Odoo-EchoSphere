const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  pointsRequired: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);

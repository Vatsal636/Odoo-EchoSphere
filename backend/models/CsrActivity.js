const mongoose = require('mongoose');

const csrActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  date: { type: Date },
  pointsValue: { type: Number, default: 0 },
  maxParticipants: { type: Number },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CsrActivity', csrActivitySchema);

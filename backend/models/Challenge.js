const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  xpValue: { type: Number },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  evidenceRequired: { type: Boolean, default: false },
  deadline: { type: Date },
  status: { type: String, enum: ['draft', 'active', 'under_review', 'completed', 'archived'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);

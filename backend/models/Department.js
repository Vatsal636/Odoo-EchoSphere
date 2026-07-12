const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);

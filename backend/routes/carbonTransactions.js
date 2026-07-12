const express = require('express');
const CarbonTransaction = require('../models/CarbonTransaction');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const transactions = await CarbonTransaction.find()
      .populate('department', 'name')
      .populate('emissionFactor', 'name factorValue unit')
      .populate('createdBy', 'name')
      .populate('vendor', 'name category')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/by-scope', auth, async (req, res) => {
  try {
    const scopeAgg = await CarbonTransaction.aggregate([
      { $group: { _id: '$scope', totalKg: { $sum: '$emissionKg' }, count: { $sum: 1 } } },
      { $project: { scope: '$_id', totalKg: 1, count: 1, _id: 0 } }
    ]);
    const labels = { scope_1: 'Scope 1', scope_2: 'Scope 2', scope_3: 'Scope 3' };
    const result = scopeAgg.map(s => ({ scope: labels[s.scope] || s.scope, totalKg: Math.round(s.totalKg * 100) / 100, count: s.count }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/by-department/:deptId', auth, async (req, res) => {
  try {
    const transactions = await CarbonTransaction.find({ department: req.params.deptId })
      .populate('emissionFactor', 'name factorValue unit')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const transaction = await CarbonTransaction.create(data);
    const populated = await CarbonTransaction.findById(transaction._id)
      .populate('department', 'name')
      .populate('emissionFactor', 'name factorValue unit')
      .populate('vendor', 'name category');
    const goal = await SustainabilityGoal.findOne({
      department: transaction.department,
      periodStart: { $lte: transaction.date },
      periodEnd: { $gte: transaction.date }
    });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const transaction = await CarbonTransaction.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('department', 'name')
      .populate('emissionFactor', 'name factorValue unit')
      .populate('vendor', 'name category');
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const transaction = await CarbonTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

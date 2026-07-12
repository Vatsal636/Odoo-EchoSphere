const express = require('express');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const CarbonTransaction = require('../models/CarbonTransaction');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const goals = await SustainabilityGoal.find().populate('department', 'name');
    const result = [];
    for (const goal of goals) {
      const agg = await CarbonTransaction.aggregate([
        { $match: { department: goal.department._id || goal.department, date: { $gte: goal.periodStart, $lte: goal.periodEnd } } },
        { $group: { _id: null, total: { $sum: '$emissionKg' } } }
      ]);
      const currentKg = agg.length > 0 ? agg[0].total : 0;
      const pct = goal.targetKg > 0 ? Math.round((currentKg / goal.targetKg) * 100) : 0;
      let status = goal.status;
      if (pct > 100) status = 'exceeded';
      else if (pct > 80) status = 'at_risk';
      else status = 'on_track';
      result.push({ ...goal.toObject(), currentKg, percentage: pct, status });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await SustainabilityGoal.findById(req.params.id).populate('department', 'name');
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    const agg = await CarbonTransaction.aggregate([
      { $match: { department: goal.department._id || goal.department, date: { $gte: goal.periodStart, $lte: goal.periodEnd } } },
      { $group: { _id: null, total: { $sum: '$emissionKg' } } }
    ]);
    const currentKg = agg.length > 0 ? agg[0].total : 0;
    const pct = goal.targetKg > 0 ? Math.round((currentKg / goal.targetKg) * 100) : 0;
    res.json({ ...goal.toObject(), currentKg, percentage: pct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const goal = await SustainabilityGoal.create(req.body);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    if (req.body.status === 'at_risk' && previousStatus !== 'at_risk') {
      // Notify managers/admins — adjust the User.find() filter to your needs
      const User = require('../models/User');
      const recipients = await User.find({ role: { $in: ['admin', 'manager'] } }).select('_id');
      await notifyUsers({
        userIds: recipients.map(u => u._id),
        type: 'goal_at_risk',
        title: 'Sustainability Goal At Risk',
        message: `"${goal.name}" is now at risk of missing its target of ${goal.targetKg} kg CO2e.`,
        link: '/environmental/goals'
      });
    }
    const goal = await SustainabilityGoal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const goal = await SustainabilityGoal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

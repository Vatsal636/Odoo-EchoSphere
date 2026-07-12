const express = require('express');
const Badge = require('../models/Badge');
const EmployeeBadge = require('../models/EmployeeBadge');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.find().sort({ name: 1 });
    const employeeBadges = await EmployeeBadge.find({ employee: req.user._id }).populate('badge');
    const unlockedBadgeIds = employeeBadges.map(eb => eb.badge._id.toString());
    const result = badges.map(b => ({
      ...b.toObject(),
      unlocked: unlockedBadgeIds.includes(b._id.toString()),
      awardedDate: employeeBadges.find(eb => eb.badge._id.toString() === b._id.toString())?.awardedDate || null
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const badge = await Badge.create(req.body);
    res.status(201).json(badge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json(badge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

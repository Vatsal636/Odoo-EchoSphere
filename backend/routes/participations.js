const express = require('express');
const Participation = require('../models/Participation');
const CsrActivity = require('../models/CsrActivity');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { checkAndAwardBadges } = require('../utils/badgeHelper');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const participation = await Participation.create({ ...req.body, employee: req.user._id });
    const populated = await Participation.findById(participation._id)
      .populate('activity', 'name pointsValue')
      .populate('employee', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const participations = await Participation.find({ employee: req.user._id })
      .populate('activity', 'name pointsValue date')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json(participations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const participations = await Participation.find()
      .populate('activity', 'name pointsValue')
      .populate('employee', 'name email department')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json(participations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.id).populate('activity');
    if (!participation) return res.status(404).json({ error: 'Participation not found' });
    participation.approvalStatus = 'approved';
    participation.pointsEarned = participation.activity.pointsValue;
    participation.completionDate = new Date();
    participation.reviewer = req.user._id;
    await participation.save();
    await User.findByIdAndUpdate(participation.employee, { $inc: { totalXp: participation.pointsEarned } });
    await checkAndAwardBadges(participation.employee);
    const updated = await Participation.findById(participation._id)
      .populate('activity', 'name pointsValue')
      .populate('employee', 'name')
      .populate('reviewer', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/reject', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const participation = await Participation.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected', reviewer: req.user._id, notes: req.body.notes },
      { new: true }
    ).populate('activity', 'name pointsValue').populate('employee', 'name').populate('reviewer', 'name');
    if (!participation) return res.status(404).json({ error: 'Participation not found' });
    res.json(participation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

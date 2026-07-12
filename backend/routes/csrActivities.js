const express = require('express');
const CsrActivity = require('../models/CsrActivity');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const activities = await CsrActivity.find()
      .populate('category', 'name')
      .populate('organizer', 'name')
      .sort({ date: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await CsrActivity.findById(req.params.id)
      .populate('category', 'name')
      .populate('organizer', 'name');
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const data = { ...req.body, organizer: req.user._id };
    const activity = await CsrActivity.create(data);
    const populated = await CsrActivity.findById(activity._id)
      .populate('category', 'name')
      .populate('organizer', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const activity = await CsrActivity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category', 'name')
      .populate('organizer', 'name');
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const activity = await CsrActivity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const ChallengeParticipation = require('../models/ChallengeParticipation');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { checkAndAwardBadges } = require('../utils/badgeHelper');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const existing = await ChallengeParticipation.findOne({ challenge: req.body.challenge, employee: req.user._id });
    if (existing) return res.status(400).json({ error: 'Already joined this challenge' });
    const cp = await ChallengeParticipation.create({ ...req.body, employee: req.user._id });
    const populated = await ChallengeParticipation.findById(cp._id)
      .populate('challenge', 'name xpValue')
      .populate('employee', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const cps = await ChallengeParticipation.find({ employee: req.user._id })
      .populate('challenge', 'name xpValue difficulty deadline status')
      .sort({ createdAt: -1 });
    res.json(cps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const cps = await ChallengeParticipation.find()
      .populate('challenge', 'name xpValue')
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.json(cps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const cp = await ChallengeParticipation.findById(req.params.id);
    if (!cp) return res.status(404).json({ error: 'Challenge participation not found' });
    if (cp.employee.toString() !== req.user._id.toString() && req.user.role === 'employee') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    cp.progress = req.body.progress;
    if (req.body.proofUrl) cp.proofUrl = req.body.proofUrl;
    if (cp.progress >= 100) {
      cp.approvalStatus = 'pending';
      cp.submissionDate = new Date();
    }
    await cp.save();
    const populated = await ChallengeParticipation.findById(cp._id)
      .populate('challenge', 'name xpValue')
      .populate('employee', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const cp = await ChallengeParticipation.findById(req.params.id).populate('challenge');
    if (!cp) return res.status(404).json({ error: 'Challenge participation not found' });
    cp.approvalStatus = 'approved';
    cp.xpAwarded = cp.challenge.xpValue;
    await cp.save();
    await User.findByIdAndUpdate(cp.employee, { $inc: { totalXp: cp.xpAwarded } });
    await checkAndAwardBadges(cp.employee);
    const updated = await ChallengeParticipation.findById(cp._id)
      .populate('challenge', 'name xpValue')
      .populate('employee', 'name');
    res.json(updated);
    await notifyUser({
      userId: participation.employee,
      type: participation.approvalStatus === 'approved' ? 'challenge_approved' : 'challenge_rejected',
      title: participation.approvalStatus === 'approved' ? 'Challenge Approved!' : 'Challenge Submission Rejected',
      message: participation.approvalStatus === 'approved'
        ? `Your submission was approved. You earned ${participation.xpAwarded} XP!`
        : `Your challenge submission needs revision. Check the feedback and resubmit.`,
      link: '/challenges'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/reject', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const cp = await ChallengeParticipation.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected', xpAwarded: 0 },
      { new: true }
    ).populate('challenge', 'name xpValue').populate('employee', 'name');
    if (!cp) return res.status(404).json({ error: 'Challenge participation not found' });
    res.json(cp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const ComplianceIssue = require('../models/ComplianceIssue');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { notifyUser } = require('../utils/notificationService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const issues = await ComplianceIssue.find()
      .populate('owner', 'name email')
      .sort({ dueDate: 1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const issue = await ComplianceIssue.findById(req.params.id).populate('owner', 'name email');
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const issue = await ComplianceIssue.create(req.body);
    const populated = await ComplianceIssue.findById(issue._id).populate('owner', 'name email');
    if (issue.owner) {
      notifyUser({
        userId: issue.owner,
        type: 'compliance_assigned',
        title: 'New Compliance Issue Assigned',
        message: `You've been assigned "${issue.name}" (severity: ${issue.severity}), due ${new Date(issue.dueDate).toLocaleDateString()}.`,
        link: '/governance/compliance'
      }).catch(err => console.error('[compliance] Notification failed:', err));
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const issue = await ComplianceIssue.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner', 'name email');
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const issue = await ComplianceIssue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('owner', 'name email');
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const issue = await ComplianceIssue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const Policy = require('../models/Policy');
const PolicyAcknowledgement = require('../models/PolicyAcknowledgement');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const policies = await Policy.find().sort({ effectiveDate: -1 });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const result = [];
    for (const policy of policies) {
      const ackCount = await PolicyAcknowledgement.countDocuments({ policy: policy._id, status: 'acknowledged' });
      const userAck = await PolicyAcknowledgement.findOne({ policy: policy._id, employee: req.user._id });
      result.push({
        ...policy.toObject(),
        acknowledgementRate: totalEmployees > 0 ? Math.round((ackCount / totalEmployees) * 100) : 0,
        acknowledgedCount: ackCount,
        totalEmployees,
        userAcknowledged: userAck ? userAck.status === 'acknowledged' : false,
        userAck
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const policy = await Policy.create(req.body);
    res.status(201).json(policy);
    
    const User = require('../models/User');
    const allUsers = await User.find().select('_id');
    await notifyUsers({
      userIds: allUsers.map(u => u._id),
      type: 'policy_pending',
      title: 'New Policy Requires Acknowledgement',
      message: `A new policy "${policy.name}" has been published and requires your acknowledgement.`,
      link: '/governance/policies'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/acknowledge', auth, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    let ack = await PolicyAcknowledgement.findOne({ policy: policy._id, employee: req.user._id });
    if (ack) {
      ack.status = 'acknowledged';
      ack.acknowledgedDate = new Date();
      await ack.save();
    } else {
      ack = await PolicyAcknowledgement.create({
        policy: policy._id,
        employee: req.user._id,
        status: 'acknowledged',
        acknowledgedDate: new Date()
      });
    }
    res.json(ack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

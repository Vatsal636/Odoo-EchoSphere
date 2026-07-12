const express = require('express');
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ active: true }).sort({ pointsRequired: 1 });
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.status(201).json(reward);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    res.json(reward);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    res.json({ message: 'Reward deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    if (reward.stock <= 0) return res.status(400).json({ error: 'Out of stock' });
    if (reward.status === 'out_of_stock') return res.status(400).json({ error: 'Out of stock' });
    const user = await User.findById(req.user._id);
    if (user.totalXp < reward.pointsRequired) {
      return res.status(400).json({ error: 'Not enough XP' });
    }
    user.totalXp -= reward.pointsRequired;
    await user.save();
    reward.stock -= 1;
    if (reward.stock <= 0) reward.status = 'out_of_stock';
    await reward.save();
    await RewardRedemption.create({
      employee: user._id,
      reward: reward._id,
      pointsDeducted: reward.pointsRequired
    });
    res.json({ message: 'Reward redeemed', totalXp: user.totalXp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

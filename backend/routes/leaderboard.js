const express = require('express');
const User = require('../models/User');
const EmployeeBadge = require('../models/EmployeeBadge');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .populate('department', 'name')
      .sort({ totalXp: -1 })
      .limit(20);
    const result = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const badgeCount = await EmployeeBadge.countDocuments({ employee: u._id });
      result.push({
        rank: i + 1,
        _id: u._id,
        name: u.name,
        email: u.email,
        department: u.department,
        totalXp: u.totalXp,
        badgeCount
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

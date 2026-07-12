const express = require('express');
const CarbonTransaction = require('../models/CarbonTransaction');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { forecastEmissions, detectAnomalies, benchmarkDepartments } = require('../utils/analyticsService');
const router = express.Router();

router.get('/forecast', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    const transactions = await CarbonTransaction.find(filter).populate('department', 'name').sort({ date: 1 });

    let goalTargetKg = null;
    if (req.query.goalId) {
      const goal = await SustainabilityGoal.findById(req.query.goalId);
      if (goal) goalTargetKg = goal.targetKg;
    }

    const result = forecastEmissions(transactions, goalTargetKg);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/anomalies', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    const transactions = await CarbonTransaction.find(filter).populate('department', 'name').sort({ date: -1 });

    const result = detectAnomalies(transactions);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/benchmark', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const transactions = await CarbonTransaction.find().populate('department', 'name').sort({ date: -1 });

    const result = benchmarkDepartments(transactions);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

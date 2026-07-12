const express = require('express');
const CarbonTransaction = require('../models/CarbonTransaction');
const ComplianceIssue = require('../models/ComplianceIssue');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const CsrActivity = require('../models/CsrActivity');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const {
  generateCarbonSummaryPDF,
  generateEsgOverviewPDF,
  generateComplianceReportPDF
} = require('../utils/pdfGenerator');
const router = express.Router();

// GET /api/reports/carbon-summary?startDate=&endDate=&department=
router.get('/carbon-summary', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (department) filter.department = department;

    const transactions = await CarbonTransaction.find(filter)
      .populate('department', 'name')
      .populate('emissionFactor', 'name unit')
      .sort({ date: -1 });

    const totalKg = transactions.reduce((sum, t) => sum + (t.emissionKg || 0), 0);

    const byDeptMap = {};
    transactions.forEach(t => {
      const name = t.department?.name || 'Unassigned';
      byDeptMap[name] = (byDeptMap[name] || 0) + (t.emissionKg || 0);
    });
    const byDepartment = Object.entries(byDeptMap).map(([name, totalKg]) => ({ name, totalKg }));

    generateCarbonSummaryPDF(res, { transactions, totalKg, byDepartment, startDate, endDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/esg-overview
router.get('/esg-overview', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const [goals, csrThisMonth, openIssues, overdueIssues] = await Promise.all([
      SustainabilityGoal.find(),
      CsrActivity.countDocuments({
        date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),
      ComplianceIssue.countDocuments({ status: { $ne: 'resolved' } }),
      ComplianceIssue.countDocuments({ status: { $ne: 'resolved' }, dueDate: { $lt: new Date() } })
    ]);

    const activeGoals = goals.length;
    const goalsOnTrack = goals.filter(g => g.status === 'on_track').length;

    // Simple ESG score placeholders — swap for real weighted calculations
    // once you define exact scoring rules; kept consistent with dashboard route.
    const esgScores = {
      environmental: activeGoals ? Math.round((goalsOnTrack / activeGoals) * 100) : 0,
      social: Math.min(100, csrThisMonth * 10),
      governance: Math.max(0, 100 - overdueIssues * 15)
    };

    generateEsgOverviewPDF(res, {
      esgScores,
      goalsOnTrack,
      activeGoals,
      csrActivitiesThisMonth: csrThisMonth,
      complianceIssuesOpen: openIssues,
      complianceIssuesOverdue: overdueIssues
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/compliance-status
router.get('/compliance-status', auth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const issues = await ComplianceIssue.find()
      .populate('owner', 'name')
      .sort({ dueDate: 1 });

    generateComplianceReportPDF(res, { issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

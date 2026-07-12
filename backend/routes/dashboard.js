const express = require('express');
const CarbonTransaction = require('../models/CarbonTransaction');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const Challenge = require('../models/Challenge');
const CsrActivity = require('../models/CsrActivity');
const User = require('../models/User');
const ComplianceIssue = require('../models/ComplianceIssue');
const Participation = require('../models/Participation');
const PolicyAcknowledgement = require('../models/PolicyAcknowledgement');
const EmployeeBadge = require('../models/EmployeeBadge');
const Policy = require('../models/Policy');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const carbonAgg = await CarbonTransaction.aggregate([
      { $group: { _id: null, total: { $sum: '$emissionKg' } } }
    ]);
    const totalCarbonKg = carbonAgg.length > 0 ? carbonAgg[0].total : 0;

    const carbonByDept = await CarbonTransaction.aggregate([
      { $group: { _id: '$department', totalKg: { $sum: '$emissionKg' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { dept: '$dept.name', totalKg: 1 } }
    ]);

    const activeGoals = await SustainabilityGoal.countDocuments({ status: { $in: ['on_track', 'at_risk'] } });
    const goalsOnTrack = await SustainabilityGoal.countDocuments({ status: 'on_track' });

    const activeChallenges = await Challenge.countDocuments({ status: 'active' });
    const csrActivitiesThisMonth = await CsrActivity.countDocuments({
      date: { $gte: startOfMonth, $lte: now }
    });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const complianceIssuesOpen = await ComplianceIssue.countDocuments({ status: { $ne: 'resolved' } });
    const complianceIssuesOverdue = await ComplianceIssue.countDocuments({
      dueDate: { $lt: now },
      status: { $ne: 'resolved' }
    });

    const topBadgeHolders = await EmployeeBadge.aggregate([
      { $group: { _id: '$employee', badgeCount: { $sum: 1 } } },
      { $sort: { badgeCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, badgeCount: 1, name: '$user.name', email: '$user.email' } }
    ]);

    const carbonTrend = await CarbonTransaction.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo, $lte: now } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalKg: { $sum: '$emissionKg' }
      }},
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', totalKg: 1, _id: 0 } }
    ]);

    const allGoals = await SustainabilityGoal.find();
    let envScore = 50;
    if (allGoals.length > 0) {
      let totalPct = 0;
      for (const g of allGoals) {
        const agg = await CarbonTransaction.aggregate([
          { $match: { department: g.department, date: { $gte: g.periodStart, $lte: g.periodEnd } } },
          { $group: { _id: null, total: { $sum: '$emissionKg' } } }
        ]);
        const currentKg = agg.length > 0 ? agg[0].total : 0;
        const pct = g.targetKg > 0 ? Math.min(currentKg / g.targetKg, 1) : 0;
        totalPct += pct;
      }
      const avgPct = totalPct / allGoals.length;
      envScore = Math.round((1 - avgPct) * 100);
    }

    const totalParticipations = await Participation.countDocuments();
    const approvedParticipations = await Participation.countDocuments({ approvalStatus: 'approved' });
    const socialScore = totalParticipations > 0 ? Math.round((approvedParticipations / totalParticipations) * 100) : 50;

    const totalPolicies = await Policy.countDocuments();
    let govScore = 50;
    if (totalPolicies > 0) {
      const totalEmployeesCount = await User.countDocuments({ role: { $ne: 'admin' } });
      if (totalEmployeesCount > 0) {
        let totalAcks = 0;
        const policies = await Policy.find();
        for (const p of policies) {
          totalAcks += await PolicyAcknowledgement.countDocuments({ policy: p._id, status: 'acknowledged' });
        }
        const totalPossible = totalPolicies * totalEmployeesCount;
        govScore = totalPossible > 0 ? Math.round((totalAcks / totalPossible) * 100) : 50;
      }
    }

    const carbonByScope = await CarbonTransaction.aggregate([
      { $group: { _id: '$scope', totalKg: { $sum: '$emissionKg' } } },
      { $project: { scope: '$_id', totalKg: { $round: ['$totalKg', 2] }, _id: 0 } }
    ]);

    res.json({
      totalCarbonKg,
      carbonByDept: carbonByDept.map(c => ({ dept: c.dept || 'Unknown', totalKg: c.totalKg })),
      carbonByScope: carbonByScope.map(s => ({ scope: s.scope, totalKg: s.totalKg })),
      activeGoals,
      goalsOnTrack,
      activeChallenges,
      csrActivitiesThisMonth,
      totalEmployees,
      complianceIssuesOpen,
      complianceIssuesOverdue,
      topBadgeHolders,
      carbonTrend,
      esgScores: {
        environmental: Math.min(envScore, 100),
        social: Math.min(socialScore, 100),
        governance: Math.min(govScore, 100)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const CarbonTransaction = require('../models/CarbonTransaction');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const Department = require('../models/Department');
const User = require('../models/User');
const CsrActivity = require('../models/CsrActivity');
const Participation = require('../models/Participation');
const Challenge = require('../models/Challenge');
const ChallengeParticipation = require('../models/ChallengeParticipation');
const ComplianceIssue = require('../models/ComplianceIssue');
const Policy = require('../models/Policy');
const PolicyAcknowledgement = require('../models/PolicyAcknowledgement');
const EmployeeBadge = require('../models/EmployeeBadge');

async function buildEsgContext() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // --- ENVIRONMENTAL ---
  const allTransactions = await CarbonTransaction.find()
    .populate('department', 'name')
    .populate('emissionFactor', 'name unit factorValue')
    .lean();

  const totalCarbonKg = allTransactions.reduce((s, t) => s + (t.emissionKg || 0), 0);

  // Carbon by department
  const carbonByDept = {};
  for (const t of allTransactions) {
    const dname = t.department?.name || 'Unknown';
    carbonByDept[dname] = (carbonByDept[dname] || 0) + (t.emissionKg || 0);
  }

  // Carbon last 30 days vs previous 30 days
  const last30 = allTransactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
  const prev30 = allTransactions.filter(t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo);
  const last30Total = last30.reduce((s, t) => s + (t.emissionKg || 0), 0);
  const prev30Total = prev30.reduce((s, t) => s + (t.emissionKg || 0), 0);

  // Carbon by department for last 30 days
  const carbonByDeptLast30 = {};
  for (const t of last30) {
    const dname = t.department?.name || 'Unknown';
    carbonByDeptLast30[dname] = (carbonByDeptLast30[dname] || 0) + (t.emissionKg || 0);
  }

  // Carbon by source
  const carbonBySource = {};
  for (const t of allTransactions) {
    carbonBySource[t.source] = (carbonBySource[t.source] || 0) + (t.emissionKg || 0);
  }

  // Sustainability goals
  const goals = await SustainabilityGoal.find().populate('department', 'name').lean();
  const goalsSummary = goals.map(g => ({
    name: g.name,
    department: g.department?.name,
    targetKg: g.targetKg,
    status: g.status,
    periodStart: g.periodStart,
    periodEnd: g.periodEnd
  }));

  // --- SOCIAL ---
  const totalEmployees = await User.countDocuments({ role: 'employee' });
  
  const allParticipations = await Participation.find()
    .populate('activity', 'name pointsValue')
    .populate('employee', 'name department')
    .lean();
  
  const approvedParticipations = allParticipations.filter(p => p.approvalStatus === 'approved');
  const participationRate = totalEmployees > 0 
    ? Math.round((new Set(approvedParticipations.map(p => p.employee?._id?.toString())).size / totalEmployees) * 100) 
    : 0;

  const csrActivities = await CsrActivity.find().lean();
  const csrByStatus = {};
  for (const a of csrActivities) {
    csrByStatus[a.status] = (csrByStatus[a.status] || 0) + 1;
  }

  const challengeParticipations = await ChallengeParticipation.find()
    .populate('challenge', 'name xpValue status')
    .populate('employee', 'name')
    .lean();
  
  const approvedChallenges = challengeParticipations.filter(p => p.approvalStatus === 'approved');
  const totalXpAwarded = approvedChallenges.reduce((s, p) => s + (p.xpAwarded || 0), 0);

  const challenges = await Challenge.find().lean();
  const challengesByStatus = {};
  for (const c of challenges) {
    challengesByStatus[c.status] = (challengesByStatus[c.status] || 0) + 1;
  }

  // Top employees by XP
  const topEmployees = await User.find({ role: 'employee' })
    .sort({ totalXp: -1 })
    .limit(5)
    .populate('department', 'name')
    .lean();

  const topEmployeesSummary = topEmployees.map((e, i) => ({
    rank: i + 1,
    name: e.name,
    department: e.department?.name,
    xp: e.totalXp
  }));

  // Badges
  const totalBadgesAwarded = await EmployeeBadge.countDocuments();

  // --- GOVERNANCE ---
  const policies = await Policy.find().lean();
  const acknowledgements = await PolicyAcknowledgement.find().lean();
  const acknowledgedCount = acknowledgements.filter(a => a.status === 'acknowledged').length;
  const totalPossibleAck = policies.length * totalEmployees;
  const ackRate = totalPossibleAck > 0 ? Math.round((acknowledgedCount / totalPossibleAck) * 100) : 0;

  const complianceIssues = await ComplianceIssue.find()
    .populate('owner', 'name')
    .lean();
  
  const issuesByStatus = {};
  const issuesBySeverity = {};
  let overdueCount = 0;
  
  for (const issue of complianceIssues) {
    issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
    if (new Date(issue.dueDate) < now && issue.status !== 'resolved') overdueCount++;
  }

  // --- ESG SCORES ---
  const envScore = goals.length > 0
    ? Math.min(100, Math.round(goals.filter(g => g.status === 'on_track').length / goals.length * 100))
    : 50;
  
  const socialScore = Math.min(100, participationRate);
  
  const govScore = ackRate;

  const totalScore = Math.round(envScore * 0.4 + socialScore * 0.3 + govScore * 0.3);

  return {
    generatedAt: now.toISOString(),
    environmental: {
      totalCarbonKg: Math.round(totalCarbonKg * 100) / 100,
      carbonByDepartment: carbonByDept,
      carbonLast30Days: Math.round(last30Total * 100) / 100,
      carbonPrev30Days: Math.round(prev30Total * 100) / 100,
      carbonTrend: last30Total > prev30Total ? 'increasing' : last30Total < prev30Total ? 'decreasing' : 'stable',
      carbonByDeptLast30Days: carbonByDeptLast30,
      carbonBySource,
      sustainabilityGoals: goalsSummary,
      totalTransactions: allTransactions.length
    },
    social: {
      totalEmployees,
      participationRate: `${participationRate}%`,
      approvedParticipations: approvedParticipations.length,
      csrActivitiesByStatus: csrByStatus,
      challengesByStatus,
      totalXpAwarded,
      totalBadgesAwarded,
      topEmployeesByXp: topEmployeesSummary
    },
    governance: {
      totalPolicies: policies.length,
      policyAcknowledgementRate: `${ackRate}%`,
      complianceIssuesByStatus: issuesByStatus,
      complianceIssuesBySeverity: issuesBySeverity,
      overdueIssues: overdueCount
    },
    esgScores: {
      environmental: envScore,
      social: socialScore,
      governance: govScore,
      total: totalScore,
      breakdown: 'Environmental 40% + Social 30% + Governance 30%'
    }
  };
}

module.exports = { buildEsgContext };

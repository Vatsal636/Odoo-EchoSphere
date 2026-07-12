const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('../models/Department');
const EmissionFactor = require('../models/EmissionFactor');
const CarbonTransaction = require('../models/CarbonTransaction');
const SustainabilityGoal = require('../models/SustainabilityGoal');
const Category = require('../models/Category');
const CsrActivity = require('../models/CsrActivity');
const Participation = require('../models/Participation');
const Challenge = require('../models/Challenge');
const ChallengeParticipation = require('../models/ChallengeParticipation');
const Badge = require('../models/Badge');
const EmployeeBadge = require('../models/EmployeeBadge');
const Reward = require('../models/Reward');
const Policy = require('../models/Policy');
const PolicyAcknowledgement = require('../models/PolicyAcknowledgement');
const ComplianceIssue = require('../models/ComplianceIssue');
const User = require('../models/User');
const { checkAndAwardBadges } = require('../utils/badgeHelper');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear all data
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
  console.log('Cleared all collections');

  // Create departments
  const engineering = await Department.create({ name: 'Engineering', code: 'ENG', status: 'active' });
  const operations = await Department.create({ name: 'Operations', code: 'OPS', status: 'active' });
  const hr = await Department.create({ name: 'HR', code: 'HR', status: 'active' });
  console.log('Departments created');

  // Create users
  const admin = await User.create({ name: 'Alex Admin', email: 'admin@ecosphere.com', password: 'password123', role: 'admin' });
  const manager = await User.create({ name: 'Maya Manager', email: 'manager@ecosphere.com', password: 'password123', role: 'manager', department: operations._id });
  const alice = await User.create({ name: 'Alice Chen', email: 'alice@ecosphere.com', password: 'password123', role: 'employee', department: engineering._id, totalXp: 850 });
  const bob = await User.create({ name: 'Bob Patel', email: 'bob@ecosphere.com', password: 'password123', role: 'employee', department: operations._id, totalXp: 620 });
  const carol = await User.create({ name: 'Carol Singh', email: 'carol@ecosphere.com', password: 'password123', role: 'employee', department: hr._id, totalXp: 410 });
  const david = await User.create({ name: 'David Kim', email: 'david@ecosphere.com', password: 'password123', role: 'employee', department: engineering._id, totalXp: 290 });
  const eve = await User.create({ name: 'Eve Thomas', email: 'eve@ecosphere.com', password: 'password123', role: 'employee', department: operations._id, totalXp: 150 });

  // Update department heads
  engineering.head = admin._id; await engineering.save();
  operations.head = manager._id; await operations.save();
  hr.head = admin._id; await hr.save();
  console.log('Users created');

  // Emission factors
  const electricity = await EmissionFactor.create({ name: 'Electricity', category: 'energy', factorValue: 0.233, unit: 'kWh', description: 'Grid electricity consumption' });
  const travel = await EmissionFactor.create({ name: 'Business Travel', category: 'transport', factorValue: 0.255, unit: 'km', description: 'Business travel by car' });
  const heating = await EmissionFactor.create({ name: 'Office Heating', category: 'energy', factorValue: 2.04, unit: 'm3', description: 'Natural gas heating' });
  const paper = await EmissionFactor.create({ name: 'Paper', category: 'waste', factorValue: 0.919, unit: 'kg', description: 'Paper consumption' });
  const fleet = await EmissionFactor.create({ name: 'Fleet', category: 'transport', factorValue: 0.171, unit: 'km', description: 'Company fleet vehicles' });
  console.log('Emission factors created');

  // Carbon transactions - 15 spread across 3 departments over 60 days
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const txData = [
    { name: 'Q1 Electricity Bill', dept: engineering, factor: electricity, qty: 4500, date: daysAgo(55), src: 'purchase' },
    { name: 'Travel to Client A', dept: engineering, factor: travel, qty: 320, date: daysAgo(50), src: 'expense' },
    { name: 'Office Heating Jan', dept: engineering, factor: heating, qty: 85, date: daysAgo(45), src: 'manual' },
    { name: 'Fleet Fuel Jan', dept: operations, factor: fleet, qty: 1200, date: daysAgo(48), src: 'fleet' },
    { name: 'Operations Travel', dept: operations, factor: travel, qty: 450, date: daysAgo(42), src: 'expense' },
    { name: 'Warehouse Electricity', dept: operations, factor: electricity, qty: 3200, date: daysAgo(38), src: 'purchase' },
    { name: 'Paper Procurement Q1', dept: operations, factor: paper, qty: 150, date: daysAgo(35), src: 'purchase' },
    { name: 'HR Office Electricity', dept: hr, factor: electricity, qty: 800, date: daysAgo(40), src: 'purchase' },
    { name: 'HR Travel', dept: hr, factor: travel, qty: 200, date: daysAgo(30), src: 'expense' },
    { name: 'Heating Feb', dept: hr, factor: heating, qty: 40, date: daysAgo(25), src: 'manual' },
    { name: 'Electricity March', dept: engineering, factor: electricity, qty: 4200, date: daysAgo(15), src: 'purchase' },
    { name: 'Fleet Feb', dept: operations, factor: fleet, qty: 1100, date: daysAgo(12), src: 'fleet' },
    { name: 'Paper Usage', dept: hr, factor: paper, qty: 50, date: daysAgo(10), src: 'purchase' },
    { name: 'Travel to Client B', dept: engineering, factor: travel, qty: 280, date: daysAgo(5), src: 'expense' },
    { name: 'March Fleet', dept: operations, factor: fleet, qty: 950, date: daysAgo(2), src: 'fleet' },
  ];

  for (const tx of txData) {
    const factor = await EmissionFactor.findById(tx.factor._id || tx.factor);
    const emissionKg = tx.qty * factor.factorValue;
    await CarbonTransaction.create({
      name: tx.name,
      department: tx.dept._id || tx.dept,
      emissionFactor: tx.factor._id || tx.factor,
      quantity: tx.qty,
      emissionKg,
      date: tx.date,
      source: tx.src,
      createdBy: admin._id
    });
  }
  console.log('Carbon transactions created');

  // Sustainability goals
  const thisYear = now.getFullYear();
  await SustainabilityGoal.create({ name: 'Reduce Engineering Carbon', department: engineering._id, targetKg: 1500, periodStart: new Date(thisYear, 0, 1), periodEnd: new Date(thisYear, 11, 31) });
  await SustainabilityGoal.create({ name: 'Operations Efficiency', department: operations._id, targetKg: 2000, periodStart: new Date(thisYear, 0, 1), periodEnd: new Date(thisYear, 11, 31) });
  await SustainabilityGoal.create({ name: 'HR Sustainability', department: hr._id, targetKg: 500, periodStart: new Date(thisYear, 0, 1), periodEnd: new Date(thisYear, 11, 31) });
  console.log('Sustainability goals created');

  // Categories
  const csrCat = await Category.create({ name: 'Environmental', type: 'csr', status: 'active' });
  const challengeCat = await Category.create({ name: 'Sustainability', type: 'challenge', status: 'active' });
  console.log('Categories created');

  // CSR Activities
  const treePlantation = await CsrActivity.create({
    name: 'Tree Plantation Drive', category: csrCat._id, description: 'Plant trees in the community park', date: daysAgo(20), pointsValue: 150, maxParticipants: 50, status: 'completed', organizer: admin._id
  });
  const beachCleanup = await CsrActivity.create({
    name: 'Beach Cleanup', category: csrCat._id, description: 'Clean up the local beach area', date: daysAgo(10), pointsValue: 200, maxParticipants: 30, status: 'completed', organizer: manager._id
  });
  await CsrActivity.create({
    name: 'Carbon Awareness Workshop', category: csrCat._id, description: 'Workshop on carbon footprint reduction', date: daysAgo(-5), pointsValue: 100, maxParticipants: 40, status: 'ongoing', organizer: admin._id
  });
  await CsrActivity.create({
    name: 'Cycle to Work Week', category: csrCat._id, description: 'Encourage cycling to work', date: daysAgo(-20), pointsValue: 120, maxParticipants: 60, status: 'upcoming', organizer: manager._id
  });
  console.log('CSR activities created');

  // Participations
  const p1 = await Participation.create({
    activity: treePlantation._id, employee: alice._id, approvalStatus: 'approved', pointsEarned: 150, completionDate: daysAgo(18), reviewer: manager._id
  });
  const p2 = await Participation.create({
    activity: treePlantation._id, employee: bob._id, approvalStatus: 'approved', pointsEarned: 150, completionDate: daysAgo(18), reviewer: manager._id
  });
  const p3 = await Participation.create({
    activity: beachCleanup._id, employee: carol._id, approvalStatus: 'approved', pointsEarned: 200, completionDate: daysAgo(8), reviewer: manager._id
  });
  console.log('Participations created');

  // Update XP for participations
  alice.totalXp += 150; await alice.save();
  bob.totalXp += 150; await bob.save();
  carol.totalXp += 200; await carol.save();
  console.log('XP updated from participations');

  // Challenges
  const zw = await Challenge.create({ name: 'Zero Waste Week', category: challengeCat._id, description: 'Produce zero waste for a week', xpValue: 300, difficulty: 'hard', evidenceRequired: true, deadline: daysAgo(-30), status: 'active' });
  const gc = await Challenge.create({ name: 'Green Commute Month', category: challengeCat._id, description: 'Use eco-friendly commute for a month', xpValue: 200, difficulty: 'medium', evidenceRequired: false, deadline: daysAgo(-45), status: 'active' });
  const ea = await Challenge.create({ name: 'Energy Audit', category: challengeCat._id, description: 'Conduct an energy audit of your home', xpValue: 150, difficulty: 'easy', evidenceRequired: true, deadline: daysAgo(-15), status: 'under_review' });
  const pt = await Challenge.create({ name: 'Plant a Tree', category: challengeCat._id, description: 'Plant a tree in your neighborhood', xpValue: 100, difficulty: 'easy', evidenceRequired: false, deadline: daysAgo(-60), status: 'completed' });
  await Challenge.create({ name: 'Paperless Office', category: challengeCat._id, description: 'Go paperless for a month', xpValue: 250, difficulty: 'medium', evidenceRequired: false, deadline: daysAgo(-60), status: 'draft' });
  console.log('Challenges created');

  // Challenge participations
  await ChallengeParticipation.create({ challenge: zw._id, employee: alice._id, progress: 80, approvalStatus: 'pending', submissionDate: new Date() });
  await ChallengeParticipation.create({ challenge: gc._id, employee: bob._id, progress: 60, approvalStatus: 'pending' });
  await ChallengeParticipation.create({ challenge: ea._id, employee: david._id, progress: 100, approvalStatus: 'pending', proofUrl: 'https://example.com/audit.pdf', submissionDate: new Date() });
  await ChallengeParticipation.create({ challenge: pt._id, employee: alice._id, progress: 100, approvalStatus: 'approved', xpAwarded: 100, submissionDate: daysAgo(55) });
  await ChallengeParticipation.create({ challenge: pt._id, employee: eve._id, progress: 100, approvalStatus: 'approved', xpAwarded: 100, submissionDate: daysAgo(55) });
  console.log('Challenge participations created');

  // Update XP for completed challenges
  alice.totalXp += 100; await alice.save();  // Plant a Tree
  eve.totalXp += 100; await eve.save();       // Plant a Tree
  console.log('XP updated from challenges');

  // Badges
  const gs = await Badge.create({ name: 'Green Starter', description: 'Earn 100 XP', unlockType: 'xp_threshold', unlockValue: 100, active: true });
  const ew = await Badge.create({ name: 'Eco Warrior', description: 'Earn 300 XP', unlockType: 'xp_threshold', unlockValue: 300, active: true });
  const sc = await Badge.create({ name: 'Sustainability Champion', description: 'Earn 500 XP', unlockType: 'xp_threshold', unlockValue: 500, active: true });
  const el = await Badge.create({ name: 'ESG Leader', description: 'Earn 1000 XP', unlockType: 'xp_threshold', unlockValue: 1000, active: true });
  const cm = await Badge.create({ name: 'Challenge Master', description: 'Complete 3 challenges', unlockType: 'challenge_count', unlockValue: 3, active: true });
  console.log('Badges created');

  // Award badges based on XP
  const allUsers = [alice, bob, carol, david, eve];
  for (const user of allUsers) {
    await checkAndAwardBadges(user._id);
  }
  console.log('Badges awarded');

  // Rewards
  await Reward.create({ name: 'Eco-Friendly Water Bottle', description: 'Stainless steel, 500ml', pointsRequired: 200, stock: 10 });
  await Reward.create({ name: 'Sustainable Tote Bag', description: 'Organic cotton tote bag', pointsRequired: 350, stock: 15 });
  await Reward.create({ name: 'Gift Card $50', description: 'Amazon gift card', pointsRequired: 500, stock: 5 });
  await Reward.create({ name: 'Premium Lunch Box', description: 'Bamboo fiber lunch box set', pointsRequired: 150, stock: 20 });
  console.log('Rewards created');

  // Policies
  const policy1 = await Policy.create({ name: 'Environmental Policy', content: 'All employees must adhere to the company environmental policy including waste segregation, energy conservation, and sustainable commuting practices.', effectiveDate: new Date(thisYear, 0, 1) });
  const policy2 = await Policy.create({ name: 'Code of Conduct', content: 'The code of conduct outlines the ethical standards expected of all employees regarding environmental responsibility and social impact.', effectiveDate: new Date(thisYear, 1, 1) });
  console.log('Policies created');

  // Policy acknowledgements
  await PolicyAcknowledgement.create({ policy: policy1._id, employee: alice._id, status: 'acknowledged', acknowledgedDate: new Date() });
  await PolicyAcknowledgement.create({ policy: policy1._id, employee: bob._id, status: 'acknowledged', acknowledgedDate: new Date() });
  console.log('Policy acknowledgements created');

  // Compliance issues
  await ComplianceIssue.create({
    name: 'Waste Segregation Audit Finding',
    description: 'Improper waste segregation observed in cafeteria',
    severity: 'high',
    owner: bob._id,
    dueDate: daysAgo(5),
    status: 'open'
  });
  await ComplianceIssue.create({
    name: 'Energy Consumption Reporting',
    description: 'Monthly energy report not submitted for last quarter',
    severity: 'medium',
    owner: alice._id,
    dueDate: daysAgo(-5),
    status: 'in_progress'
  });
  await ComplianceIssue.create({
    name: 'Supplier Sustainability Assessment',
    description: 'Complete sustainability assessment for top 5 suppliers',
    severity: 'low',
    owner: carol._id,
    dueDate: daysAgo(-30),
    status: 'resolved'
  });
  console.log('Compliance issues created');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Login credentials:');
  console.log('  admin@ecosphere.com / password123 (admin)');
  console.log('  manager@ecosphere.com / password123 (manager)');
  console.log('  alice@ecosphere.com / password123 (employee)');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

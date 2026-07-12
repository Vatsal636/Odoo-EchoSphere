const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const emissionFactorRoutes = require('./routes/emissionFactors');
const carbonTransactionRoutes = require('./routes/carbonTransactions');
const sustainabilityGoalRoutes = require('./routes/sustainabilityGoals');
const csrActivityRoutes = require('./routes/csrActivities');
const participationRoutes = require('./routes/participations');
const challengeRoutes = require('./routes/challenges');
const challengeParticipationRoutes = require('./routes/challengeParticipations');
const badgeRoutes = require('./routes/badges');
const rewardRoutes = require('./routes/rewards');
const policyRoutes = require('./routes/policies');
const categoryRoutes = require('./routes/categories');
const complianceIssueRoutes = require('./routes/complianceIssues');
const leaderboardRoutes = require('./routes/leaderboard');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');
const vendorRoutes = require('./routes/vendors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/emission-factors', emissionFactorRoutes);
app.use('/api/carbon-transactions', carbonTransactionRoutes);
app.use('/api/sustainability-goals', sustainabilityGoalRoutes);
app.use('/api/csr-activities', csrActivityRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/challenge-participations', challengeParticipationRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/compliance-issues', complianceIssueRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vendors', vendorRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

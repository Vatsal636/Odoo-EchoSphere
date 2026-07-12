const User = require('../models/User');
const Badge = require('../models/Badge');
const EmployeeBadge = require('../models/EmployeeBadge');
const ChallengeParticipation = require('../models/ChallengeParticipation');

async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  const alreadyAwarded = await EmployeeBadge.find({ employee: userId }).distinct('badge');
  const badges = await Badge.find({ active: true, _id: { $nin: alreadyAwarded } });
  const challengeCount = await ChallengeParticipation.countDocuments({
    employee: userId, approvalStatus: 'approved'
  });
  for (const badge of badges) {
    let unlock = false;
    if (badge.unlockType === 'xp_threshold' && user.totalXp >= badge.unlockValue) unlock = true;
    if (badge.unlockType === 'challenge_count' && challengeCount >= badge.unlockValue) unlock = true;
    if (unlock) {
      await EmployeeBadge.create({ employee: userId, badge: badge._id, awardedReason: `Auto-awarded: ${badge.name}` });

      const { notifyUser } = require('./notificationService');

      await notifyUser({
        userId: userId, // whatever variable holds the user's ID in this function
        type: 'badge_earned',
        title: 'New Badge Earned! 🏆',
        message: `You've earned the "${badge.name}" badge. Keep up the great work!`,
        link: '/gamification/badges'
      });
    }
  }
}

module.exports = { checkAndAwardBadges };

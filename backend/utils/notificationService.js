const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

// One HTML template per notification type — keep it simple, inline styles
// since most email clients strip <style> blocks.
const emailTemplates = {
  compliance_assigned: (n) => wrap('New Compliance Issue Assigned', n.message, n.link),
  goal_at_risk: (n) => wrap('Sustainability Goal At Risk', n.message, n.link),
  challenge_approved: (n) => wrap('Challenge Submission Approved', n.message, n.link),
  challenge_rejected: (n) => wrap('Challenge Submission Update', n.message, n.link),
  badge_earned: (n) => wrap('New Badge Earned! 🏆', n.message, n.link),
  policy_pending: (n) => wrap('Policy Acknowledgement Required', n.message, n.link),
  reward_redeemed: (n) => wrap('Reward Redemption Update', n.message, n.link),
  general: (n) => wrap(n.title, n.message, n.link)
};

function wrap(heading, message, link) {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #16a34a;">${heading}</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">${message}</p>
      ${link ? `<a href="${appUrl}${link}" style="display:inline-block;margin-top:12px;padding:10px 18px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;">View in EcoSphere</a>` : ''}
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">EcoSphere — Sustainability & ESG Platform</p>
    </div>
  `;
}

/**
 * Creates an in-app notification for a user, and (by default) emails them too.
 * Use this everywhere instead of calling Notification.create() directly, so
 * email delivery stays consistent.
 *
 * @param {Object} opts
 * @param {string} opts.userId
 * @param {string} opts.type - one of the Notification schema enum values
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.link] - frontend path to deep-link to, e.g. '/governance/compliance'
 * @param {boolean} [opts.sendEmailToo=true]
 */
async function notifyUser({ userId, type = 'general', title, message, link, sendEmailToo = true }) {
  const notification = await Notification.create({ user: userId, type, title, message, link });

  if (sendEmailToo) {
    const user = await User.findById(userId).select('email name');
    if (user?.email) {
      const html = (emailTemplates[type] || emailTemplates.general)(notification);
      const result = await sendEmail({ to: user.email, subject: title, html });
      if (result.sent) {
        notification.emailSent = true;
        await notification.save();
      }
    }
  }

  return notification;
}

/**
 * Convenience for notifying multiple users at once (e.g. "new policy published"
 * to every employee). Runs sequentially to avoid hammering the SMTP server.
 */
async function notifyUsers({ userIds, type, title, message, link, sendEmailToo = true }) {
  const results = [];
  for (const userId of userIds) {
    results.push(await notifyUser({ userId, type, title, message, link, sendEmailToo }));
  }
  return results;
}

module.exports = { notifyUser, notifyUsers };

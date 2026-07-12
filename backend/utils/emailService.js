const nodemailer = require('nodemailer');

let transporter = null;
let warnedOnce = false;

/**
 * Lazily creates (and caches) the SMTP transporter.
 * Returns null if SMTP env vars are missing — callers should handle that
 * gracefully rather than crash the app (useful for local dev without email set up).
 */
function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedOnce) {
      console.warn('[emailService] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — emails will be logged, not sent.');
      warnedOnce = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  return transporter;
}

/**
 * Sends an email. Never throws — returns { sent: boolean, reason?: string }
 * so calling code (e.g. inside a POST route) never gets blocked by email failures.
 */
async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();

  if (!t) {
    console.log(`[emailService] (DEV MODE) Would send email to ${to}: "${subject}"`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || '"EcoSphere" <no-reply@ecosphere.local>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '')
    });
    return { sent: true };
  } catch (err) {
    console.error('[emailService] Failed to send email:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendEmail };

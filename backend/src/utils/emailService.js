const logger = require('./logger');

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
const getApiUrl = () => (process.env.PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const buildEmailVerificationUrl = (token) => `${getApiUrl()}/pelanggan/verify-email?token=${encodeURIComponent(token)}`;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return { sent: false, reason: 'missing-recipient' };

  try {
    // Nodemailer is optional at runtime so local development can still run without SMTP.
    // Install dependencies and set SMTP_* env vars to enable real delivery.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const nodemailer = require('nodemailer');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email delivery skipped because SMTP env is not configured', { to, subject });
      return { sent: false, reason: 'smtp-not-configured' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });

    return { sent: true };
  } catch (error) {
    logger.warn('Email delivery skipped or failed', { to, subject, error: error.message });
    return { sent: false, reason: error.message };
  }
};

const sendVerificationEmail = async ({ user, token }) => {
  const verificationUrl = buildEmailVerificationUrl(token);
  const appUrl = getFrontendUrl();

  const result = await sendEmail({
    to: user.email,
    subject: 'Verifikasi Email Akun SIGAP',
    text: [
      `Halo ${user.nama_lengkap},`,
      '',
      'Terima kasih sudah mendaftar di SIGAP.',
      `Buka tautan berikut untuk memverifikasi email Anda: ${verificationUrl}`,
      '',
      `Setelah email terverifikasi, Anda dapat masuk melalui ${appUrl}.`
    ].join('\n'),
    html: `
      <p>Halo ${user.nama_lengkap},</p>
      <p>Terima kasih sudah mendaftar di SIGAP.</p>
      <p><a href="${verificationUrl}">Klik di sini untuk verifikasi email Anda</a>.</p>
      <p>Setelah email terverifikasi, Anda dapat masuk melalui <a href="${appUrl}">${appUrl}</a>.</p>
    `
  });

  if (!result.sent) {
    logger.info('Development email verification link', {
      user_id: user.id,
      email: user.email,
      verification_url: verificationUrl,
      reason: result.reason
    });
  }

  return {
    ...result,
    verificationUrl
  };
};

module.exports = {
  buildEmailVerificationUrl,
  sendVerificationEmail
};

// Fungsi: Middleware backend untuk memproses request sebelum controller.
const rateLimit = require('express-rate-limit');

const { ipKeyGenerator } = rateLimit;

const isProduction = process.env.NODE_ENV === 'production';

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const createLimiter = ({
  windowMs,
  limit,
  skipSuccessfulRequests = false,
  keyGenerator,
  message = 'Terlalu banyak percobaan. Silakan coba lagi nanti.'
}) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests,
  keyGenerator,
  handler: (req, res) => res.status(429).json({
    success: false,
    message
  })
});

const getIpKey = (req) => ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown');

const getIdentifierKey = (req, fieldNames = ['identifier']) => {
  const identifier = fieldNames
    .map((field) => req.body?.[field] || req.query?.[field])
    .find(Boolean);

  return String(identifier || 'tanpa-identifier').trim().toLowerCase();
};

const generalLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.GENERAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: toPositiveNumber(process.env.GENERAL_RATE_LIMIT, isProduction ? 300 : 3000)
});

const authLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: toPositiveNumber(process.env.AUTH_RATE_LIMIT, isProduction ? 5 : 100),
  skipSuccessfulRequests: true
});

const forgotPasswordLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: toPositiveNumber(process.env.FORGOT_PASSWORD_RATE_LIMIT, isProduction ? 5 : 50),
  message: 'Permintaan terlalu sering. Silakan coba lagi beberapa menit lagi.'
});

const pelangganPublicLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.PELANGGAN_PUBLIC_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: toPositiveNumber(process.env.PELANGGAN_PUBLIC_RATE_LIMIT, isProduction ? 120 : 1200),
  keyGenerator: getIpKey
});

const pelangganLoginLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.PELANGGAN_LOGIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: toPositiveNumber(process.env.PELANGGAN_LOGIN_RATE_LIMIT, isProduction ? 5 : 100),
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${getIpKey(req)}:${getIdentifierKey(req, ['identifier', 'email'])}`,
  message: 'Percobaan login terlalu sering. Silakan coba lagi 15 menit kemudian.'
});

const pelangganRegisterLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.PELANGGAN_REGISTER_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  limit: toPositiveNumber(process.env.PELANGGAN_REGISTER_RATE_LIMIT, isProduction ? 3 : 30),
  keyGenerator: getIpKey,
  message: 'Pendaftaran terlalu sering dari koneksi ini. Silakan coba lagi nanti.'
});

const pelangganReportLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.PELANGGAN_REPORT_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  limit: toPositiveNumber(process.env.PELANGGAN_REPORT_RATE_LIMIT, isProduction ? 10 : 100),
  keyGenerator: (req) => `${getIpKey(req)}:${req.user?.id || 'anonim'}`,
  message: 'Pengiriman laporan terlalu sering. Silakan coba lagi nanti.'
});

const pelangganCommentLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.PELANGGAN_COMMENT_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  limit: toPositiveNumber(process.env.PELANGGAN_COMMENT_RATE_LIMIT, isProduction ? 20 : 200),
  keyGenerator: (req) => `${getIpKey(req)}:${req.user?.id || 'anonim'}`,
  message: 'Komentar terlalu sering. Silakan coba lagi nanti.'
});

module.exports = {
  generalLimiter,
  authLimiter,
  forgotPasswordLimiter,
  pelangganPublicLimiter,
  pelangganLoginLimiter,
  pelangganRegisterLimiter,
  pelangganReportLimiter,
  pelangganCommentLimiter
};

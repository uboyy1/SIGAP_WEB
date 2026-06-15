// API Pelanggan - SIGAP: Middleware autentikasi, otorisasi, dan CSRF pelanggan.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Laporan } = require('../models');

const SESSION_EXPIRED_MESSAGE = 'Sesi habis, silakan login ulang';

const unauthorized = (res) => res.status(401).json({
  success: false,
  message: SESSION_EXPIRED_MESSAGE
});

const getBearerToken = (req) => {
  const authorization = req.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.split(' ')[1] : null;
};

const protectPelanggan = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) return unauthorized(res);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return unauthorized(res);

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun pelanggan tidak aktif. Silakan hubungi admin.'
      });
    }

    req.user = user;
    req.authToken = token;
    return next();
  } catch (error) {
    console.error('Pelanggan auth error:', error.message);
    return unauthorized(res);
  }
};

const optionalPelangganAuth = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (user?.role === 'pelanggan' && user.is_active) {
      req.user = user;
      req.authToken = token;
    }
  } catch (error) {
    console.error('Optional pelanggan auth ignored:', error.message);
  }

  return next();
};

const pelangganOnly = (req, res, next) => {
  if (req.user?.role === 'pelanggan') return next();

  return res.status(403).json({
    success: false,
    message: 'Akses ditolak. Endpoint ini khusus pelanggan.'
  });
};

const createPelangganCsrfToken = (userId, authToken) => {
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'sigap-csrf-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${userId}:${authToken}`)
    .digest('hex');
};

const issuePelangganCsrfToken = (req, res) => res.status(200).json({
  success: true,
  data: {
    csrf_token: createPelangganCsrfToken(req.user.id, req.authToken)
  }
});

const verifyPelangganCsrfToken = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const providedToken = req.get('x-csrf-token') || '';
  const expectedToken = createPelangganCsrfToken(req.user.id, req.authToken || getBearerToken(req) || '');

  const providedBuffer = Buffer.from(providedToken);
  const expectedBuffer = Buffer.from(expectedToken);

  if (
    providedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Sesi keamanan tidak valid. Muat ulang halaman lalu coba lagi.'
  });
};

const ownLaporanOnly = async (req, res, next) => {
  try {
    const laporan = await Laporan.findOne({
      where: {
        id: req.params.id,
        pelanggan_id: req.user.id
      }
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan atau bukan milik pelanggan'
      });
    }

    req.laporan = laporan;
    return next();
  } catch (error) {
    console.error('Own laporan check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  optionalPelangganAuth,
  protectPelanggan,
  pelangganOnly,
  issuePelangganCsrfToken,
  verifyPelangganCsrfToken,
  ownLaporanOnly,
  SESSION_EXPIRED_MESSAGE
};

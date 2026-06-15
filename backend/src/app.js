// Fungsi: Entry aplikasi Express yang menyusun middleware, route, dan error handler.
// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const crypto = require('crypto');
require('./config/env');
const logger = require('./utils/logger');
const { sequelize } = require('./models');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const tugasRoutes = require('./routes/tugasRoutes');
const resetPasswordRoutes = require('./routes/resetPasswordRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const kepalaTeknisiRoutes = require('./routes/kepalaTeknisiRoutes');
const aktivitasLogRoutes = require('./routes/aktivitasLogRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');
const pelangganRoutes = require('./routes/pelanggan');

const app = express();
app.set('trust proxy', 1);

// ============ MIDDLEWARE ============

const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 30000);
const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sigap-pdam.vercel.app',
  'https://sigap-vert.vercel.app',
  'https://sigapweb-production.up.railway.app'
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn('CORS blocked request', { origin });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Authorization', 'X-CSRF-Token']
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]));
  }
  return value;
};

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  req.setTimeout(requestTimeoutMs);
  res.setTimeout(requestTimeoutMs, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
        request_id: req.id
      });
    }
  });

  logger.info('Incoming request', {
    request_id: req.id,
    method: req.method,
    url: req.url,
    content_type: req.headers['content-type'],
    authorization: req.headers.authorization ? 'Bearer [hidden]' : 'none',
    origin: req.headers.origin
  });

  const originalSend = res.send;
  res.send = function sendWithLog(data) {
    logger.info('Outgoing response', {
      request_id: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: Date.now() - req._startAt
    });
    originalSend.call(this, data);
  };

  next();
});

app.use((req, res, next) => {
  req._startAt = Date.now();
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production' || process.env.REQUIRE_HTTPS === 'false') return next();

  const protocol = req.get('x-forwarded-proto') || req.protocol;
  if (protocol === 'https') return next();

  return res.status(403).json({
    success: false,
    message: 'Koneksi HTTPS wajib digunakan di production',
    request_id: req.id
  });
});

app.use((req, res, next) => {
  if (!mutatingMethods.has(req.method)) return next();

  const requestOrigin = req.get('origin') || '';
  if (!requestOrigin) return next();

  if (isAllowedOrigin(requestOrigin) || process.env.NODE_ENV !== 'production') return next();

  return res.status(403).json({
    success: false,
    message: 'Origin request tidak diizinkan',
    request_id: req.id
  });
});

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'no-referrer' }
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: logger.stream
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/profil', express.static(path.join(__dirname, '../uploads/profil')));
app.use('/uploads/laporan', express.static(path.join(__dirname, '../uploads/laporan')));

// ============ ROUTES ============

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIGAP Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        forgotPassword: 'POST /api/auth/forgot-password',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        password: 'PUT /api/auth/password'
      },
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        detail: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        resetPassword: 'POST /api/users/:id/reset-password',
        uploadPhoto: 'POST /api/users/:id/upload-photo'
      },
      admin_dashboard: {
        stats: 'GET /api/dashboard/stats',
        laporan: 'GET /api/dashboard/laporan',
        updateStatus: 'PUT /api/dashboard/laporan/:id/status'
      },
      kepala_teknisi: {
        dashboard: 'GET /api/kepala-teknisi/dashboard/stats',
        laporan_masuk: 'GET /api/kepala-teknisi/laporan-masuk',
        riwayat: 'GET /api/kepala-teknisi/riwayat-pelaporan',
        analisis: 'GET /api/kepala-teknisi/analisis-kinerja',
        laporan_darurat: 'GET /api/kepala-teknisi/laporan-darurat',
        update_darurat: 'PUT /api/kepala-teknisi/laporan-darurat/:id',
        tugas: 'GET /api/kepala-teknisi/tugas'
      },
      laporan: {
        list: 'GET /api/laporan',
        filter: 'GET /api/laporan/filter',
        stats: 'GET /api/laporan/stats',
        detail: 'GET /api/laporan/:id',
        updateStatus: 'PUT /api/laporan/:id/status',
        delete: 'DELETE /api/laporan/:id'
      },
      tugas: {
        list: 'GET /api/tugas',
        create: 'POST /api/tugas',
        assign: 'PUT /api/tugas/:id/assign',
        complete: 'PUT /api/tugas/:id/complete',
        delete: 'DELETE /api/tugas/:id'
      },
      resetPassword: {
        list: 'GET /api/reset-password',
        detail: 'GET /api/reset-password/:id',
        approve: 'PUT /api/reset-password/:id/approve',
        reject: 'PUT /api/reset-password/:id/reject'
      },
      kategori: {
        list: 'GET /api/kategori'
      },
      aktivitas_log: {
        recent: 'GET /api/aktivitas-log/recent',
        all: 'GET /api/aktivitas-log/all'
      },
      notifications: {
        recent: 'GET /api/notifications/recent',
        markRead: 'PUT /api/notifications/:id/read'
      },
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      success: true,
      message: 'Layanan berjalan normal',
      services: {
        api: 'ok',
        database: 'ok'
      },
      timestamp: new Date().toISOString(),
      request_id: req.id
    });
  } catch (error) {
    logger.error('Health check failed', { request_id: req.id, error });
    res.status(503).json({
      success: false,
      message: 'Server berjalan, tetapi layanan data belum terhubung',
      services: {
        api: 'ok',
        database: 'error'
      },
      request_id: req.id
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/tugas', tugasRoutes);
app.use('/api/reset-password', resetPasswordRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/kepala-teknisi', kepalaTeknisiRoutes);
app.use('/api/aktivitas-log', aktivitasLogRoutes);
app.use('/api/notifications', notifikasiRoutes);
app.use('/api/pelanggan', pelangganRoutes);

// ============ ERROR HANDLERS ============

app.use('*', (req, res) => {
  logger.warn('Route not found', {
    request_id: req.id,
    method: req.method,
    url: req.originalUrl
  });
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: '/api for API documentation',
    request_id: req.id
  });
});

app.use((err, req, res, next) => {
  logger.error('Global error', { request_id: req.id, error: err, method: req.method, url: req.originalUrl });

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Sesi habis, silakan login ulang',
      request_id: req.id
    });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File terlalu besar. Maksimal 2MB.',
        request_id: req.id
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      request_id: req.id
    });
  }

  if (err.message && err.message.includes('Hanya file gambar')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      request_id: req.id
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan server internal',
    request_id: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

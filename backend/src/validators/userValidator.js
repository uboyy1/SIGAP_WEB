// Fungsi: Validator request untuk memastikan input API sesuai aturan.
const { body, param, query } = require('express-validator');

const phoneValidator = body('no_telp')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Nomor telepon tidak valid');

const createUserValidator = [
  body('nama_lengkap')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Nama lengkap harus 3-100 karakter'),
  body('email')
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 }).withMessage('Password harus 8-72 karakter')
    .matches(/[A-Za-z]/).withMessage('Password harus memuat huruf')
    .matches(/[0-9]/).withMessage('Password harus memuat angka'),
  body('role')
    .isIn(['pelanggan', 'teknisi', 'kepala_teknisi', 'admin']).withMessage('Role tidak valid'),
  body('no_langganan')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('No langganan harus 3-50 karakter'),
  phoneValidator,
  body('jenis_kelamin')
    .optional({ checkFalsy: true })
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin tidak valid'),
  body('tanggal_lahir')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Tanggal lahir tidak valid')
];

const updateUserValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID user tidak valid'),
  body('nama_lengkap')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Nama lengkap harus 3-100 karakter'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(['pelanggan', 'teknisi', 'kepala_teknisi', 'admin']).withMessage('Role tidak valid'),
  body('no_langganan')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('No langganan harus 3-50 karakter'),
  phoneValidator,
  body('is_active')
    .optional()
    .isBoolean().withMessage('Status aktif harus bernilai boolean')
];

const resetUserPasswordValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID user tidak valid'),
  body('new_password')
    .isLength({ min: 8, max: 72 }).withMessage('Password baru harus 8-72 karakter')
    .matches(/[A-Za-z]/).withMessage('Password baru harus memuat huruf')
    .matches(/[0-9]/).withMessage('Password baru harus memuat angka')
];

const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page tidak valid'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus 1-100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Pencarian terlalu panjang'),
  query('role').optional().trim().isLength({ max: 30 }).withMessage('Role tidak valid'),
  query('status').optional().isIn(['', 'Semua', 'Semua Status', 'Aktif', 'Tidak Aktif', 'active', 'inactive']).withMessage('Status tidak valid')
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  resetUserPasswordValidator,
  listUsersValidator
};

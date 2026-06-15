// API Pelanggan - SIGAP: Validator request pelanggan.
const { body } = require('express-validator');

const forbiddenUsernameWords = [
  'anjing',
  'asu',
  'babi',
  'bajingan',
  'bangsat',
  'goblok',
  'idiot',
  'jancok',
  'jancuk',
  'kampret',
  'kimak',
  'kontol',
  'memek',
  'ngentot',
  'pepek',
  'peler',
  'tai',
  'tolol'
];

const hasForbiddenUsernameWord = (value = '') => {
  const normalized = String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
  return forbiddenUsernameWords.some((word) => normalized.includes(word));
};

const phoneRule = () => body('no_telp')
  .trim()
  .matches(/^(?:\+?62|0)?8\d{8,11}$/).withMessage('Nomor telepon harus nomor Indonesia yang valid');

const optionalPhoneRule = (field = 'no_telp') => body(field)
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^(?:\+?62|0)?8\d{8,11}$/).withMessage('Nomor telepon harus nomor Indonesia yang valid');

const passwordRule = body('password')
  .isLength({ min: 8, max: 72 }).withMessage('Password harus 8-72 karakter')
  .matches(/[A-Za-z]/).withMessage('Password harus memuat huruf')
  .matches(/[0-9]/).withMessage('Password harus memuat angka');

const registerValidator = [
  body('no_langganan')
    .trim()
    .notEmpty().withMessage('Nomor langganan harus diisi')
    .matches(/^\d{6,10}$/).withMessage('Nomor langganan harus 6 hingga 10 digit angka'),
  body('nama_lengkap')
    .trim()
    .notEmpty().withMessage('Nama lengkap harus diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama lengkap harus 2-100 karakter'),
  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Username hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung')
    .custom((value) => {
      if (hasForbiddenUsernameWord(value)) {
        throw new Error('Username tidak boleh memuat kata yang tidak pantas');
      }
      return true;
    }),
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isLength({ max: 100 }).withMessage('Email maksimal 100 karakter')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  passwordRule,
  phoneRule().notEmpty().withMessage('Nomor telepon harus diisi'),
  body('jenis_kelamin').optional({ checkFalsy: true }).isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin tidak valid'),
  body('tanggal_lahir').optional({ checkFalsy: true }).isISO8601().withMessage('Tanggal lahir tidak valid'),
  body('alamat').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Alamat maksimal 500 karakter')
];

const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('Nomor langganan harus diisi')
    .matches(/^\d{6,10}$/).withMessage('Nomor langganan harus 6 hingga 10 digit angka'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password harus diisi')
];

const updateProfileValidator = [
  body('nama_lengkap').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 100 }).withMessage('Nama lengkap harus 2-100 karakter'),
  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Username hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung')
    .custom((value) => {
      if (hasForbiddenUsernameWord(value)) {
        throw new Error('Username tidak boleh memuat kata yang tidak pantas');
      }
      return true;
    }),
  body('email').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Email maksimal 100 karakter').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  optionalPhoneRule('no_telp'),
  body('jenis_kelamin').optional({ checkFalsy: true }).isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin tidak valid'),
  body('tanggal_lahir').optional({ checkFalsy: true }).isISO8601().withMessage('Tanggal lahir tidak valid'),
  body('alamat').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Alamat maksimal 500 karakter'),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).withMessage('Bio maksimal 300 karakter')
];

const createLaporanValidator = [
  body('kategori_gangguan_id').isInt({ min: 1 }).withMessage('Kategori gangguan harus dipilih'),
  body('judul').trim().notEmpty().withMessage('Judul laporan harus diisi').isLength({ min: 5, max: 120 }).withMessage('Judul laporan harus 5-120 karakter'),
  body('deskripsi').trim().notEmpty().withMessage('Deskripsi laporan harus diisi').isLength({ min: 10, max: 2000 }).withMessage('Deskripsi harus 10-2000 karakter'),
  body('lokasi').trim().notEmpty().withMessage('Lokasi gangguan harus diisi').isLength({ min: 5, max: 500 }).withMessage('Lokasi harus 5-500 karakter'),
  optionalPhoneRule('nomor_telepon'),
  body('opsi_privasi').optional({ checkFalsy: true }).isIn(['anonim', 'rahasia', 'anonim_rahasia', 'tidak_ada']),
  body('sub_kategori').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Sub kategori maksimal 100 karakter'),
  body('tanggal_kejadian').optional({ checkFalsy: true }).isISO8601().withMessage('Tanggal kejadian tidak valid'),
  body('prioritas').optional({ checkFalsy: true }).isIn(['rendah', 'sedang', 'tinggi'])
];

const updateLaporanValidator = [
  body('kategori_gangguan_id').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('judul').optional({ checkFalsy: true }).trim().isLength({ min: 5, max: 120 }).withMessage('Judul laporan harus 5-120 karakter'),
  body('deskripsi').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 2000 }).withMessage('Deskripsi harus 10-2000 karakter'),
  body('lokasi').optional({ checkFalsy: true }).trim().isLength({ min: 5, max: 500 }).withMessage('Lokasi harus 5-500 karakter'),
  optionalPhoneRule('nomor_telepon'),
  body('opsi_privasi').optional({ checkFalsy: true }).isIn(['anonim', 'rahasia', 'anonim_rahasia', 'tidak_ada']),
  body('sub_kategori').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Sub kategori maksimal 100 karakter'),
  body('tanggal_kejadian').optional({ checkFalsy: true }).isISO8601().withMessage('Tanggal kejadian tidak valid'),
  body('prioritas').optional({ checkFalsy: true }).isIn(['rendah', 'sedang', 'tinggi'])
];

const commentValidator = [
  body('komentar').trim().notEmpty().withMessage('Komentar harus diisi').isLength({ max: 1000 }).withMessage('Komentar maksimal 1000 karakter')
];

const updatePasswordValidator = [
  body('current_password').notEmpty().withMessage('Password saat ini harus diisi'),
  body('new_password')
    .isLength({ min: 8, max: 72 }).withMessage('Password baru harus 8-72 karakter')
    .matches(/[A-Za-z]/).withMessage('Password baru harus memuat huruf')
    .matches(/[0-9]/).withMessage('Password baru harus memuat angka')
];

const forgotPasswordValidator = [
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('identifier').optional({ checkFalsy: true }).trim()
];

const resetApprovedPasswordValidator = [
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('identifier').optional({ checkFalsy: true }).trim(),
  body('new_password')
    .isLength({ min: 8, max: 72 }).withMessage('Password baru harus 8-72 karakter')
    .matches(/[A-Za-z]/).withMessage('Password baru harus memuat huruf')
    .matches(/[0-9]/).withMessage('Password baru harus memuat angka')
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  createLaporanValidator,
  updateLaporanValidator,
  commentValidator,
  updatePasswordValidator,
  forgotPasswordValidator,
  resetApprovedPasswordValidator
};

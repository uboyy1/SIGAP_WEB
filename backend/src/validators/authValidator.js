// Fungsi: Validator request untuk memastikan input API sesuai aturan.
const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password harus diisi')
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail()
];

const resetApprovedPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('new_password')
    .isLength({ min: 8, max: 72 }).withMessage('Password baru harus 8-72 karakter')
    .matches(/[A-Za-z]/).withMessage('Password baru harus memuat huruf')
    .matches(/[0-9]/).withMessage('Password baru harus memuat angka')
];

const updatePasswordValidator = [
  body('current_password')
    .notEmpty().withMessage('Password saat ini harus diisi'),
  body('new_password')
    .isLength({ min: 8, max: 72 }).withMessage('Password baru harus 8-72 karakter')
    .matches(/[A-Za-z]/).withMessage('Password baru harus memuat huruf')
    .matches(/[0-9]/).withMessage('Password baru harus memuat angka')
];

module.exports = {
  loginValidator,
  forgotPasswordValidator,
  resetApprovedPasswordValidator,
  updatePasswordValidator
};

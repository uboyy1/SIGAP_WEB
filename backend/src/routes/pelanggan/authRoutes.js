// API Pelanggan - SIGAP: Route autentikasi dan profil pelanggan.
const express = require('express');
const router = express.Router();
const upload = require('../../middleware/uploadMiddleware');
const validateRequest = require('../../middleware/validateRequest');
const {
  forgotPasswordLimiter,
  pelangganLoginLimiter,
  pelangganRegisterLimiter
} = require('../../middleware/rateLimiter');
const {
  issuePelangganCsrfToken,
  protectPelanggan,
  pelangganOnly,
  verifyPelangganCsrfToken
} = require('../../middleware/pelangganMiddleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  updatePasswordValidator,
  forgotPasswordValidator,
  resetApprovedPasswordValidator
} = require('../../validators/pelangganValidator');
const {
  register,
  login,
  logout,
  me,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  updatePassword,
  forgotPassword,
  resetStatus,
  resetApprovedPassword,
  verifyEmail,
  resendVerificationEmail,
  deleteAccount
} = require('../../controllers/pelanggan/authController');

router.post('/register', pelangganRegisterLimiter, registerValidator, validateRequest, register);
router.post('/login', pelangganLoginLimiter, loginValidator, validateRequest, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.get('/reset-status', resetStatus);
router.post('/reset-approved-password', forgotPasswordLimiter, resetApprovedPasswordValidator, validateRequest, resetApprovedPassword);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', forgotPasswordLimiter, resendVerificationEmail);

router.use(protectPelanggan, pelangganOnly);
router.get('/csrf-token', issuePelangganCsrfToken);
router.post('/logout', verifyPelangganCsrfToken, logout);
router.get('/me', me);
router.put('/profile', verifyPelangganCsrfToken, updateProfileValidator, validateRequest, updateProfile);
router.post('/upload-photo', verifyPelangganCsrfToken, upload.single('foto_profil'), upload.compressUploadedImage, uploadPhoto);
router.delete('/profile/photo', verifyPelangganCsrfToken, deletePhoto);
router.put('/password', verifyPelangganCsrfToken, updatePasswordValidator, validateRequest, updatePassword);
router.delete('/account', verifyPelangganCsrfToken, deleteAccount);

module.exports = router;

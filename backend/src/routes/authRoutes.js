// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');
const {
  loginValidator,
  forgotPasswordValidator,
  resetApprovedPasswordValidator,
  updatePasswordValidator
} = require('../validators/authValidator');
const {
  adminLogin,
  forgotPassword,
  getResetPasswordStatus,
  resetApprovedPassword,
  adminLogout,
  getCurrentAdmin,
  updateAdminProfile,
  updateAdminPassword,
  uploadAdminPhoto,
  deleteAdminPhoto
} = require('../controllers/admin/authController');

// Public
router.post('/login', authLimiter, loginValidator, validateRequest, adminLogin);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password-status', forgotPasswordLimiter, forgotPasswordValidator, validateRequest, getResetPasswordStatus);
router.post('/reset-approved-password', forgotPasswordLimiter, resetApprovedPasswordValidator, validateRequest, resetApprovedPassword);

// Protected
router.use(protect);
router.post('/logout', adminLogout);
router.get('/me', getCurrentAdmin);
router.put('/profile', updateAdminProfile);
router.put('/password', updatePasswordValidator, validateRequest, updateAdminPassword);

// Upload photo
router.post('/upload-photo', upload.single('foto_profil'), uploadAdminPhoto);
router.delete('/profile/photo', deleteAdminPhoto);

module.exports = router;

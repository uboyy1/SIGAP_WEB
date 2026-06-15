// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createUserValidator,
  updateUserValidator,
  resetUserPasswordValidator,
  listUsersValidator
} = require('../validators/userValidator');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  uploadProfilePicture
} = require('../controllers/admin/userController');

// Semua route user memerlukan autentikasi dan akses admin
router.use(protect);
router.use(adminOnly);

router.get('/', listUsersValidator, validateRequest, getUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidator, validateRequest, createUser);
router.put('/:id', updateUserValidator, validateRequest, updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetUserPasswordValidator, validateRequest, resetUserPassword);
router.post('/:id/upload-photo', upload.single('foto_profil'), uploadProfilePicture);

module.exports = router;

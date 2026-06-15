// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllResetRequests,
  approveResetRequest,
  rejectResetRequest,
  getResetRequestById
} = require('../controllers/admin/resetPasswordController');

router.use(protect);
router.use(adminOnly);

router.get('/', getAllResetRequests);
router.get('/:id', getResetRequestById);
router.put('/:id/approve', approveResetRequest);
router.put('/:id/reject', rejectResetRequest);

module.exports = router;
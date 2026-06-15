// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getLaporanAdmin
} = require('../controllers/admin/dashboardController');
const { updateLaporanStatus } = require('../controllers/admin/laporanController'); 

router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/laporan', getLaporanAdmin);
router.put('/laporan/:id/status', updateLaporanStatus); 

module.exports = router;
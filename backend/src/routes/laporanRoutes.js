// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllLaporan,
  getLaporanById,
  updateLaporanStatus,
  deleteLaporan,
  getLaporanStats,
  getLaporanWithFilters   // <-- import
} = require('../controllers/admin/laporanController');

router.use(protect);
router.use(adminOnly);

router.get('/', getAllLaporan);
router.get('/filter', getLaporanWithFilters);  // <-- tambahkan
router.get('/stats', getLaporanStats);
router.get('/:id', getLaporanById);
router.put('/:id/status', updateLaporanStatus);
router.delete('/:id', deleteLaporan);

module.exports = router;
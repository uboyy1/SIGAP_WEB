// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllKategori } = require('../controllers/admin/kategoriController');

const adminOrKepalaTeknisiOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'kepala_teknisi' || req.user.is_admin === true)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin atau kepala teknisi yang dapat mengakses.'
    });
  }
};

router.use(protect);
router.use(adminOrKepalaTeknisiOnly);
router.get('/', getAllKategori);

module.exports = router;

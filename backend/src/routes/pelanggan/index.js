// API Pelanggan - SIGAP: Agregator route pelanggan.
const express = require('express');
const router = express.Router();
const { protectPelanggan, pelangganOnly } = require('../../middleware/pelangganMiddleware');
const authRoutes = require('./authRoutes');
const laporanRoutes = require('./laporanRoutes');
const notifikasiRoutes = require('./notifikasiRoutes');
const {
  getStats,
  getKategori
} = require('../../controllers/pelanggan/dashboardController');
const {
  getAboutContent,
  getTermsContent
} = require('../../controllers/pelanggan/infoController');

router.use('/laporan', laporanRoutes);
router.use('/notifications', notifikasiRoutes);

router.get('/info/about', getAboutContent);
router.get('/info/terms', getTermsContent);
router.get('/dashboard/stats', protectPelanggan, pelangganOnly, getStats);
router.get('/kategori', getKategori);
router.use('/', authRoutes);

module.exports = router;

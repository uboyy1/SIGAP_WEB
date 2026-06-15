// Fungsi: Route kepala teknisi untuk menghubungkan endpoint kepala teknisi ke controller.
// backend/src/routes/kepalaTeknisiRoutes.js
const express = require('express');
const router = express.Router();
const { protect, kepalaTeknisiOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ============ IMPORT CONTROLLERS ============

// Dashboard Controller
const { getDashboardStats } = require('../controllers/kepalaTeknisi/dashboardController');

// Laporan Masuk Controller
const {
  getLaporanMasuk,
  getLaporanMasukDetail,
  getTeknisiOptions,
  terimaLaporan,
  tolakLaporan
} = require('../controllers/kepalaTeknisi/laporanMasukController');

// Riwayat Pelaporan Controller
const { 
  getRiwayatPelaporan,
  getRiwayatDetail 
} = require('../controllers/kepalaTeknisi/riwayatPelaporanController');

// Analisis Kinerja Controller
const { getAnalisisKinerja } = require('../controllers/kepalaTeknisi/analisisKinerjaController');

// Laporan Darurat Controller
const { 
  getLaporanDarurat, 
  updateLaporanDaruratStatus 
} = require('../controllers/kepalaTeknisi/laporanDaruratController');

// Tugas Controller
const { getSemuaTugas } = require('../controllers/kepalaTeknisi/tugasController');

// Profile Controller
const { 
  getProfile, 
  updateProfile, 
  updatePassword, 
  uploadProfilePhoto,
  deleteProfilePhoto
} = require('../controllers/kepalaTeknisi/profileController');

// ============ APPLY MIDDLEWARE ============
// Semua route di bawah ini memerlukan autentikasi dan role kepala teknisi
router.use(protect);
router.use(kepalaTeknisiOnly);

// ============ DASHBOARD ROUTES ============
// GET /api/kepala-teknisi/dashboard/stats - Statistik dashboard kepala teknisi
router.get('/dashboard/stats', getDashboardStats);

// ============ LAPORAN MASUK ROUTES ============
// GET /api/kepala-teknisi/laporan-masuk - Daftar laporan masuk (status menunggu)
router.get('/laporan-masuk', getLaporanMasuk);

// GET /api/kepala-teknisi/laporan-masuk/teknisi - Daftar semua teknisi untuk dropdown
router.get('/laporan-masuk/teknisi', getTeknisiOptions);

// GET /api/kepala-teknisi/laporan-masuk/:id - Detail laporan masuk
router.get('/laporan-masuk/:id', getLaporanMasukDetail);

// PUT /api/kepala-teknisi/laporan-masuk/:id/terima - Terima laporan dan tugaskan ke teknisi
router.put('/laporan-masuk/:id/terima', terimaLaporan);

// PUT /api/kepala-teknisi/laporan-masuk/:id/tolak - Tolak laporan
router.put('/laporan-masuk/:id/tolak', tolakLaporan);

// ============ RIWAYAT PELAPORAN ROUTES ============
// GET /api/kepala-teknisi/riwayat-pelaporan - Daftar riwayat laporan (selesai/ditolak/diproses)
router.get('/riwayat-pelaporan', getRiwayatPelaporan);

// GET /api/kepala-teknisi/riwayat-pelaporan/:id - Detail riwayat laporan
router.get('/riwayat-pelaporan/:id', getRiwayatDetail);

// ============ ANALISIS KINERJA ROUTES ============
// GET /api/kepala-teknisi/analisis-kinerja - Data analisis kinerja teknisi
router.get('/analisis-kinerja', getAnalisisKinerja);

// ============ LAPORAN DARURAT ROUTES ============
// GET /api/kepala-teknisi/laporan-darurat - Daftar laporan darurat dari teknisi
router.get('/laporan-darurat', getLaporanDarurat);

// PUT /api/kepala-teknisi/laporan-darurat/:id - Update status laporan darurat
router.put('/laporan-darurat/:id', updateLaporanDaruratStatus);

// ============ TUGAS ROUTES ============
// GET /api/kepala-teknisi/tugas - Daftar semua tugas
router.get('/tugas', getSemuaTugas);

// ============ PROFILE ROUTES ============
// GET /api/kepala-teknisi/profile - Ambil data profil
router.get('/profile', getProfile);

// PUT /api/kepala-teknisi/profile - Update profil
router.put('/profile', updateProfile);

// PUT /api/kepala-teknisi/profile/password - Update password
router.put('/profile/password', updatePassword);

// POST /api/kepala-teknisi/profile/upload-photo - Upload foto profil
router.post('/profile/upload-photo', upload.single('foto_profil'), uploadProfilePhoto);

// DELETE /api/kepala-teknisi/profile/photo - Hapus foto profil
router.delete('/profile/photo', deleteProfilePhoto);

module.exports = router;

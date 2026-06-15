// API Pelanggan - SIGAP: Route laporan, feed publik, like, dan komentar pelanggan.
const express = require('express');
const router = express.Router();
const { uploadLaporan, compressUploadedImage } = require('../../middleware/uploadMiddleware');
const validateRequest = require('../../middleware/validateRequest');
const {
  pelangganPublicLimiter,
  pelangganReportLimiter,
  pelangganCommentLimiter
} = require('../../middleware/rateLimiter');
const {
  optionalPelangganAuth,
  protectPelanggan,
  pelangganOnly,
  ownLaporanOnly,
  verifyPelangganCsrfToken
} = require('../../middleware/pelangganMiddleware');
const {
  createLaporanValidator,
  updateLaporanValidator,
  commentValidator
} = require('../../validators/pelangganValidator');
const {
  getMyLaporan,
  getMyLaporanDetail,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  getPublicLaporan,
  getLaporanCount
} = require('../../controllers/pelanggan/laporanController');
const {
  toggleLike,
  addComment,
  getComments
} = require('../../controllers/pelanggan/laporanDetailController');

router.get('/public', pelangganPublicLimiter, optionalPelangganAuth, getPublicLaporan);
router.get('/count', pelangganPublicLimiter, getLaporanCount);
router.get('/:id/comments', pelangganPublicLimiter, getComments);

router.use(protectPelanggan, pelangganOnly);
router.get('/', getMyLaporan);
router.post('/', pelangganReportLimiter, verifyPelangganCsrfToken, uploadLaporan.single('foto'), compressUploadedImage, createLaporanValidator, validateRequest, createLaporan);
router.get('/:id', getMyLaporanDetail);
router.put('/:id', verifyPelangganCsrfToken, uploadLaporan.single('foto'), compressUploadedImage, ownLaporanOnly, updateLaporanValidator, validateRequest, updateLaporan);
router.delete('/:id', verifyPelangganCsrfToken, ownLaporanOnly, deleteLaporan);
router.post('/:id/like', verifyPelangganCsrfToken, toggleLike);
router.post('/:id/comment', pelangganCommentLimiter, verifyPelangganCsrfToken, commentValidator, validateRequest, addComment);

module.exports = router;

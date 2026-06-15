// API Pelanggan - SIGAP: Route notifikasi pelanggan.
const express = require('express');
const router = express.Router();
const { protectPelanggan, pelangganOnly, verifyPelangganCsrfToken } = require('../../middleware/pelangganMiddleware');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications
} = require('../../controllers/pelanggan/notifikasiController');

router.use(protectPelanggan, pelangganOnly);
router.get('/', getNotifications);
router.put('/read-all', verifyPelangganCsrfToken, markAllNotificationsAsRead);
router.delete('/all', verifyPelangganCsrfToken, deleteAllNotifications);
router.put('/:id/read', verifyPelangganCsrfToken, markNotificationAsRead);

module.exports = router;

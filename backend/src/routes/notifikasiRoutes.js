// Fungsi: Route shared untuk endpoint backend lintas role.
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications
} = require('../controllers/notifikasiController');

router.use(protect);

router.get('/recent', getRecentNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.delete('/all', deleteAllNotifications);
router.put('/:id/read', markNotificationAsRead);

module.exports = router;

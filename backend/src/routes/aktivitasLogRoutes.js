// Fungsi: Route shared untuk endpoint backend lintas role.
// backend/src/routes/aktivitasLogRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getRecentActivities, getAllActivities } = require('../controllers/aktivitasLogController');

router.use(protect);
router.use(adminOnly);

router.get('/recent', getRecentActivities);
router.get('/all', getAllActivities);

module.exports = router;
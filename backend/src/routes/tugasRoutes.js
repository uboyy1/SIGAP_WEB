// Fungsi: Route admin untuk menghubungkan endpoint admin ke controller.
const express = require('express');
const router = express.Router();
const { protect, adminOnly, kepalaTeknisiOnly } = require('../middleware/authMiddleware');
const {
  getAllTugas,
  createTugas,
  assignTugas,
  completeTugas,
  deleteTugas
} = require('../controllers/admin/tugasController');

router.use(protect);
router.use(adminOnly);

router.get('/', getAllTugas);
router.post('/', createTugas);
router.put('/:id/assign', assignTugas);
router.put('/:id/complete', completeTugas);
router.delete('/:id', deleteTugas);

module.exports = router;
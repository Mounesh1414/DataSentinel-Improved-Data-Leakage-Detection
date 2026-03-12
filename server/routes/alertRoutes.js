const express = require('express');
const {
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAlerts);
router.get('/stats/overview', protect, getAlertStats);
router.get('/:id', protect, getAlertById);
router.put('/:id/acknowledge', protect, acknowledgeAlert);
router.put('/:id/resolve', protect, resolveAlert);

module.exports = router;

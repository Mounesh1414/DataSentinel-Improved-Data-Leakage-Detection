const express = require('express');
const { getLogs, getUserLogs, getLogStats, exportLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin', 'auditor'), getLogs);
router.get('/stats/overview', protect, authorize('admin', 'auditor'), getLogStats);
router.get('/user/:userId', protect, getUserLogs);
router.get('/export/csv', protect, authorize('admin', 'auditor'), exportLogs);

module.exports = router;

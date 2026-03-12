const express = require('express');
const multer = require('multer');
const {
  scanFile,
  getScanResults,
  getScanResultById,
  quarantineFile,
  getDashboardStats,
  exportScansCSV,
  cleanupOldScans,
} = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Scan endpoints
router.post('/upload', protect, upload.single('file'), scanFile);
router.get('/results', protect, getScanResults);
router.get('/results/:id', protect, getScanResultById);
router.put('/quarantine/:id', protect, quarantineFile);

// Statistics and analytics
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/export/csv', protect, exportScansCSV);

// Admin endpoints
router.delete('/cleanup', protect, admin, cleanupOldScans);

module.exports = router;

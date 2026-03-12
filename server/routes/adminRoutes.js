const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getComplianceReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply admin authorization to all routes
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/compliance-report', getComplianceReport);

module.exports = router;

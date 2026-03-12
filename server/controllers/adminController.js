const User = require('../models/User');
const ScanResult = require('../models/ScanResult');
const Alert = require('../models/Alert');
const Log = require('../models/Log');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalScans = await ScanResult.countDocuments();
    const criticalScans = await ScanResult.countDocuments({ riskLevel: 'CRITICAL' });
    const openAlerts = await Alert.countDocuments({ status: 'open' });
    const totalAlerts = await Alert.countDocuments();

    const recentAlerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('relatedUser', 'name email');

    const scansByRiskLevel = await ScanResult.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]);

    const alertsBySeverity = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalScans,
        criticalScans,
        openAlerts,
        totalAlerts,
        recentAlerts,
        scansByRiskLevel,
        alertsBySeverity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, isActive, limit = 10, page = 1 } = req.query;
    let query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updateData = {};

    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get compliance report
// @route   GET /api/admin/compliance-report
// @access  Private/Admin
exports.getComplianceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let scanQuery = {};
    if (startDate || endDate) {
      scanQuery.createdAt = {};
      if (startDate) scanQuery.createdAt.$gte = new Date(startDate);
      if (endDate) scanQuery.createdAt.$lte = new Date(endDate);
    }

    const totalScans = await ScanResult.countDocuments(scanQuery);
    const quarantinedFiles = await ScanResult.countDocuments({ ...scanQuery, quarantined: true });
    const filesWithSensitiveData = await ScanResult.countDocuments({ ...scanQuery, sensitiveDataFound: true });

    const riskDistribution = await ScanResult.aggregate([
      { $match: scanQuery },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]);

    const alertsCreated = await Alert.countDocuments({
      createdAt: scanQuery.createdAt,
    });

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalScans,
        quarantinedFiles,
        filesWithSensitiveData,
        riskDistribution,
        alertsCreated,
        complianceScore: Math.max(0, 100 - (quarantinedFiles / totalScans) * 100),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

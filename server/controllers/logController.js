const Log = require('../models/Log');

// @desc    Get all logs
// @route   GET /api/logs
// @access  Private/Admin
exports.getLogs = async (req, res) => {
  try {
    const { action, severity, limit = 50, page = 1, startDate, endDate } = req.query;
    let query = {};

    if (action) query.action = action;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const logs = await Log.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Log.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user activity logs
// @route   GET /api/logs/user/:userId
// @access  Private
exports.getUserLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Log.countDocuments({ user: req.params.userId });

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get log statistics
// @route   GET /api/logs/stats/overview
// @access  Private/Admin
exports.getLogStats = async (req, res) => {
  try {
    const totalLogs = await Log.countDocuments();
    const successLogs = await Log.countDocuments({ status: 'success' });
    const failedLogs = await Log.countDocuments({ status: 'failed' });

    const logsByAction = await Log.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
    ]);

    const logsBySeverity = await Log.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        successLogs,
        failedLogs,
        logsByAction,
        logsBySeverity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export logs as CSV
// @route   GET /api/logs/export/csv
// @access  Private/Admin
exports.exportLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    let csv = 'User,Email,Action,Resource,Status,IP Address,Severity,Date\n';
    logs.forEach((log) => {
      csv += `"${log.user?.name || 'N/A'}","${log.user?.email || 'N/A'}","${log.action}","${log.resource || 'N/A'}","${log.status}","${log.ipAddress || 'N/A'}","${log.severity}","${log.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

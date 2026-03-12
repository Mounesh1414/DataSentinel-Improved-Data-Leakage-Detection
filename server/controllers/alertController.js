const Alert = require('../models/Alert');
const Log = require('../models/Log');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const { status, severity, limit = 10, page = 1 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;

    const skip = (page - 1) * limit;
    const alerts = await Alert.find(query)
      .populate('relatedUser', 'name email')
      .populate('relatedScan', 'fileName riskLevel')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Alert.countDocuments(query);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get alert by ID
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('relatedUser', 'name email')
      .populate('relatedScan')
      .populate('acknowledgedBy', 'name');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        acknowledgedBy: req.userId,
        acknowledgedAt: new Date(),
      },
      { new: true }
    );

    // Log the action
    await Log.create({
      user: req.userId,
      action: 'alert_acknowledged',
      resource: alert._id.toString(),
      resourceType: 'alert',
      status: 'success',
      ipAddress: req.ip,
      severity: 'info',
    });

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
exports.resolveAlert = async (req, res) => {
  try {
    const { resolution, isFalsePositive } = req.body;

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: isFalsePositive ? 'false_positive' : 'resolved',
        resolution,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    // Log the action
    await Log.create({
      user: req.userId,
      action: 'alert_acknowledged',
      resource: alert._id.toString(),
      resourceType: 'alert',
      status: 'success',
      ipAddress: req.ip,
      severity: 'info',
      details: { resolution, isFalsePositive },
    });

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats/overview
// @access  Private
exports.getAlertStats = async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const openAlerts = await Alert.countDocuments({ status: 'open' });
    const criticalAlerts = await Alert.countDocuments({ severity: 'CRITICAL' });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });

    const alertsBySeverity = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAlerts,
        openAlerts,
        criticalAlerts,
        resolvedAlerts,
        alertsBySeverity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

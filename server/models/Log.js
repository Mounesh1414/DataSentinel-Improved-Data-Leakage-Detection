const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'file_upload', 'file_scan', 'file_download', 'alert_created', 'alert_acknowledged', 'report_generated', 'settings_changed'],
    required: true,
  },
  resource: String,
  resourceType: String,
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'attempted'],
    default: 'success',
  },
  details: mongoose.Schema.Types.Mixed,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// TTL Index: Auto-delete logs after 90 days
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Log', logSchema);

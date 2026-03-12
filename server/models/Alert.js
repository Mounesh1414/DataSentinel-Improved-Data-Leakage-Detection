const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
  },
  alertType: {
    type: String,
    enum: ['data_leak', 'unauthorized_access', 'suspicious_activity', 'policy_violation', 'system_error'],
    default: 'data_leak',
  },
  relatedScan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScanResult',
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['open', 'acknowledged', 'resolved', 'false_positive'],
    default: 'open',
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  acknowledgedAt: Date,
  resolution: String,
  resolvedAt: Date,
  notificationSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);

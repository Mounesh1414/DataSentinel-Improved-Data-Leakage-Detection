const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    index: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  verdict: {
    type: String,
    enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'SAFE',
    index: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  detectedPatterns: [
    {
      type: {
        type: String,
        description: String,
        count: Number,
        category: String,
        weight: Number,
        matches: [String]
      }
    }
  ],
  categories: {
    type: Map,
    of: {
      count: Number,
      patterns: [String],
      severity: String
    }
  },
  totalMatches: {
    type: Number,
    default: 0
  },
  sensitiveDataFound: {
    type: Boolean,
    default: false,
    index: true
  },
  detailsReport: {
    ssn: [String],
    creditCards: [String],
    emails: [String],
    phoneNumbers: [String],
    apiKeys: [String],
    privateKeys: [String],
    jwtTokens: [String],
    bearerTokens: [String],
    ipAddresses: [String],
    awsKeys: [String],
    mongoUris: [String],
    keywords: Map
  },
  recommendations: [String],
  quarantined: {
    type: Boolean,
    default: false,
    index: true
  },
  quarantineReason: String,
  quarantinedAt: Date,
  mlScore: {
    type: Number,
    min: 0,
    max: 1
  },
  notes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'archived', 'deleted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for compound queries
scanResultSchema.index({ uploadedBy: 1, createdAt: -1 });
scanResultSchema.index({ verdict: 1, riskScore: -1 });

// Virtual for risk category
scanResultSchema.virtual('riskCategory').get(function() {
  if (this.riskScore >= 80) return 'Critical';
  if (this.riskScore >= 60) return 'High';
  if (this.riskScore >= 40) return 'Medium';
  if (this.riskScore >= 20) return 'Low';
  return 'Safe';
});

// Method to export as CSV row
scanResultSchema.methods.toCSV = function() {
  return [
    this.fileName,
    this.riskScore,
    this.verdict,
    Object.keys(this.categories || {}).join(';'),
    this.quarantined ? 'Yes' : 'No',
    this.uploadedBy?.email || 'Unknown',
    this.createdAt.toLocaleDateString()
  ];
};

module.exports = mongoose.model('ScanResult', scanResultSchema);

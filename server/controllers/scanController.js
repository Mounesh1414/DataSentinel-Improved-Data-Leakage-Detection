const ScanResult = require('../models/ScanResult');
const Alert = require('../models/Alert');
const Log = require('../models/Log');
const detectLeakage = require('../utils/detectLeakage');
const fileExtractor = require('../utils/fileExtractor');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Scan uploaded file
 * @route   POST /api/scan/upload
 * @access  Private
 */
exports.scanFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Extract text from file
    let fileContent = '';
    try {
      fileContent = await fileExtractor.extractText(req.file);
    } catch (e) {
      // Fallback to buffer extraction
      fileContent = req.file.buffer.toString('utf-8');
    }

    // Analyze content for data leakage
    const detectionResult = detectLeakage.analyzeContent(fileContent);
    const report = detectLeakage.generateReport(fileContent, req.file.originalname);

    // Create scan result
    const scanResult = await ScanResult.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.userId,
      riskScore: detectionResult.riskScore,
      verdict: detectionResult.verdict,
      confidence: detectionResult.confidence,
      detectedPatterns: detectionResult.patterns,
      categories: detectionResult.categories,
      sensitiveDataFound: detectionResult.sensitiveDataFound,
      totalMatches: detectionResult.totalMatches,
      detailsReport: detectionResult.details,
      recommendations: report.recommendations,
      quarantined: detectionResult.riskScore >= 80,
      quarantineReason: detectionResult.riskScore >= 80 ? 'Critical risk level detected' : null,
    });

    // Create alert if high risk
    if (detectionResult.riskScore >= 50) {
      const alertSeverity = detectionResult.riskScore >= 80 ? 'critical' : 
                           detectionResult.riskScore >= 60 ? 'high' : 'medium';
      
      await Alert.create({
        title: `Data Leakage Detected: ${req.file.originalname}`,
        description: `Risk Score: ${detectionResult.riskScore}/100 - ${detectionResult.verdict}`,
        severity: alertSeverity,
        alertType: 'data_leak',
        relatedScan: scanResult._id,
        relatedUser: req.userId,
        status: 'open',
        details: {
          verdict: detectionResult.verdict,
          categories: Object.keys(detectionResult.categories),
          topMatches: detectionResult.patterns.slice(0, 3)
        }
      });
    }

    // Log the scan
    await Log.create({
      user: req.userId,
      action: 'file_scanned',
      resource: req.file.originalname,
      resourceType: 'file',
      status: 'completed',
      ipAddress: req.ip,
      severity: detectionResult.riskScore >= 60 ? 'warning' : 'info',
      details: {
        riskScore: detectionResult.riskScore,
        verdict: detectionResult.verdict,
        categoriesDetected: Object.keys(detectionResult.categories).length
      }
    });

    res.status(200).json({
      success: true,
      message: 'File scanned successfully',
      data: {
        _id: scanResult._id,
        fileName: scanResult.fileName,
        fileSize: scanResult.fileSize,
        riskScore: scanResult.riskScore,
        verdict: scanResult.verdict,
        confidence: scanResult.confidence,
        detectedPatterns: scanResult.detectedPatterns,
        categories: scanResult.categories,
        totalMatches: scanResult.totalMatches,
        quarantined: scanResult.quarantined,
        recommendations: scanResult.recommendations,
        createdAt: scanResult.createdAt
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all scan results with filters
 * @route   GET /api/scan/results
 * @access  Private
 */
exports.getScanResults = async (req, res) => {
  try {
    const { verdict, minRisk, maxRisk, limit = 10, page = 1, sortBy = '-createdAt' } = req.query;
    let query = {};

    // Add filters
    if (verdict) {
      query.verdict = verdict;
    }
    
    if (minRisk || maxRisk) {
      query.riskScore = {};
      if (minRisk) query.riskScore.$gte = parseInt(minRisk);
      if (maxRisk) query.riskScore.$lte = parseInt(maxRisk);
    }

    const skip = (page - 1) * parseInt(limit);
    const results = await ScanResult.find(query)
      .populate('uploadedBy', 'name email role')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ScanResult.countDocuments(query);

    // Calculate statistics
    const stats = await ScanResult.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$verdict',
          count: { $sum: 1 },
          avgRisk: { $avg: '$riskScore' },
          maxRisk: { $max: '$riskScore' },
          minRisk: { $min: '$riskScore' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      statistics: stats,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get scan result by ID
 * @route   GET /api/scan/results/:id
 * @access  Private
 */
exports.getScanResultById = async (req, res) => {
  try {
    const result = await ScanResult.findById(req.params.id)
      .populate('uploadedBy', 'name email role')
      .lean();

    if (!result) {
      return res.status(404).json({ success: false, message: 'Scan result not found' });
    }

    res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Quarantine file
 * @route   PUT /api/scan/quarantine/:id
 * @access  Private
 */
exports.quarantineFile = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await ScanResult.findByIdAndUpdate(
      req.params.id,
      { 
        quarantined: true, 
        quarantineReason: reason,
        quarantinedAt: new Date()
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Scan result not found' });
    }

    // Log the action
    await Log.create({
      user: req.userId,
      action: 'file_quarantined',
      resource: result.fileName,
      resourceType: 'file',
      status: 'success',
      severity: 'warning',
      details: { action: 'quarantine', reason, scanId: req.params.id },
      ipAddress: req.ip,
    });

    res.status(200).json({ 
      success: true, 
      message: 'File quarantined successfully',
      data: result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/scan/stats/dashboard
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    // Get stats
    const totalScans = await ScanResult.countDocuments({});
    const criticalScans = await ScanResult.countDocuments({ verdict: 'CRITICAL' });
    const highScans = await ScanResult.countDocuments({ verdict: 'HIGH' });
    const quarantinedScans = await ScanResult.countDocuments({ quarantined: true });

    // Get average risk score
    const avgRisk = await ScanResult.aggregate([
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
    ]);

    // Get recent scans
    const recentScans = await ScanResult.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'name email')
      .lean();

    // Get top categories
    const topCategories = await ScanResult.aggregate([
      { 
        $group: {
          _id: '$categories',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get risk distribution
    const riskDistribution = await ScanResult.aggregate([
      {
        $bucket: {
          groupBy: '$riskScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalScans,
        criticalScans,
        highScans,
        quarantinedScans,
        averageRiskScore: avgRisk[0]?.avgRisk || 0,
        recentScans,
        riskDistribution,
        summary: {
          safeFiles: totalScans - criticalScans - highScans,
          atRiskFiles: criticalScans + highScans,
          quarantined: quarantinedScans
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Export scan results as CSV
 * @route   GET /api/scan/export/csv
 * @access  Private
 */
exports.exportScansCSV = async (req, res) => {
  try {
    const results = await ScanResult.find()
      .populate('uploadedBy', 'name email')
      .lean();

    // Create CSV header
    const header = ['File Name', 'Risk Score', 'Verdict', 'Categories', 'Quarantined', 'User', 'Date'];
    const rows = results.map(r => [
      r.fileName,
      r.riskScore,
      r.verdict,
      Object.keys(r.categories || {}).join('; '),
      r.quarantined ? 'Yes' : 'No',
      r.uploadedBy?.email || 'Unknown',
      new Date(r.createdAt).toLocaleDateString()
    ]);

    // Format CSV
    const csv = [header, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="scan_results.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete old scan results
 * @route   DELETE /api/scan/cleanup
 * @access  Admin
 */
exports.cleanupOldScans = async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);

    const result = await ScanResult.deleteMany({
      createdAt: { $lt: dateThreshold },
      quarantined: false
    });

    // Log the cleanup
    await Log.create({
      user: req.userId,
      action: 'cleanup_performed',
      resource: 'scan_results',
      resourceType: 'system',
      status: 'success',
      severity: 'info',
      details: { deletedCount: result.deletedCount, daysOld },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old scan results`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

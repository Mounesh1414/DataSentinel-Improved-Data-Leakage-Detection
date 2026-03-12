import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import axiosInstance from '../utils/axiosInstance';
import { calculateOverallRisk, getRiskColor } from '../utils/riskCalculator';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const scanRes = await axiosInstance.get('/scan/stats/dashboard?days=30');
      const alertRes = await axiosInstance.get('/alerts?limit=100');
      
      const scanStats = scanRes.data.data;
      const alerts = alertRes.data.data;

      const stats = {
        totalScans: scanStats.totalScans,
        criticalScans: scanStats.criticalScans,
        highScans: scanStats.highScans,
        quarantinedScans: scanStats.quarantinedScans,
        safeFiles: scanStats.summary?.safeFiles || 0,
        averageRiskScore: scanStats.averageRiskScore,
        openAlerts: alerts.filter((a) => a.status === 'open').length,
        totalAlerts: alerts.length,
        recentScans: scanStats.recentScans || [],
        riskDistribution: scanStats.riskDistribution || [],
        alerts: alerts.slice(0, 5)
      };

      setStats(stats);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh stats
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  // Filter stats based on selected filter
  const getFilteredStats = () => {
    if (!stats) return null;
    
    switch(filter) {
      case 'critical':
        return stats.criticalScans;
      case 'high':
        return stats.highScans;
      case 'safe':
        return stats.safeFiles;
      default:
        return stats.totalScans;
    }
  };

  if (loading && !stats) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  const criticalPercentage = stats ? ((stats.criticalScans / stats.totalScans) * 100).toFixed(1) : 0;
  const highPercentage = stats ? ((stats.highScans / stats.totalScans) * 100).toFixed(1) : 0;

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>🛡️ DataSentinel Dashboard</h1>
            <p>Real-time Security & Compliance Overview</p>
          </div>
          <div className="refresh-controls">
            <button onClick={fetchStats} className="btn-refresh">🔄 Refresh Now</button>
            <select value={refreshInterval} onChange={(e) => setRefreshInterval(parseInt(e.target.value))} className="refresh-select">
              <option value="10">Auto-refresh: 10s</option>
              <option value="30">Auto-refresh: 30s</option>
              <option value="60">Auto-refresh: 60s</option>
              <option value="0">Auto-refresh: Off</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Key Metrics Section */}
        <div className="metrics-section">
          <h2>Key Metrics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Scans</h3>
                <p className="stat-value">{stats?.totalScans || 0}</p>
                <p className="stat-subtitle">Files analyzed</p>
              </div>
            </div>

            <div className="stat-card critical">
              <div className="stat-icon">🔴</div>
              <div className="stat-content">
                <h3>Critical Issues</h3>
                <p className="stat-value">{stats?.criticalScans || 0}</p>
                <p className="stat-subtitle">{criticalPercentage}% of total</p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">🟠</div>
              <div className="stat-content">
                <h3>High Risk</h3>
                <p className="stat-value">{stats?.highScans || 0}</p>
                <p className="stat-subtitle">{highPercentage}% of total</p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Safe Files</h3>
                <p className="stat-value">{stats?.safeFiles || 0}</p>
                <p className="stat-subtitle">No issues detected</p>
              </div>
            </div>

            <div className="stat-card quarantine">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <h3>Quarantined</h3>
                <p className="stat-value">{stats?.quarantinedScans || 0}</p>
                <p className="stat-subtitle">Isolated for review</p>
              </div>
            </div>

            <div className="stat-card risk">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Avg Risk Score</h3>
                <p className="stat-value" style={{ color: getRiskColor(stats?.averageRiskScore > 50 ? 'HIGH' : 'LOW') }}>
                  {(stats?.averageRiskScore || 0).toFixed(1)}/100
                </p>
                <p className="stat-subtitle">Organization average</p>
              </div>
            </div>

            <div className="stat-card alert">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <h3>Open Alerts</h3>
                <p className="stat-value">{stats?.openAlerts || 0}</p>
                <p className="stat-subtitle">Requires attention</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📢</div>
              <div className="stat-content">
                <h3>Total Alerts</h3>
                <p className="stat-value">{stats?.totalAlerts || 0}</p>
                <p className="stat-subtitle">All-time alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="activity-section">
          <div className="recent-scans">
            <div className="section-header">
              <h2>📋 Recent File Scans</h2>
              <a href="/scanner" className="btn-link">Scan New File →</a>
            </div>
            <div className="scan-list">
              {stats?.recentScans?.length === 0 ? (
                <p className="no-data">No recent scans. Start by scanning a file!</p>
              ) : (
                stats?.recentScans?.map((scan) => (
                  <div key={scan._id} className={`scan-item scan-item-${scan.verdict?.toLowerCase()}`}>
                    <div className="scan-icon">
                      {scan.verdict === 'CRITICAL' && '🔴'}
                      {scan.verdict === 'HIGH' && '🟠'}
                      {scan.verdict === 'MEDIUM' && '🟡'}
                      {scan.verdict === 'LOW' && '🔵'}
                      {scan.verdict === 'SAFE' && '✅'}
                    </div>
                    <div className="scan-info">
                      <h4>{scan.fileName}</h4>
                      <p className="scan-details">
                        Risk Score: {scan.riskScore} | Categories: {Object.keys(scan.categories || {}).length}
                      </p>
                      <p className="scan-time">{new Date(scan.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="scan-status">
                      <span className={`verdict-badge verdict-${scan.verdict?.toLowerCase()}`}>
                        {scan.verdict}
                      </span>
                      {scan.quarantined && <span className="quarantine-badge">🔒 Quarantined</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="recent-alerts">
            <div className="section-header">
              <h2>🚨 Recent Alerts</h2>
              <a href="/alerts" className="btn-link">View All →</a>
            </div>
            <div className="alert-list">
              {stats?.alerts?.length === 0 ? (
                <p className="no-data">No alerts. System is secure!</p>
              ) : (
                stats?.alerts?.map((alert) => (
                  <div key={alert._id} className={`alert-item alert-${alert.severity}`}>
                    <div className="alert-icon">
                      {alert.severity === 'critical' && '🔴'}
                      {alert.severity === 'high' && '🟠'}
                      {alert.severity === 'medium' && '🟡'}
                    </div>
                    <div className="alert-info">
                      <h4>{alert.title}</h4>
                      <p>{alert.description}</p>
                      <p className="alert-time">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`status-badge status-${alert.status}`}>{alert.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        {stats?.riskDistribution && stats.riskDistribution.length > 0 && (
          <div className="chart-section">
            <h2>📊 Risk Distribution</h2>
            <div className="risk-chart">
              {stats.riskDistribution.map((item, idx) => (
                <div key={idx} className="chart-bar">
                  <div className="bar-label">
                    {item._id === 'Other' ? 'Other' : `${item._id[0]}-${item._id[1]}`}
                  </div>
                  <div className="bar-container">
                    <div 
                      className={`bar ${item._id === 'Other' ? 'bar-other' : `bar-${Math.floor(item._id[0] / 25)}`}`}
                      style={{ width: `${(item.count / stats.totalScans) * 100}%` }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;

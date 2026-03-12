import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AlertCard from '../components/AlertCard';
import axiosInstance from '../utils/axiosInstance';
import '../styles/alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus, filterSeverity]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterSeverity) params.severity = filterSeverity;

      const response = await axiosInstance.get('/alerts', { params });
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await axiosInstance.put(`/alerts/${alertId}/acknowledge`);
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId, isFalsePositive) => {
    try {
      await axiosInstance.put(`/alerts/${alertId}/resolve`, {
        resolution: isFalsePositive ? 'False positive' : 'Issue resolved',
        isFalsePositive,
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="alerts-page">
        <div className="alerts-header">
          <h1>Alerts & Notifications</h1>
          <p>Monitor and manage security alerts</p>
        </div>

        <div className="alerts-filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="no-alerts">
            <p>✓ No alerts at this time</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Alerts;

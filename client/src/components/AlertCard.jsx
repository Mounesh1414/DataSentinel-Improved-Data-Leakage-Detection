import React from 'react';
import { formatDate, getTimeAgo } from '../utils/formatDate';
import '../styles/alertcard.css';

const AlertCard = ({ alert, onAcknowledge, onResolve }) => {
  const getSeverityIcon = (severity) => {
    const icons = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    };
    return icons[severity] || '⚪';
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status}`;
  };

  return (
    <div className={`alert-card severity-${alert.severity}`}>
      <div className="alert-header">
        <div className="alert-title">
          <span className="severity-icon">{getSeverityIcon(alert.severity)}</span>
          <h3>{alert.title}</h3>
        </div>
        <span className={getStatusBadgeClass(alert.status)}>{alert.status}</span>
      </div>

      <div className="alert-body">
        <p className="alert-description">{alert.description}</p>

        <div className="alert-meta">
          <div>
            <strong>Alert Type:</strong> {alert.alertType}
          </div>
          <div>
            <strong>Created:</strong> {getTimeAgo(alert.createdAt)}
          </div>
        </div>

        {alert.relatedScan && (
          <div className="related-scan">
            <strong>Related Scan:</strong> {alert.relatedScan.fileName}
          </div>
        )}
      </div>

      <div className="alert-actions">
        {alert.status === 'open' && (
          <>
            <button
              onClick={() => onAcknowledge(alert._id)}
              className="btn btn-secondary"
            >
              Acknowledge
            </button>
            <button
              onClick={() => onResolve(alert._id, false)}
              className="btn btn-primary"
            >
              Resolve
            </button>
          </>
        )}
        {alert.status === 'acknowledged' && (
          <>
            <button
              onClick={() => onResolve(alert._id, false)}
              className="btn btn-primary"
            >
              Resolve
            </button>
            <button
              onClick={() => onResolve(alert._id, true)}
              className="btn btn-outline"
            >
              False Positive
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AlertCard;

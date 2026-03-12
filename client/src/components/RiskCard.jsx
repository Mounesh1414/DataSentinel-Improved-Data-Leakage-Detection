import React from 'react';
import { getRiskColor, getRiskBgColor } from '../utils/riskCalculator';
import '../styles/riskcard.css';

const RiskCard = ({ scan }) => {
  const riskColor = getRiskColor(scan.riskLevel);
  const riskBgColor = getRiskBgColor(scan.riskLevel);

  return (
    <div className="risk-card" style={{ borderLeftColor: riskColor }}>
      <div className="risk-header">
        <h3>{scan.fileName}</h3>
        <span className="risk-badge" style={{ backgroundColor: riskBgColor, color: riskColor }}>
          {scan.riskLevel}
        </span>
      </div>

      <div className="risk-body">
        <div className="risk-score">
          <span className="score-label">Risk Score:</span>
          <span className="score-value" style={{ color: riskColor }}>
            {scan.riskScore}/100
          </span>
        </div>

        <div className="risk-details">
          <p><strong>File Type:</strong> {scan.fileType}</p>
          <p><strong>Size:</strong> {(scan.fileSize / 1024).toFixed(2)} KB</p>
          <p><strong>Uploaded:</strong> {new Date(scan.createdAt).toLocaleDateString()}</p>
        </div>

        {scan.sensitiveDataFound && (
          <div className="sensitive-data">
            <strong>Detected Patterns:</strong>
            <ul>
              {scan.detectedPatterns?.slice(0, 3).map((pattern, idx) => (
                <li key={idx}>
                  {pattern.type}: {pattern.count} occurrence(s)
                </li>
              ))}
            </ul>
          </div>
        )}

        {scan.quarantined && (
          <div className="quarantine-notice">
            🔒 File has been quarantined
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskCard;

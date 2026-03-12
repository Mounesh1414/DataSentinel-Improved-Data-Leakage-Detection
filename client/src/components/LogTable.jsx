import React from 'react';
import { formatDate } from '../utils/formatDate';
import '../styles/logtable.css';

const LogTable = ({ logs = [] }) => {
  if (logs.length === 0) {
    return <div className="no-data">No logs found</div>;
  }

  return (
    <div className="log-table-container">
      <table className="log-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
            <th>IP Address</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className={`status-${log.status}`}>
              <td>{log.user?.name || 'System'}</td>
              <td className="action-cell">{log.action}</td>
              <td className="resource-cell">{log.resource || '-'}</td>
              <td>
                <span className={`status-badge ${log.status}`}>
                  {log.status}
                </span>
              </td>
              <td className="ip-cell">{log.ipAddress || '-'}</td>
              <td className="date-cell">{formatDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;

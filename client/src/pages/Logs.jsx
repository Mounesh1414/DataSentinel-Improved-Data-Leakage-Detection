import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LogTable from '../components/LogTable';
import axiosInstance from '../utils/axiosInstance';
import '../styles/logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterSeverity, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 50 };
      if (filterAction) params.action = filterAction;
      if (filterSeverity) params.severity = filterSeverity;

      const response = await axiosInstance.get('/logs', { params });
      setLogs(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get('/logs/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logs.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="logs-page">
        <div className="logs-header">
          <h1>Activity Logs</h1>
          <p>Monitor system activity and user actions</p>
        </div>

        <div className="logs-toolbar">
          <div className="logs-filters">
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="file_upload">File Upload</option>
              <option value="file_scan">File Scan</option>
            </select>

            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <button onClick={handleExport} className="export-btn">
            📥 Export CSV
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading logs...</p>
          </div>
        ) : (
          <>
            <LogTable logs={logs} />

            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Logs;

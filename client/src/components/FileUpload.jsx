import React, { useState } from 'react';
import { useScanAPI } from '../hooks/useScanAPI';
import '../styles/fileupload.css';

const FileUpload = ({ onScanComplete }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploadAndScan, loading, error } = useScanAPI();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const result = await uploadAndScan(file);
      onScanComplete(result);
      setFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  return (
    <div className="file-upload">
      <form onSubmit={handleSubmit}>
        <div
          className={`upload-area ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h3>Drag & drop your file here</h3>
            <p>or click to select</p>
            <input
              type="file"
              onChange={handleChange}
              className="file-input"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="file-label">
              Browse Files
            </label>
          </div>
        </div>

        {file && (
          <div className="file-preview">
            <div className="file-info">
              <span className="file-icon">📄</span>
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="remove-btn"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="scan-btn"
          disabled={!file || loading}
        >
          {loading ? 'Scanning...' : 'Scan File'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;

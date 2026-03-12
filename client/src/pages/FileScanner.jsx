import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import RiskCard from '../components/RiskCard';
import '../styles/filescanner.css';

const FileScanner = () => {
  const [scanResults, setScanResults] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);

  const handleScanComplete = (result) => {
    setScanResults([result, ...scanResults]);
    setCurrentScan(result);
  };

  return (
    <>
      <Navbar />
      <div className="file-scanner">
        <div className="scanner-header">
          <h1>File Scanner</h1>
          <p>Upload and scan files for sensitive data leakage</p>
        </div>

        <div className="scanner-container">
          <div className="upload-section">
            <FileUpload onScanComplete={handleScanComplete} />
          </div>

          {currentScan && (
            <div className="current-scan">
              <h2>Latest Scan Result</h2>
              <RiskCard scan={currentScan} />
            </div>
          )}
        </div>

        {scanResults.length > 0 && (
          <div className="results-section">
            <h2>Scan History</h2>
            <div className="results-grid">
              {scanResults.map((scan) => (
                <RiskCard key={scan._id} scan={scan} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FileScanner;

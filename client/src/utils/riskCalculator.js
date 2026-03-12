export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'CRITICAL':
      return '#d32f2f';
    case 'HIGH':
      return '#f57c00';
    case 'MEDIUM':
      return '#fbc02d';
    case 'LOW':
      return '#388e3c';
    default:
      return '#999';
  }
};

export const getRiskBgColor = (riskLevel) => {
  switch (riskLevel) {
    case 'CRITICAL':
      return '#ffebee';
    case 'HIGH':
      return '#fff3e0';
    case 'MEDIUM':
      return '#fffde7';
    case 'LOW':
      return '#e8f5e9';
    default:
      return '#f5f5f5';
  }
};

export const calculateOverallRisk = (scans) => {
  if (scans.length === 0) return 0;
  const total = scans.reduce((sum, scan) => sum + scan.riskScore, 0);
  return Math.round(total / scans.length);
};

export const getAlertStats = (alerts) => {
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
    high: alerts.filter((a) => a.severity === 'HIGH').length,
    medium: alerts.filter((a) => a.severity === 'MEDIUM').length,
    open: alerts.filter((a) => a.status === 'open').length,
  };
};

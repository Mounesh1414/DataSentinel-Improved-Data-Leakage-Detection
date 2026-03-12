const nodemailer = require('nodemailer');

class Notifier {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmailAlert(email, subject, htmlContent) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log('Email sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error.message);
      return false;
    }
  }

  async sendCriticalAlert(email, alertDetails) {
    const htmlContent = `
      <h2>🚨 Critical Data Leakage Alert</h2>
      <p><strong>Alert Title:</strong> ${alertDetails.title}</p>
      <p><strong>Severity:</strong> ${alertDetails.severity}</p>
      <p><strong>Description:</strong> ${alertDetails.description}</p>
      <p><strong>Risk Score:</strong> ${alertDetails.riskScore}/100</p>
      <p><strong>Detected Patterns:</strong></p>
      <ul>
        ${alertDetails.patterns.map((p) => `<li>${p.type}: ${p.count} occurrence(s)</li>`).join('')}
      </ul>
      <p>Please review the DataSentinel dashboard immediately.</p>
    `;

    return await this.sendEmailAlert(email, 'DataSentinel: Critical Alert', htmlContent);
  }

  async sendDailyReport(email, reportData) {
    const htmlContent = `
      <h2>📊 DataSentinel Daily Report</h2>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Total Scans:</strong> ${reportData.totalScans}</p>
      <p><strong>Critical Issues:</strong> ${reportData.criticalIssues}</p>
      <p><strong>Open Alerts:</strong> ${reportData.openAlerts}</p>
      <p><strong>Files Quarantined:</strong> ${reportData.quarantinedFiles}</p>
      <p>View full details on the DataSentinel dashboard.</p>
    `;

    return await this.sendEmailAlert(email, 'DataSentinel: Daily Report', htmlContent);
  }
}

module.exports = new Notifier();

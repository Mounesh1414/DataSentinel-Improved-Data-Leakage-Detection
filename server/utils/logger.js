const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }
  }

  getLogFile(type = 'general') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `${type}-${date}.log`);
  }

  log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message} ${JSON.stringify(metadata)}\n`;

    const logFile = this.getLogFile(level.toLowerCase());
    fs.appendFileSync(logFile, logEntry);

    console.log(logEntry);
  }

  info(message, metadata) {
    this.log('INFO', message, metadata);
  }

  error(message, metadata) {
    this.log('ERROR', message, metadata);
  }

  warn(message, metadata) {
    this.log('WARN', message, metadata);
  }

  debug(message, metadata) {
    this.log('DEBUG', message, metadata);
  }
}

module.exports = new Logger();

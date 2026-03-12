// Sensitive Keywords & Detection Rules - Enhanced
const SENSITIVE_KEYWORDS = {
  financial: [
    'ssn', 'credit card', 'bank account', 'routing number', 'swift code', 'iban', 'account number',
    'cvv', 'pin', 'password', 'salary', 'invoice', 'payment', 'transaction', 'wire transfer',
    'eft', 'ach', 'cryptocurrency', 'bitcoin', 'ethereum', 'wallet', 'balance', 'debit', 'credit',
    'atm', 'loan', 'mortgage', 'interest rate', 'principal', 'promissory note'
  ],
  personal: [
    'social security', 'passport', 'drivers license', 'date of birth', 'phone number', 'email', 
    'address', 'full name', 'aadhaar', 'pan', 'voter id', 'license number', 'national id',
    'emergency contact', 'maiden name', 'marital status', 'spouse', 'children', 'next of kin'
  ],
  healthcare: [
    'patient id', 'medical record', 'diagnosis', 'prescription', 'medication', 'health insurance', 
    'member id', 'patient name', 'allergies', 'treatment', 'surgery', 'hospital', 'clinic',
    'doctor', 'physician', 'mental health', 'psychiatrist', 'therapy', 'counseling', 'hiv', 'aids'
  ],
  intellectual: [
    'confidential', 'proprietary', 'trade secret', 'patent', 'classified', 'restricted',
    'internal use only', 'do not distribute', 'nda', 'non-disclosure', 'copyright',
    'trademark', 'license agreement', 'source code', 'algorithm', 'business plan',
    'strategic plan', 'merger', 'acquisition', 'ipo', 'valuation'
  ],
  credentials: [
    'api key', 'access token', 'secret key', 'private key', 'username', 'authentication',
    'bearer token', 'oauth', 'jwt', 'session id', 'cookie', 'refresh token', 'passphrase',
    'admin', 'root user', 'superuser', 'sudo', 'password hash'
  ],
  network: [
    'ip address', 'hostname', 'domain', 'server', 'database', 'firewall', 'vpn',
    'localhost', '127.0.0.1', 'ssh', 'telnet', 'ftp', 'smb', 'dns', 'dhcp',
    'ssl certificate', 'certificate', 'port', 'socket'
  ]
};

const REGEX_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  aadhaar: /\b\d{4}\s\d{4}\s\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phoneNumber: /\b(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  apiKey: /(?:api[_-]?key|apikey|api_secret|secret_key|access_token)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}/gi,
  privateKey: /BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY/gi,
  dob: /\b(?:0?[1-9]|[12][0-9]|3[01])[-\/](?:0?[1-9]|1[0-2])[-\/](?:\d{4}|\d{2})\b/g,
  accountNumber: /\b\d{8,20}\b/g,
  ifscCode: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
  jwtToken: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_\-]+/g,
  bearerToken: /bearer\s+[a-zA-Z0-9\.\-_]*\w/gi,
  awsKey: /AKIA[0-9A-Z]{16}/g,
  mongoUri: /mongodb(\+srv)?:\/\/[^\s:]+:[^\s@]+@[^\s/]+/gi
};

const RISK_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

const RISK_SCORES = {
  CRITICAL: 90,
  HIGH: 70,
  MEDIUM: 50,
  LOW: 30,
};

// Category risk levels
const CATEGORY_RISK = {
  credentials: 'CRITICAL',
  financial: 'CRITICAL',
  intellectual: 'HIGH',
  personal: 'HIGH',
  healthcare: 'HIGH',
  network: 'MEDIUM'
};

module.exports = {
  SENSITIVE_KEYWORDS,
  REGEX_PATTERNS,
  RISK_LEVELS,
  RISK_SCORES,
  CATEGORY_RISK,
};

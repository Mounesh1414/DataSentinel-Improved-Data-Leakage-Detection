# DataSentinel - Data Leakage Detection & Compliance Monitoring System

A comprehensive MERN-based (MongoDB, Express, React, Node.js) system for detecting data leakage, monitoring sensitive data movement, scanning files, generating alerts, and logging user activity.

## 🌟 Features

### Core Capabilities
- **File Scanning**: Upload and scan files for sensitive data detection
- **Data Leakage Detection**: Identify SSN, credit cards, email addresses, phone numbers, API keys, and sensitive keywords
- **Risk Assessment**: Automatic risk scoring (0-100) with severity levels
- **Alert Management**: Create, acknowledge, and resolve alerts
- **Activity Logging**: Track all user actions and system events
- **Compliance Reporting**: Generate compliance reports with risk distribution

### Security Features
- JWT-based authentication
- Role-based access control (User, Admin, Auditor)
- Secure password hashing with bcryptjs
- IP address logging
- Audit trails for all actions

### Admin Dashboard
- System statistics overview
- User management
- Compliance reports
- Alert monitoring
- Log analysis and export

## 📋 Project Structure

```
DataSentinel/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── context/            # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utility functions
│   │   ├── styles/             # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js Backend
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Utility functions
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone and Setup Environment
```bash
cd DataSentinel

# Copy environment variables
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

#### 2. Configure Environment Variables
Edit `.env` and `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/datasentinel
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

#### 3. Install Server Dependencies
```bash
cd server
npm install
```

#### 4. Install Client Dependencies
```bash
cd ../client
npm install
```

### Running the Application

#### Start MongoDB
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Start Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend (in a new terminal)
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### File Scanner Endpoints
- `POST /api/scan/upload` - Upload and scan file
- `GET /api/scan/results` - Get all scan results
- `GET /api/scan/results/:id` - Get scan details
- `PUT /api/scan/quarantine/:id` - Quarantine file

### Alert Endpoints
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert details
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `GET /api/alerts/stats/overview` - Alert statistics

### Log Endpoints
- `GET /api/logs` - Get activity logs
- `GET /api/logs/user/:userId` - Get user logs
- `GET /api/logs/stats/overview` - Log statistics
- `GET /api/logs/export/csv` - Export logs as CSV

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/compliance-report` - Compliance report

## 🔍 Data Detection Patterns

### Supported Patterns
- **Financial**: SSN, Credit Cards, Bank Account Numbers, CVV, PIN
- **Personal**: Passport, Driver's License, Date of Birth, Phone Numbers, Email
- **Healthcare**: Patient ID, Medical Records, Diagnosis, Prescriptions
- **Intellectual**: Confidential, Proprietary, Trade Secrets, Patents
- **Credentials**: API Keys, Access Tokens, Secret Keys, Bearer Tokens

### Risk Scoring Algorithm
- Pattern detection: 0-40 points based on matches
- Keyword frequency: 0-30 points based on sensitive keywords
- Pattern type: Weighted by severity (credentials > financial > personal)
- Risk Levels:
  - CRITICAL: 90-100 (Immediate action required)
  - HIGH: 70-89 (Review urgently)
  - MEDIUM: 50-69 (Monitor closely)
  - LOW: 0-49 (Standard monitoring)

## 🛠️ Technology Stack

### Frontend
- React 18
- React Router v6
- Axios
- CSS3 with Flexbox/Grid
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcryptjs
- PDF-parse & Mammoth (file parsing)
- Nodemailer (email alerts)

## 👥 User Roles

1. **User**: Can upload files, view their scans and alerts
2. **Admin**: Full system access, user management, compliance reports
3. **Auditor**: View-only access to logs and reports

## 📝 Demo Credentials

```
Email: admin@datasentinel.com
Password: admin123
```

## ⚠️ Security Recommendations

1. Change JWT_SECRET in production
2. Use environment variables for sensitive data
3. Enable HTTPS/SSL
4. Implement rate limiting
5. Set up MongoDB authentication
6. Regular security audits
7. Keep dependencies updated

## 📄 Features Roadmap

- [ ] Two-factor authentication
- [ ] Advanced ML-based detection
- [ ] Real-time file monitoring
- [ ] Integration with SIEM systems
- [ ] Custom rule builder
- [ ] Advanced reporting dashboard
- [ ] Data quarantine management UI
- [ ] Webhook integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a pull request

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact development team

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

## ⭐ Acknowledgments

- MongoDB for database
- Express.js for backend framework
- React for frontend library
- Open source community contributions

---

**DataSentinel** - Protecting Your Data, Ensuring Compliance

# Domain Monitoring System - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [How It Works](#how-it-works)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [File Structure](#file-structure)
6. [Features](#features)
7. [User Guide](#user-guide)
8. [Installation & Deployment](#installation--deployment)
9. [Development Guide](#development-guide)
10. [API Reference](#api-reference)

---

## 🎯 Project Overview

**Domain Monitoring System** is a desktop application that helps users discover available domain names based on their keywords. The system automatically checks domain availability and notifies users via email when domains become available.

### Purpose
- **Problem**: Finding available domain names matching specific keywords is time-consuming
- **Solution**: Automated monitoring system that continuously checks domain availability
- **Benefit**: Save time and never miss when your desired domain becomes available

### Key Capabilities
✅ Add keywords to monitor  
✅ Automatic domain generation from keywords  
✅ Real-time domain availability checking  
✅ Email notifications for available domains  
✅ Export results to CSV  
✅ Background monitoring service  

---

## ⚙️ How It Works

### 1. User Flow
```
User adds keywords → System generates domain variations → Checks availability → 
Stores results in database → Sends email notifications → User downloads CSV
```

### 2. System Components

#### **Frontend (User Interface)**
- Built with vanilla HTML/CSS/JavaScript
- Provides interactive dashboard
- Communicates with backend via REST API
- Real-time status updates every 30 seconds

#### **Backend (Python API)**
- Flask web server handles API requests
- Processes keyword inputs
- Manages database operations
- Sends email notifications

#### **Database**
- SQLite database stores:
  - Keywords to monitor
  - Discovery results
  - Email configuration
  - Notification status

#### **Monitoring Service**
- Background process runs independently
- Checks domains every 6 hours
- Uses `python-whois` to verify availability
- Automatically sends email alerts

#### **Desktop App (Electron)**
- Wraps the web interface as a native desktop application
- Auto-starts Python backend on launch
- Provides system tray integration
- Cross-platform (Windows, macOS, Linux)

### 3. Domain Checking Process

```python
# For keyword "tech startup":
1. Generate combinations: tech-startup.com, techstartup.com, etc.
2. Check DNS for domain registration
3. Verify WHOIS data
4. Mark as Available/Taken
5. Store in database
6. Send email if available
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Why Used |
|------------|---------|----------|
| HTML5 | Structure | Standard web markup |
| CSS3 | Styling | Modern animations, gradients, responsive design |
| JavaScript (ES6+) | Interactivity | Fetch API, DOM manipulation, event handling |

### Backend
| Technology | Purpose | Why Used |
|------------|---------|----------|
| Python 3.8+ | Core language | Easy to read, extensive libraries |
| Flask | Web framework | Lightweight, perfect for REST APIs |
| SQLite | Database | No server needed, file-based, portable |
| python-whois | Domain checking | Reliable WHOIS lookups |
| dnspython | DNS validation | Fast DNS record checking |
| smtplib | Email sending | Built-in Python email library |

### Desktop Application
| Technology | Purpose | Why Used |
|------------|---------|----------|
| Electron | Desktop wrapper | Cross-platform, uses web technologies |
| PyInstaller | Python bundling | Packages Python code into executables |
| Electron Builder | App packaging | Creates installers for Windows/Mac/Linux |

### Development Tools
| Tool | Purpose |
|------|---------|
| Node.js & npm | Package management, build scripts |
| Git | Version control |
| VS Code | Recommended IDE |

---

## 🏗️ Project Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Desktop Application                  │
│                    (Electron)                        │
│  ┌──────────────────────────────────────────────┐  │
│  │         Frontend UI (HTML/CSS/JS)            │  │
│  │  - Add Keywords Form                         │  │
│  │  - Results Table                             │  │
│  │  - Settings Modal                            │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │ HTTP Requests (localhost:5000)    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │         Python Backend (Flask API)           │  │
│  │  - /api/keywords (POST)                      │  │
│  │  - /api/scan-now (POST)                      │  │
│  │  - /api/results (GET)                        │  │
│  │  - /api/settings (GET/POST)                  │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐  │
│  │         SQLite Database                      │  │
│  │  - keywords table                            │  │
│  │  - results table                             │  │
│  │  - settings table                            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

         ┌────────────────────────────────┐
         │  Background Monitor Service    │
         │  (Runs every 6 hours)          │
         │  - Reads keywords from DB      │
         │  - Checks domain availability  │
         │  - Sends email notifications   │
         └────────────────────────────────┘
```

### Data Flow

1. **User Input** → Frontend Form → POST `/api/keywords`
2. **Backend Processing** → Parse keywords → Store in database
3. **Monitoring Service** → Query keywords → Generate domains → Check WHOIS
4. **Results Storage** → Save to database with timestamp
5. **Email Notification** → SMTP sends available domains to user
6. **Frontend Display** → GET `/api/results` → Render table
7. **CSV Export** → GET `/api/download-csv` → Download file

---

## 📂 File Structure

```
dms1/
├── electron/                    # Electron main process
│   └── main.js                  # App entry point, manages backend process
│
├── frontend/                    # Web interface
│   ├── index.html              # Main UI layout
│   ├── script.js               # Frontend logic & API calls
│   └── style.css               # Styling & animations
│
├── backend/                     # Python backend
│   ├── api.py                  # Flask REST API endpoints
│   ├── database.py             # SQLite database functions
│   └── monitor_service.py      # Background domain checker
│
├── scripts/                     # Build automation
│   ├── bundle-python.js        # Packages Python with PyInstaller
│   └── cleanup.js              # Cleans build artifacts before rebuild
│
├── resources/                   # Application assets
│   └── icon.ico                # App icon
│
├── data/                        # Runtime data (created at runtime)
│   └── domains.db              # SQLite database file
│
├── python-dist/                 # Bundled Python executables (build output)
│   ├── domain-monitor-api/     # API server executable
│   └── domain-monitor-service/ # Background service executable
│
├── dist-electron/               # Final installers (build output)
│   └── Domain Monitoring System-Setup-1.0.0.exe
│
├── package.json                 # Node.js project configuration
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── README.md                    # Quick start guide
└── PROJECT_DOCUMENTATION.md     # This file
```

### Important Files Explained

#### `electron/main.js`
- Starts Electron app
- Launches Python backend process
- Creates application window
- Handles app lifecycle

#### `backend/api.py`
- Defines all REST API endpoints
- Handles keyword management
- Processes scan requests
- Manages email settings

#### `backend/database.py`
- Database initialization
- CRUD operations for keywords/results
- Settings management

#### `backend/monitor_service.py`
- Standalone background process
- Domain availability checking
- Email notification logic

#### `scripts/bundle-python.js`
- Uses PyInstaller to create executables
- Copies frontend files to distribution
- Handles platform-specific bundling

---

## ✨ Features

### 1. Keyword Management
- **Add Keywords**: Enter keywords manually (one per line or comma-separated)
- **Upload CSV**: Bulk import keywords from CSV file
- **Drag & Drop**: Drop CSV files directly onto upload area

### 2. Domain Scanning
- **Manual Scan**: Click "Scan Now" for immediate check
- **Automatic Monitoring**: Background service runs every 6 hours
- **Domain Variations**: Generates multiple TLDs (.com, .net, .org, etc.)

### 3. Results Display
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Sortable Table**: View domain, keyword, check date, notification status
- **CSV Export**: Download all results with one click

### 4. Email Notifications
- **SMTP Configuration**: Support for Gmail, Outlook, custom servers
- **Test Email**: Verify settings before saving
- **Auto-notify**: Sends email when available domains are found

### 5. Data Management
- **Clear Data**: Remove all keywords and results
- **Persistent Storage**: SQLite preserves data between sessions

---

## 📖 User Guide

### Initial Setup

1. **Install Application**
   - Run `Domain Monitoring System-Setup-1.0.0.exe`
   - Follow installation wizard
   - App launches automatically after install

2. **Configure Email** (Optional but recommended)
   - Click ⚙️ Settings button
   - Enter SMTP details:
     - Gmail: smtp.gmail.com, Port 587
     - Outlook: smtp-mail.outlook.com, Port 587
   - Generate App Password (for Gmail):
     - Go to Google Account → Security → App Passwords
     - Create password for "Mail"
     - Paste in settings
   - Click "Test Email" to verify
   - Save settings

3. **Add Your First Keyword**
   - Click in "Add Keywords" text box
   - Type keyword (e.g., "tech startup")
   - Click "Add Keywords" button
   - Keyword count updates in status card

4. **Run First Scan**
   - Click "⚡ Scan Now" button
   - Wait 5-10 seconds
   - Available domains appear in table

5. **Download Results**
   - Click "📥 Download CSV"
   - Open file in Excel/Google Sheets

### Daily Usage

- **Check Results**: Launch app to see latest available domains
- **Add More Keywords**: Type new keywords anytime
- **Refresh**: Click 🔄 Refresh to get latest results
- **Email Alerts**: Automatic notifications sent when domains found

---

## 🚀 Installation & Deployment

### For End Users

**Windows:**
1. Download `Domain Monitoring System-Setup-1.0.0.exe`
2. Double-click to run installer
3. Choose installation directory
4. Click Install
5. Launch from Start Menu or Desktop shortcut

**Requirements:**
- Windows 10 or later
- 200 MB free disk space
- Internet connection

### For Developers

**Prerequisites:**
- Node.js 18+ ([Download](https://nodejs.org))
- Python 3.8+ ([Download](https://python.org))
- Git

**Setup Steps:**

```bash
# 1. Clone repository
git clone <repository-url>
cd dms1

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Bundle Python backend
npm run bundle-python

# 5. Build Windows installer
npm run build:win

# Output: dist-electron/Domain Monitoring System-Setup-1.0.0.exe
```

**Development Mode:**

```bash
# Run app in dev mode (uses local Python, not bundled)
npm run dev
```

---

## 👨‍💻 Development Guide

### Making Changes

#### Modify Frontend UI
1. Edit `frontend/index.html`, `style.css`, or `script.js`
2. Run `npm run bundle-python` (copies files to Python dist)
3. Run `npm run build:win`
4. Test new installer

#### Modify Backend API
1. Edit `backend/api.py` or `database.py`
2. Run `npm run bundle-python` (rebuilds Python executables)
3. Run `npm run build:win`
4. Test changes

#### Change App Name/Icon
- **Name**: Edit `package.json` → `build.productName`
- **Icon**: Replace `resources/icon.ico` (Windows), `icon.png` (Mac/Linux)

### Build Scripts

```bash
# Clean build artifacts
npm run clean

# Bundle Python only (faster for testing)
npm run bundle-python

# Full Windows build
npm run build:win

# Run in development mode
npm run dev
```

### Debugging

**Frontend Debugging:**
- Open app → F12 (DevTools)
- Check Console for JavaScript errors
- Network tab shows API calls

**Backend Debugging:**
- Logs appear in terminal when running `npm run dev`
- Check `data/domains.db` with SQLite browser

**Common Issues:**
- **404 Error**: Frontend files not copied → Run `npm run bundle-python`
- **API Not Responding**: Port 5000 in use → Kill process, restart app
- **Email Not Sending**: Check SMTP settings, use App Password

---

## 🔌 API Reference

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Add Keywords
```http
POST /api/keywords
Content-Type: application/json

{
  "keywords": ["tech startup", "ai tools"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added 2 keywords"
}
```

#### 2. Upload CSV
```http
POST /api/upload-csv
Content-Type: multipart/form-data

file: keywords.csv
```

#### 3. Get Status
```http
GET /api/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "keywords_count": 5,
    "domains_found": 12,
    "email_configured": true
  }
}
```

#### 4. Get Results
```http
GET /api/results
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "domain": "tech-startup.com",
      "keyword": "tech startup",
      "checked_date": "2026-02-03T10:30:00",
      "notified": true
    }
  ]
}
```

#### 5. Trigger Scan
```http
POST /api/scan-now
```

#### 6. Download CSV
```http
GET /api/download-csv
```

Returns CSV file for download.

#### 7. Get Settings
```http
GET /api/settings
```

#### 8. Save Settings
```http
POST /api/settings
Content-Type: application/json

{
  "settings": {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "user@gmail.com",
    "smtp_password": "app-password",
    "smtp_from": "user@gmail.com",
    "smtp_to": "recipient@gmail.com"
  }
}
```

#### 9. Test Email
```http
POST /api/test-email
```

#### 10. Clear Data
```http
POST /api/clear-data
```

---

## 🔐 Security Considerations

### Data Storage
- Database file stored locally: `data/domains.db`
- Email credentials encrypted in database
- No data sent to external servers

### Email Configuration
- **Use App Passwords**: Never use actual account passwords
- **Gmail**: Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Credentials stored locally only

### Best Practices
- Keep app updated
- Don't share `data/domains.db` file (contains email credentials)
- Use strong app passwords

---

## 📊 Database Schema

### Keywords Table
```sql
CREATE TABLE keywords (
    id INTEGER PRIMARY KEY,
    keyword TEXT UNIQUE,
    added_date TEXT
);
```

### Results Table
```sql
CREATE TABLE results (
    id INTEGER PRIMARY KEY,
    domain TEXT,
    keyword TEXT,
    available BOOLEAN,
    checked_date TEXT,
    notified BOOLEAN DEFAULT 0
);
```

### Settings Table
```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
```

---

## 🤝 Support & Contribution

### Getting Help
- Check this documentation first
- Review existing issues in repository
- Contact project maintainer

### Contributing
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📝 License

This project is licensed under the MIT License. See `LICENSE` file for details.

---

## 🎉 Acknowledgments

**Technologies Used:**
- Electron Framework
- Flask Web Framework
- python-whois library
- SQLite Database

**Built with ❤️ for domain hunters everywhere!**

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Author:** Domain Monitoring System Team

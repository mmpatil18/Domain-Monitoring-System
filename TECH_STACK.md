# Technology Stack & Components

Complete list of technologies, libraries, and tools used in the Domain Monitor System.

---

## 📋 Table of Contents
- [Programming Languages](#programming-languages)
- [Backend Technologies](#backend-technologies)
- [Frontend Technologies](#frontend-technologies)
- [Database](#database)
- [External APIs & Services](#external-apis--services)
- [Development Tools](#development-tools)
- [System Requirements](#system-requirements)

---

## Programming Languages

### Python 3.8+
**Purpose**: Backend development, monitoring service, API server
**Used for**:
- Domain availability checking
- Database operations
- Email notifications
- REST API server
- Background monitoring service

### JavaScript (ES6+)
**Purpose**: Frontend interactivity
**Used for**:
- DOM manipulation
- AJAX/API calls
- Form handling
- File uploads
- Real-time UI updates

### HTML5
**Purpose**: Web interface structure
**Used for**:
- Page layout
- Forms and inputs
- Semantic markup

### CSS3
**Purpose**: Web interface styling
**Used for**:
- Visual design
- Animations
- Responsive layout
- Gradient backgrounds
- Modern UI effects

### Batch Script (.bat)
**Purpose**: Windows automation
**Used for**:
- Installation automation
- Service startup
- Background process management

---

## Backend Technologies

### Web Framework

#### Flask 3.0.0
**Purpose**: Web server and REST API framework
**Used for**:
- HTTP server
- API endpoint routing
- Request/response handling
- Static file serving
- CORS management

**Key Features Used**:
- Route decorators (`@app.route`)
- Request parsing (`request.get_json()`)
- File uploads (`request.files`)
- Response generation (`jsonify()`, `send_file()`)

---

### Python Libraries

#### python-dotenv 1.0.0
**Purpose**: Environment variable management
**Used for**:
- Loading `.env` configuration files
- Separating configuration from code
- Managing sensitive credentials (email passwords, SMTP settings)

**Example**:
```python
# Loads SMTP_USERNAME, SMTP_PASSWORD, etc.
from dotenv import load_dotenv
load_dotenv()
```

---

#### python-whois 0.8.0
**Purpose**: Domain WHOIS information retrieval
**Used for**:
- Querying domain registration data
- Checking domain availability
- Retrieving domain registration details

**Example Use**:
```python
import whois
w = whois.whois('example.com')
# Returns registration info or error if not registered
```

**What it checks**:
- Domain registration status
- Registrar information
- Expiration dates

---

#### dnspython 2.4.2
**Purpose**: DNS (Domain Name System) query library
**Used for**:
- Fast domain existence checks
- DNS record lookups
- Hostname resolution

**Example Use**:
```python
import socket
socket.gethostbyname('example.com')
# Throws error if domain doesn't exist
```

**Why we use it**:
- Faster than WHOIS for initial checks
- Reliable availability indicator
- Low latency

---

#### requests 2.31.0
**Purpose**: HTTP client library
**Used for**:
- Future API integrations
- HTTP requests to domain services
- Dependency for other libraries

**Potential uses**:
- Integration with domain registrar APIs (GoDaddy, Namecheap)
- Webhook notifications
- External service calls

---

### Email & SMTP

#### Built-in Python Libraries
**smtplib** (Standard Library)
**Purpose**: Sending emails via SMTP
**Used for**:
- Connecting to email servers
- Sending alert notifications
- Email authentication

**email.mime** (Standard Library)
**Purpose**: Email message construction
**Used for**:
- Creating HTML emails
- Multipart messages (plain text + HTML)
- Email headers

**Example**:
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
```

**Supported Email Providers**:
- Gmail (smtp.gmail.com:587)
- Outlook/Hotmail (smtp.office365.com:587)
- Yahoo (smtp.mail.yahoo.com:587)
- Any SMTP-compatible service

---

## Frontend Technologies

### Core Web Technologies

#### HTML5
**Components Used**:
- Semantic elements (`<header>`, `<section>`)
- Forms (`<form>`, `<input>`, `<textarea>`)
- File input (`<input type="file">`)
- Tables (`<table>`, `<thead>`, `<tbody>`)

#### CSS3
**Features Used**:
- Flexbox layout
- CSS Grid
- CSS animations (`@keyframes`)
- Gradient backgrounds (`linear-gradient`)
- Transitions
- Media queries (responsive design)
- Backdrop filters (glass morphism)
- Custom properties

**Design Techniques**:
- Glass morphism (`backdrop-filter: blur()`)
- Smooth animations
- Hover effects
- Responsive breakpoints

#### Vanilla JavaScript
**No frameworks** - Pure JavaScript for lightweight performance

**Features Used**:
- Fetch API (AJAX requests)
- DOM manipulation
- Event listeners
- Async/await
- FormData API (file uploads)
- Template literals
- Arrow functions

**Why Vanilla JS?**:
- No build process needed
- Faster load times
- Smaller bundle size
- Direct control

---

## Database

### SQLite 3
**Purpose**: Embedded relational database
**Used for**:
- Keyword storage
- Domain tracking
- Scan history
- Notification status

**Why SQLite?**:
- ✅ No separate server needed
- ✅ Single file database
- ✅ ACID compliant
- ✅ Zero configuration
- ✅ Built into Python

**Database Schema**:

```
keywords
├── id (INTEGER PRIMARY KEY)
├── keyword (TEXT UNIQUE)
├── added_date (TIMESTAMP)
└── active (INTEGER)

domains
├── id (INTEGER PRIMARY KEY)
├── keyword_id (INTEGER FK)
├── domain (TEXT UNIQUE)
├── available (INTEGER)
├── checked_date (TIMESTAMP)
└── notified (INTEGER)

scan_history
├── id (INTEGER PRIMARY KEY)
├── scan_date (TIMESTAMP)
├── keywords_scanned (INTEGER)
├── domains_found (INTEGER)
└── status (TEXT)
```

---

## External APIs & Services

### WHOIS Protocol
**Purpose**: Domain registration lookup
**Provider**: Various WHOIS servers
**Used for**:
- Checking domain registration status
- Retrieving registrar information
- Domain availability verification

**How it works**:
1. Query sent to WHOIS server
2. Server returns registration data (or error)
3. Parse response to determine availability

### DNS (Domain Name System)
**Purpose**: Domain resolution
**Used for**:
- Fast domain existence checks
- Primary availability indicator
- Hostname to IP mapping

**Providers**: System DNS servers (configurable)

### SMTP Servers
**Purpose**: Email delivery
**Common Providers**:
- Gmail (smtp.gmail.com)
- Outlook/Office365 (smtp.office365.com)
- SendGrid (smtp.sendgrid.net)
- Mailgun
- Custom SMTP servers

---

## Development Tools

### Virtual Environment (venv)
**Purpose**: Python package isolation
**Used for**:
- Dependency management
- Preventing version conflicts
- Reproducible environments

**Created by**: `install.bat`

### pip (Python Package Manager)
**Purpose**: Installing Python dependencies
**Used for**:
- Installing Flask, python-whois, etc.
- Package version management
- Requirements file handling

### NSSM (Non-Sucking Service Manager)
**Purpose**: Windows service creation
**Used for**:
- Running backend as Windows service
- 24/7 operation
- Auto-restart on failure
- Service management

**Alternative to**: Built-in Windows service creation (much simpler)

---

## File Formats

### CSV (Comma-Separated Values)
**Purpose**: Data import/export
**Used for**:
- Keyword bulk upload
- Results export
- Spreadsheet compatibility

**Libraries**: Built-in Python `csv` module

### JSON (JavaScript Object Notation)
**Purpose**: API data exchange
**Used for**:
- REST API requests/responses
- Configuration data
- Inter-process communication

**Libraries**: Built-in Python `json` module

### ENV (Environment Variables)
**Purpose**: Configuration management
**Used for**:
- Sensitive credentials
- Environment-specific settings
- Feature flags

**Format**:
```env
KEY=value
SMTP_SERVER=smtp.gmail.com
```

---

## System Requirements

### Operating System
**Primary**: Windows 10/11
**Why**: Batch scripts, NSSM service manager

**Can be adapted for**:
- Linux (bash scripts instead of .bat)
- macOS (bash scripts)

### Runtime Environment
- **Python**: 3.8 or higher
- **Browser**: Modern browser (Chrome, Edge, Firefox, Safari)
- **Network**: Internet connection for domain checks

---

## Architecture Pattern

### MVC-Inspired Architecture

**Model** (Data Layer):
- `database.py` - SQLite operations
- Database schema

**View** (Presentation Layer):
- `index.html` - UI structure
- `style.css` - Visual design
- `script.js` - UI behavior

**Controller** (Business Logic):
- `api.py` - REST endpoints
- `monitor_service.py` - Background worker
- `domain_checker.py` - Domain logic
- `email_notifier.py` - Notification logic

---

## Design Patterns Used

### Singleton Pattern
**Where**: `Database` class initialization
**Purpose**: Single database connection instance

### Service Pattern
**Where**: `MonitorService`, `EmailNotifier`, `DomainChecker`
**Purpose**: Encapsulated business logic

### Repository Pattern
**Where**: `Database` class methods
**Purpose**: Data access abstraction

### Configuration Pattern
**Where**: `Config` class
**Purpose**: Centralized configuration management

---

## Security Considerations

### Implemented
✅ Environment variables for secrets (.env)
✅ SMTP authentication
✅ Input validation on API endpoints
✅ SQL injection prevention (parameterized queries)
✅ CORS headers for API security

### Recommended Additions
⚠️ API rate limiting
⚠️ Authentication/authorization
⚠️ HTTPS for production
⚠️ Input sanitization for CSV uploads

---

## Performance Optimizations

### Backend
- **SQLite indexes** on frequently queried fields
- **Connection pooling** for database
- **Async domain checking** (future enhancement)
- **Batch operations** for bulk inserts

### Frontend
- **No heavy frameworks** (vanilla JS)
- **Minimal HTTP requests**
- **Auto-refresh** only every 30 seconds
- **Efficient DOM updates**

### Network
- **DNS check first** (faster than WHOIS)
- **Fallback to WHOIS** only when needed
- **Configurable check interval** (avoid rate limits)

---

## Dependency Tree

```
Domain Monitor System
│
├── Backend (Python)
│   ├── Flask (web server)
│   │   ├── Werkzeug (WSGI)
│   │   ├── Jinja2 (templating)
│   │   └── Click (CLI)
│   │
│   ├── python-whois (domain checks)
│   │   └── future (compatibility)
│   │
│   ├── dnspython (DNS queries)
│   ├── python-dotenv (config)
│   └── requests (HTTP client)
│       ├── urllib3
│       ├── certifi (SSL)
│       ├── charset-normalizer
│       └── idna
│
├── Frontend (Web)
│   ├── HTML5 (structure)
│   ├── CSS3 (styling)
│   └── JavaScript ES6+ (behavior)
│
├── Database
│   └── SQLite 3 (embedded)
│
└── System Tools
    ├── Python venv (isolation)
    ├── pip (packages)
    └── NSSM (Windows service)
```

---

## License Information

### Open Source Libraries
All dependencies are free and open-source:
- **Flask**: BSD-3-Clause License
- **python-whois**: MIT License
- **dnspython**: ISC License
- **python-dotenv**: BSD License
- **requests**: Apache 2.0 License

### Domain Monitor System
**License**: MIT License (as specified in your project)
**Free to**: Use, modify, distribute

---

## Version Information

### Current Stack Versions
```txt
Python >= 3.8
Flask == 3.0.0
python-dotenv == 1.0.0
python-whois == 0.8.0
dnspython == 2.4.2
requests == 2.31.0
```

### Browser Compatibility
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

---

## Future Technology Considerations

### Potential Additions
- **Redis**: Caching layer for faster lookups
- **Celery**: Distributed task queue
- **React/Vue**: For complex UI needs
- **Docker**: Containerization
- **PostgreSQL**: For larger deployments
- **GraphQL**: Alternative API layer
- **WebSocket**: Real-time updates

### Scalability Options
- **Load balancer**: Multiple API instances
- **Cloud hosting**: AWS, Azure, Google Cloud
- **CDN**: Static file delivery
- **Database replication**: Read replicas

---

## Summary

This project uses a **minimal but powerful** tech stack:

**Backend**: Python + Flask + SQLite
**Frontend**: HTML + CSS + Vanilla JavaScript
**Services**: WHOIS + DNS + SMTP
**Tools**: pip + venv + NSSM

**Philosophy**: Keep it simple, reliable, and easy to maintain.

Total dependencies: ~10 packages
Total lines of code: ~1,500
Installation time: < 2 minutes
Startup time: < 5 seconds

**Result**: A lightweight, efficient, 24/7 domain monitoring system! 🚀

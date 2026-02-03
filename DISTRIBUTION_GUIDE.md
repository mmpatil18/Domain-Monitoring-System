# Distribution Guide

How to share your Domain Monitoring System with others for testing and deployment.

---

## Available Packages

Your packaged application is located in `dist-electron/`:

- **Windows Installer**: `Domain Monitoring System-Setup-1.0.0.exe` (108 MB)
  - NSIS installer with installation wizard
  - Creates Start Menu and Desktop shortcuts
  - Includes all dependencies (Electron + Python backend)

---

## Distribution Methods

### 1. Direct File Sharing (Quickest for Testing)

> [!TIP]
> Best for: Small teams, quick testing, internal testers

#### Option A: Cloud Storage

Upload the installer to a cloud service:

**Google Drive**:
1. Upload `Domain Monitoring System-Setup-1.0.0.exe` to Google Drive
2. Right-click → **Share** → **Get link**
3. Set to "Anyone with the link can view"
4. Share the link with testers

**Dropbox**:
1. Upload the file to Dropbox
2. Click **Share** → **Create link**
3. Share the generated link

**OneDrive/WeTransfer/SendGB**:
- Similar process - upload and share link

**Pros**:
- ✅ Simple and fast
- ✅ No technical setup required
- ✅ Works immediately

**Cons**:
- ❌ Manual process for updates
- ❌ No version tracking
- ❌ Large file size may slow downloads

#### Option B: Local Network Sharing

For testers on the same network:

1. **Windows File Sharing**:
   ```batch
   # Share the dist-electron folder
   # Right-click folder → Properties → Sharing → Advanced Sharing
   # Share it and provide the network path to testers
   ```

2. **HTTP Server** (Quick local server):
   ```batch
   cd dist-electron
   python -m http.server 8000
   ```
   Testers can download from: `http://YOUR-IP:8000`

---

### 2. GitHub Releases (Recommended for Open Source)

> [!IMPORTANT]
> Best for: Public projects, automatic updates, version control

#### Setup Steps

1. **Create GitHub Repository** (if not already done):
   ```bash
   cd d:\dms1
   git init
   git add .
   git commit -m "Initial release v1.0.0"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
   git push -u origin main
   ```

2. **Create a Release**:
   
   **Via GitHub CLI**:
   ```bash
   # Install GitHub CLI first: https://cli.github.com/
   gh release create v1.0.0 \
     "dist-electron/Domain Monitoring System-Setup-1.0.0.exe" \
     --title "Domain Monitor v1.0.0" \
     --notes "First stable release"
   ```

   **Via GitHub Web**:
   - Go to your repository on GitHub
   - Click **Releases** → **Create a new release**
   - Tag: `v1.0.0`
   - Title: `Domain Monitor v1.0.0`
   - Upload: `Domain Monitoring System-Setup-1.0.0.exe`
   - Click **Publish release**

3. **Share the Download Link**:
   ```
   https://github.com/YOUR-USERNAME/domain-monitor/releases/download/v1.0.0/Domain%20Monitoring%20System-Setup-1.0.0.exe
   ```

**Pros**:
- ✅ Free hosting
- ✅ Version history
- ✅ Supports auto-update mechanism
- ✅ Professional distribution

**Cons**:
- ❌ Requires GitHub account
- ❌ Public repository (unless paid)

---

### 3. Self-Hosted Web Server

> [!WARNING]
> Best for: Private/enterprise distribution, full control

Upload to your own server:

```bash
# Via FTP/SFTP to your web server
# Example: www.yourcompany.com/downloads/domain-monitor-setup.exe
```

**Setup Auto-Download Page** (Optional):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Download Domain Monitor</title>
</head>
<body>
    <h1>Domain Monitoring System</h1>
    <p>Version: 1.0.0</p>
    <a href="Domain-Monitoring-System-Setup-1.0.0.exe" download>
        <button>Download for Windows</button>
    </a>
</body>
</html>
```

---

### 4. Email Distribution

For very small teams:

1. **Compress the installer** (optional):
   - Right-click → Send to → Compressed folder
   - Or use 7-Zip for better compression

2. **Upload to file service** (email size limits):
   - Most email providers limit attachments to 25-50 MB
   - Your file is 108 MB, so use a download link instead

3. **Email template**:
   ```
   Subject: Domain Monitor Beta - Testing Request
   
   Hi [Name],
   
   Please help test the Domain Monitoring System v1.0.0.
   
   Download: [LINK]
   
   Installation:
   1. Download the installer
   2. Run "Domain Monitoring System-Setup-1.0.0.exe"
   3. Follow the installation wizard
   
   The app will create a desktop shortcut. Double-click to launch.
   
   Please report any issues!
   ```

---

## Installation Instructions for Testers

Share these instructions with your testers:

### Windows Installation

1. **Download** the installer file:
   - `Domain Monitoring System-Setup-1.0.0.exe`

2. **Run the installer**:
   - Double-click the `.exe` file
   - Windows may show "Windows protected your PC" warning
   - Click **More info** → **Run anyway**
   - (This happens because the app isn't code-signed)

3. **Follow the installation wizard**:
   - Choose installation directory (default: `C:\Program Files\Domain Monitoring System`)
   - Select shortcuts (Desktop/Start Menu)
   - Click **Install**

4. **Launch the application**:
   - From Desktop shortcut, or
   - From Start Menu → Domain Monitoring System

5. **First run setup**:
   - Configure email settings if needed
   - Add keywords to monitor
   - Start scanning!

### System Requirements

- **OS**: Windows 10 or later (64-bit)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk**: 500 MB free space
- **Network**: Internet connection required

---

## Troubleshooting for Testers

### "Windows protected your PC" Warning

**Cause**: Application isn't code-signed (requires paid certificate)

**Solution**:
- Click **More info**
- Click **Run anyway**
- This is safe - it's your application

### Antivirus Blocking

**Cause**: Some antivirus software may flag unsigned apps

**Solution**:
- Add exception in antivirus settings
- Whitelist the installation directory
- Windows Defender: Settings → Virus & threat protection → Exclusions

### Application Won't Start

**Check**:
1. Port 5000 isn't used by another application
2. Windows Firewall isn't blocking the app
3. Check logs in: `%APPDATA%\domain-monitor\logs`

---

## Code Signing (Future Enhancement)

> [!NOTE]
> For production distribution, consider code signing to avoid security warnings

### Windows Code Signing

1. **Purchase certificate**:
   - DigiCert (~$200/year)
   - Sectigo (~$150/year)
   - Or use free EV certificate (more complex process)

2. **Sign the installer**:
   ```bash
   # Add to package.json build config
   {
     "win": {
       "certificateFile": "path/to/cert.pfx",
       "certificatePassword": "password"
     }
   }
   ```

**Benefits**:
- ✅ No security warnings
- ✅ Professional appearance
- ✅ User trust
- ✅ Windows SmartScreen approval

---

## Distribution Checklist

Before distributing, ensure:

- [ ] Application tested on clean Windows machine
- [ ] All features working (keyword scanning, email alerts)
- [ ] Sample configuration files included
- [ ] Documentation provided (README.md)
- [ ] Version number is correct
- [ ] Installation instructions prepared
- [ ] Support contact/feedback method ready
- [ ] Known issues documented

---

## Feedback Collection

### Create a Feedback Form

**Google Forms Template**:
```
1. Installation experience (1-5 stars)
2. Did the app install without issues? (Yes/No)
3. Which features did you test?
4. Did you encounter any errors? (Text)
5. Performance rating (1-5 stars)
6. Feature requests (Text)
7. Contact email (Optional)
```

### Issue Tracking

**GitHub Issues**:
- Enable Issues tab in your repository
- Create issue templates for bug reports
- Testers can submit feedback directly

**Simple Email**:
- Provide support email
- Template for testers to send screenshots/logs

---

## Update Strategy

### Manual Updates

For now, notify users via:
- Email announcement
- GitHub release notes
- Application changelog

Users download and reinstall manually.

### Auto-Updates (Future)

Configure `electron-updater` to check GitHub releases:

```javascript
// In electron/main.js
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

See [PACKAGING.md](file:///d:/dms1/PACKAGING.md#L373-L410) for details.

---

## Recommended Distribution Flow

### Phase 1: Alpha Testing (Internal)
- Share via Google Drive/Dropbox
- 2-5 close contacts
- Collect critical feedback
- Fix major bugs

### Phase 2: Beta Testing (Limited)
- Create GitHub release (or private server)
- 10-20 testers
- More thorough testing
- Refine features

### Phase 3: Public Release
- GitHub release with proper documentation
- Announce on relevant communities
- Consider package managers (winget)
- Marketing if needed

---

## Quick Start Commands

### Share via temporary HTTP server:
```bash
cd d:\dms1\dist-electron
python -m http.server 8080
# Share: http://YOUR-IP:8080
```

### Create GitHub release:
```bash
gh release create v1.0.0 "dist-electron/Domain Monitoring System-Setup-1.0.0.exe" --notes "Initial release"
```

### Upload to Google Drive (via web):
1. Go to drive.google.com
2. Upload `Domain Monitoring System-Setup-1.0.0.exe`
3. Share and copy link

---

## Next Steps

1. **Choose distribution method** based on your audience
2. **Test installation** on a different computer
3. **Prepare documentation** for testers
4. **Set up feedback collection** mechanism
5. **Share with initial testers**
6. **Iterate based on feedback**

---

**For build instructions**: See [BUILD_GUIDE.md](file:///d:/dms1/BUILD_GUIDE.md)

**For packaging details**: See [PACKAGING.md](file:///d:/dms1/PACKAGING.md)

# 🚀 Quick Start: GitHub Distribution

**Goal**: Publish your Domain Monitor app on GitHub Releases

---

## ⚡ Fast Track (3 Steps)

### Step 1️⃣: Setup Git & GitHub (5 minutes)

**Run the automated setup**:
```powershell
.\setup_github.bat
```

This will:
- ✅ Initialize Git repository
- ✅ Update package.json with your GitHub username
- ✅ Commit all files
- ✅ Configure GitHub remote

**OR manually**:

1. Create repository on GitHub: https://github.com/new
   - Name: `domain-monitor`
   - Visibility: **Public** ✅ (required for free releases)

2. Run these commands:
   ```powershell
   cd d:\dms1
   git init
   git add .
   git commit -m "Initial commit - v1.0.0"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
   git push -u origin main
   ```

---

### Step 2️⃣: Create Release (2 minutes)

1. **Go to**: https://github.com/YOUR-USERNAME/domain-monitor/releases/new

2. **Fill in**:
   - **Tag**: `v1.0.0`
   - **Title**: `Domain Monitor v1.0.0 - Initial Release`
   - **Description**: Copy from template below

3. **Upload**: Drag `dist-electron\Domain Monitoring System-Setup-1.0.0.exe`

4. **Click**: "Publish release" ✅

---

### Step 3️⃣: Share Link (1 minute)

Your download link:
```
https://github.com/YOUR-USERNAME/domain-monitor/releases/latest
```

**Done!** 🎉 Testers can now download your app!

---

## 📝 Release Description Template

Copy this for Step 2:

```markdown
# Domain Monitoring System v1.0.0

First stable release! 🎉

## ✨ Features
- ✅ Monitor domain availability automatically
- ✅ Email notifications when domains become available
- ✅ Keyword-based domain generation
- ✅ CSV import/export functionality
- ✅ SQLite database for efficient storage
- ✅ Background monitoring service
- ✅ System tray integration

## 💾 Download & Install

### Windows (64-bit)
1. Download `Domain-Monitoring-System-Setup-1.0.0.exe` below
2. Run the installer
3. Follow installation wizard
4. Launch from Desktop shortcut

## 📋 System Requirements
- Windows 10 or 11 (64-bit)
- 4 GB RAM minimum
- Internet connection

## ⚠️ First-Time Installation
Windows may show "Windows protected your PC" warning (app is not code-signed):
- Click **"More info"**
- Click **"Run anyway"**
- This is safe - it's your application

## 🐛 Known Issues
- First launch may take 10-15 seconds
- Port 5000 must be available

## 📖 Documentation
- [Full Documentation](https://github.com/YOUR-USERNAME/domain-monitor#readme)
- [Build from Source](https://github.com/YOUR-USERNAME/domain-monitor/blob/main/BUILD_GUIDE.md)

## 💬 Support
Report issues: https://github.com/YOUR-USERNAME/domain-monitor/issues
```

---

## 🎯 What Testers Need

### Email Template for Testers

```
Subject: Domain Monitor v1.0.0 - Ready for Testing

Hi [Name],

The Domain Monitor app is ready for testing!

📥 Download: https://github.com/YOUR-USERNAME/domain-monitor/releases/latest

🔧 Quick Install:
1. Click the link above
2. Download "Domain-Monitoring-System-Setup-1.0.0.exe"
3. Run the installer
4. If Windows shows a warning, click "More info" → "Run anyway"

✅ Test these features:
- Add keywords and scan for domains
- Import keywords from CSV
- Export results to CSV
- Email notifications (optional)

🐛 Report Issues:
https://github.com/YOUR-USERNAME/domain-monitor/issues

Thanks for helping test!
```

---

## 🔄 For Future Updates

### When you release v1.1.0:

1. **Update version**:
   ```json
   // package.json
   "version": "1.1.0"
   ```

2. **Rebuild**:
   ```powershell
   npm run build:win
   ```

3. **Commit & push**:
   ```powershell
   git add .
   git commit -m "Release v1.1.0"
   git push
   ```

4. **Create new release**:
   - Tag: `v1.1.0`
   - Upload new `.exe`
   - Add changelog

5. **Users will be notified automatically!** (if auto-update is enabled)

---

## 🛠️ Troubleshooting

### "Repository not found" when pushing
→ Make sure you created the repository on GitHub first

### "Permission denied"
→ Configure Git authentication:
```powershell
# Set username and email
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Use GitHub CLI (recommended)
# Install from: https://cli.github.com/
gh auth login
```

### "Large file" warning
→ Your installer is fine! GitHub allows up to 2GB per file

### Auto-update not working yet
→ Install electron-updater:
```powershell
npm install electron-updater
```
See GITHUB_RELEASE_GUIDE.md Step 6 for details

---

## 📚 Full Documentation

- **Detailed GitHub Setup**: [GITHUB_RELEASE_GUIDE.md](file:///d:/dms1/GITHUB_RELEASE_GUIDE.md)
- **All Distribution Options**: [DISTRIBUTION_GUIDE.md](file:///d:/dms1/DISTRIBUTION_GUIDE.md)
- **Build Instructions**: [BUILD_GUIDE.md](file:///d:/dms1/BUILD_GUIDE.md)

---

## ✅ Pre-Release Checklist

Before publishing:

- [ ] Application tested on clean Windows machine
- [ ] `package.json` version is correct (1.0.0)
- [ ] GitHub username updated in `package.json`
- [ ] Repository created on GitHub (public)
- [ ] Installer file exists in `dist-electron/`
- [ ] README.md updated with correct username
- [ ] LICENSE file present
- [ ] Release notes prepared

---

**Need help?** Check the full guides or ask! 🚀

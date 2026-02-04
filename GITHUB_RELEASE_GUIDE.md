# GitHub Release Setup Guide

Step-by-step guide to distribute your Domain Monitoring System via GitHub Releases.

---

## Prerequisites

- [ ] GitHub account
- [ ] Git installed on your computer
- [ ] Application built (`dist-electron/Domain Monitoring System-Setup-1.0.0.exe` exists)

---

## Step 1: Create GitHub Repository

### Option A: Via GitHub Website

1. **Go to GitHub**: https://github.com/new

2. **Repository settings**:
   - **Repository name**: `domain-monitor`
   - **Description**: `Domain Monitoring System - Track domain availability and get email alerts`
   - **Visibility**: 
     - ✅ **Public** (free, anyone can download)
     - ⬜ **Private** (requires GitHub Pro for releases)
   - **Initialize**: Leave unchecked (we have existing files)

3. **Click "Create repository"**

4. **Copy the repository URL**:
   ```
   https://github.com/YOUR-USERNAME/domain-monitor.git
   ```

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI: https://cli.github.com/
gh auth login
gh repo create domain-monitor --public --description "Domain Monitoring System"
```

---

## Step 2: Initialize Local Git Repository

Open PowerShell in your project directory:

```powershell
cd d:\dms1

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Domain Monitor v1.0.0"

# Set main branch
git branch -M main

# Add GitHub remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git

# Push to GitHub
git push -u origin main
```

> [!NOTE]
> Replace `YOUR-USERNAME` with your actual GitHub username!

---

## Step 3: Update Auto-Update Configuration

Before creating the release, update `package.json`:

```json
"publish": {
  "provider": "github",
  "owner": "YOUR-GITHUB-USERNAME",  // ← Change this
  "repo": "domain-monitor",
  "releaseType": "release"
}
```

Also update the repository field in your README if needed.

---

## Step 4: Create GitHub Release

### Option A: Via GitHub Website (Recommended for First Release)

1. **Go to your repository**:
   ```
   https://github.com/YOUR-USERNAME/domain-monitor
   ```

2. **Click "Releases"** (right sidebar)

3. **Click "Create a new release"**

4. **Fill in release details**:
   - **Tag version**: `v1.0.0`
   - **Release title**: `Domain Monitor v1.0.0 - Initial Release`
   - **Description**:
     ```markdown
     # Domain Monitoring System v1.0.0
     
     First stable release! 🎉
     
     ## Features
     - ✅ Monitor domain availability
     - ✅ Email notifications when domains become available
     - ✅ Keyword-based domain generation
     - ✅ CSV import/export
     - ✅ SQLite database storage
     - ✅ Background monitoring service
     
     ## Installation
     
     ### Windows
     1. Download `Domain-Monitoring-System-Setup-1.0.0.exe`
     2. Run the installer
     3. Follow the installation wizard
     4. Launch from Desktop shortcut
     
     **System Requirements:**
     - Windows 10/11 (64-bit)
     - 4 GB RAM
     - Internet connection
     
     ## What's Included
     - Complete Electron application
     - Python backend (bundled)
     - All dependencies included
     - Sample keyword file
     
     ## Known Issues
     - Windows may show security warning (app is not code-signed)
       - Click "More info" → "Run anyway"
     - First launch may take 10-15 seconds while backend initializes
     
     ## Support
     - Report issues: https://github.com/YOUR-USERNAME/domain-monitor/issues
     - Email: your-email@example.com
     ```

5. **Upload installer**:
   - Drag and drop `Domain Monitoring System-Setup-1.0.0.exe`
   - Or click "Attach binaries" and select the file

6. **Set as latest release**: ✅ Check "Set as the latest release"

7. **Click "Publish release"**

### Option B: Via GitHub CLI

```powershell
cd d:\dms1

# Create release with file
gh release create v1.0.0 `
  "dist-electron/Domain Monitoring System-Setup-1.0.0.exe" `
  --title "Domain Monitor v1.0.0 - Initial Release" `
  --notes "First stable release with domain monitoring and email notifications"
```

### Option C: Via Git Command Line

```powershell
# Create and push tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Then upload file manually via GitHub web interface
```

---

## Step 5: Share Download Link

Your installer will be available at:

```
https://github.com/YOUR-USERNAME/domain-monitor/releases/download/v1.0.0/Domain-Monitoring-System-Setup-1.0.0.exe
```

### Short URL for sharing:

```
https://github.com/YOUR-USERNAME/domain-monitor/releases/latest
```

### Embed in README:

Add to your `README.md`:

```markdown
## Download

[![Download Latest Release](https://img.shields.io/github/v/release/YOUR-USERNAME/domain-monitor)](https://github.com/YOUR-USERNAME/domain-monitor/releases/latest)

**Windows**: [Download Installer](https://github.com/YOUR-USERNAME/domain-monitor/releases/latest)
```

---

## Step 6: Enable Auto-Updates (Optional)

To enable automatic updates in the application:

1. **Install electron-updater**:
   ```powershell
   npm install electron-updater
   ```

2. **Update `electron/main.js`**:
   ```javascript
   const { autoUpdater } = require('electron-updater');
   
   app.on('ready', () => {
     // Check for updates (only in production)
     if (!isDev) {
       autoUpdater.checkForUpdatesAndNotify();
     }
     
     createWindow();
     startPythonBackend();
   });
   
   // Auto-update event handlers
   autoUpdater.on('update-available', () => {
     console.log('Update available');
   });
   
   autoUpdater.on('update-downloaded', () => {
     const { dialog } = require('electron');
     dialog.showMessageBox({
       type: 'info',
       title: 'Update Ready',
       message: 'A new version has been downloaded. Restart to apply?',
       buttons: ['Restart', 'Later']
     }).then((result) => {
       if (result.response === 0) {
         autoUpdater.quitAndInstall();
       }
     });
   });
   ```

3. **Rebuild and create new release** (v1.0.1) with auto-update enabled

---

## Releasing Updates

When you have a new version:

1. **Update version in `package.json`**:
   ```json
   "version": "1.1.0"
   ```

2. **Rebuild the application**:
   ```powershell
   npm run build:win
   ```

3. **Commit changes**:
   ```powershell
   git add .
   git commit -m "Release v1.1.0 - New features and bug fixes"
   git push
   ```

4. **Create new release** (same as Step 4):
   - Tag: `v1.1.0`
   - Upload new installer
   - Add changelog

5. **Users with auto-update will be notified automatically!**

---

## Best Practices

### Versioning (Semantic Versioning)

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Release Notes Template

```markdown
# Domain Monitor v1.1.0

## 🆕 New Features
- Feature 1 description
- Feature 2 description

## 🐛 Bug Fixes
- Fixed issue with...
- Resolved problem where...

## 🔧 Improvements
- Performance optimization
- UI/UX enhancements

## 📦 Download
- Windows: Domain-Monitoring-System-Setup-1.1.0.exe

## ⬆️ Upgrading
- Users with v1.0.0+ will be notified automatically
- Or download and reinstall manually
```

### Pre-release Testing

For beta versions:

1. Create release with tag `v1.1.0-beta.1`
2. Check "This is a pre-release"
3. Share with beta testers only
4. After testing, create stable `v1.1.0` release

---

## Troubleshooting

### "Permission denied" when pushing

**Solution**: Set up SSH or Personal Access Token

**SSH Method**:
```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
# Copy public key:
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:YOUR-USERNAME/domain-monitor.git
```

**Token Method**:
```powershell
# GitHub → Settings → Developer settings → Personal access tokens
# Generate token with 'repo' scope
# Use token as password when pushing
```

### Auto-update not working

**Check**:
1. `publish` configuration in `package.json` is correct
2. Repository is public
3. Release is marked as "latest"
4. Application is running in production mode (not dev)

### Large file size warning

GitHub releases support files up to 2GB, so your 108MB installer is fine!

---

## Security Considerations

### Access Tokens

If using GitHub Actions or CLI:

1. **Create Personal Access Token**:
   - GitHub → Settings → Developer settings → Personal access tokens
   - Scopes needed: `repo`, `write:packages`

2. **Store securely**:
   - Don't commit tokens to repository
   - Use environment variables
   - Rotate tokens periodically

### Code Signing

For production, consider:
- Windows: DigiCert/Sectigo certificate (~$150-200/year)
- Eliminates security warnings
- Increases user trust

---

## Analytics (Optional)

Track downloads:

1. **GitHub Insights**:
   - Repository → Insights → Traffic
   - Shows clone and download statistics

2. **Release Download Counter**:
   Add badge to README:
   ```markdown
   ![Downloads](https://img.shields.io/github/downloads/YOUR-USERNAME/domain-monitor/total)
   ```

---

## Next Steps After Publishing

1. ✅ **Test the download link** on another computer
2. ✅ **Update README** with download badges and instructions
3. ✅ **Create documentation** (wiki or docs folder)
4. ✅ **Set up issue templates** for bug reports
5. ✅ **Add contributing guidelines** if open source
6. ✅ **Announce release** on relevant communities/forums

---

## Quick Reference Commands

```powershell
# Initial setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
git push -u origin main

# Create release
gh release create v1.0.0 "dist-electron/Domain Monitoring System-Setup-1.0.0.exe" --title "v1.0.0" --notes "Initial release"

# Update and new release
# 1. Update package.json version
# 2. Build: npm run build:win
# 3. Commit and push
git add .
git commit -m "Release v1.1.0"
git push
# 4. Create new release via web or CLI
```

---

**For distribution details**: See [DISTRIBUTION_GUIDE.md](file:///d:/dms1/DISTRIBUTION_GUIDE.md)

**For build instructions**: See [BUILD_GUIDE.md](file:///d:/dms1/BUILD_GUIDE.md)

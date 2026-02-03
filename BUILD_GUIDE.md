# Building Domain Monitor

Complete guide for building cross-platform installers for Domain Monitor.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Building Installers](#building-installers)
- [Platform-Specific Notes](#platform-specific-notes)
- [Troubleshooting](#troubleshooting)
- [Distribution](#distribution)

---

## Prerequisites

### Required Software

#### All Platforms
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Python** 3.8 or higher ([Download](https://python.org/))
- **Git** (optional, for version control)

#### Windows-Specific
- **Windows 10/11** (64-bit)
- **Visual Studio Build Tools** (optional, for native modules)

#### macOS-Specific
- **macOS 10.15+**
- **Xcode Command Line Tools**: `xcode-select --install`
- **Apple Developer Account** (optional, for code signing)

#### Linux-Specific
- **Ubuntu 18.04+** / **Debian 10+** / **Fedora 32+**
- **Build essentials**: `sudo apt install build-essential`
- **Additional dependencies**: `sudo apt install rpm`

---

## Development Setup

### 1. Clone or Download Project

```bash
cd d:\dms1
```

### 2. Install Dependencies

**Node.js packages:**
```bash
npm install
```

**Python packages:**
```bash
# Windows
venv\Scripts\activate
pip install -r requirements.txt

# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run in Development Mode

```bash
npm start
```

This will:
- Start the Python backend using your system Python
- Launch Electron window
- Open DevTools for debugging
- Enable hot reload (restart to see changes)

---

## Building Installers

### Quick Build (Recommended)

**Windows:**
```batch
build.bat
```

**Linux/macOS:**
```bash
chmod +x build.sh
./build.sh
```

The script will:
1. Install dependencies
2. Bundle Python backend
3. Prompt for build target (current platform or all platforms)
4. Create installers in `dist-electron/` folder

### Manual Build

#### Step 1: Install Build Dependencies

```bash
npm install
pip install pyinstaller
```

#### Step 2: Bundle Python

```bash
npm run bundle-python
```

This creates a standalone Python distribution in `python-dist/` that includes:
- Python runtime
- All dependencies (Flask, python-whois, etc.)
- Your backend code

#### Step 3: Build Electron App

**Windows only:**
```bash
npm run build:win
```

**macOS only:**
```bash
npm run build:mac
```

**Linux only:**
```bash
npm run build:linux
```

**All platforms:**
```bash
npm run build:all
```

---

## Build Outputs

### Windows
- **Location**: `dist-electron/`
- **Files**:
  - `Domain-Monitor-Setup-1.0.0.exe` - NSIS installer (recommended for distribution)
  - `Domain Monitor 1.0.0.exe` - Portable executable (no installation required)

**Installer features:**
- Custom install location
- Desktop shortcut
- Start Menu entry
- Automatic uninstaller

### macOS
- **Location**: `dist-electron/`
- **Files**:
  - `Domain-Monitor-1.0.0-x64.dmg` - Intel Macs
  - `Domain-Monitor-1.0.0-arm64.dmg` - Apple Silicon (M1/M2)
  - `Domain-Monitor-1.0.0-x64.zip` - ZIP archive (Intel)
  - `Domain-Monitor-1.0.0-arm64.zip` - ZIP archive (ARM)

**DMG installer:**
- Drag to Applications folder
- Automatic code signing (if configured)
- Notarization support (if configured)

### Linux
- **Location**: `dist-electron/`
- **Files**:
  - `Domain-Monitor-1.0.0.AppImage` - Universal Linux package (recommended)
  - `domain-monitor_1.0.0_amd64.deb` - Debian/Ubuntu package
  - `domain-monitor-1.0.0.x86_64.rpm` - Fedora/RedHat package

**Installation:**
```bash
# AppImage (no installation, just run)
chmod +x Domain-Monitor-1.0.0.AppImage
./Domain-Monitor-1.0.0.AppImage

# Debian/Ubuntu
sudo dpkg -i domain-monitor_1.0.0_amd64.deb

# Fedora/RedHat
sudo rpm -i domain-monitor-1.0.0.x86_64.rpm
```

---

## Platform-Specific Notes

### Windows

#### Icon Requirements
- **Format**: `.ico` file
- **Sizes**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- **Location**: `resources/icon.ico`

Already provided ✓

#### Code Signing (Optional)
To avoid "Unknown Publisher" warnings:

1. Obtain a code signing certificate
2. Add to `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "YOUR_PASSWORD"
   }
   ```

### macOS

#### Icon Requirements
- **Format**: `.icns` file
- **Sizes**: Multiple resolutions from 16x16 to 1024x1024
- **Location**: `resources/icon.icns`

**Generate from PNG:**
```bash
# Install iconutil (macOS built-in)
mkdir icon.iconset
# Create multiple sizes and convert
iconutil -c icns icon.iconset
```

#### Code Signing (Recommended)
Required for distribution outside App Store:

1. Enroll in Apple Developer Program ($99/year)
2. Create a Developer ID Application certificate
3. Add to environment:
   ```bash
   export CSC_LINK="path/to/cert.p12"
   export CSC_KEY_PASSWORD="cert_password"
   ```

4. Build will automatically sign

#### Notarization (For macOS 10.15+)
```bash
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
npm run build:mac
```

### Linux

#### Icon Requirements
- **Format**: `.png` file
- **Size**: 512x512 or 1024x1024
- **Location**: `resources/icon.png`

Already provided ✓

#### Dependencies
Electron Builder may need:
```bash
# Ubuntu/Debian
sudo apt install rpm

# Fedora
sudo dnf install dpkg
```

---

## Troubleshooting

### Build Errors

#### "Node.js not found"
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

#### "Python not found"
- Install Python from https://python.org/
- Add Python to PATH during installation

#### "PyInstaller failed"
```bash
# Reinstall PyInstaller
pip uninstall pyinstaller
pip install pyinstaller==6.3.0
```

#### "electron-builder failed"
```bash
# Clear cache and rebuild
rm -rf node_modules dist-electron
npm install
npm run build
```

### Runtime Errors

#### "Python backend didn't start"
- Check Python is bundled in `python-dist/`
- Verify all requirements are installed
- Check console logs in DevTools (Ctrl+Shift+I)

#### "Flask server port already in use"
- Close any running instances
- Change port in `backend/config.py`

#### "Database locked"
- Close all running instances
- Delete `data/domains.db-journal` if exists

###Antivirus False Positives

PyInstaller executables are commonly flagged by antivirus:

**Solutions:**
1. **Code signing** (Windows/macOS) - Most reliable
2. **Whitelist** in antivirus settings
3. **Submit to vendors** for analysis
4. **Use installer** instead of portable exe

---

## Distribution

### Recommended Distribution Methods

#### 1. GitHub Releases (Free)
```bash
# Create release
git tag v1.0.0
git push origin v1.0.0

# Upload installers to release page
```

#### 2. Download from Website
- Host installers on your server
- Provide download links for each platform

#### 3. Package Managers

**Windows (Chocolatey):**
- Create `.nuspec` file
- Submit to Chocolatey repository

**macOS (Homebrew):**
```ruby
# Create homebrew cask
cask "domain-monitor" do
  version "1.0.0"
  url "https://example.com/Domain-Monitor-1.0.0.dmg"
  # ...
end
```

**Linux (Snapcraft):**
- Create `snap/snapcraft.yaml`
- Publish to Snap Store

### Auto-Updates (Future Enhancement)

Electron Builder supports auto-updates:

1. Host releases on GitHub or update server
2. Configure in `package.json`:
   ```json
   "publish": {
     "provider": "github",
     "owner": "your-username",
     "repo": "domain-monitor"
   }
   ```

3. Add update checker to `electron/main.js`

---

## Build Size Optimization

### Current Sizes
- **Windows**: ~180MB installer
- **macOS**: ~160MB DMG
- **Linux**: ~150MB AppImage

### Reduce Size
1. **Exclude dev dependencies**
   ```json
   "files": ["!node_modules/dev-*"]
   ```

2. **Compress assets**
   ```json
   "compression": "maximum"
   ```

3. **Remove unused Python packages**
   ```bash
   pip uninstall unnecessary-package
   ```

---

## CI/CD Automation

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v4
      - run: npm install
      - run: npm run bundle-python
      - run: npm run build:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist-electron/*.exe

  build-mac:
    runs-on: macos-latest
    # Similar steps...

  build-linux:
    runs-on: ubuntu-latest
    # Similar steps...
```

This automatically builds on every tag push.

---

## Support

### Build Issues
- Check Node.js version: `node --version`
- Check Python version: `python --version`
- Clear build cache: Delete `node_modules/`, `dist-electron/`, `python-dist/`
- Review logs in `build/` directory

### Further Help
- Check `PACKAGING.md` for architecture details
- Review Electron Builder docs: https://www.electron.build/
- Review PyInstaller docs: https://pyinstaller.org/

---

**Happy Building! 🚀**

# 🚀 Final Release Guide

Follow these steps to build your production-ready installer and push your code to GitHub.

---

## 🏗️ Step 1: Build the Installer

This will create the setup file for Windows (`.exe`).

1. **Stop any running servers** (Ctrl+C in terminal)
2. **Run the build command:**

```powershell
npm run build:win
```

**Wait for it to finish.** It may take 1-2 minutes.

### 🔍 Where is the installer?
Go to the `dist` folder:
- File: `Domain Monitor Setup 1.1.0.exe`

### ✅ Test It:
1. Double-click `Domain Monitor Setup 1.1.0.exe`
2. It should install and launch automatically.
3. Verify the tray icon appears.
4. Verify you can minimize to try.

---

## ☁️ Step 2: Push to GitHub

Once you've built and tested, push your source code to GitHub so you can share it or work on it later.

**Use the dedicated guide:**

1. Open `COMMANDS_TO_PUSH.md`
2. Follow **Step 2** to **Step 8** exactly.

**Quick Summary:**
```powershell
# 1. Reset (careful!)
git reset HEAD~1
git rm -r --cached .

# 2. Add files
git add .
git reset dist/ # Don't push the massive exe files!
git reset node_modules/ 

# 3. Commit
git commit -m "Release v1.1.0 - Background Monitoring & Tray Support"

# 4. Push (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
git push -u origin main
```

---

## 🎉 You're Done!

You now have:
1. A working **Windows Installer** (`.exe`) to share with users.
2. A **GitHub Repository** with your source code safe in the cloud.

# 📋 Copy-Paste Commands: Push Essential Files Only

## Instructions
1. Copy each code block
2. Paste in PowerShell (right-click)
3. Press Enter
4. Wait for completion before next block

---

## ✂️ Step 1: Reset & Clean

```powershell
cd d:\dms1
git reset HEAD~1
git rm -r --cached .
```

---

## 📁 Step 2: Add Essential Files

**Copy these commands one by one:**

```powershell
# Core configuration files
git add .gitignore
git add .env.example
git add package.json
git add requirements.txt
git add LICENSE
git add README.md
git add sample_keywords.csv

# Source code
git add backend/*.py
git add frontend/*.html
git add frontend/*.css
git add frontend/*.js
git add electron/*.js

# Resources
git add resources/

# Documentation
git add BUILD_GUIDE.md
git add DISTRIBUTION_GUIDE.md
git add GITHUB_DISTRIBUTION.md
git add GITHUB_RELEASE_GUIDE.md
git add PACKAGING.md
git add TECH_STACK.md
git add PROJECT_DOCUMENTATION.md

# Build scripts
git add build.bat
git add build.sh
git add install.bat
git add scripts/*.js
```

**Or as one line (PowerShell compatible):**

```powershell
git add .gitignore .env.example package.json requirements.txt LICENSE README.md sample_keywords.csv; git add backend/*.py; git add frontend/*.html frontend/*.css frontend/*.js; git add electron/*.js; git add resources/; git add BUILD_GUIDE.md DISTRIBUTION_GUIDE.md GITHUB_DISTRIBUTION.md GITHUB_RELEASE_GUIDE.md PACKAGING.md TECH_STACK.md PROJECT_DOCUMENTATION.md; git add build.bat build.sh install.bat; git add scripts/*.js
```

---

## 👀 Step 3: Review What Will Be Committed

```powershell
git status
```

Check the output - you should see your source files in green. If you see files you don't want:

```powershell
# Remove a specific file
git reset HEAD unwanted-file.bat
```

---

## 💾 Step 4: Commit

```powershell
git commit -m "Initial commit - Domain Monitor v1.0.0"
```

---

## 🔍 Step 5: Verify Files

```powershell
git ls-files | more
```

Press SPACE to see more. Press Q to quit. Verify only essential files are listed.

---

## 🌐 Step 6: Create GitHub Repository

**Stop here and do this manually:**

1. Open browser: https://github.com/new
2. Name: `domain-monitor`
3. Visibility: **Public**
4. DON'T check any boxes
5. Click "Create repository"
6. **Remember your username** for next step

---

## ⚙️ Step 7: Update Configuration

**Replace `YOUR-USERNAME` below with your actual GitHub username**, then paste:

```powershell
$username = "YOUR-USERNAME"
(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content package.json
(Get-Content README.md) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content README.md
git add package.json README.md
git commit -m "Update GitHub username"
```

Example if your username is `mayurpatil123`:
```powershell
$username = "mayurpatil123"
(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content package.json
(Get-Content README.md) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content README.md
git add package.json README.md
git commit -m "Update GitHub username"
```

---

## 🚀 Step 8: Push to GitHub

**Replace `YOUR-USERNAME` with your GitHub username**, then paste:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
git push -u origin main
```

Example:
```powershell
git remote add origin https://github.com/mayurpatil123/domain-monitor.git
git push -u origin main
```

---

## 🎉 Step 9: Verify on GitHub

Open browser and check:
```
https://github.com/YOUR-USERNAME/domain-monitor
```

You should see your files!

---

## 🎯 What's Included

Your GitHub repo will have:
- ✅ Source code (backend, frontend, electron)
- ✅ Documentation (README, guides)
- ✅ Configuration files
- ✅ Build scripts
- ✅ Resources & samples

NOT included (as intended):
- ❌ node_modules/
- ❌ dist-electron/
- ❌ venv/
- ❌ *.log files
- ❌ .env (your secrets)
- ❌ data/ (your database)
- ❌ Build artifacts

---

## 🆘 If Something Goes Wrong

### "Remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
git push -u origin main
```

### "Authentication failed"
```powershell
# Install GitHub CLI
gh auth login
# Then try push again
```

### Want to start over from Step 2?
```powershell
git reset HEAD~1
git rm -r --cached .
# Then go back to Step 2
```

---

## 📊 Quick Reference

| Step | What It Does |
|------|--------------|
| 1 | Reset commit, clear staging |
| 2 | Add only essential files |
| 3 | Review what's staged |
| 4 | Commit the files |
| 5 | Verify files in repo |
| 6 | Create repo on GitHub |
| 7 | Update config with username |
| 8 | Push to GitHub |
| 9 | Verify on GitHub |

---

**Ready?** Start with Step 1! ⬆️

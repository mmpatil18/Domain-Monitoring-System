# ✅ CORRECTED PowerShell Commands - Copy & Paste

## Step 1: Reset & Clean

```powershell
cd d:\dms1
git reset HEAD~1
git rm -r --cached .
```

---

## Step 2: Add Essential Files (FIXED - PowerShell Compatible)

**Copy and paste these commands:**

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

---

## Step 3: Review What Will Be Committed

```powershell
git status
```

---

## Step 4: Commit

```powershell
git commit -m "Initial commit - Domain Monitor v1.0.0"
```

---

## Step 5: Verify Files

```powershell
git ls-files | more
```

Press SPACE to see more, Q to quit.

**Double-check .env is NOT listed:**

```powershell
git ls-files | findstr "\.env"
```

You should only see:
```
.env.example
```

If you see `.env` without `.example`, STOP and let me know!

---

## Step 6: Create GitHub Repository

**Do this manually:**

1. Open: https://github.com/new
2. Name: `domain-monitor`
3. Visibility: **Public**
4. Don't initialize with anything
5. Click "Create repository"
6. Copy your username for next step

---

## Step 7: Update Configuration

**Replace `YOUR-USERNAME` with your actual GitHub username:**

```powershell
$username = "YOUR-USERNAME"
(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content package.json
(Get-Content README.md) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content README.md
git add package.json README.md
git commit -m "Update GitHub username"
```

**Example** (if your GitHub username is `mayurpatil123`):

```powershell
$username = "mayurpatil123"
(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content package.json
(Get-Content README.md) -replace 'YOUR-GITHUB-USERNAME', $username | Set-Content README.md
git add package.json README.md
git commit -m "Update GitHub username"
```

---

## Step 8: Add Remote and Push

**Replace `YOUR-USERNAME` with your GitHub username:**

```powershell
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
git push -u origin main
```

**Example:**

```powershell
git remote add origin https://github.com/mayurpatil123/domain-monitor.git
git push -u origin main
```

---

## ✅ Success!

After pushing, verify at:
```
https://github.com/YOUR-USERNAME/domain-monitor
```

---

## 🔒 Security Verified

Your .env file with your email and app password is **PROTECTED** and will NOT be pushed!

Only `.env.example` (the template) will be on GitHub.

---

## 🆘 Troubleshooting

### "Remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git
git push -u origin main
```

### Authentication prompt
Use GitHub CLI for easiest authentication:
```powershell
gh auth login
```

Or use Personal Access Token:
- Username: Your GitHub username
- Password: Token from https://github.com/settings/tokens

---

**Start with Step 1 above!** ⬆️

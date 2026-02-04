# Step-by-Step: Push Only Essential Files to GitHub

Copy and paste these commands in PowerShell exactly as shown.

---

## Step 1: Reset the Current Commit (Keep Files)

This removes the existing commit but keeps all your files:

```powershell
cd d:\dms1
git reset HEAD~1
```

---

## Step 2: Clear the Staging Area

Remove all files from staging:

```powershell
git rm -r --cached .
```

---

## Step 3: Add Only Essential Files

Now add files one by one or by category:

### Core Application Files

```powershell
# Configuration files
git add .gitignore
git add .env.example
git add package.json
git add requirements.txt

# License and documentation
git add LICENSE
git add README.md
```

### Source Code Directories

```powershell
# Backend source code
git add backend/*.py

# Frontend source code
git add frontend/*.html
git add frontend/*.css
git add frontend/*.js

# Electron source code
git add electron/*.js
```

### Resources

```powershell
# Icons and resources
git add resources/

# Sample files
git add sample_keywords.csv
```

### Documentation (Choose what you want)

```powershell
# Build and distribution guides
git add BUILD_GUIDE.md
git add DISTRIBUTION_GUIDE.md
git add GITHUB_DISTRIBUTION.md
git add GITHUB_RELEASE_GUIDE.md
git add QUICK_START_GITHUB.md
git add PACKAGING.md
git add TECH_STACK.md
git add PROJECT_DOCUMENTATION.md

# Setup guides
git add AUTOSTART_GUIDE.md
```

### Build Scripts (Optional - for developers who want to build from source)

```powershell
# Build scripts
git add build.bat
git add build.sh
git add install.bat

# Python bundling scripts
git add scripts/bundle-python.js
git add scripts/cleanup.js
git add scripts/verify-build.js
```

### Setup Scripts (Optional - for advanced users)

```powershell
# Autostart setup scripts
git add setup_autostart.bat
git add setup_service_linux.sh
git add setup_service_mac.sh
git add install_as_service.bat
```

---

## Step 4: Review What Will Be Committed

Check what files are staged:

```powershell
git status
```

You should see only the files you added in green.

---

## Step 5: Create a Clean Commit

```powershell
git commit -m "Initial commit - Domain Monitor v1.0.0 (essential files only)"
```

---

## Step 6: Verify the Commit

See what files are in the repository:

```powershell
git ls-files
```

---

## Step 7: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `domain-monitor`
3. Visibility: **Public**
4. Don't initialize with anything
5. Click "Create repository"

---

## Step 8: Update Configuration Files

Replace `YOUR-USERNAME` with your actual GitHub username:

```powershell
# Update package.json (replace YOUR-USERNAME with your GitHub username)
(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', 'your-actual-username' | Set-Content package.json

# Update README.md (replace YOUR-USERNAME with your GitHub username)
(Get-Content README.md) -replace 'YOUR-GITHUB-USERNAME', 'your-actual-username' | Set-Content README.md

# Commit the changes
git add package.json README.md
git commit -m "Update GitHub configuration"
```

---

## Step 9: Add GitHub Remote and Push

Replace `YOUR-USERNAME` with your GitHub username:

```powershell
# Add GitHub remote
git remote add origin https://github.com/YOUR-USERNAME/domain-monitor.git

# Push to GitHub
git push -u origin main
```

---

## ✅ What Gets Pushed (Essential Files Only)

After following these steps, your GitHub repo will contain:

### ✅ Included:
- Source code (backend/, frontend/, electron/)
- Configuration files (package.json, .env.example, requirements.txt)
- Documentation (README.md, guides)
- Resources (icons, sample files)
- Build scripts (for users who want to build from source)
- License

### ❌ Excluded (automatically via .gitignore):
- node_modules/ (too large, users will run npm install)
- dist-electron/ (build output, users download from releases)
- python-dist/ (build output)
- venv/ (Python virtual environment)
- data/ (your local database)
- *.log (log files)
- .env (your private configuration)
- package-lock.json (can cause conflicts)
- Build artifacts (*.exe, *.dmg, etc.)

---

## 🎯 Minimal Setup (If You Want Even Fewer Files)

If you want the absolute minimum, use these commands instead of Step 3:

```powershell
# Absolute essentials only
git add .gitignore
git add .env.example
git add LICENSE
git add README.md
git add package.json
git add requirements.txt
git add backend/*.py
git add frontend/*.html frontend/*.css frontend/*.js
git add electron/*.js
git add resources/
git add sample_keywords.csv
git add BUILD_GUIDE.md
git add scripts/
```

This gives users everything they need to:
1. Understand the project (README, LICENSE)
2. Build from source (package.json, requirements.txt, build scripts)
3. Run the application (all source code)

---

## 🔍 Verify Before Pushing

Before Step 9 (pushing), run this to see exactly what will be pushed:

```powershell
git ls-files
```

Review the list and make sure you're happy with what's included.

---

## ⚠️ Important Notes

1. **Don't commit**:
   - Your .env file (contains sensitive info)
   - data/ folder (your personal database)
   - node_modules/ (too large)
   - Build artifacts (dist-electron/, python-dist/)
   - Log files

2. **The installer (.exe file)** is not in Git
   - You'll upload it manually to GitHub Releases
   - Users download from releases, not from source code

3. **package-lock.json** is excluded
   - Prevents version conflicts
   - Users will generate their own when they run `npm install`

---

## 🆘 If You Make a Mistake

If you accidentally add wrong files:

```powershell
# Remove specific file from staging
git reset HEAD filename

# Or start over from Step 2
git reset HEAD~1
git rm -r --cached .
# Then redo Step 3
```

---

## ✅ Success Checklist

After pushing:

- [ ] Run `git ls-files` and verify only essential files are included
- [ ] Check GitHub repository to see the files
- [ ] No sensitive data (.env, databases) in the repo
- [ ] No build artifacts in the repo
- [ ] README.md displays correctly on GitHub
- [ ] Ready to create release and upload installer

---

**Ready?** Start with Step 1 and copy-paste each command!

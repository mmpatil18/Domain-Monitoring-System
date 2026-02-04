@echo off
REM GitHub Push Helper - Domain Monitor
REM Run this after creating your repository on GitHub

echo ====================================
echo GitHub Push - Domain Monitor
echo ====================================
echo.

echo Your Git repository is ready!
echo.
echo BEFORE RUNNING THIS SCRIPT:
echo.
echo 1. Open browser and go to: https://github.com/new
echo 2. Create repository with these settings:
echo    - Repository name: domain-monitor
echo    - Visibility: PUBLIC (required for free releases)
echo    - Do NOT initialize with README, .gitignore, or license
echo 3. Click "Create repository"
echo.

set /p CONTINUE="Have you created the repository on GitHub? (Y/N): "
if /i not "%CONTINUE%"=="Y" (
    echo.
    echo Please create the repository first, then run this script again.
    pause
    exit /b 0
)

echo.
set /p GITHUB_USER="Enter your GitHub username: "
if "%GITHUB_USER%"=="" (
    echo [ERROR] GitHub username cannot be empty
    pause
    exit /b 1
)

echo.
echo Configuration:
echo - Username: %GITHUB_USER%
echo - Repository: domain-monitor
echo - URL: https://github.com/%GITHUB_USER%/domain-monitor
echo.

set /p CONFIRM="Is this correct? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo Step 1: Updating package.json with your GitHub username...
powershell -Command "(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', '%GITHUB_USER%' | Set-Content package.json"
echo [OK] package.json updated

echo.
echo Step 2: Updating README.md with your GitHub username...
powershell -Command "(Get-Content README.md) -replace 'YOUR-GITHUB-USERNAME', '%GITHUB_USER%' | Set-Content README.md"
echo [OK] README.md updated

echo.
echo Step 3: Committing configuration changes...
git add package.json README.md
git commit -m "Update GitHub configuration with username"
echo [OK] Configuration committed

echo.
echo Step 4: Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/domain-monitor.git
echo [OK] Remote added

echo.
echo Step 5: Pushing to GitHub...
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo SUCCESS! 
    echo ====================================
    echo.
    echo Your code is now on GitHub!
    echo Repository: https://github.com/%GITHUB_USER%/domain-monitor
    echo.
    echo NEXT STEPS:
    echo.
    echo 1. Create your first release:
    echo    https://github.com/%GITHUB_USER%/domain-monitor/releases/new
    echo.
    echo 2. Fill in release details:
    echo    - Tag: v1.0.0
    echo    - Title: Domain Monitor v1.0.0 - Initial Release
    echo    - Description: See GITHUB_DISTRIBUTION.md for template
    echo.
    echo 3. Upload installer:
    echo    dist-electron\Domain Monitoring System-Setup-1.0.0.exe
    echo.
    echo 4. Click "Publish release"
    echo.
    echo 5. Share your download link:
    echo    https://github.com/%GITHUB_USER%/domain-monitor/releases/latest
    echo.
    echo For detailed instructions, see: GITHUB_DISTRIBUTION.md
) else (
    echo.
    echo ====================================
    echo PUSH FAILED
    echo ====================================
    echo.
    echo Common issues:
    echo.
    echo 1. Repository doesn't exist on GitHub
    echo    Solution: Create it at https://github.com/new
    echo.
    echo 2. Authentication failed
    echo    Solution: Use GitHub CLI or Personal Access Token
    echo    - GitHub CLI: gh auth login
    echo    - Or generate token at: https://github.com/settings/tokens
    echo.
    echo 3. Permission denied
    echo    Solution: Check repository ownership and access rights
    echo.
    echo Try running this script again after fixing the issue.
)

echo.
pause

@echo off
REM GitHub Setup Helper Script for Domain Monitor
REM This script helps initialize Git and prepare for GitHub release

echo ====================================
echo Domain Monitor - GitHub Setup
echo ====================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Check if already initialized
if exist ".git" (
    echo [WARNING] Git repository already exists!
    echo.
    echo Current status:
    git status
    echo.
    choice /C YN /M "Do you want to continue anyway"
    if errorlevel 2 exit /b 0
    echo.
) else (
    echo Step 1: Initializing Git repository...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to initialize Git repository
        pause
        exit /b 1
    )
    echo [OK] Git repository initialized
    echo.
)

REM Get GitHub username
echo Step 2: GitHub Configuration
echo.
set /p GITHUB_USER="Enter your GitHub username: "
if "%GITHUB_USER%"=="" (
    echo [ERROR] GitHub username cannot be empty
    pause
    exit /b 1
)

echo.
echo GitHub Username: %GITHUB_USER%
echo Repository URL: https://github.com/%GITHUB_USER%/domain-monitor
echo.
choice /C YN /M "Is this correct"
if errorlevel 2 goto :get_username
echo.

REM Update package.json with GitHub username
echo Step 3: Updating package.json with GitHub configuration...
powershell -Command "(Get-Content package.json) -replace 'YOUR-GITHUB-USERNAME', '%GITHUB_USER%' | Set-Content package.json"
echo [OK] package.json updated
echo.

REM Add all files
echo Step 4: Adding files to Git...
git add .
echo [OK] Files staged
echo.

REM Create initial commit
echo Step 5: Creating initial commit...
git commit -m "Initial commit - Domain Monitor v1.0.0"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Commit failed or nothing to commit
    echo.
)

REM Set main branch
echo Step 6: Setting main branch...
git branch -M main
echo [OK] Branch set to main
echo.

REM Add remote
echo Step 7: Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/domain-monitor.git
echo [OK] Remote added
echo.

REM Show status
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Repository configured for: https://github.com/%GITHUB_USER%/domain-monitor
echo.
echo NEXT STEPS:
echo.
echo 1. Create repository on GitHub:
echo    https://github.com/new
echo    Repository name: domain-monitor
echo    Make it PUBLIC (for free releases)
echo.
echo 2. Push your code:
echo    git push -u origin main
echo.
echo 3. Create your first release:
echo    - Go to: https://github.com/%GITHUB_USER%/domain-monitor/releases/new
echo    - Tag: v1.0.0
echo    - Upload: dist-electron\Domain Monitoring System-Setup-1.0.0.exe
echo    - Publish release
echo.
echo For detailed instructions, see: GITHUB_RELEASE_GUIDE.md
echo.

REM Ask if user wants to push now
echo.
choice /C YN /M "Do you want to push to GitHub now (repository must exist)"
if errorlevel 2 goto :end

echo.
echo Pushing to GitHub...
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Code pushed to GitHub!
    echo.
    echo Now create your release at:
    echo https://github.com/%GITHUB_USER%/domain-monitor/releases/new
) else (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo Make sure you:
    echo 1. Created the repository on GitHub
    echo 2. Have correct permissions
    echo 3. Are logged in to Git
    echo.
    echo You can push manually later with:
    echo    git push -u origin main
)

:end
echo.
pause

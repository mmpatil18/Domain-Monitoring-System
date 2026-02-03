@echo off
REM ==============================================
REM Domain Monitor - Development Quick Start
REM ==============================================

echo.
echo ==========================================
echo   Domain Monitor - Development Mode
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] Installing Node.js dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
) else (
    echo [✓] Node.js dependencies already installed
    echo.
)

REM Check if Python venv exists
if not exist "venv\" (
    echo [WARNING] Python virtual environment not found!
    echo Please run install.bat first to set up Python
    echo.
    pause
    exit /b 1
)

echo [2/2] Starting Electron app in development mode...
echo.
echo ==========================================
echo   App will open in a new window
echo   - Python backend will start automatically
echo   - Web interface will load
echo   - DevTools will be open for debugging
echo ==========================================
echo.
echo Press Ctrl+C to stop the application
echo.

REM Start Electron
call npm start

echo.
echo Application closed.
pause

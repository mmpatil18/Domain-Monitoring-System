@echo off
REM ============================================
REM Domain Monitor - Build Script (Windows)
REM ============================================

echo.
echo ========================================
echo   Building Domain Monitor
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/5] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Installing Python build dependencies...
call venv\Scripts\activate.bat
pip install pyinstaller
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install PyInstaller, will use fallback method
)

echo.
echo [3/5] Bundling Python backend...
call npm run bundle-python
if %errorlevel% neq 0 (
    echo [ERROR] Failed to bundle Python backend
    pause
    exit /b 1
)

echo.
echo [4/5] Building Electron application...
echo Choose build target:
echo   1. Windows only (fastest)
echo   2. All platforms (Windows, macOS, Linux)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Building for Windows...
    call npm run build:win
) else if "%choice%"=="2" (
    echo Building for all platforms...
    call npm run build:all
) else (
    echo Building for Windows (default)...
    call npm run build:win
)

if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo [5/5] Build complete!
echo.
echo ========================================
echo   Build Summary
echo ========================================
echo Output directory: dist-electron\
echo.
dir dist-electron\
echo.
echo ========================================
echo Build completed successfully! 🎉
echo ========================================
echo.
pause

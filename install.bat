@echo off
echo ============================================================
echo Domain Monitor System - Installation
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Python found
python --version

REM Create virtual environment
echo.
echo [2/5] Creating virtual environment...
if exist "venv" (
    echo Virtual environment already exists, skipping...
) else (
    python -m venv venv
    echo Virtual environment created
)

REM Activate virtual environment
echo.
echo [3/5] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo.
echo [4/5] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if not exists
echo.
echo [5/5] Setting up configuration...
if exist ".env" (
    echo Configuration file already exists
) else (
    copy .env.example .env
    echo Created .env file from template
    echo IMPORTANT: Please edit .env file with your email settings
)

REM Initialize database
echo.
echo Initializing database...
python -c "from backend.database import Database; Database()"

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo NEXT STEPS:
echo 1. Edit .env file with your email settings (optional)
echo 2. Run start_backend.bat to start the monitoring service
echo 3. Run start_app.bat to open the web interface
echo.
echo NOTE: Email alerts are optional. The system will work without
echo       email configuration, but you won't receive notifications.
echo.
pause

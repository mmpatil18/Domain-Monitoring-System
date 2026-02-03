@echo off
echo ============================================================
echo Starting Domain Monitor Backend Service
echo ============================================================
echo.

REM Check if venv exists
if not exist "venv" (
    echo [ERROR] Virtual environment not found
    echo Please run install.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

echo Starting monitoring service...
echo Monitor will check domains periodically
echo Press Ctrl+C to stop
echo.
echo ============================================================
echo.

REM Start monitor service
python backend\monitor_service.py

pause

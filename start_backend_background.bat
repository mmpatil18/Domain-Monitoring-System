@echo off
REM Run the monitoring service hidden in background
REM This keeps it running even if you close the window

echo Starting Domain Monitor in background mode...

REM Check if venv exists
if not exist "venv" (
    echo [ERROR] Virtual environment not found
    echo Please run install.bat first
    pause
    exit /b 1
)

REM Activate virtual environment and run in background
start /min "" cmd /c "call venv\Scripts\activate.bat && python backend\monitor_service.py >> logs\monitor.log 2>&1"

echo Domain Monitor is now running in background (minimized)
echo Check logs\monitor.log for output
echo.
echo To stop: Open Task Manager and end python.exe process
timeout /t 3

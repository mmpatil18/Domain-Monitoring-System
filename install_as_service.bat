@echo off
echo ============================================================
echo Setting up Domain Monitor as Windows Service using NSSM
echo ============================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires administrator privileges
    echo Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

echo [1/3] Checking for NSSM (Non-Sucking Service Manager)...

REM Check if nssm exists
where nssm >nul 2>&1
if errorlevel 1 (
    echo NSSM not found. Downloading...
    echo.
    echo Please download NSSM manually:
    echo 1. Visit: https://nssm.cc/download
    echo 2. Download nssm-2.24.zip
    echo 3. Extract nssm.exe to this folder OR add to PATH
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo NSSM found!

echo.
echo [2/3] Installing Domain Monitor Backend Service...

REM Get current directory
set CURRENT_DIR=%cd%

REM Remove existing service if it exists
nssm stop DomainMonitor >nul 2>&1
nssm remove DomainMonitor confirm >nul 2>&1

REM Install the service
nssm install DomainMonitor "%CURRENT_DIR%\venv\Scripts\python.exe" "%CURRENT_DIR%\backend\monitor_service.py"
nssm set DomainMonitor AppDirectory "%CURRENT_DIR%"
nssm set DomainMonitor DisplayName "Domain Monitor Service"
nssm set DomainMonitor Description "Continuously monitors domain availability and sends alerts"
nssm set DomainMonitor Start SERVICE_AUTO_START

REM Set up logging
if not exist "logs" mkdir logs
nssm set DomainMonitor AppStdout "%CURRENT_DIR%\logs\monitor_output.log"
nssm set DomainMonitor AppStderr "%CURRENT_DIR%\logs\monitor_error.log"

echo Service installed successfully!

echo.
echo [3/3] Starting the service...
nssm start DomainMonitor

echo.
echo ============================================================
echo Domain Monitor is now running as a Windows Service!
echo ============================================================
echo.
echo Service Name: DomainMonitor
echo Status: Running
echo Startup Type: Automatic (starts on boot)
echo Logs: %CURRENT_DIR%\logs\
echo.
echo MANAGEMENT COMMANDS:
echo - View status:  nssm status DomainMonitor
echo - Stop service: nssm stop DomainMonitor
echo - Start service: nssm start DomainMonitor
echo - Restart: nssm restart DomainMonitor
echo - Remove service: nssm remove DomainMonitor confirm
echo.
echo You can also manage it via:
echo - Services app (services.msc)
echo - Task Manager ^> Services tab
echo.
pause

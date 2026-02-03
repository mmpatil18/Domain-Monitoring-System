@echo off
echo ============================================================
echo Setting up Domain Monitor to run at Windows Startup
echo ============================================================
echo.

REM Get current directory
set CURRENT_DIR=%cd%
set SHORTCUT_NAME=Domain Monitor Backend
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [1/2] Creating startup shortcut...

REM Create VBS script to create shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%STARTUP_FOLDER%\%SHORTCUT_NAME%.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%CURRENT_DIR%\start_backend.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%CURRENT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "Domain Monitor Backend Service" >> CreateShortcut.vbs
echo oLink.WindowStyle = 7 >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Run the VBS script
cscript //nologo CreateShortcut.vbs

REM Delete the VBS script
del CreateShortcut.vbs

echo Shortcut created in Startup folder!

echo.
echo [2/2] Testing the shortcut...
echo The backend service will start minimized when you log in to Windows.

echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo The Domain Monitor backend will now:
echo - Start automatically when you log in to Windows
echo - Run minimized in the background
echo.
echo Location: %STARTUP_FOLDER%\%SHORTCUT_NAME%.lnk
echo.
echo To disable auto-start:
echo 1. Press Win+R and type: shell:startup
echo 2. Delete the "%SHORTCUT_NAME%" shortcut
echo.
echo NOTE: This method requires you to stay logged in.
echo For true 24/7 service, use install_as_service.bat instead.
echo.
pause

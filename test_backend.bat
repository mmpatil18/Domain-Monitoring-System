@echo off
REM Quick test to verify Python backend works

echo Testing Python Backend...
echo.

REM Check venv exists
if not exist "venv\" (
    echo [ERROR] Virtual environment not found!
    echo Please run install.bat first
    pause
    exit /b 1
)

echo [1/2] Activating virtual environment...
call venv\Scripts\activate

echo [2/2] Testing Flask import...
python -c "import flask; print('Flask version:', flask.__version__)"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Flask not installed in virtual environment!
    echo Please run: pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Flask server (Press Ctrl+C to stop)...
echo.
python backend\api.py

pause

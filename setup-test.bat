@echo off
echo Installing Python dependencies for Code with Morais...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python from https://python.org/downloads/
    pause
    exit /b 1
)

echo Installing Flask and Firebase dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo Dependencies installed! Now you can run:
echo   python app.py
echo.
echo Then visit: http://localhost:5000/student-dashboard
pause
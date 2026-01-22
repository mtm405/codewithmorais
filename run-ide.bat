@echo off
REM Streamlit IDE Launcher for Windows Command Prompt
REM Quick script to start the Python IDE

echo.
echo ================================================
echo    Python Interactive IDE - Code with Morais
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if streamlit is installed
python -m streamlit --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing required dependencies...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Create student_submissions directory if it doesn't exist
if not exist "student_submissions" (
    mkdir student_submissions
    echo [INFO] Created student_submissions directory
)

echo [INFO] Starting Streamlit IDE...
echo.
echo ================================================
echo The IDE will open in your default browser
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Start Streamlit
python -m streamlit run streamlit_ide.py --server.headless=false

pause

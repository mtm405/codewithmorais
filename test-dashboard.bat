@echo off
echo Testing Student Dashboard - Code with Morais
echo ============================================
echo.

echo 1. Checking for Python installations...
echo.

REM Try different Python commands
echo Trying 'python --version':
python --version 2>nul
if %errorlevel% == 0 (
    echo ✓ Python found via 'python' command
    echo.
    echo 2. Testing Flask app...
    echo Starting Flask development server...
    python -m flask --app app run --debug --port 5000
) else (
    echo ✗ Python not found via 'python' command
    
    echo.
    echo Trying 'py --version':
    py --version 2>nul
    if %errorlevel% == 0 (
        echo ✓ Python found via 'py' command
        echo.
        echo 2. Testing Flask app...
        echo Starting Flask development server...
        py -m flask --app app run --debug --port 5000
    ) else (
        echo ✗ Python not found via 'py' command
        
        echo.
        echo Checking common Python installation locations:
        if exist "C:\Python*\python.exe" (
            echo ✓ Found Python in C:\Python*
            for /D %%i in (C:\Python*) do (
                echo   - %%i\python.exe
                "%%i\python.exe" --version
            )
        ) else (
            echo ✗ No Python found in C:\Python*
        )
        
        if exist "%LOCALAPPDATA%\Programs\Python\Python*\python.exe" (
            echo ✓ Found Python in %LOCALAPPDATA%\Programs\Python
            for /D %%i in ("%LOCALAPPDATA%\Programs\Python\Python*") do (
                echo   - %%i\python.exe
                "%%i\python.exe" --version
            )
        ) else (
            echo ✗ No Python found in %LOCALAPPDATA%\Programs\Python
        )
        
        echo.
        echo ❌ Python installation not found or not accessible
        echo.
        echo Please install Python from:
        echo - https://www.python.org/downloads/
        echo - Or Microsoft Store (search for Python)
        echo.
        echo Alternative: Use the test dashboard that just opened in your browser
        echo File: public\test-student-dashboard.html
        echo.
        echo This test dashboard simulates real data and doesn't require Python.
    )
)

echo.
echo Press any key to continue...
pause >nul
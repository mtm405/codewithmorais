@echo off
title Firebase Production Dashboard Deployment
color 0b
echo.
echo ==========================================
echo   Production Dashboard Deployment
echo ==========================================
echo.

echo Checking required files...
echo.

if exist "public\production-dashboard.html" (
    echo [✓] production-dashboard.html
) else (
    echo [✗] production-dashboard.html - MISSING
)

if exist "public\firebase-lesson-integration.js" (
    echo [✓] firebase-lesson-integration.js
) else (
    echo [✗] firebase-lesson-integration.js - MISSING
)

if exist "firebase.json" (
    echo [✓] firebase.json
) else (
    echo [✗] firebase.json - MISSING
)

if exist "firestore.rules" (
    echo [✓] firestore.rules
) else (
    echo [✗] firestore.rules - MISSING
)

echo.
echo ==========================================
echo   Deployment Options
echo ==========================================
echo.
echo 1. Firebase Console (Manual Upload)
echo 2. Install Node.js and Firebase CLI  
echo 3. Deploy to Netlify (Drag and Drop)
echo 4. Test Locally (HTTP Server)
echo 5. Open Deployment Guides
echo 0. Exit
echo.

set /p choice="Choose option (0-5): "

if "%choice%"=="1" goto firebase_console
if "%choice%"=="2" goto install_nodejs
if "%choice%"=="3" goto netlify
if "%choice%"=="4" goto test_local
if "%choice%"=="5" goto open_guides
if "%choice%"=="0" goto exit
goto menu

:firebase_console
echo.
echo ==========================================
echo   Firebase Console Deployment
echo ==========================================
echo.
echo Steps:
echo 1. Go to: https://console.firebase.google.com/
echo 2. Select project: code-with-morais-405
echo 3. Navigate to: Hosting (left sidebar)
echo 4. Upload contents of 'public' folder
echo.
echo Files to upload:
dir /b public\
echo.
echo Don't forget to update Firestore rules:
echo - Go to Firestore Database ^> Rules
echo - Copy content from firestore.rules
echo - Click Publish
echo.
set /p open="Open Firebase Console? (y/n): "
if /i "%open%"=="y" start https://console.firebase.google.com/
goto menu

:install_nodejs
echo.
echo ==========================================
echo   Install Node.js and Firebase CLI
echo ==========================================
echo.
echo Steps:
echo 1. Download Node.js from: https://nodejs.org/
echo 2. Install Node.js (includes npm)
echo 3. Restart this script after installation
echo 4. Run: npm install -g firebase-tools
echo 5. Run: firebase login
echo 6. Run: firebase deploy
echo.
set /p open="Open Node.js download page? (y/n): "
if /i "%open%"=="y" start https://nodejs.org/
goto menu

:netlify
echo.
echo ==========================================
echo   Netlify Deployment (Free and Easy)
echo ==========================================
echo.
echo Steps:
echo 1. Go to: https://netlify.com/
echo 2. Drag and drop 'public' folder to deployment area
echo 3. Get instant live URL
echo 4. Add your Netlify domain to Firebase authorized domains
echo.
echo After deployment:
echo - Update Firebase Auth settings with new domain
echo - Test Google Sign-In on new domain
echo.
set /p open="Open Netlify? (y/n): "
if /i "%open%"=="y" start https://netlify.com/
goto menu

:test_local
echo.
echo ==========================================
echo   Local Testing
echo ==========================================
echo.
echo Starting local HTTP server...
echo Navigate to: http://localhost:8000/production-dashboard.html
echo Press Ctrl+C to stop server
echo.
cd public
python -m http.server 8000
cd ..
goto menu

:open_guides
echo.
echo ==========================================
echo   Opening Deployment Guides
echo ==========================================
echo.
if exist "DEPLOYMENT_GUIDE.md" (
    start DEPLOYMENT_GUIDE.md
    echo Opened: DEPLOYMENT_GUIDE.md
)
if exist "PRODUCTION_DASHBOARD_SETUP.md" (
    start PRODUCTION_DASHBOARD_SETUP.md
    echo Opened: PRODUCTION_DASHBOARD_SETUP.md
)
echo.
goto menu

:menu
echo.
echo Press any key to return to menu or Ctrl+C to exit...
pause >nul
cls
goto start

:exit
echo.
echo ==========================================
echo   Deployment Ready!
echo ==========================================
echo.
echo Your production dashboard files are ready:
echo ✓ Real Firebase authentication
echo ✓ Live data synchronization  
echo ✓ Secure user progress tracking
echo ✓ Achievement system
echo ✓ Real-time updates
echo.
echo Choose any deployment method above to go live!
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions.
echo.
pause
exit /b

:start
goto menu
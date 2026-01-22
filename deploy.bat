@echo off
echo ========================================
echo   Firebase Deployment Setup Assistant
echo ========================================
echo.

echo Checking for Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    echo.
    echo 📥 Installing Node.js using winget...
    winget install OpenJS.NodeJS
    echo.
    echo ⚠️  Please restart this script after Node.js installation completes
    pause
    exit /b
) else (
    echo ✅ Node.js is installed
)

echo.
echo Checking for Firebase CLI...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found
    echo.
    echo 📥 Installing Firebase CLI...
    npm install -g firebase-tools
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Firebase CLI
        echo Please run: npm install -g firebase-tools
        pause
        exit /b
    )
    echo ✅ Firebase CLI installed
) else (
    echo ✅ Firebase CLI is installed
)

echo.
echo ========================================
echo   Ready to Deploy!
echo ========================================
echo.
echo Your deployment options:
echo.
echo 1️⃣  Deploy to Firebase Hosting
echo 2️⃣  Login to Firebase (if not logged in)
echo 3️⃣  Check current Firebase project
echo 4️⃣  Deploy only hosting
echo 5️⃣  Deploy only Firestore rules
echo 6️⃣  Deploy everything
echo 7️⃣  Test locally first
echo 0️⃣  Exit
echo.

set /p choice="Choose an option (0-7): "

if "%choice%"=="1" goto deploy_all
if "%choice%"=="2" goto login
if "%choice%"=="3" goto check_project
if "%choice%"=="4" goto deploy_hosting
if "%choice%"=="5" goto deploy_rules
if "%choice%"=="6" goto deploy_all
if "%choice%"=="7" goto test_local
if "%choice%"=="0" goto exit

:login
echo.
echo 🔐 Logging into Firebase...
firebase login
goto main_menu

:check_project
echo.
echo 📋 Current Firebase project:
firebase projects:list
firebase use
goto main_menu

:deploy_hosting
echo.
echo 📤 Deploying hosting only...
firebase deploy --only hosting
echo.
echo ✅ Hosting deployed!
echo 🌐 Your dashboard should be live at:
echo    https://code-with-morais-405.web.app/production-dashboard
goto main_menu

:deploy_rules
echo.
echo 📤 Deploying Firestore rules...
firebase deploy --only firestore:rules
echo.
echo ✅ Firestore rules deployed!
goto main_menu

:deploy_all
echo.
echo 📤 Deploying everything...
firebase deploy
echo.
echo ✅ Full deployment complete!
echo 🌐 Your dashboard is live at:
echo    https://code-with-morais-405.web.app/production-dashboard
echo    https://code-with-morais-405.firebaseapp.com/production-dashboard
goto main_menu

:test_local
echo.
echo 🧪 Starting local test server...
echo 📂 Navigate to: http://localhost:8000/production-dashboard.html
echo.
cd public
python -m http.server 8000
goto main_menu

:main_menu
echo.
echo Press any key to return to main menu...
pause >nul
cls
goto start

:exit
echo.
echo 👋 Goodbye! Your dashboard is ready to deploy.
echo.
echo 📖 For manual deployment, see DEPLOYMENT_GUIDE.md
echo.
pause
exit /b

:start
goto main_menu
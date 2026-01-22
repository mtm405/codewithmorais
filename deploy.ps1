# Firebase Production Dashboard Deployment Script
# PowerShell version for systems without Node.js/Python readily available

Write-Host "=" -NoNewline -ForegroundColor Blue
Write-Host (" " * 48) -NoNewline
Write-Host "=" -ForegroundColor Blue
Write-Host "   🚀 Production Dashboard Deployment Assistant   " -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Blue  
Write-Host (" " * 48) -NoNewline
Write-Host "=" -ForegroundColor Blue
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "📂 Current directory: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Check for required files
$requiredFiles = @(
    "public\production-dashboard.html",
    "public\firebase-lesson-integration.js", 
    "firebase.json",
    "firestore.rules"
)

Write-Host "🔍 Checking required files..." -ForegroundColor Yellow
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "" 
    Write-Host "❌ Some required files are missing. Please ensure all files are present." -ForegroundColor Red
    Write-Host "📋 See DEPLOYMENT_GUIDE.md for manual deployment options." -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""
Write-Host "✅ All required files found!" -ForegroundColor Green
Write-Host ""

# Show deployment options
while ($true) {
    Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  Install Node.js & Firebase CLI (Automated)" -ForegroundColor White
    Write-Host "2️⃣  Manual Firebase Console Upload (No CLI needed)" -ForegroundColor White  
    Write-Host "3️⃣  Deploy to Netlify (Drag & Drop)" -ForegroundColor White
    Write-Host "4️⃣  Test locally (Simple HTTP server)" -ForegroundColor White
    Write-Host "5️⃣  Open deployment guides" -ForegroundColor White
    Write-Host "6️⃣  View production dashboard files" -ForegroundColor White
    Write-Host "0️⃣  Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Choose an option (0-6)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "📥 Installing Node.js..." -ForegroundColor Yellow
            Write-Host "This will install Node.js which includes npm and allows Firebase CLI installation." -ForegroundColor Gray
            Write-Host ""
            
            # Try winget first
            $wingetInstall = Read-Host "Install Node.js using winget? (y/n)"
            if ($wingetInstall -eq "y" -or $wingetInstall -eq "Y") {
                try {
                    winget install OpenJS.NodeJS
                    Write-Host "✅ Node.js installation initiated" -ForegroundColor Green
                    Write-Host "⚠️  Please restart PowerShell after installation completes" -ForegroundColor Yellow
                    Write-Host "Then run: npm install -g firebase-tools" -ForegroundColor Yellow
                } catch {
                    Write-Host "❌ Winget installation failed. Try manual download." -ForegroundColor Red
                }
            }
            
            Write-Host ""
            Write-Host "📖 Manual installation steps:" -ForegroundColor Cyan
            Write-Host "1. Visit: https://nodejs.org/" -ForegroundColor White
            Write-Host "2. Download the Windows Installer (.msi)" -ForegroundColor White
            Write-Host "3. Run the installer" -ForegroundColor White
            Write-Host "4. Restart PowerShell" -ForegroundColor White
            Write-Host "5. Run: npm install -g firebase-tools" -ForegroundColor White
            Write-Host "6. Run: firebase login" -ForegroundColor White
            Write-Host "7. Run: firebase deploy" -ForegroundColor White
            Write-Host ""
        }
        
        "2" {
            Write-Host ""
            Write-Host "🌐 Manual Firebase Console Upload" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "📋 Steps:" -ForegroundColor Yellow
            Write-Host "1. Open: https://console.firebase.google.com/" -ForegroundColor White
            Write-Host "2. Select project: code-with-morais-405" -ForegroundColor White
            Write-Host "3. Go to: Hosting (left sidebar)" -ForegroundColor White
            Write-Host "4. Click: 'Get Started' or 'Add another site'" -ForegroundColor White
            Write-Host "5. Upload contents of 'public' folder" -ForegroundColor White
            Write-Host ""
            Write-Host "📁 Files to upload:" -ForegroundColor Yellow
            Get-ChildItem "public\*" | ForEach-Object { Write-Host "   • $($_.Name)" -ForegroundColor Gray }
            Write-Host ""
            Write-Host "🔐 Don't forget to update Firestore rules:" -ForegroundColor Yellow
            Write-Host "   • Go to Firestore Database > Rules" -ForegroundColor White
            Write-Host "   • Copy content from firestore.rules file" -ForegroundColor White
            Write-Host "   • Click 'Publish'" -ForegroundColor White
            Write-Host ""
            
            $openConsole = Read-Host "Open Firebase Console now? (y/n)"
            if ($openConsole -eq "y" -or $openConsole -eq "Y") {
                Start-Process "https://console.firebase.google.com/"
            }
        }
        
        "3" {
            Write-Host ""
            Write-Host "🚀 Deploy to Netlify (Free and Easy)" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "📋 Steps:" -ForegroundColor Yellow
            Write-Host "1. Go to: https://netlify.com/" -ForegroundColor White
            Write-Host "2. Drag and drop your 'public' folder to the deployment area" -ForegroundColor White
            Write-Host "3. Get your live URL instantly" -ForegroundColor White
            Write-Host "4. Update Firebase authorized domains with your new URL" -ForegroundColor White
            Write-Host ""
            Write-Host "🔧 After deployment:" -ForegroundColor Yellow
            Write-Host "   • Add your Netlify domain to Firebase Auth Settings Authorized domains" -ForegroundColor White
            Write-Host "   • Update any hardcoded URLs in your dashboard" -ForegroundColor White
            Write-Host ""
            
            $openNetlify = Read-Host "Open Netlify now? (y/n)"
            if ($openNetlify -eq "y" -or $openNetlify -eq "Y") {
                Start-Process "https://netlify.com/"
            }
        }
        
        "4" {
            Write-Host ""
            Write-Host "🧪 Testing locally..." -ForegroundColor Yellow
            Write-Host "Starting simple HTTP server on port 8000" -ForegroundColor Gray
            Write-Host ""
            Write-Host "📂 Navigate to: http://localhost:8000/production-dashboard.html" -ForegroundColor Cyan
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
            Write-Host ""
            
            # Try different methods to start HTTP server
            Set-Location "public"
            
            # Method 1: Python (if available)
            try {
                python -m http.server 8000
            } catch {
                # Method 2: Try py launcher  
                try {
                    py -m http.server 8000
                } catch {
                    Write-Host "❌ Python not available for local server" -ForegroundColor Red
                    Write-Host "💡 Alternative: Use Visual Studio Code Live Server extension" -ForegroundColor Yellow
                    Write-Host "   or any other local development server" -ForegroundColor Yellow
                }
            }
            
            Set-Location ".."
        }
        
        "5" {
            Write-Host ""
            Write-Host "📖 Opening deployment guides..." -ForegroundColor Yellow
            
            if (Test-Path "DEPLOYMENT_GUIDE.md") {
                Start-Process "DEPLOYMENT_GUIDE.md"
            }
            
            if (Test-Path "PRODUCTION_DASHBOARD_SETUP.md") {
                Start-Process "PRODUCTION_DASHBOARD_SETUP.md"  
            }
            
            Write-Host "✅ Guides opened in default editor" -ForegroundColor Green
        }
        
        "6" {
            Write-Host ""
            Write-Host "📁 Production Dashboard Files:" -ForegroundColor Cyan
            Write-Host ""
            
            # Show file sizes and modification dates
            $files = @(
                "public\production-dashboard.html",
                "public\firebase-lesson-integration.js",
                "firebase.json", 
                "firestore.rules",
                "DEPLOYMENT_GUIDE.md",
                "PRODUCTION_DASHBOARD_SETUP.md"
            )
            
            foreach ($file in $files) {
                if (Test-Path $file) {
                    $fileInfo = Get-Item $file
                    $size = [math]::Round($fileInfo.Length / 1KB, 1)
                    Write-Host "✅ $file" -ForegroundColor Green
                    Write-Host "   Size: $size KB | Modified: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
                } else {
                    Write-Host "❌ $file (not found)" -ForegroundColor Red
                }
                Write-Host ""
            }
        }
        
        "0" {
            Write-Host ""
            Write-Host "👋 Goodbye! Your production dashboard is ready to deploy." -ForegroundColor Green
            Write-Host ""
            Write-Host "🎯 Quick summary of what you have:" -ForegroundColor Cyan
            Write-Host "   ✅ Production dashboard with real Firebase integration" -ForegroundColor White
            Write-Host "   ✅ Lesson integration system for progress tracking" -ForegroundColor White  
            Write-Host "   ✅ Updated Firebase hosting configuration" -ForegroundColor White
            Write-Host "   ✅ Secure Firestore rules for user data protection" -ForegroundColor White
            Write-Host ""
            Write-Host "📋 See DEPLOYMENT_GUIDE.md for complete instructions" -ForegroundColor Yellow
            Write-Host ""
            break
        }
        
        default {
            Write-Host ""
            Write-Host "❌ Invalid option. Please choose 0-6." -ForegroundColor Red
            Write-Host ""
        }
    }
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
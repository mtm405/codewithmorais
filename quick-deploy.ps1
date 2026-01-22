Write-Host "==========================================" -ForegroundColor Blue
Write-Host "   Production Dashboard Deployment" -ForegroundColor Cyan  
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

# Check required files
$files = @(
    "public\production-dashboard.html",
    "public\firebase-lesson-integration.js", 
    "firebase.json",
    "firestore.rules"
)

Write-Host "Checking files..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Firebase Console (Manual Upload)"
Write-Host "2. Install Node.js and Firebase CLI"  
Write-Host "3. Deploy to Netlify"
Write-Host "4. Test Locally"
Write-Host "5. Open Guides"
Write-Host "0. Exit"
Write-Host ""

$choice = Read-Host "Choose option (0-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Firebase Console Deployment:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://console.firebase.google.com/"
        Write-Host "2. Select: code-with-morais-405"  
        Write-Host "3. Navigate to: Hosting"
        Write-Host "4. Upload 'public' folder contents"
        Write-Host ""
        
        $open = Read-Host "Open Firebase Console? (y/n)"
        if ($open -eq "y") {
            Start-Process "https://console.firebase.google.com/"
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Installing Node.js..." -ForegroundColor Yellow
        Write-Host "Visit: https://nodejs.org/"
        Write-Host "Download and install Node.js"
        Write-Host "Then run: npm install -g firebase-tools"
        
        $open = Read-Host "Open Node.js download page? (y/n)"
        if ($open -eq "y") {
            Start-Process "https://nodejs.org/"
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Netlify Deployment:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://netlify.com/"
        Write-Host "2. Drag 'public' folder to deployment area"
        Write-Host "3. Get instant live URL"
        
        $open = Read-Host "Open Netlify? (y/n)"
        if ($open -eq "y") {
            Start-Process "https://netlify.com/"
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Starting local server..." -ForegroundColor Yellow
        Write-Host "Navigate to: http://localhost:8000/production-dashboard.html"
        Write-Host ""
        Set-Location "public"
        python -m http.server 8000
        Set-Location ".."
    }
    
    "5" {
        Write-Host ""
        Write-Host "Opening deployment guides..." -ForegroundColor Yellow
        if (Test-Path "DEPLOYMENT_GUIDE.md") {
            Start-Process "DEPLOYMENT_GUIDE.md"
        }
    }
    
    "0" {
        Write-Host ""
        Write-Host "Your production dashboard is ready!" -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = Read-Host
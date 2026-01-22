# Streamlit IDE Launcher
# Quick script to start the Python IDE

Write-Host "🐍 Starting Python Interactive IDE..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if streamlit is installed
try {
    $streamlitVersion = python -m streamlit --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Streamlit not found. Installing dependencies..." -ForegroundColor Yellow
        python -m pip install -r requirements.txt
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Create student_submissions directory if it doesn't exist
if (-not (Test-Path "student_submissions")) {
    New-Item -ItemType Directory -Path "student_submissions" | Out-Null
    Write-Host "📁 Created student_submissions directory" -ForegroundColor Green
}

Write-Host "🚀 Launching IDE..." -ForegroundColor Green
Write-Host "📝 The IDE will open in your default browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Press Ctrl+C in this window to stop the server" -ForegroundColor Gray
Write-Host "   - The IDE will auto-reload when you make changes" -ForegroundColor Gray
Write-Host "   - Student submissions are saved in ./student_submissions/" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Start Streamlit
python -m streamlit run streamlit_ide.py --server.headless=false

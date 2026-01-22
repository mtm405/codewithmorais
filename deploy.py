#!/usr/bin/env python3
"""
Firebase Deployment Helper Script
Simple deployment assistant for the production dashboard
"""

import os
import subprocess
import sys
import webbrowser
from pathlib import Path

def run_command(command, shell=True):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=shell, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_dependencies():
    """Check if required tools are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Node.js
    node_ok, _, _ = run_command("node --version")
    if node_ok:
        print("✅ Node.js is installed")
    else:
        print("❌ Node.js not found")
        print("   Please install from: https://nodejs.org/")
        return False
    
    # Check Firebase CLI
    firebase_ok, _, _ = run_command("firebase --version")
    if firebase_ok:
        print("✅ Firebase CLI is installed")
    else:
        print("❌ Firebase CLI not found")
        print("📥 Attempting to install Firebase CLI...")
        install_ok, _, _ = run_command("npm install -g firebase-tools")
        if install_ok:
            print("✅ Firebase CLI installed successfully")
        else:
            print("❌ Failed to install Firebase CLI")
            print("   Please run: npm install -g firebase-tools")
            return False
    
    return True

def firebase_login():
    """Handle Firebase authentication"""
    print("\n🔐 Firebase Login")
    success, _, _ = run_command("firebase login")
    if success:
        print("✅ Successfully logged into Firebase")
    else:
        print("❌ Login failed")
    return success

def check_project():
    """Check current Firebase project"""
    print("\n📋 Current Firebase project:")
    success, output, _ = run_command("firebase use")
    if success:
        print(output)
    else:
        print("❌ No project selected")
        print("Setting project to code-with-morais-405...")
        run_command("firebase use code-with-morais-405")

def deploy_hosting():
    """Deploy Firebase hosting"""
    print("\n📤 Deploying hosting...")
    success, output, error = run_command("firebase deploy --only hosting")
    if success:
        print("✅ Hosting deployed successfully!")
        print("\n🌐 Your dashboard is live at:")
        print("   https://code-with-morais-405.web.app/production-dashboard")
        print("   https://code-with-morais-405.firebaseapp.com/production-dashboard")
        
        # Ask to open in browser
        choice = input("\n🌐 Open in browser? (y/n): ").lower()
        if choice == 'y':
            webbrowser.open("https://code-with-morais-405.web.app/production-dashboard")
    else:
        print("❌ Hosting deployment failed:")
        print(error)
    return success

def deploy_rules():
    """Deploy Firestore rules"""
    print("\n📤 Deploying Firestore rules...")
    success, output, error = run_command("firebase deploy --only firestore:rules")
    if success:
        print("✅ Firestore rules deployed successfully!")
    else:
        print("❌ Rules deployment failed:")
        print(error)
    return success

def deploy_all():
    """Deploy everything"""
    print("\n📤 Deploying everything...")
    success, output, error = run_command("firebase deploy")
    if success:
        print("✅ Full deployment successful!")
        print("\n🌐 Your dashboard is live at:")
        print("   https://code-with-morais-405.web.app/production-dashboard")
        print("   https://code-with-morais-405.firebaseapp.com/production-dashboard")
    else:
        print("❌ Deployment failed:")
        print(error)
    return success

def test_local():
    """Start local development server"""
    print("\n🧪 Starting local test server...")
    print("📂 Navigate to: http://localhost:8000/production-dashboard.html")
    print("Press Ctrl+C to stop the server")
    
    public_dir = Path("public")
    if public_dir.exists():
        os.chdir(public_dir)
        try:
            subprocess.run([sys.executable, "-m", "http.server", "8000"])
        except KeyboardInterrupt:
            print("\n✅ Local server stopped")
    else:
        print("❌ Public directory not found")

def manual_deployment_guide():
    """Show manual deployment options"""
    print("\n📖 Manual Deployment Options:")
    print("\n1️⃣  Firebase Console (No CLI needed):")
    print("   • Go to https://console.firebase.google.com/")
    print("   • Select: code-with-morais-405")
    print("   • Navigate to Hosting")
    print("   • Upload your 'public' folder contents")
    print("\n2️⃣  Alternative Hosting:")
    print("   • Netlify: Drag & drop 'public' folder to netlify.com")
    print("   • Vercel: Connect GitHub repo to vercel.com")
    print("   • GitHub Pages: Push to GitHub and enable Pages")
    print("\n📋 See DEPLOYMENT_GUIDE.md for detailed instructions")

def main():
    """Main deployment menu"""
    print("=" * 50)
    print("   🚀 Firebase Production Dashboard Deployer")
    print("=" * 50)
    
    while True:
        print("\n📋 Deployment Options:")
        print("1️⃣  Quick Deploy (recommended)")
        print("2️⃣  Login to Firebase")
        print("3️⃣  Check Firebase project")
        print("4️⃣  Deploy hosting only")
        print("5️⃣  Deploy Firestore rules only")
        print("6️⃣  Deploy everything")
        print("7️⃣  Test locally")
        print("8️⃣  Manual deployment guide")
        print("0️⃣  Exit")
        
        choice = input("\nChoose an option (0-8): ").strip()
        
        if choice == "1":
            # Quick deploy workflow
            if not check_dependencies():
                continue
            check_project()
            if deploy_hosting() and deploy_rules():
                print("\n🎉 Quick deployment completed successfully!")
                break
                
        elif choice == "2":
            firebase_login()
            
        elif choice == "3":
            check_project()
            
        elif choice == "4":
            if check_dependencies():
                deploy_hosting()
                
        elif choice == "5":
            if check_dependencies():
                deploy_rules()
                
        elif choice == "6":
            if check_dependencies():
                deploy_all()
                
        elif choice == "7":
            test_local()
            
        elif choice == "8":
            manual_deployment_guide()
            
        elif choice == "0":
            print("\n👋 Goodbye! Your dashboard is ready to deploy.")
            break
            
        else:
            print("❌ Invalid option. Please choose 0-8.")

if __name__ == "__main__":
    main()
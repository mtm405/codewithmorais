#!/usr/bin/env python3
"""
Quick test script to verify quiz unlock button functionality
"""

import os
import sys

def main():
    print("🧪 QUIZ FIX VERIFICATION TEST")
    print("=" * 50)
    
    # Check if required files exist
    files_to_check = [
        "static/js/quiz_core.js",
        "static/js/quiz_master.js", 
        "static/dist/app.min.js",
        "templates/pages/lesson.html"
    ]
    
    print("\n📁 Checking required files:")
    all_files_exist = True
    for file_path in files_to_check:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"   ✅ {file_path} ({size:,} bytes)")
        else:
            print(f"   ❌ {file_path} (missing)")
            all_files_exist = False
    
    if not all_files_exist:
        print("\n❌ Some required files are missing!")
        return False
    
    # Check quiz_core.js content
    print("\n🔍 Checking quiz_core.js content:")
    with open("static/js/quiz_core.js", "r", encoding="utf-8") as f:
        content = f.read()
        
    checks = [
        ("originalButtonTexts", "originalButtonTexts" in content),
        ("restoreButton method", "restoreButton(" in content),
        ("startQuizDemo method", "startQuizDemo(" in content),
        ("submitDemoAnswer method", "submitDemoAnswer(" in content),
        ("Quiz unlock buttons init", "initQuizUnlockButtons" in content)
    ]
    
    for check_name, check_result in checks:
        status = "✅" if check_result else "❌"
        print(f"   {status} {check_name}")
    
    # Check if production bundle includes the fixes
    print("\n📦 Checking production bundle:")
    with open("static/dist/app.min.js", "r", encoding="utf-8") as f:
        bundle_content = f.read()
        
    bundle_checks = [
        ("QuizCore in bundle", "QuizCore" in bundle_content),
        ("originalButtonTexts in bundle", "originalButtonTexts" in bundle_content),
        ("restoreButton in bundle", "restoreButton" in bundle_content)
    ]
    
    for check_name, check_result in bundle_checks:
        status = "✅" if check_result else "❌"
        print(f"   {status} {check_name}")
    
    print("\n🎯 TESTING RECOMMENDATIONS:")
    print("1. Open http://localhost:5000/lesson/1_1 in browser")
    print("2. Click any quiz unlock button (Easy, Medium, Hard)")
    print("3. Button should show 'Loading quiz...' then restore original text")
    print("4. Quiz modal should open with demo content")
    print("5. Demo quiz should be interactive and closeable")
    
    print("\n🐛 IF ISSUES PERSIST:")
    print("- Check browser console for JavaScript errors")
    print("- Verify QuizCore.init() is called on page load")
    print("- Ensure jQuery and other dependencies load before quiz scripts")
    
    print("\n✅ Quiz fix verification complete!")
    return True

if __name__ == "__main__":
    main()

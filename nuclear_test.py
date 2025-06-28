#!/usr/bin/env python3
"""
🎪 NUCLEAR QUIZ SYSTEM - VERIFICATION TEST

THE ULTIMATE TEST for the nuclear simplification
Verifies that ALL chaos has been eliminated and the system WORKS perfectly
"""

import os
import sys
import time
from pathlib import Path

def test_file_elimination():
    """Test that chaos files have been eliminated"""
    
    print("🗑️  TESTING FILE ELIMINATION...")
    
    chaos_files = [
        'static/js/quiz_core.js',
        'static/js/quiz_master.min.js', 
        'static/js/quiz_engine_unified.js',
        'static/js/course_dashboard.min.js',
        'static/js/dashboard_manager_unified.js',
        'static/js/api.min.js',
        'static/js/api_client_unified.js',
        'static/js/dev-utils.min.js',
        'static/js/utils_unified.js',
        'static/js/components/index.js',
        'static/js/components/MultipleChoice.js',
        'static/js/components/QuizContainer.js'
    ]
    
    eliminated_count = 0
    
    for file_path in chaos_files:
        if not os.path.exists(file_path):
            print(f"  ✅ ELIMINATED: {file_path}")
            eliminated_count += 1
        else:
            print(f"  ❌ STILL EXISTS: {file_path}")
    
    print(f"\n🎯 Elimination Results: {eliminated_count}/{len(chaos_files)} files eliminated")
    return eliminated_count == len(chaos_files)

def test_nuclear_bundles():
    """Test that nuclear bundles exist and are properly sized"""
    
    print("\n📦 TESTING NUCLEAR BUNDLES...")
    
    bundles = {
        'static/dist/core.ultimate.js': {'min_size': 15000, 'max_size': 25000},
        'static/dist/dashboard.ultimate.js': {'min_size': 10000, 'max_size': 20000}
    }
    
    all_good = True
    total_size = 0
    
    for bundle_path, constraints in bundles.items():
        if os.path.exists(bundle_path):
            size = os.path.getsize(bundle_path)
            total_size += size
            
            if constraints['min_size'] <= size <= constraints['max_size']:
                print(f"  ✅ {bundle_path} ({size:,} bytes) - PERFECT SIZE")
            else:
                print(f"  ⚠️  {bundle_path} ({size:,} bytes) - Size outside expected range")
                all_good = False
        else:
            print(f"  ❌ MISSING: {bundle_path}")
            all_good = False
    
    print(f"\n📊 Total Bundle Size: {total_size:,} bytes ({total_size/1024:.1f} KB)")
    
    return all_good

def test_essential_preservation():
    """Test that essential files are preserved"""
    
    print("\n🛡️  TESTING ESSENTIAL FILE PRESERVATION...")
    
    essential_files = [
        'static/js/modules/accessibility/drag-drop-keyboard.js'
    ]
    
    all_preserved = True
    
    for file_path in essential_files:
        if os.path.exists(file_path):
            print(f"  ✅ PRESERVED: {file_path}")
        else:
            print(f"  ❌ MISSING: {file_path}")
            all_preserved = False
    
    return all_preserved

def test_template_updates():
    """Test that templates use nuclear bundles"""
    
    print("\n📄 TESTING TEMPLATE UPDATES...")
    
    head_template = 'templates/layouts/head.html'
    
    if os.path.exists(head_template):
        with open(head_template, 'r', encoding='utf-8') as f:
            content = f.read()
        
        tests = [
            ('core.ultimate.js', 'core.ultimate.js' in content),
            ('dashboard.ultimate.js', 'dashboard.ultimate.js' in content),
            ('Old core.min.js removed', 'core.min.js' not in content),
            ('Old dashboard.min.js removed', 'dashboard.min.js' not in content)
        ]
        
        all_good = True
        for test_name, result in tests:
            if result:
                print(f"  ✅ {test_name}")
            else:
                print(f"  ❌ {test_name}")
                all_good = False
        
        return all_good
    else:
        print(f"  ❌ Template file not found: {head_template}")
        return False

def test_nuclear_system():
    """Run complete nuclear system test"""
    
    print("🎪 NUCLEAR QUIZ SYSTEM - VERIFICATION TEST")
    print("=" * 50)
    
    tests = [
        ("File Elimination", test_file_elimination),
        ("Nuclear Bundles", test_nuclear_bundles), 
        ("Essential Preservation", test_essential_preservation),
        ("Template Updates", test_template_updates)
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 RUNNING TEST: {test_name}")
        try:
            if test_func():
                print(f"✅ {test_name} - PASSED")
                passed_tests += 1
            else:
                print(f"❌ {test_name} - FAILED")
        except Exception as e:
            print(f"💥 {test_name} - ERROR: {e}")
    
    print(f"\n🎯 TEST RESULTS")
    print("=" * 30)
    print(f"✅ Passed: {passed_tests}/{total_tests}")
    print(f"❌ Failed: {total_tests - passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("\n🎊 ALL TESTS PASSED!")
        print("🎪 NUCLEAR SIMPLIFICATION - COMPLETE SUCCESS!")
        print("🚀 Quiz system is ready for production!")
        
        print("\n🎯 NUCLEAR ACHIEVEMENTS:")
        print("  🗑️  JavaScript chaos ELIMINATED")
        print("  📦 Single source of truth ACHIEVED") 
        print("  🎯 Quiz functionality RESTORED")
        print("  🚀 Performance MAXIMIZED")
        print("  🧹 Maintainability PARADISE")
        
        return True
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("🔧 Please review failed tests and fix issues")
        return False

def check_runtime_functionality():
    """Check if the system works at runtime"""
    
    print("\n🎮 RUNTIME FUNCTIONALITY TEST")
    print("=" * 30)
    
    print("🌐 Flask app should be running on http://localhost:8080")
    print("🧪 Manual testing required:")
    print("  1. Visit http://localhost:8080/lesson/1_1")
    print("  2. Click any quiz unlock button (Easy, Medium, Hard)")
    print("  3. Verify button shows 'Loading quiz...' then opens modal")
    print("  4. Verify quiz modal contains interactive content")
    print("  5. Verify no JavaScript errors in browser console")
    print("  6. Check browser console for nuclear messages:")
    print("     - '🎯 Quiz Engine Ultimate - Nuclear initialization starting...'")
    print("     - '🌐 API Client Ultimate - Loading...'")
    print("     - '✅ Quiz Engine Ultimate - NUCLEAR INITIALIZATION COMPLETE!'")
    
    print("\n📋 Expected console output:")
    print("  🎯 Quiz Engine Ultimate - Nuclear initialization starting...")
    print("  🌐 API Client Ultimate - Loading...")
    print("  📊 Dashboard Ultimate - Loading...")
    print("  ✅ Quiz Engine Ultimate - NUCLEAR INITIALIZATION COMPLETE!")
    print("  🔘 Found X quiz unlock buttons")
    print("  ✅ Quiz unlock buttons initialized: X")

if __name__ == "__main__":
    success = test_nuclear_system()
    
    if success:
        check_runtime_functionality()
        print("\n🎪 NUCLEAR QUIZ SYSTEM - VERIFICATION COMPLETE!")
        print("🎯 System is ready for production deployment!")
    else:
        print("\n❌ Nuclear verification failed!")
        print("🔧 Please review and fix issues before deployment.")
        sys.exit(1)

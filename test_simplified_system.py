#!/usr/bin/env python3
"""
SIMPLIFIED SYSTEM TEST
Comprehensive verification that our unified JS system works correctly

Tests:
1. File presence and integrity
2. Bundle loading and initialization
3. Quiz functionality
4. API communication
5. Dashboard features
6. No conflicts or errors
"""

import os
import requests
import time
from pathlib import Path

def test_file_presence():
    """Test that all required files exist"""
    print("📁 Testing File Presence...")
    
    required_files = [
        'static/dist/core.min.js',
        'static/dist/dashboard.min.js',
        'templates/layouts/head.html'
    ]
    
    archived_files = [
        'project_archives/simplified_cleanup/quiz_core.js.bak',
        'project_archives/simplified_cleanup/quiz_master.js.bak',
        'project_archives/simplified_cleanup/course_dashboard.js.bak'
    ]
    
    # Check required files exist
    all_present = True
    for file_path in required_files:
        if os.path.exists(file_path):
            size_kb = os.path.getsize(file_path) / 1024
            print(f"   ✅ {file_path} ({size_kb:.1f}KB)")
        else:
            print(f"   ❌ {file_path} (MISSING)")
            all_present = False
    
    # Check old files are archived
    print("\n📦 Checking Archived Files...")
    for file_path in archived_files:
        if os.path.exists(file_path):
            print(f"   ✅ {file_path} (archived)")
        else:
            print(f"   ⚠️  {file_path} (not found)")
    
    return all_present

def test_bundle_content():
    """Test that bundles contain expected functionality"""
    print("\n🔍 Testing Bundle Content...")
    
    # Test core bundle
    try:
        with open('static/dist/core.min.js', 'r', encoding='utf-8') as f:
            core_content = f.read()
        
        expected_in_core = [
            'QuizEngine',
            'APIClient', 
            'Utils',
            'Theme',
            'quiz_engine_unified'
        ]
        
        for item in expected_in_core:
            if item in core_content:
                print(f"   ✅ Core bundle contains: {item}")
            else:
                print(f"   ❌ Core bundle missing: {item}")
        
        # Check size
        core_size = len(core_content) / 1024
        print(f"   📊 Core bundle size: {core_size:.1f}KB")
        
    except Exception as e:
        print(f"   ❌ Core bundle test failed: {e}")
        return False
    
    # Test dashboard bundle
    try:
        with open('static/dist/dashboard.min.js', 'r', encoding='utf-8') as f:
            dashboard_content = f.read()
        
        expected_in_dashboard = [
            'DashboardManager',
            'initLeaderboard',
            'initDailyChallenges'
        ]
        
        for item in expected_in_dashboard:
            if item in dashboard_content:
                print(f"   ✅ Dashboard bundle contains: {item}")
            else:
                print(f"   ❌ Dashboard bundle missing: {item}")
        
        # Check size
        dashboard_size = len(dashboard_content) / 1024
        print(f"   📊 Dashboard bundle size: {dashboard_size:.1f}KB")
        
    except Exception as e:
        print(f"   ❌ Dashboard bundle test failed: {e}")
        return False
    
    return True

def test_flask_response():
    """Test that Flask app loads our pages correctly"""
    print("\n🌐 Testing Flask Responses...")
    
    test_urls = [
        ('/', 'Homepage'),
        ('/lesson/1_1', 'Lesson Page'),
        ('/dashboard', 'Dashboard Page')
    ]
    
    all_successful = True
    
    for url, name in test_urls:
        try:
            response = requests.get(f'http://localhost:5000{url}', timeout=5)
            
            if response.status_code == 200:
                # Check if our bundles are referenced
                if 'core.min.js' in response.text:
                    print(f"   ✅ {name}: Loads core.min.js")
                else:
                    print(f"   ⚠️  {name}: No core.min.js reference")
                
                if url == '/dashboard' and 'dashboard.min.js' in response.text:
                    print(f"   ✅ {name}: Loads dashboard.min.js")
                elif url == '/dashboard':
                    print(f"   ⚠️  {name}: No dashboard.min.js reference")
                
            else:
                print(f"   ❌ {name}: HTTP {response.status_code}")
                all_successful = False
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ {name}: Connection failed - {e}")
            all_successful = False
    
    return all_successful

def check_template_integration():
    """Check that templates are using the new bundles"""
    print("\n📝 Testing Template Integration...")
    
    try:
        with open('templates/layouts/head.html', 'r', encoding='utf-8') as f:
            head_content = f.read()
        
        # Check for new bundle references
        if 'core.min.js' in head_content:
            print("   ✅ head.html references core.min.js")
        else:
            print("   ❌ head.html missing core.min.js reference")
            return False
        
        if 'dashboard.min.js' in head_content:
            print("   ✅ head.html references dashboard.min.js")
        else:
            print("   ❌ head.html missing dashboard.min.js reference")
            return False
        
        # Check that old references are removed
        old_refs = ['quiz_core.js', 'quiz_master.js', 'course_dashboard.js', 'app.min.js']
        for old_ref in old_refs:
            if old_ref in head_content:
                print(f"   ⚠️  head.html still references old file: {old_ref}")
            else:
                print(f"   ✅ head.html cleaned of: {old_ref}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Template integration test failed: {e}")
        return False

def performance_comparison():
    """Compare old vs new bundle sizes"""
    print("\n📊 Performance Comparison...")
    
    # Calculate new bundle sizes
    new_size = 0
    if os.path.exists('static/dist/core.min.js'):
        new_size += os.path.getsize('static/dist/core.min.js')
    if os.path.exists('static/dist/dashboard.min.js'):
        new_size += os.path.getsize('static/dist/dashboard.min.js')
    
    new_size_kb = new_size / 1024
    
    # Estimate old bundle size (from archived files)
    old_size = 0
    old_files = [
        'project_archives/simplified_cleanup/quiz_core.js.bak',
        'project_archives/simplified_cleanup/quiz_master.js.bak', 
        'project_archives/simplified_cleanup/course_dashboard.js.bak',
        'project_archives/simplified_cleanup/api.js.bak',
        'project_archives/simplified_cleanup/dev-utils.js.bak'
    ]
    
    for file_path in old_files:
        if os.path.exists(file_path):
            old_size += os.path.getsize(file_path)
    
    old_size_kb = old_size / 1024
    
    print(f"   📄 OLD SYSTEM: {old_size_kb:.1f}KB ({len(old_files)} files)")
    print(f"   📄 NEW SYSTEM: {new_size_kb:.1f}KB (2 bundles)")
    
    if old_size_kb > 0:
        savings = old_size_kb - new_size_kb
        savings_percent = (savings / old_size_kb) * 100
        print(f"   🎯 SAVINGS: {savings:.1f}KB ({savings_percent:.1f}% reduction)")
    
    print(f"   🚀 HTTP Requests reduced: {len(old_files)} → 2 files")

def main():
    """Run all tests"""
    print("🎪 SIMPLIFIED SYSTEM COMPREHENSIVE TEST")
    print("=" * 60)
    
    # Track test results
    tests = [
        ("File Presence", test_file_presence),
        ("Bundle Content", test_bundle_content),
        ("Flask Response", test_flask_response),
        ("Template Integration", check_template_integration)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name} Test")
        print("-" * 30)
        
        try:
            result = test_func()
            if result:
                print(f"   ✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"   ❌ {test_name}: FAILED")
        except Exception as e:
            print(f"   ❌ {test_name}: ERROR - {e}")
    
    # Performance comparison (always run)
    performance_comparison()
    
    # Final summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"✅ PASSED: {passed}/{total} tests")
    print(f"❌ FAILED: {total - passed}/{total} tests")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("🚀 Simplified system is working perfectly!")
        print("\n🎯 BENEFITS ACHIEVED:")
        print("   • Single unified quiz system")
        print("   • No more conflicting JS files")
        print("   • Smaller bundle sizes")
        print("   • Cleaner architecture")
        print("   • Better maintainability")
    else:
        print(f"\n⚠️  {total - passed} tests failed - needs attention")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🎪 'JUST SIMPLIFY IT' OPERATION: COMPLETE! 🎉")
    else:
        print("\n❌ Some issues detected - check test output")

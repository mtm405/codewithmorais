#!/usr/bin/env python3
"""
SIMPLIFIED BUILD SYSTEM
Creates optimized production bundles from our unified JS files

Files to bundle:
- quiz_engine_unified.js (replaces quiz_core.js + quiz_master.js + course_dashboard.js quiz logic)
- api_client_unified.js (replaces api.js + scattered API calls)
- dashboard_manager_unified.js (replaces course_dashboard.js non-quiz logic)
- utils_unified.js (replaces dev-utils.js + scattered utilities)

Result: 4 files → 2 production bundles (much cleaner!)
"""

import os
import re
import time
from pathlib import Path

def minify_js(content):
    """Basic JS minification - removes comments, excess whitespace, console.logs"""
    
    # Remove multi-line comments /* ... */
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Remove single-line comments // (but preserve URLs)
    content = re.sub(r'(?<!:)//.*$', '', content, flags=re.MULTILINE)
    
    # Remove console.log statements completely (production optimization)
    content = re.sub(r'console\.(log|warn|info|debug)\([^)]*\);?', '', content)
    
    # Remove excess whitespace but preserve line breaks for readability
    content = re.sub(r'\n\s*\n', '\n', content)  # Remove empty lines
    content = re.sub(r'^\s+', '', content, flags=re.MULTILINE)  # Remove leading spaces
    content = re.sub(r'\s+$', '', content, flags=re.MULTILINE)  # Remove trailing spaces
    
    # Compress some common patterns
    content = re.sub(r'\s*{\s*', ' {', content)
    content = re.sub(r'\s*}\s*', '}\n', content)
    content = re.sub(r'\s*;\s*', ';', content)
    content = re.sub(r'\s*,\s*', ', ', content)
    
    return content.strip()

def get_file_size(filepath):
    """Get file size in KB"""
    return os.path.getsize(filepath) / 1024

def build_unified_bundles():
    """Build simplified JS bundles"""
    
    print("🎪 SIMPLIFIED BUILD SYSTEM")
    print("=" * 50)
    
    # Source files (our new unified files)
    js_files = [
        'static/js/quiz_engine_unified.js',
        'static/js/api_client_unified.js', 
        'static/js/dashboard_manager_unified.js',
        'static/js/utils_unified.js'
    ]
    
    # Check if all source files exist
    missing_files = []
    for file_path in js_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing source files:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    # Calculate original total size
    original_size = sum(get_file_size(f) for f in js_files)
    
    print("\n📁 Source Files:")
    for file_path in js_files:
        size_kb = get_file_size(file_path)
        print(f"   📄 {file_path} ({size_kb:.1f}KB)")
    
    print(f"\n📊 Total Original Size: {original_size:.1f}KB")
    
    # Create dist directory
    os.makedirs('static/dist', exist_ok=True)
    
    # === BUILD CORE BUNDLE ===
    print("\n🔨 Building Core Bundle...")
    
    core_files = [
        'static/js/utils_unified.js',
        'static/js/api_client_unified.js',
        'static/js/quiz_engine_unified.js'
    ]
    
    core_content = []
    for file_path in core_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add file header comment
        core_content.append(f"/* {os.path.basename(file_path)} */")
        core_content.append(content)
        core_content.append("")  # Empty line between files
    
    # Combine and minify
    combined_core = '\n'.join(core_content)
    minified_core = minify_js(combined_core)
    
    # Write core bundle
    core_bundle_path = 'static/dist/core.min.js'
    with open(core_bundle_path, 'w', encoding='utf-8') as f:
        f.write(minified_core)
    
    core_size = get_file_size(core_bundle_path)
    print(f"   ✅ {core_bundle_path} ({core_size:.1f}KB)")
    
    # === BUILD DASHBOARD BUNDLE ===
    print("\n🔨 Building Dashboard Bundle...")
    
    dashboard_content = []
    
    # Add dashboard manager
    with open('static/js/dashboard_manager_unified.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    dashboard_content.append("/* dashboard_manager_unified.js */")
    dashboard_content.append(content)
    
    # Combine and minify
    combined_dashboard = '\n'.join(dashboard_content)
    minified_dashboard = minify_js(combined_dashboard)
    
    # Write dashboard bundle
    dashboard_bundle_path = 'static/dist/dashboard.min.js'
    with open(dashboard_bundle_path, 'w', encoding='utf-8') as f:
        f.write(minified_dashboard)
    
    dashboard_size = get_file_size(dashboard_bundle_path)
    print(f"   ✅ {dashboard_bundle_path} ({dashboard_size:.1f}KB)")
    
    # === SUMMARY ===
    total_bundle_size = core_size + dashboard_size
    size_reduction = original_size - total_bundle_size
    reduction_percent = (size_reduction / original_size) * 100
    
    print("\n📦 SIMPLIFIED BUILD COMPLETE!")
    print("=" * 50)
    print(f"📄 BEFORE: {len(js_files)} files, {original_size:.1f}KB")
    print(f"📄 AFTER:  2 bundles, {total_bundle_size:.1f}KB")
    print(f"🎯 REDUCTION: {size_reduction:.1f}KB saved ({reduction_percent:.1f}%)")
    
    print("\n✅ PRODUCTION BUNDLES:")
    print(f"   📦 core.min.js - Main functionality ({core_size:.1f}KB)")
    print(f"   📦 dashboard.min.js - Dashboard only ({dashboard_size:.1f}KB)")
    
    print("\n🚀 BENEFITS:")
    print("   • Single quiz system (no more conflicts)")
    print("   • Cleaner architecture (unified files)")
    print("   • Smaller bundles (optimized minification)")
    print("   • Better maintainability (clear separation)")
    
    return True

def cleanup_old_files():
    """Clean up old, conflicting JS files"""
    
    print("\n🧹 CLEANING UP OLD FILES...")
    
    # Files to remove (old, conflicting ones)
    files_to_remove = [
        'static/js/quiz_core.js',
        'static/js/quiz_master.js', 
        'static/js/course_dashboard.js',
        'static/js/api.js',
        'static/js/dev-utils.js',
        'static/dist/app.min.js'  # Old bundle
    ]
    
    removed_count = 0
    for file_path in files_to_remove:
        if os.path.exists(file_path):
            try:
                # Move to archive instead of delete
                archive_dir = 'project_archives/simplified_cleanup'
                os.makedirs(archive_dir, exist_ok=True)
                
                filename = os.path.basename(file_path)
                archive_path = os.path.join(archive_dir, f"{filename}.bak")
                
                os.rename(file_path, archive_path)
                print(f"   📦 Archived: {file_path} → {archive_path}")
                removed_count += 1
            except Exception as e:
                print(f"   ❌ Failed to archive {file_path}: {e}")
        else:
            print(f"   ℹ️  Already gone: {file_path}")
    
    print(f"\n✅ Cleanup complete: {removed_count} files archived")

if __name__ == "__main__":
    success = build_unified_bundles()
    
    if success:
        print("\n" + "="*50)
        print("🎯 SIMPLIFICATION SUCCESS!")
        print("Quiz system chaos has been ELIMINATED! 🎉")
        print("="*50)
        
        # Offer to clean up old files
        response = input("\n🧹 Archive old conflicting files? [y/N]: ").lower().strip()
        if response in ['y', 'yes']:
            cleanup_old_files()
        
    else:
        print("\n❌ Build failed - check source files")

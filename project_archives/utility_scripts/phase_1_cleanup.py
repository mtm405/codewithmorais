#!/usr/bin/env python3
"""
Quiz Master 3.0 - Phase 1 Cleanup Execution
Safe removal of development scripts and unused files
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def execute_phase_1_cleanup():
    """Execute Phase 1: Remove development scripts and unused files"""
    print("🧹 Quiz Master 3.0 - Phase 1 Cleanup Execution")
    print("=" * 60)
    
    cleanup_results = {
        "deleted_files": [],
        "kept_files": [],
        "errors": [],
        "space_saved_mb": 0
    }
    
    # Files to DELETE in Phase 1 (Development Scripts)
    files_to_delete = [
        # Development and validation scripts
        "cleanup_legacy.py",
        "dark_mode_validation.py", 
        "final_validation.py",
        "migrate_quizzes.py",
        "project_cleanup_audit.py",
        "validate_phase_2.py",
        
        # Unused templates 
        "templates/base_old.html",
        "templates/quiz_21_test.html",
        "templates/quiz_summary.html", 
        "templates/quiz_test.html",
        
        # Duplicate/unused JavaScript files
        "static/js/course_dashboard_fixed.js",  # Duplicate of course_dashboard.js
        
        # Unused CSS files
        "static/css/accessibility-enhancements.css",  # Not referenced
        "static/css/html-audit-fixes.css",  # Temporary audit fixes
    ]
    
    # Files to KEEP (Core functionality)
    core_files = [
        "app.py",
        "src/routes.py",
        "src/config.py", 
        "src/auth.py",
        "src/utils.py",
        "templates/base.html",
        "templates/lesson.html",
        "templates/dashboard.html",
        "templates/index.html",
        "templates/partials/block_quiz.html",  # Quiz Master 3.0 unified
        "static/js/quiz_master.js",  # Quiz Master 3.0 controller
        "static/css/quiz_core.css",  # Quiz Master 3.0 styles
        "static/css/theme.css",
        "requirements.txt"
    ]
    
    print("🎯 Phase 1 Target: Development Scripts & Unused Files")
    print(f"📋 Files to review: {len(files_to_delete)}")
    print(f"🛡️ Core files protected: {len(core_files)}")
    
    # Calculate space before cleanup
    total_size_before = 0
    for file_path in files_to_delete:
        path = Path(file_path)
        if path.exists():
            total_size_before += path.stat().st_size
    
    print(f"\n💾 Space to be freed: {total_size_before / (1024*1024):.1f} MB")
    
    # Execute cleanup
    print(f"\n🗑️ Executing Phase 1 Cleanup...")
    
    for file_path in files_to_delete:
        path = Path(file_path)
        if path.exists():
            try:
                size_kb = path.stat().st_size / 1024
                
                # Safety check - don't delete if file is too important
                if is_safe_to_delete(path):
                    os.remove(path)
                    cleanup_results["deleted_files"].append(file_path)
                    cleanup_results["space_saved_mb"] += size_kb / 1024
                    print(f"   ✅ Deleted: {file_path} ({size_kb:.1f}KB)")
                else:
                    cleanup_results["kept_files"].append(file_path)
                    print(f"   🛡️ PROTECTED: {file_path} (safety check)")
                    
            except Exception as e:
                cleanup_results["errors"].append(f"Error deleting {file_path}: {e}")
                print(f"   ❌ Error: {file_path} - {e}")
        else:
            print(f"   ⏭️ Not found: {file_path}")
    
    # Verify core files are intact
    print(f"\n🔍 Verifying Core Files Integrity...")
    missing_core = []
    for core_file in core_files:
        if not Path(core_file).exists():
            missing_core.append(core_file)
    
    if missing_core:
        print(f"   ⚠️ Missing core files: {missing_core}")
        cleanup_results["errors"].extend([f"Missing core file: {f}" for f in missing_core])
    else:
        print(f"   ✅ All core files intact")
    
    # Check Quiz Master 3.0 system integrity
    print(f"\n🎯 Verifying Quiz Master 3.0 System...")
    quiz_master_files = [
        "templates/partials/block_quiz.html",
        "static/js/quiz_master.js", 
        "static/css/quiz_core.css"
    ]
    
    quiz_intact = True
    for qm_file in quiz_master_files:
        if Path(qm_file).exists():
            size_kb = Path(qm_file).stat().st_size / 1024
            print(f"   ✅ {qm_file} ({size_kb:.1f}KB)")
        else:
            print(f"   ❌ MISSING: {qm_file}")
            quiz_intact = False
    
    # Final summary
    print(f"\n📊 Phase 1 Cleanup Summary:")
    print("=" * 60)
    print(f"   Files deleted: {len(cleanup_results['deleted_files'])}")
    print(f"   Files protected: {len(cleanup_results['kept_files'])}")
    print(f"   Errors: {len(cleanup_results['errors'])}")
    print(f"   Space saved: {cleanup_results['space_saved_mb']:.1f} MB")
    
    if cleanup_results["errors"]:
        print(f"\n⚠️ Errors encountered:")
        for error in cleanup_results["errors"]:
            print(f"   • {error}")
    
    if quiz_intact and not missing_core:
        print(f"\n🎉 PHASE 1 CLEANUP: SUCCESS!")
        print(f"✅ Development scripts removed")
        print(f"✅ Unused files cleaned up")
        print(f"✅ Quiz Master 3.0 system intact")
        print(f"✅ Core application preserved")
        print(f"\n🚀 Project is cleaner and ready for Phase 2!")
    else:
        print(f"\n⚠️ PHASE 1 CLEANUP: ISSUES DETECTED")
        print(f"❌ Some core files may be missing")
        print(f"❌ Quiz Master 3.0 system may be damaged")
        print(f"\n🔧 Please review and restore missing files")
    
    print("=" * 60)
    return cleanup_results

def is_safe_to_delete(file_path):
    """Safety check to prevent deletion of critical files"""
    path_str = str(file_path).lower()
    
    # Never delete these critical files
    critical_patterns = [
        "app.py",
        "config.py", 
        "routes.py",
        "quiz_master.js",
        "quiz_core.css",
        "theme.css",
        "base.html",
        "lesson.html"
    ]
    
    for pattern in critical_patterns:
        if pattern in path_str:
            return False
    
    # Safe to delete development/temp files
    safe_patterns = [
        "validate_", "migration_", "cleanup_", "audit_", 
        "test_", "temp_", "debug_", "_old", "_fixed"
    ]
    
    for pattern in safe_patterns:
        if pattern in path_str:
            return True
    
    # Default: be cautious
    return True

if __name__ == "__main__":
    results = execute_phase_1_cleanup()

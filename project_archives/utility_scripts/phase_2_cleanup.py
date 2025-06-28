#!/usr/bin/env python3
"""
Quiz Master 3.0 - Phase 2 Cleanup Execution
Archive optimization and documentation cleanup
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def execute_phase_2_cleanup():
    """Execute Phase 2: Archive optimization and documentation cleanup"""
    print("🧹 Quiz Master 3.0 - Phase 2 Cleanup Execution")
    print("=" * 60)
    
    cleanup_results = {
        "deleted_files": [],
        "deleted_directories": [],
        "archived_files": [],
        "space_saved_mb": 0,
        "errors": []
    }
    
    # PHASE 2A: ARCHIVE DIRECTORIES CLEANUP (BIG SPACE SAVINGS!)
    print("📦 PHASE 2A: Archive Directories Cleanup")
    
    # Directories that can be safely deleted (they can be regenerated)
    deletable_archives = [
        "__pycache__",       # Python bytecode cache - regenerated automatically
        ".pytest_cache",     # Pytest cache - regenerated when needed
        "venve",             # Duplicate virtual environment
        "node_modules",      # Node.js dependencies - regenerated with npm install
    ]
    
    # Directories to archive/compress before potential deletion
    archivable_dirs = [
        "legacy_quiz_files", # Contains Quiz Master 2.0 legacy files
        "migration_backups", # Contains migration backup files
        "venv"               # Virtual environment (keep one, remove duplicate)
    ]
    
    # Calculate space before cleanup
    total_space_before = 0
    
    print("\n🗑️ Deleting regenerable archive directories...")
    for dir_name in deletable_archives:
        dir_path = Path(dir_name)
        if dir_path.exists():
            try:
                # Calculate size before deletion
                size_mb = sum(f.stat().st_size for f in dir_path.rglob("*") if f.is_file()) / (1024 * 1024)
                file_count = len([f for f in dir_path.rglob("*") if f.is_file()])
                
                # Delete the directory
                shutil.rmtree(dir_path)
                
                cleanup_results["deleted_directories"].append(dir_name)
                cleanup_results["space_saved_mb"] += size_mb
                print(f"   ✅ Deleted: {dir_name}/ ({file_count} files, {size_mb:.1f}MB)")
                
            except Exception as e:
                cleanup_results["errors"].append(f"Error deleting {dir_name}: {e}")
                print(f"   ❌ Error deleting {dir_name}: {e}")
        else:
            print(f"   ⏭️ Not found: {dir_name}/")
    
    print(f"\n📦 Archiving important directories...")
    for dir_name in archivable_dirs:
        dir_path = Path(dir_name)
        if dir_path.exists():
            try:
                size_mb = sum(f.stat().st_size for f in dir_path.rglob("*") if f.is_file()) / (1024 * 1024)
                file_count = len([f for f in dir_path.rglob("*") if f.is_file()])
                
                # Create archive directory if it doesn't exist
                archive_base = Path("project_archives")
                archive_base.mkdir(exist_ok=True)
                
                # Move to archive (don't delete, just relocate)
                archive_target = archive_base / f"{dir_name}_archived_{datetime.now().strftime('%Y%m%d')}"
                shutil.move(str(dir_path), str(archive_target))
                
                cleanup_results["archived_files"].append(f"{dir_name} -> {archive_target}")
                print(f"   📦 Archived: {dir_name}/ -> project_archives/ ({file_count} files, {size_mb:.1f}MB)")
                
            except Exception as e:
                cleanup_results["errors"].append(f"Error archiving {dir_name}: {e}")
                print(f"   ❌ Error archiving {dir_name}: {e}")
        else:
            print(f"   ⏭️ Not found: {dir_name}/")
    
    # PHASE 2B: DOCUMENTATION CLEANUP
    print(f"\n📖 PHASE 2B: Development Documentation Cleanup")
    
    # Development documentation files to archive
    dev_docs = [
        "AUDIT_REPORT.md",
        "CRITICAL_FIXES_CHECKLIST.md", 
        "FRONTEND_AUDIT_2025.md",
        "IMPLEMENTATION_CHECKLIST.md",
        "PHASE_3_MIGRATION_PLAN.md",
        "QUIZ_DEVELOPMENT_ROADMAP.md",
        "QUIZ_IMPROVEMENT_PLAN.md",
        "QUIZ_MASTER_3_PHASE_2_COMPLETE.md",
        "QUIZ_MASTER_3_PHASE_3_COMPLETE.md",
        "QUIZ_TESTING_CHECKLIST.md"
    ]
    
    # Create docs archive directory
    docs_archive = Path("project_archives/development_docs")
    docs_archive.mkdir(parents=True, exist_ok=True)
    
    for doc_file in dev_docs:
        doc_path = Path(doc_file)
        if doc_path.exists():
            try:
                size_kb = doc_path.stat().st_size / 1024
                
                # Move to archive
                archive_target = docs_archive / doc_file
                shutil.move(str(doc_path), str(archive_target))
                
                cleanup_results["archived_files"].append(f"{doc_file} -> development_docs/")
                cleanup_results["space_saved_mb"] += size_kb / 1024
                print(f"   📦 Archived: {doc_file} ({size_kb:.1f}KB)")
                
            except Exception as e:
                cleanup_results["errors"].append(f"Error archiving {doc_file}: {e}")
                print(f"   ❌ Error archiving {doc_file}: {e}")
        else:
            print(f"   ⏭️ Not found: {doc_file}")
    
    # PHASE 2C: UTILITY SCRIPTS CLEANUP
    print(f"\n📤 PHASE 2C: Upload Scripts Cleanup")
    
    upload_scripts = [
        "upload_bell_ringer.py",
        "upload_bell_ringers.py",
        "upload_lesson.py", 
        "upload_user.js",
        "add_snippet_ids.py"
    ]
    
    # Create scripts archive
    scripts_archive = Path("project_archives/utility_scripts")
    scripts_archive.mkdir(parents=True, exist_ok=True)
    
    for script in upload_scripts:
        script_path = Path(script)
        if script_path.exists():
            try:
                size_kb = script_path.stat().st_size / 1024
                
                # Move to archive
                archive_target = scripts_archive / script
                shutil.move(str(script_path), str(archive_target))
                
                cleanup_results["archived_files"].append(f"{script} -> utility_scripts/")
                cleanup_results["space_saved_mb"] += size_kb / 1024
                print(f"   📦 Archived: {script} ({size_kb:.1f}KB)")
                
            except Exception as e:
                cleanup_results["errors"].append(f"Error archiving {script}: {e}")
                print(f"   ❌ Error archiving {script}: {e}")
        else:
            print(f"   ⏭️ Not found: {script}")
    
    # PHASE 2D: CONFIG FILES REVIEW (Keep essential ones)
    print(f"\n⚙️ PHASE 2D: Config Files Review")
    
    # Essential config files to KEEP
    essential_configs = [
        "app.yaml",           # Google Cloud deployment
        "requirements.txt",   # Python dependencies  
        "site_data.db",       # Application database
        "serviceAccountKey.json"  # Firebase service account
    ]
    
    # Non-essential config files to archive
    non_essential_configs = [
        "bell_ringer.json",
        "cors.json", 
        "daily_challenge.json",
        "firebase_web_config.json",
        "user.json",
        "announcement.txt",
        "eslint.config.js",
        ".eslintignore",
        ".eslintrc.json", 
        ".htmlhintrc",
        ".stylelintrc.json"
    ]
    
    # Create config archive
    config_archive = Path("project_archives/config_files")
    config_archive.mkdir(parents=True, exist_ok=True)
    
    print(f"   ✅ Keeping essential configs: {', '.join(essential_configs)}")
    
    for config in non_essential_configs:
        config_path = Path(config)
        if config_path.exists():
            try:
                size_kb = config_path.stat().st_size / 1024
                
                # Move to archive
                archive_target = config_archive / config
                shutil.move(str(config_path), str(archive_target))
                
                cleanup_results["archived_files"].append(f"{config} -> config_files/")
                cleanup_results["space_saved_mb"] += size_kb / 1024
                print(f"   📦 Archived: {config} ({size_kb:.1f}KB)")
                
            except Exception as e:
                cleanup_results["errors"].append(f"Error archiving {config}: {e}")
                print(f"   ❌ Error archiving {config}: {e}")
    
    # Final verification
    print(f"\n🔍 Verifying Core Application Integrity...")
    
    critical_files = [
        "app.py",
        "src/routes.py",
        "src/config.py",
        "templates/base.html",
        "templates/lesson.html",
        "templates/partials/block_quiz.html",
        "static/js/quiz_master.js",
        "static/css/quiz_core.css",
        "static/css/theme.css",
        "requirements.txt"
    ]
    
    missing_critical = []
    for critical_file in critical_files:
        if not Path(critical_file).exists():
            missing_critical.append(critical_file)
    
    if missing_critical:
        print(f"   ❌ CRITICAL FILES MISSING: {missing_critical}")
        cleanup_results["errors"].extend([f"Missing critical file: {f}" for f in missing_critical])
    else:
        print(f"   ✅ All critical application files intact")
    
    # Summary
    print(f"\n📊 Phase 2 Cleanup Summary:")
    print("=" * 60)
    print(f"   Directories deleted: {len(cleanup_results['deleted_directories'])}")
    print(f"   Files/directories archived: {len(cleanup_results['archived_files'])}")
    print(f"   Space saved: {cleanup_results['space_saved_mb']:.1f} MB")
    print(f"   Errors: {len(cleanup_results['errors'])}")
    
    if cleanup_results["deleted_directories"]:
        print(f"\n🗑️ Deleted directories:")
        for dir_name in cleanup_results["deleted_directories"]:
            print(f"   • {dir_name}/")
    
    if cleanup_results["archived_files"]:
        print(f"\n📦 Archived items:")
        for item in cleanup_results["archived_files"][:10]:  # Show first 10
            print(f"   • {item}")
        if len(cleanup_results["archived_files"]) > 10:
            print(f"   • ... and {len(cleanup_results['archived_files']) - 10} more")
    
    if cleanup_results["errors"]:
        print(f"\n❌ Errors:")
        for error in cleanup_results["errors"]:
            print(f"   • {error}")
    
    if not missing_critical and len(cleanup_results["errors"]) == 0:
        print(f"\n🎉 PHASE 2 CLEANUP: SUCCESS!")
        print(f"✅ Archive directories optimized")
        print(f"✅ Development documentation archived")
        print(f"✅ Utility scripts archived")
        print(f"✅ Non-essential configs archived")
        print(f"✅ Core application preserved")
        print(f"\n💾 Project size reduced by {cleanup_results['space_saved_mb']:.1f}MB!")
        print(f"📁 All archived files available in project_archives/")
    else:
        print(f"\n⚠️ PHASE 2 CLEANUP: ISSUES DETECTED")
        print(f"❌ Please review errors above")
    
    print("=" * 60)
    return cleanup_results

if __name__ == "__main__":
    results = execute_phase_2_cleanup()

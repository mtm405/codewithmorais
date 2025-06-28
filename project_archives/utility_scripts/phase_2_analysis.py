#!/usr/bin/env python3
"""
Quiz Master 3.0 - Phase 2 Cleanup Plan
Advanced cleanup: Documentation, Archives, and Optimization
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def analyze_phase_2_targets():
    """Analyze targets for Phase 2 cleanup"""
    print("🔍 Quiz Master 3.0 - Phase 2 Cleanup Analysis")
    print("=" * 60)
    
    phase_2_targets = {
        "documentation_files": [],
        "archive_directories": [],
        "upload_scripts": [],
        "config_files": [],
        "development_artifacts": [],
        "space_analysis": {}
    }
    
    project_root = Path(".")
    
    # 1. DOCUMENTATION FILES (Many redundant markdown files)
    print("📖 DOCUMENTATION ANALYSIS:")
    doc_patterns = ["*.md", "*.txt"]
    doc_files = []
    for pattern in doc_patterns:
        doc_files.extend(list(project_root.glob(pattern)))
    
    # Categorize documentation
    essential_docs = ["README.md", "requirements.txt"]
    redundant_docs = []
    
    for doc in doc_files:
        size_kb = doc.stat().st_size / 1024
        doc_name = doc.name
        
        if doc_name in essential_docs:
            print(f"   ✅ KEEP: {doc_name} ({size_kb:.1f}KB)")
        elif any(pattern in doc_name.lower() for pattern in ["audit", "plan", "phase", "roadmap", "checklist"]):
            redundant_docs.append(str(doc))
            print(f"   🗑️ CLEANUP: {doc_name} ({size_kb:.1f}KB) - Development documentation")
        else:
            print(f"   📋 REVIEW: {doc_name} ({size_kb:.1f}KB)")
    
    phase_2_targets["documentation_files"] = redundant_docs
    
    # 2. ARCHIVE DIRECTORIES ANALYSIS
    print(f"\n📦 ARCHIVE ANALYSIS:")
    archive_dirs = [
        "legacy_quiz_files",
        "migration_backups", 
        "__pycache__",
        ".pytest_cache",
        "venv",
        "venve",  # Duplicate venv
        "node_modules"
    ]
    
    total_archive_size = 0
    for archive_dir in archive_dirs:
        archive_path = project_root / archive_dir
        if archive_path.exists():
            try:
                size_mb = sum(f.stat().st_size for f in archive_path.rglob("*") if f.is_file()) / (1024 * 1024)
                file_count = len([f for f in archive_path.rglob("*") if f.is_file()])
                total_archive_size += size_mb
                phase_2_targets["archive_directories"].append({
                    "path": str(archive_path),
                    "size_mb": size_mb,
                    "file_count": file_count
                })
                print(f"   📁 {archive_dir}: {file_count} files ({size_mb:.1f}MB)")
            except:
                print(f"   ❌ Error accessing {archive_dir}")
    
    print(f"   💾 Total archive size: {total_archive_size:.1f}MB")
    
    # 3. UPLOAD SCRIPTS ANALYSIS
    print(f"\n📤 UPLOAD SCRIPTS ANALYSIS:")
    upload_scripts = [
        "upload_bell_ringer.py",
        "upload_bell_ringers.py", 
        "upload_lesson.py",
        "upload_user.js",
        "add_snippet_ids.py"
    ]
    
    for script in upload_scripts:
        script_path = project_root / script
        if script_path.exists():
            size_kb = script_path.stat().st_size / 1024
            print(f"   📜 {script} ({size_kb:.1f}KB)")
            phase_2_targets["upload_scripts"].append(script)
    
    # 4. CONFIG/DATA FILES ANALYSIS  
    print(f"\n⚙️ CONFIG & DATA FILES ANALYSIS:")
    config_files = [
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
    
    for config_file in config_files:
        config_path = project_root / config_file
        if config_path.exists():
            size_kb = config_path.stat().st_size / 1024
            print(f"   ⚙️ {config_file} ({size_kb:.1f}KB)")
            phase_2_targets["config_files"].append(config_file)
    
    # 5. DEVELOPMENT ARTIFACTS
    print(f"\n🛠️ DEVELOPMENT ARTIFACTS:")
    dev_artifacts = [
        ".devcontainer",
        ".vscode",
        ".git",
        "docker",
        "Dockerfile",
        "tests"
    ]
    
    for artifact in dev_artifacts:
        artifact_path = project_root / artifact
        if artifact_path.exists():
            if artifact_path.is_dir():
                try:
                    size_mb = sum(f.stat().st_size for f in artifact_path.rglob("*") if f.is_file()) / (1024 * 1024)
                    file_count = len([f for f in artifact_path.rglob("*") if f.is_file()])
                    print(f"   🛠️ {artifact}/: {file_count} files ({size_mb:.1f}MB)")
                    phase_2_targets["development_artifacts"].append({
                        "path": artifact,
                        "size_mb": size_mb,
                        "type": "directory"
                    })
                except:
                    print(f"   🛠️ {artifact}/: (access error)")
            else:
                size_kb = artifact_path.stat().st_size / 1024
                print(f"   🛠️ {artifact}: ({size_kb:.1f}KB)")
                phase_2_targets["development_artifacts"].append({
                    "path": artifact,
                    "size_kb": size_kb,
                    "type": "file"
                })
    
    return phase_2_targets

def generate_phase_2_plan(targets):
    """Generate comprehensive Phase 2 cleanup plan"""
    print(f"\n🎯 PHASE 2 CLEANUP PLAN:")
    print("=" * 60)
    
    # Calculate potential space savings
    total_savings_mb = 0
    
    # Documentation cleanup
    if targets["documentation_files"]:
        doc_size = sum(Path(doc).stat().st_size for doc in targets["documentation_files"]) / (1024 * 1024)
        total_savings_mb += doc_size
        print(f"📖 DOCUMENTATION CLEANUP:")
        print(f"   Action: Archive or delete {len(targets['documentation_files'])} development docs")
        print(f"   Space saved: {doc_size:.1f}MB")
        print(f"   Files: {', '.join([Path(f).name for f in targets['documentation_files']])}")
    
    # Archive optimization
    if targets["archive_directories"]:
        archive_size = sum(archive["size_mb"] for archive in targets["archive_directories"])
        print(f"\n📦 ARCHIVE OPTIMIZATION:")
        print(f"   Action: Compress or remove {len(targets['archive_directories'])} archive directories")
        print(f"   Potential space saved: {archive_size:.1f}MB")
        for archive in targets["archive_directories"]:
            print(f"   • {Path(archive['path']).name}: {archive['size_mb']:.1f}MB")
    
    # Upload scripts cleanup
    if targets["upload_scripts"]:
        upload_size = sum(Path(script).stat().st_size for script in targets["upload_scripts"]) / (1024 * 1024)
        total_savings_mb += upload_size
        print(f"\n📤 UPLOAD SCRIPTS CLEANUP:")
        print(f"   Action: Remove {len(targets['upload_scripts'])} upload utility scripts")
        print(f"   Space saved: {upload_size:.1f}MB")
        print(f"   Files: {', '.join(targets['upload_scripts'])}")
    
    # Config files review
    if targets["config_files"]:
        config_size = sum(Path(config).stat().st_size for config in targets["config_files"] if Path(config).exists()) / (1024 * 1024)
        print(f"\n⚙️ CONFIG FILES REVIEW:")
        print(f"   Action: Review and clean {len(targets['config_files'])} config files")
        print(f"   Potential space saved: {config_size:.1f}MB")
        print(f"   Files: {', '.join(targets['config_files'])}")
    
    print(f"\n💾 TOTAL POTENTIAL SPACE SAVINGS: {total_savings_mb:.1f}MB")
    
    # Safety recommendations
    print(f"\n🛡️ SAFETY RECOMMENDATIONS:")
    print(f"   1. Create backup before Phase 2 cleanup")
    print(f"   2. Keep essential configs (app.yaml, requirements.txt)")
    print(f"   3. Archive documentation instead of deleting")
    print(f"   4. Test application after each cleanup step")
    print(f"   5. Keep version control (.git) unless specifically requested")
    
    return total_savings_mb

if __name__ == "__main__":
    targets = analyze_phase_2_targets()
    savings = generate_phase_2_plan(targets)
    
    print(f"\n🚀 PHASE 2 READY FOR EXECUTION")
    print(f"Potential project size reduction: {savings:.1f}MB")
    print("=" * 60)

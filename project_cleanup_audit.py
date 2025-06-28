#!/usr/bin/env python3
"""
Quiz Master 3.0 - Project Cleanup Audit
Comprehensive analysis of all project files to identify cleanup opportunities
"""

import os
import json
from pathlib import Path
import re

def comprehensive_project_audit():
    """Analyze entire project for cleanup opportunities"""
    print("🔍 Quiz Master 3.0 - Project Cleanup Audit")
    print("=" * 60)
    
    audit_results = {
        "total_files": 0,
        "active_files": [],
        "legacy_files": [],
        "unused_files": [],
        "duplicate_files": [],
        "cleanup_recommendations": []
    }
    
    # Scan entire project directory
    project_root = Path(".")
    
    print("📁 Scanning project structure...")
    
    # 1. TEMPLATES ANALYSIS
    print("\n📄 TEMPLATES AUDIT:")
    templates_dir = project_root / "templates"
    if templates_dir.exists():
        template_files = list(templates_dir.rglob("*.html"))
        for template in template_files:
            size_kb = template.stat().st_size / 1024
            print(f"   {template.relative_to(project_root)} ({size_kb:.1f}KB)")
            audit_results["total_files"] += 1
            
            # Check if template is referenced
            if is_template_used(template):
                audit_results["active_files"].append(str(template))
            else:
                audit_results["unused_files"].append(str(template))
    
    # 2. JAVASCRIPT ANALYSIS
    print("\n📜 JAVASCRIPT AUDIT:")
    js_dir = project_root / "static" / "js"
    if js_dir.exists():
        js_files = list(js_dir.glob("*.js"))
        for js_file in js_files:
            size_kb = js_file.stat().st_size / 1024
            print(f"   {js_file.relative_to(project_root)} ({size_kb:.1f}KB)")
            audit_results["total_files"] += 1
            
            # Check if JS file is referenced
            if is_js_file_used(js_file):
                audit_results["active_files"].append(str(js_file))
            else:
                audit_results["unused_files"].append(str(js_file))
    
    # 3. CSS ANALYSIS
    print("\n🎨 CSS AUDIT:")
    css_dir = project_root / "static" / "css"
    if css_dir.exists():
        css_files = list(css_dir.glob("*.css"))
        for css_file in css_files:
            size_kb = css_file.stat().st_size / 1024
            print(f"   {css_file.relative_to(project_root)} ({size_kb:.1f}KB)")
            audit_results["total_files"] += 1
            
            # Check if CSS file is referenced
            if is_css_file_used(css_file):
                audit_results["active_files"].append(str(css_file))
            else:
                audit_results["unused_files"].append(str(css_file))
    
    # 4. PYTHON FILES ANALYSIS
    print("\n🐍 PYTHON FILES AUDIT:")
    python_files = list(project_root.glob("*.py"))
    python_files.extend(list((project_root / "src").glob("*.py")) if (project_root / "src").exists() else [])
    
    for py_file in python_files:
        size_kb = py_file.stat().st_size / 1024
        print(f"   {py_file.relative_to(project_root)} ({size_kb:.1f}KB)")
        audit_results["total_files"] += 1
        
        # Categorize Python files
        if is_core_python_file(py_file):
            audit_results["active_files"].append(str(py_file))
        elif is_temporary_script(py_file):
            audit_results["unused_files"].append(str(py_file))
        else:
            audit_results["active_files"].append(str(py_file))
    
    # 5. ARCHIVE ANALYSIS
    print("\n📦 LEGACY ARCHIVE AUDIT:")
    legacy_paths = [
        "legacy_quiz_files/archive",
        "archive",
        "backup"
    ]
    
    for legacy_path in legacy_paths:
        archive_dir = project_root / legacy_path
        if archive_dir.exists():
            archive_files = list(archive_dir.rglob("*"))
            archive_size_mb = sum(f.stat().st_size for f in archive_files if f.is_file()) / (1024 * 1024)
            print(f"   {legacy_path}: {len(archive_files)} files ({archive_size_mb:.1f}MB)")
            audit_results["legacy_files"].extend([str(f) for f in archive_files if f.is_file()])
    
    # 6. IDENTIFY LEGACY QUIZ FILES
    print("\n🎯 LEGACY QUIZ FILES IDENTIFICATION:")
    legacy_templates = [
        "templates/partials/block_multiple_choice.html",
        "templates/partials/block_fill_in_blank.html",
        "templates/partials/block_drag_and_drop.html",
        "templates/partials/block_quiz_section.html",
        "templates/partials/block_comprehensive_quiz.html"
    ]
    
    legacy_js = [
        "static/js/quiz_core.js",
        "static/js/enhanced_quiz_core.js",
        "static/js/comprehensive_quiz.js",
        "static/js/comprehensive_quiz_new.js",
        "static/js/quiz_summary_block.js"
    ]
    
    legacy_css = [
        "static/css/enhanced_quiz_blocks.css",
        "static/css/enhanced_quiz_styles.css",
        "static/css/unified_quiz_styles.css"
    ]
    
    legacy_quiz_files = []
    for file_path in legacy_templates + legacy_js + legacy_css:
        if Path(file_path).exists():
            size_kb = Path(file_path).stat().st_size / 1024
            print(f"   LEGACY: {file_path} ({size_kb:.1f}KB)")
            legacy_quiz_files.append(file_path)
    
    audit_results["legacy_quiz_files"] = legacy_quiz_files
    
    return audit_results

def is_template_used(template_path):
    """Check if a template is referenced in Python code or other templates"""
    template_name = template_path.name
    
    # Check main Python files
    python_files = [Path("app.py"), Path("src/routes.py")]
    for py_file in python_files:
        if py_file.exists():
            try:
                content = py_file.read_text(encoding='utf-8', errors='ignore')
                if template_name in content:
                    return True
            except:
                pass
    
    # Check if it's a core template
    core_templates = [
        "base.html", "lesson.html", "index.html", "dashboard.html",
        "block_quiz.html"  # Quiz Master 3.0 unified template
    ]
    return template_name in core_templates

def is_js_file_used(js_path):
    """Check if a JavaScript file is referenced in templates"""
    js_name = js_path.name
    
    # Check templates for script references
    templates_dir = Path("templates")
    if templates_dir.exists():
        for template in templates_dir.rglob("*.html"):
            try:
                content = template.read_text(encoding='utf-8', errors='ignore')
                if js_name in content:
                    return True
            except:
                continue
    
    # Core Quiz Master 3.0 files
    core_js_files = [
        "quiz_master.js"  # Quiz Master 3.0 unified controller - THE ONLY ONE NEEDED
    ]
    return js_name in core_js_files

def is_css_file_used(css_path):
    """Check if a CSS file is referenced in templates"""
    css_name = css_path.name
    
    # Check templates for style references
    templates_dir = Path("templates")
    if templates_dir.exists():
        for template in templates_dir.rglob("*.html"):
            try:
                content = template.read_text(encoding='utf-8', errors='ignore')
                if css_name in content:
                    return True
            except:
                continue
    
    # Core CSS files
    core_css_files = [
        "theme.css", "quiz_core.css"  # Quiz Master 3.0 core styles
    ]
    return css_name in core_css_files

def is_core_python_file(py_path):
    """Check if a Python file is core to the application"""
    py_name = py_path.name
    core_files = [
        "app.py", "routes.py", "config.py", "auth.py", "utils.py"
    ]
    return py_name in core_files

def is_temporary_script(py_path):
    """Check if a Python file is a temporary script that can be cleaned up"""
    py_name = py_path.name.lower()
    temp_patterns = [
        "test_", "validate_", "migration_", "cleanup_", "audit_",
        "temp_", "debug_", "phase_", "final_validation", "dark_mode_validation"
    ]
    return any(pattern in py_name for pattern in temp_patterns)

if __name__ == "__main__":
    results = comprehensive_project_audit()
    
    print("\n" + "="*60)
    print("📊 AUDIT SUMMARY:")
    print(f"   Total files scanned: {results['total_files']}")
    print(f"   Active files: {len(results['active_files'])}")
    print(f"   Unused files: {len(results['unused_files'])}")
    print(f"   Legacy archive files: {len(results['legacy_files'])}")
    
    if 'legacy_quiz_files' in results:
        print(f"   Legacy quiz files: {len(results['legacy_quiz_files'])}")
    
    print("\n🎯 PHASE 1 CLEANUP TARGETS:")
    if 'legacy_quiz_files' in results and results['legacy_quiz_files']:
        print("   READY TO DELETE - Legacy Quiz System Files:")
        for file in results['legacy_quiz_files']:
            print(f"      🗑️ {file}")
    else:
        print("   ✅ No legacy quiz files found - cleanup already complete!")
    
    print("="*60)

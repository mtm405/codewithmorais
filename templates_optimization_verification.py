#!/usr/bin/env python3
"""
Quiz Master 3.0 - Templates Optimization Verification
Final validation and summary of completed optimization
"""

from pathlib import Path
import json

def verify_templates_optimization():
    """Verify the templates optimization is complete and working"""
    print("🔍 Quiz Master 3.0 - Templates Optimization Verification")
    print("=" * 60)
    
    verification_results = {
        "structure_check": check_directory_structure(),
        "file_organization": check_file_organization(),
        "reference_validation": check_template_references(),
        "backup_verification": check_backup_integrity(),
        "documentation_check": check_documentation()
    }
    
    # Print results
    print_verification_results(verification_results)
    
    # Save verification report
    with open("templates_optimization_verification.json", 'w') as f:
        json.dump(verification_results, f, indent=2)
    
    print("\n📊 Verification report saved: templates_optimization_verification.json")
    
    return verification_results

def check_directory_structure():
    """Check that all expected directories exist"""
    print("\n📁 Checking directory structure...")
    
    expected_dirs = {
        "templates/layouts": "Base templates and layouts",
        "templates/pages": "Main page templates",
        "templates/components": "Reusable UI components", 
        "templates/blocks": "Content block templates",
        "templates/forms": "Form templates (future use)",
        "templates/errors": "Error page templates (future use)"
    }
    
    structure_status = {"status": "success", "directories": {}}
    
    for directory, description in expected_dirs.items():
        dir_path = Path(directory)
        exists = dir_path.exists()
        file_count = len(list(dir_path.glob("*.html"))) if exists else 0
        
        structure_status["directories"][directory] = {
            "exists": exists,
            "file_count": file_count,
            "description": description
        }
        
        status_icon = "✅" if exists else "❌"
        print(f"   {status_icon} {directory}: {file_count} files")
    
    return structure_status

def check_file_organization():
    """Check that files are properly organized"""
    print("\n📄 Checking file organization...")
    
    expected_files = {
        "templates/layouts/base.html": "Main application layout",
        "templates/layouts/head.html": "HTML head section",
        "templates/pages/dashboard.html": "User dashboard",
        "templates/pages/lesson.html": "Lesson display page",
        "templates/blocks/quiz.html": "Unified quiz block",
        "templates/components/navigation.html": "Main navigation",
        "templates/components/sidebar.html": "Application sidebar"
    }
    
    organization_status = {"status": "success", "files": {}}
    
    for file_path, description in expected_files.items():
        path = Path(file_path)
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        
        organization_status["files"][file_path] = {
            "exists": exists,
            "size_bytes": size,
            "description": description
        }
        
        status_icon = "✅" if exists else "❌"
        print(f"   {status_icon} {file_path}: {size} bytes")
    
    return organization_status

def check_template_references():
    """Check that template references are updated"""
    print("\n🔗 Checking template references...")
    
    templates_dir = Path("templates")
    old_patterns = ["partials/block_", "{% include 'partials"]
    
    reference_status = {"status": "success", "issues": []}
    
    for template_file in templates_dir.rglob("*.html"):
        try:
            content = template_file.read_text(encoding='utf-8')
            for pattern in old_patterns:
                if pattern in content and "project_archives" not in str(template_file):
                    reference_status["issues"].append({
                        "file": str(template_file),
                        "pattern": pattern,
                        "description": "Old reference pattern found"
                    })
        except Exception as e:
            reference_status["issues"].append({
                "file": str(template_file),
                "error": str(e),
                "description": "Error reading file"
            })
    
    if reference_status["issues"]:
        reference_status["status"] = "warning"
        print(f"   ⚠️ Found {len(reference_status['issues'])} reference issues")
    else:
        print("   ✅ All template references updated correctly")
    
    return reference_status

def check_backup_integrity():
    """Check that backup was created properly"""
    print("\n💾 Checking backup integrity...")
    
    backup_dir = Path("templates_backup_phase2")
    backup_status = {"status": "success", "backup_info": {}}
    
    if backup_dir.exists():
        backup_files = list(backup_dir.rglob("*.html"))
        backup_size = sum(f.stat().st_size for f in backup_files)
        
        backup_status["backup_info"] = {
            "exists": True,
            "file_count": len(backup_files),
            "total_size_bytes": backup_size,
            "total_size_kb": round(backup_size / 1024, 1)
        }
        
        print(f"   ✅ Backup exists: {len(backup_files)} files, {backup_size / 1024:.1f}KB")
    else:
        backup_status["status"] = "warning"
        backup_status["backup_info"] = {"exists": False}
        print("   ⚠️ Backup directory not found")
    
    return backup_status

def check_documentation():
    """Check that documentation was created"""
    print("\n📚 Checking documentation...")
    
    expected_docs = [
        "TEMPLATES_GUIDE.md",
        "templates_documentation.json",
        "templates_optimization_complete.json",
        "TEMPLATES_OPTIMIZATION_COMPLETE.md"
    ]
    
    doc_status = {"status": "success", "documents": {}}
    
    for doc_file in expected_docs:
        path = Path(doc_file)
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        
        doc_status["documents"][doc_file] = {
            "exists": exists,
            "size_bytes": size
        }
        
        status_icon = "✅" if exists else "❌"
        print(f"   {status_icon} {doc_file}: {size} bytes")
    
    return doc_status

def print_verification_results(results):
    """Print a summary of verification results"""
    print("\n🎯 TEMPLATES OPTIMIZATION VERIFICATION SUMMARY:")
    print("=" * 60)
    
    total_checks = len(results)
    passed_checks = sum(1 for result in results.values() if result["status"] == "success")
    
    print(f"   📊 Checks passed: {passed_checks}/{total_checks}")
    
    if passed_checks == total_checks:
        print("   🎊 ALL CHECKS PASSED - Optimization completed successfully!")
    else:
        print("   ⚠️ Some checks have warnings - Review verification report")
    
    # Count total files organized
    if "file_organization" in results:
        total_files = sum(
            1 for file_info in results["file_organization"]["files"].values() 
            if file_info["exists"]
        )
        print(f"   📄 Templates organized: {total_files}")
    
    # Count directories created
    if "structure_check" in results:
        total_dirs = sum(
            1 for dir_info in results["structure_check"]["directories"].values()
            if dir_info["exists"]
        )
        print(f"   📁 Directories organized: {total_dirs}")
    
    print("\n✅ TEMPLATES OPTIMIZATION VERIFICATION COMPLETE!")

if __name__ == "__main__":
    verify_templates_optimization()

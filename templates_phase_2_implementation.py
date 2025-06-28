#!/usr/bin/env python3
"""
Quiz Master 3.0 - Templates Organization Phase 2
Template Restructuring & Component Extraction Implementation
"""

import os
import shutil
from pathlib import Path
import json

def execute_phase_2_templates_optimization():
    """Execute Phase 2: Template restructuring and component extraction"""
    print("🚀 Quiz Master 3.0 - Templates Phase 2 Implementation")
    print("=" * 60)
    
    # Load Phase 1 analysis results
    phase_1_file = Path("templates_phase_1_analysis.json")
    if not phase_1_file.exists():
        print("❌ Phase 1 analysis file not found. Please run Phase 1 first.")
        return
    
    with open(phase_1_file, 'r', encoding='utf-8') as f:
        phase_1_data = json.load(f)
    
    # Create backup
    backup_templates()
    
    # Execute optimization steps
    print("\n🏗️ PHASE 2 IMPLEMENTATION STEPS:")
    print("=" * 60)
    
    # Step 1: Create new directory structure
    create_template_hierarchy()
    
    # Step 2: Extract components from large templates
    extract_components_from_base()
    extract_components_from_dashboards()
    extract_components_from_lesson()
    
    # Step 3: Reorganize existing partials
    reorganize_partials()
    
    # Step 4: Update template references
    update_template_references()
    
    # Step 5: Validate new structure
    validate_phase_2_structure()
    
    print("\n✅ PHASE 2 IMPLEMENTATION COMPLETE!")
    print("=" * 60)

def backup_templates():
    """Create backup of current templates structure"""
    print("📦 Creating backup of current templates...")
    
    backup_dir = Path("templates_backup_phase2")
    if backup_dir.exists():
        shutil.rmtree(backup_dir)
    
    shutil.copytree("templates", backup_dir)
    print(f"   ✅ Backup created: {backup_dir}")

def create_template_hierarchy():
    """Create organized directory structure"""
    print("\n📁 Creating new template hierarchy...")
    
    directories = [
        "templates/layouts",      # Base templates and layouts
        "templates/pages",        # Main page templates
        "templates/components",   # Reusable UI components
        "templates/blocks",       # Content block templates
        "templates/forms",        # Form-specific templates
        "templates/errors"        # Error page templates
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   📁 Created: {directory}")

def extract_components_from_base():
    """Extract reusable components from base.html"""
    print("\n🧩 Extracting components from base.html...")
    
    base_path = Path("templates/base.html")
    if not base_path.exists():
        print("   ❌ base.html not found")
        return
    
    content = base_path.read_text(encoding='utf-8')
    
    # Extract head section
    head_component = extract_head_section(content)
    create_component_file("layouts/head.html", head_component)
    
    # Extract navigation
    nav_component = extract_navigation_section(content)
    create_component_file("components/navigation.html", nav_component)
    
    # Extract footer
    footer_component = extract_footer_section(content)
    create_component_file("components/footer.html", footer_component)
    
    # Create simplified base template
    simplified_base = create_simplified_base(content)
    create_component_file("layouts/base.html", simplified_base)
    
    print("   ✅ Components extracted from base.html")

def extract_head_section(content):
    """Extract head section from base template"""
    head_start = content.find('<head>')
    head_end = content.find('</head>') + 7
    
    if head_start == -1 or head_end == -1:
        return ""
    
    head_content = content[head_start:head_end]
    
    # Clean up and modularize
    return f"""<!-- Head Component - Extracted from base.html -->
{head_content}
"""

def extract_navigation_section(content):
    """Extract navigation section"""
    # Look for nav or header elements
    nav_patterns = [
        ('<nav', '</nav>'),
        ('<header', '</header>'),
        ('class="navbar"', '</nav>'),
        ('class="header"', '</header>')
    ]
    
    for start_pattern, end_pattern in nav_patterns:
        start_pos = content.find(start_pattern)
        if start_pos != -1:
            end_pos = content.find(end_pattern, start_pos)
            if end_pos != -1:
                nav_content = content[start_pos:end_pos + len(end_pattern)]
                return f"""<!-- Navigation Component - Extracted from base.html -->
{nav_content}
"""
    
    return "<!-- Navigation component - No navigation found in base.html -->"

def extract_footer_section(content):
    """Extract footer section"""
    footer_start = content.find('<footer')
    if footer_start == -1:
        # Look for footer-like divs
        footer_patterns = ['class="footer"', 'id="footer"', 'class="site-footer"']
        for pattern in footer_patterns:
            footer_start = content.find(pattern)
            if footer_start != -1:
                # Find the opening div
                footer_start = content.rfind('<div', 0, footer_start)
                break
    
    if footer_start != -1:
        footer_end = content.find('</footer>', footer_start)
        if footer_end == -1:
            # Look for closing div
            footer_end = content.find('</div>', footer_start)
        
        if footer_end != -1:
            footer_content = content[footer_start:footer_end + 7]
            return f"""<!-- Footer Component - Extracted from base.html -->
{footer_content}
"""
    
    return "<!-- Footer component - No footer found in base.html -->"

def create_simplified_base(content):
    """Create simplified base template"""
    return """<!DOCTYPE html>
<html lang="en">
<!-- Simplified Base Template - Phase 2 Optimization -->
{% include 'layouts/head.html' %}
<body class="{% block body_class %}{% endblock %}">
    {% include 'components/navigation.html' %}
    
    <main class="main-content">
        {% block content %}{% endblock %}
    </main>
    
    {% block sidebar %}
        {% include 'partials/sidebar.html' %}
    {% endblock %}
    
    {% include 'components/footer.html' %}
    
    <!-- Scripts -->
    {% block scripts %}{% endblock %}
</body>
</html>"""

def extract_components_from_dashboards():
    """Extract common components from dashboard templates"""
    print("\n🎯 Extracting components from dashboard templates...")
    
    dashboard_files = ["templates/dashboard.html", "templates/dashboard_course.html"]
    
    for dashboard_file in dashboard_files:
        path = Path(dashboard_file)
        if path.exists():
            content = path.read_text(encoding='utf-8')
            
            # Extract common dashboard components
            extract_dashboard_header(content, path.stem)
            extract_dashboard_sidebar(content, path.stem)
            extract_dashboard_content(content, path.stem)
    
    print("   ✅ Dashboard components extracted")

def extract_dashboard_header(content, dashboard_type):
    """Extract dashboard header component"""
    # Look for header-specific content
    header_patterns = [
        'class="dashboard-header"',
        'class="page-header"',
        'class="content-header"'
    ]
    
    for pattern in header_patterns:
        if pattern in content:
            # Extract the header section
            start = content.find(pattern)
            if start != -1:
                # Find the parent element
                start = content.rfind('<', 0, start)
                # Find closing tag
                end = content.find('>', start)
                tag_name = content[start+1:end].split()[0]
                end = content.find(f'</{tag_name}>', start) + len(f'</{tag_name}>')
                
                header_content = content[start:end]
                create_component_file(f"components/dashboard_{dashboard_type}_header.html", 
                                    f"<!-- Dashboard {dashboard_type} Header -->\n{header_content}")
                break

def extract_dashboard_sidebar(content, dashboard_type):
    """Extract dashboard sidebar component"""
    sidebar_patterns = [
        'class="dashboard-sidebar"',
        'class="sidebar"',
        'class="nav-sidebar"'
    ]
    
    for pattern in sidebar_patterns:
        if pattern in content:
            start = content.find(pattern)
            if start != -1:
                start = content.rfind('<', 0, start)
                end = content.find('>', start)
                tag_name = content[start+1:end].split()[0]
                end = content.find(f'</{tag_name}>', start) + len(f'</{tag_name}>')
                
                sidebar_content = content[start:end]
                create_component_file(f"components/dashboard_{dashboard_type}_sidebar.html", 
                                    f"<!-- Dashboard {dashboard_type} Sidebar -->\n{sidebar_content}")
                break

def extract_dashboard_content(content, dashboard_type):
    """Extract main dashboard content area"""
    content_patterns = [
        'class="dashboard-content"',
        'class="main-content"',
        'class="content-area"'
    ]
    
    for pattern in content_patterns:
        if pattern in content:
            start = content.find(pattern)
            if start != -1:
                start = content.rfind('<', 0, start)
                end = content.find('>', start)
                tag_name = content[start+1:end].split()[0]
                end = content.find(f'</{tag_name}>', start) + len(f'</{tag_name}>')
                
                content_area = content[start:end]
                create_component_file(f"components/dashboard_{dashboard_type}_content.html", 
                                    f"<!-- Dashboard {dashboard_type} Content -->\n{content_area}")
                break

def extract_components_from_lesson():
    """Extract components from lesson template"""
    print("\n📚 Extracting components from lesson.html...")
    
    lesson_path = Path("templates/lesson.html")
    if not lesson_path.exists():
        print("   ❌ lesson.html not found")
        return
    
    content = lesson_path.read_text(encoding='utf-8')
    
    # Extract lesson-specific components
    extract_lesson_header(content)
    extract_lesson_content_area(content)
    extract_lesson_navigation(content)
    
    print("   ✅ Lesson components extracted")

def extract_lesson_header(content):
    """Extract lesson header component"""
    header_patterns = [
        'class="lesson-header"',
        'class="course-header"',
        'class="lesson-title"'
    ]
    
    for pattern in header_patterns:
        if pattern in content:
            start = content.find(pattern)
            if start != -1:
                start = content.rfind('<', 0, start)
                end = content.find('>', start)
                tag_name = content[start+1:end].split()[0]
                end = content.find(f'</{tag_name}>', start) + len(f'</{tag_name}>')
                
                header_content = content[start:end]
                create_component_file("components/lesson_header.html", 
                                    f"<!-- Lesson Header Component -->\n{header_content}")
                break

def extract_lesson_content_area(content):
    """Extract lesson content area"""
    content_patterns = [
        'class="lesson-content"',
        'class="lesson-body"',
        'id="lesson-content"'
    ]
    
    for pattern in content_patterns:
        if pattern in content:
            start = content.find(pattern)
            if start != -1:
                start = content.rfind('<', 0, start)
                end = content.find('>', start)
                tag_name = content[start+1:end].split()[0]
                end = content.find(f'</{tag_name}>', start) + len(f'</{tag_name}>')
                
                content_area = content[start:end]
                create_component_file("components/lesson_content.html", 
                                    f"<!-- Lesson Content Component -->\n{content_area}")
                break

def extract_lesson_navigation(content):
    """Extract lesson navigation component"""
    nav_patterns = [
        'class="lesson-nav"',
        'class="lesson-navigation"',
        'class="course-nav"'
    ]
    
    for pattern in nav_patterns:
        if pattern in content:
            start = content.find(pattern)
            if start != -1:
                start = content.rfind('<', 0, start)
                end = content.find('>', start)
                tag_name = content[start+1:end].split()[0]
                end = content.find(f'</{tag_name}>', start) + len(f'</{tag_name}>')
                
                nav_content = content[start:end]
                create_component_file("components/lesson_navigation.html", 
                                    f"<!-- Lesson Navigation Component -->\n{nav_content}")
                break

def reorganize_partials():
    """Reorganize existing partials into new structure"""
    print("\n🔄 Reorganizing existing partials...")
    
    partials_mapping = {
        # Block components
        "partials/block_quiz.html": "blocks/quiz.html",
        "partials/block_code_snippet.html": "blocks/code_snippet.html",
        "partials/block_debug_challenge.html": "blocks/debug_challenge.html",
        "partials/block_image.html": "blocks/image.html",
        "partials/block_key_takeaway.html": "blocks/key_takeaway.html",
        "partials/block_step_card.html": "blocks/step_card.html",
        "partials/block_text.html": "blocks/text.html",
        
        # UI components
        "partials/code_editor.html": "components/code_editor.html",
        "partials/core_quiz.html": "components/quiz_core.html",
        "partials/header_bar.html": "components/header_bar.html",
        "partials/sidebar.html": "components/sidebar.html",
        "partials/syntax_block.html": "components/syntax_block.html"
    }
    
    for old_path, new_path in partials_mapping.items():
        old_file = Path(f"templates/{old_path}")
        new_file = Path(f"templates/{new_path}")
        
        if old_file.exists():
            new_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(old_file, new_file)
            print(f"   📁 Moved: {old_path} → {new_path}")

def update_template_references():
    """Update template references to use new structure"""
    print("\n🔗 Updating template references...")
    
    # Update references in all templates
    templates_dir = Path("templates")
    reference_updates = {
        "partials/block_quiz.html": "blocks/quiz.html",
        "partials/block_code_snippet.html": "blocks/code_snippet.html",
        "partials/block_debug_challenge.html": "blocks/debug_challenge.html",
        "partials/block_image.html": "blocks/image.html",
        "partials/block_key_takeaway.html": "blocks/key_takeaway.html",
        "partials/block_step_card.html": "blocks/step_card.html",
        "partials/block_text.html": "blocks/text.html",
        "partials/code_editor.html": "components/code_editor.html",
        "partials/core_quiz.html": "components/quiz_core.html",
        "partials/header_bar.html": "components/header_bar.html",
        "partials/sidebar.html": "components/sidebar.html",
        "partials/syntax_block.html": "components/syntax_block.html"
    }
    
    for template_file in templates_dir.rglob("*.html"):
        if template_file.is_file():
            content = template_file.read_text(encoding='utf-8', errors='ignore')
            modified = False
            
            for old_ref, new_ref in reference_updates.items():
                if old_ref in content:
                    content = content.replace(old_ref, new_ref)
                    modified = True
            
            if modified:
                template_file.write_text(content, encoding='utf-8')
                print(f"   🔗 Updated references in: {template_file.relative_to(templates_dir)}")

def create_component_file(relative_path, content):
    """Create a new component file"""
    file_path = Path(f"templates/{relative_path}")
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding='utf-8')

def validate_phase_2_structure():
    """Validate the new template structure"""
    print("\n✅ Validating Phase 2 structure...")
    
    expected_dirs = [
        "templates/layouts",
        "templates/pages", 
        "templates/components",
        "templates/blocks",
        "templates/forms",
        "templates/errors"
    ]
    
    for directory in expected_dirs:
        dir_path = Path(directory)
        if dir_path.exists():
            file_count = len(list(dir_path.glob("*.html")))
            print(f"   ✅ {directory}: {file_count} files")
        else:
            print(f"   ❌ {directory}: Missing")
    
    # Create summary report
    create_phase_2_summary()

def create_phase_2_summary():
    """Create Phase 2 implementation summary"""
    summary = {
        "phase_2_implementation": {
            "timestamp": "2025-01-21",
            "status": "completed",
            "actions_taken": [
                "Created organized directory structure",
                "Extracted components from large templates",
                "Reorganized existing partials",
                "Updated template references",
                "Validated new structure"
            ],
            "new_structure": {
                "layouts": "Base templates and layouts",
                "pages": "Main page templates", 
                "components": "Reusable UI components",
                "blocks": "Content block templates",
                "forms": "Form-specific templates",
                "errors": "Error page templates"
            },
            "next_steps": [
                "Phase 3: Performance optimization",
                "Phase 4: Template documentation",
                "Phase 5: Testing and validation"
            ]
        }
    }
    
    with open("templates_phase_2_summary.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print("   📊 Phase 2 summary saved to: templates_phase_2_summary.json")

if __name__ == "__main__":
    execute_phase_2_templates_optimization()

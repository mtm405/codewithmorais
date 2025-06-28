#!/usr/bin/env python3
"""
Quiz Master 3.0 - Templates Organization Phase 1
Template Structure Analysis & Documentation
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import json

def execute_phase_1_templates_audit():
    """Execute Phase 1: Comprehensive template analysis"""
    print("🔍 Quiz Master 3.0 - Templates Phase 1 Analysis")
    print("=" * 60)
    
    audit_results = {
        "template_inventory": {},
        "inheritance_tree": {},
        "block_usage": {},
        "partials_analysis": {},
        "component_mapping": {},
        "size_analysis": {},
        "optimization_targets": [],
        "phase_1_recommendations": []
    }
    
    # 1. TEMPLATE INVENTORY
    print("📁 TEMPLATE INVENTORY ANALYSIS:")
    print("=" * 60)
    templates_dir = Path("templates")
    
    if templates_dir.exists():
        all_templates = list(templates_dir.rglob("*.html"))
        
        for template in sorted(all_templates):
            rel_path = template.relative_to(templates_dir)
            size_kb = template.stat().st_size / 1024
            
            try:
                content = template.read_text(encoding='utf-8', errors='ignore')
                lines = len(content.splitlines())
                
                template_info = {
                    "path": str(template),
                    "relative_path": str(rel_path),
                    "size_kb": round(size_kb, 1),
                    "lines": lines,
                    "category": categorize_template(template),
                    "complexity": assess_complexity(content),
                    "blocks_defined": find_defined_blocks(content),
                    "blocks_used": find_used_blocks(content),
                    "includes": find_includes(content),
                    "extends": find_extends(content),
                    "jinja_features": analyze_jinja_features(content),
                    "dependencies": extract_dependencies(content)
                }
                
                audit_results["template_inventory"][str(rel_path)] = template_info
                
                # Display analysis
                category_emoji = get_category_emoji(template_info["category"])
                complexity_color = get_complexity_indicator(template_info["complexity"])
                
                print(f"   {category_emoji} {rel_path}")
                print(f"      📏 Size: {size_kb:.1f}KB ({lines} lines)")
                print(f"      🎯 Category: {template_info['category']}")
                print(f"      {complexity_color} Complexity: {template_info['complexity']}")
                
                if template_info["extends"]:
                    print(f"      🏗️ Extends: {template_info['extends']}")
                
                if template_info["includes"]:
                    print(f"      🔗 Includes: {', '.join(template_info['includes'])}")
                
                if template_info["blocks_defined"]:
                    print(f"      🧱 Defines blocks: {', '.join(template_info['blocks_defined'])}")
                
                print()
                
            except Exception as e:
                print(f"   ❌ Error reading {rel_path}: {e}")
    
    # 2. INHERITANCE ANALYSIS
    print("\n🏗️ TEMPLATE INHERITANCE ANALYSIS:")
    print("=" * 60)
    inheritance_tree = build_inheritance_tree(audit_results["template_inventory"])
    audit_results["inheritance_tree"] = inheritance_tree
    
    if inheritance_tree:
        for parent, children in inheritance_tree.items():
            print(f"   📄 {parent}")
            for child in children:
                print(f"      └── 📄 {child}")
        print()
    else:
        print("   ℹ️ No template inheritance detected")
        print()
    
    # 3. BLOCK USAGE ANALYSIS
    print("🧱 BLOCK USAGE ANALYSIS:")
    print("=" * 60)
    block_usage = analyze_block_usage(audit_results["template_inventory"])
    audit_results["block_usage"] = block_usage
    
    if block_usage:
        for block_name, usage in block_usage.items():
            defined_count = len(usage['defined_in'])
            used_count = len(usage['used_in'])
            
            if defined_count > 0:
                print(f"   🧱 '{block_name}':")
                print(f"      Defined in: {defined_count} template(s) - {', '.join(usage['defined_in'])}")
                print(f"      Used in: {used_count} template(s) - {', '.join(usage['used_in'])}")
                print()
    else:
        print("   ℹ️ No template blocks detected")
        print()
    
    # 4. PARTIALS ANALYSIS
    print("🔗 PARTIALS ANALYSIS:")
    print("=" * 60)
    partials_analysis = analyze_partials(audit_results["template_inventory"])
    audit_results["partials_analysis"] = partials_analysis
    
    partials_count = 0
    total_partials_size = 0
    
    for partial_name, partial_info in partials_analysis.items():
        if 'partials' in partial_name.lower():
            partials_count += 1
            total_partials_size += partial_info['size']
            usage_status = "✅ USED" if partial_info['used_by'] else "⚠️ UNUSED"
            
            print(f"   🔗 {partial_name}")
            print(f"      📏 Size: {partial_info['size']:.1f}KB")
            print(f"      🎯 Complexity: {partial_info['complexity']}")
            print(f"      {usage_status} by: {len(partial_info['used_by'])} template(s)")
            if partial_info['used_by']:
                print(f"      📄 Used by: {', '.join(partial_info['used_by'])}")
            print()
    
    print(f"   📊 Partials Summary: {partials_count} partials, {total_partials_size:.1f}KB total")
    print()
    
    # 5. COMPONENT MAPPING
    print("🧩 COMPONENT MAPPING ANALYSIS:")
    print("=" * 60)
    component_mapping = analyze_component_structure(audit_results["template_inventory"])
    audit_results["component_mapping"] = component_mapping
    
    for component_type, components in component_mapping.items():
        print(f"   🧩 {component_type.upper()} COMPONENTS:")
        for component in components:
            template_info = audit_results["template_inventory"][component]
            print(f"      📄 {component} ({template_info['size_kb']}KB)")
        print()
    
    # 6. SIZE ANALYSIS
    print("📊 SIZE ANALYSIS:")
    print("=" * 60)
    size_analysis = analyze_template_sizes(audit_results["template_inventory"])
    audit_results["size_analysis"] = size_analysis
    
    total_size = size_analysis["total"]
    print(f"   📏 Total templates size: {total_size:.1f}KB")
    print(f"   📈 Largest template: {size_analysis['largest']['name']} ({size_analysis['largest']['size']:.1f}KB)")
    print(f"   📉 Smallest template: {size_analysis['smallest']['name']} ({size_analysis['smallest']['size']:.1f}KB)")
    print(f"   📊 Average template size: {size_analysis['average']:.1f}KB")
    print()
    
    print(f"   📋 Size Distribution (Top 5):")
    for i, (name, size) in enumerate(size_analysis['distribution'][:5]):
        print(f"      {i+1}. {name}: {size:.1f}KB")
    print()
    
    # 7. OPTIMIZATION TARGETS
    print("🎯 OPTIMIZATION TARGETS IDENTIFICATION:")
    print("=" * 60)
    optimization_targets = identify_optimization_targets(audit_results)
    audit_results["optimization_targets"] = optimization_targets
    
    for target in optimization_targets:
        priority_emoji = "🔴" if target['priority'] == 'high' else "🟡" if target['priority'] == 'medium' else "🟢"
        print(f"   {priority_emoji} {target['type']}")
        print(f"      📝 Description: {target['description']}")
        print(f"      💡 Impact: {target['impact']}")
        print(f"      📁 Files: {len(target['files'])} affected")
        print(f"      ⚡ Priority: {target['priority']}")
        print()
    
    # 8. PHASE 1 RECOMMENDATIONS
    print("📋 PHASE 1 RECOMMENDATIONS:")
    print("=" * 60)
    recommendations = generate_phase_1_recommendations(audit_results)
    audit_results["phase_1_recommendations"] = recommendations
    
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec['title']}")
        print(f"      📝 {rec['description']}")
        print(f"      💼 Action: {rec['action']}")
        print(f"      ⏱️ Effort: {rec['effort']}")
        print()
    
    # Save detailed results
    output_file = "templates_phase_1_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(audit_results, f, indent=2, ensure_ascii=False)
    
    # Final summary
    print("📊 PHASE 1 ANALYSIS SUMMARY:")
    print("=" * 60)
    print(f"   📄 Templates analyzed: {len(audit_results['template_inventory'])}")
    print(f"   📏 Total size: {audit_results['size_analysis']['total']:.1f}KB")
    print(f"   🔗 Partials identified: {len([k for k in audit_results['partials_analysis'].keys() if 'partials' in k.lower()])}")
    print(f"   🧱 Blocks found: {len(audit_results['block_usage'])}")
    print(f"   🎯 Optimization targets: {len(audit_results['optimization_targets'])}")
    print(f"   📋 Recommendations: {len(audit_results['phase_1_recommendations'])}")
    print(f"   💾 Detailed analysis saved to: {output_file}")
    print()
    
    print("✅ PHASE 1 COMPLETE - Ready for Phase 2 Implementation!")
    print("=" * 60)
    
    return audit_results

# HELPER FUNCTIONS

def categorize_template(template_path):
    """Categorize template by its purpose and location"""
    path_str = str(template_path).lower()
    name = template_path.name.lower()
    
    if 'partials' in path_str:
        if 'block_' in name:
            return 'block_partial'
        else:
            return 'ui_partial'
    elif name in ['base.html', 'layout.html']:
        return 'base_template'
    elif name in ['home.html', 'index.html']:
        return 'page_template'
    elif 'lesson' in name or 'dashboard' in name:
        return 'application_template'
    elif 'error' in name:
        return 'error_template'
    else:
        return 'other_template'

def get_category_emoji(category):
    """Get emoji for template category"""
    emojis = {
        'base_template': '🏗️',
        'page_template': '📄',
        'application_template': '🎯',
        'block_partial': '🧱',
        'ui_partial': '🔗',
        'error_template': '❌',
        'other_template': '📋'
    }
    return emojis.get(category, '📄')

def assess_complexity(content):
    """Assess template complexity"""
    lines = len(content.splitlines())
    jinja_blocks = len(re.findall(r'{%.*?%}', content))
    jinja_vars = len(re.findall(r'{{.*?}}', content))
    nested_conditions = len(re.findall(r'{%\s*if.*?%}.*?{%\s*endif\s*%}', content, re.DOTALL))
    loops = len(re.findall(r'{%\s*for.*?%}', content))
    
    complexity_score = (lines * 0.1) + (jinja_blocks * 0.5) + (jinja_vars * 0.2) + (nested_conditions * 2.0) + (loops * 1.5)
    
    if complexity_score < 15:
        return 'low'
    elif complexity_score < 50:
        return 'medium'
    else:
        return 'high'

def get_complexity_indicator(complexity):
    """Get complexity indicator emoji"""
    indicators = {
        'low': '🟢',
        'medium': '🟡', 
        'high': '🔴'
    }
    return indicators.get(complexity, '⚪')

def find_defined_blocks(content):
    """Find all blocks defined in template"""
    blocks = re.findall(r'{%\s*block\s+(\w+)\s*%}', content)
    return list(set(blocks))  # Remove duplicates

def find_used_blocks(content):
    """Find all blocks used/overridden in template"""
    blocks = re.findall(r'{%\s*block\s+(\w+)\s*%}', content)
    return list(set(blocks))

def find_includes(content):
    """Find all included templates"""
    includes = re.findall(r'{%\s*include\s+["\']([^"\']+)["\']', content)
    return includes

def find_extends(content):
    """Find extended template"""
    extends = re.findall(r'{%\s*extends\s+["\']([^"\']+)["\']', content)
    return extends[0] if extends else None

def analyze_jinja_features(content):
    """Analyze Jinja2 features used in template"""
    return {
        'variables': len(re.findall(r'{{.*?}}', content)),
        'blocks': len(re.findall(r'{%\s*block.*?%}', content)),
        'conditions': len(re.findall(r'{%\s*if.*?%}', content)),
        'loops': len(re.findall(r'{%\s*for.*?%}', content)),
        'filters': len(re.findall(r'\|.*?[^\w]', content)),
        'comments': len(re.findall(r'{#.*?#}', content))
    }

def extract_dependencies(content):
    """Extract template dependencies"""
    dependencies = []
    
    # CSS dependencies
    css_deps = re.findall(r'href=["\']([^"\']*\.css[^"\']*)["\']', content)
    dependencies.extend([{'type': 'css', 'path': dep} for dep in css_deps])
    
    # JS dependencies
    js_deps = re.findall(r'src=["\']([^"\']*\.js[^"\']*)["\']', content)
    dependencies.extend([{'type': 'js', 'path': dep} for dep in js_deps])
    
    # Template dependencies
    template_deps = find_includes(content)
    dependencies.extend([{'type': 'template', 'path': dep} for dep in template_deps])
    
    return dependencies

def build_inheritance_tree(template_inventory):
    """Build template inheritance tree"""
    tree = defaultdict(list)
    
    for template_name, info in template_inventory.items():
        if info['extends']:
            tree[info['extends']].append(template_name)
    
    return dict(tree)

def analyze_block_usage(template_inventory):
    """Analyze how blocks are used across templates"""
    block_usage = defaultdict(lambda: {'defined_in': [], 'used_in': []})
    
    for template_name, info in template_inventory.items():
        for block in info['blocks_defined']:
            block_usage[block]['defined_in'].append(template_name)
        for block in info['blocks_used']:
            block_usage[block]['used_in'].append(template_name)
    
    return dict(block_usage)

def analyze_partials(template_inventory):
    """Analyze partials usage and organization"""
    partials = {}
    
    for template_name, info in template_inventory.items():
        if info['category'] in ['ui_partial', 'block_partial']:
            partials[template_name] = {
                'size': info['size_kb'],
                'complexity': info['complexity'],
                'used_by': []
            }
    
    # Find which templates use each partial
    for template_name, info in template_inventory.items():
        for include in info['includes']:
            # Normalize include path
            include_normalized = include.replace('partials/', '').replace('.html', '') + '.html'
            partial_key = f"partials/{include_normalized}"
            
            if partial_key in partials:
                partials[partial_key]['used_by'].append(template_name)
    
    return partials

def analyze_component_structure(template_inventory):
    """Analyze component structure and organization"""
    components = {
        'base': [],
        'page': [],
        'block': [],
        'ui': [],
        'other': []
    }
    
    for template_name, info in template_inventory.items():
        category = info['category']
        
        if category == 'base_template':
            components['base'].append(template_name)
        elif category in ['page_template', 'application_template']:
            components['page'].append(template_name)
        elif category == 'block_partial':
            components['block'].append(template_name)
        elif category == 'ui_partial':
            components['ui'].append(template_name)
        else:
            components['other'].append(template_name)
    
    return components

def analyze_template_sizes(template_inventory):
    """Analyze template sizes and identify outliers"""
    sizes = [(name, info['size_kb']) for name, info in template_inventory.items()]
    sizes.sort(key=lambda x: x[1], reverse=True)
    
    total_size = sum(size for _, size in sizes)
    avg_size = total_size / len(sizes) if sizes else 0
    
    return {
        'largest': {'name': sizes[0][0], 'size': sizes[0][1]} if sizes else None,
        'smallest': {'name': sizes[-1][0], 'size': sizes[-1][1]} if sizes else None,
        'average': avg_size,
        'total': total_size,
        'distribution': sizes
    }

def identify_optimization_targets(audit_results):
    """Identify specific optimization targets"""
    targets = []
    
    # 1. Large templates that could be split
    for template_name, info in audit_results["template_inventory"].items():
        if info['size_kb'] > 5:  # Templates larger than 5KB
            targets.append({
                'type': 'Large Template Optimization',
                'description': f'{template_name} is {info["size_kb"]}KB ({info["lines"]} lines) and could benefit from component extraction',
                'impact': 'Better maintainability, reusability, and performance',
                'files': [template_name],
                'priority': 'high' if info['size_kb'] > 10 else 'medium',
                'complexity': info['complexity']
            })
    
    # 2. Unused partials
    unused_partials = []
    for partial_name, partial_info in audit_results["partials_analysis"].items():
        if not partial_info['used_by'] and 'partials' in partial_name.lower():
            unused_partials.append(partial_name)
    
    if unused_partials:
        targets.append({
            'type': 'Unused Partials Cleanup',
            'description': f'{len(unused_partials)} partials are not used anywhere in the application',
            'impact': 'Reduced file count and cleaner codebase',
            'files': unused_partials,
            'priority': 'low'
        })
    
    # 3. Complex templates
    complex_templates = []
    for template_name, info in audit_results["template_inventory"].items():
        if info['complexity'] == 'high':
            complex_templates.append(template_name)
    
    if complex_templates:
        targets.append({
            'type': 'Complexity Reduction',
            'description': f'{len(complex_templates)} templates have high complexity and could be simplified',
            'impact': 'Easier maintenance and better developer experience',
            'files': complex_templates,
            'priority': 'medium'
        })
    
    # 4. Missing component organization
    partials_not_organized = []
    for template_name, info in audit_results["template_inventory"].items():
        if info['category'] in ['block_partial', 'ui_partial'] and not template_name.startswith('partials/'):
            partials_not_organized.append(template_name)
    
    if partials_not_organized:
        targets.append({
            'type': 'Component Organization',
            'description': f'{len(partials_not_organized)} components need better organization structure',
            'impact': 'Improved project structure and developer experience',
            'files': partials_not_organized,
            'priority': 'medium'
        })
    
    return targets

def generate_phase_1_recommendations(audit_results):
    """Generate Phase 1 specific recommendations"""
    recommendations = []
    
    # Recommendation 1: Component extraction
    large_templates = [name for name, info in audit_results["template_inventory"].items() 
                      if info['size_kb'] > 5]
    
    if large_templates:
        recommendations.append({
            'title': 'Extract Reusable Components',
            'description': f'Break down {len(large_templates)} large templates into smaller, reusable components',
            'action': 'Create component-based architecture for better maintainability',
            'effort': '3-4 hours',
            'priority': 'high',
            'files_affected': large_templates
        })
    
    # Recommendation 2: Template hierarchy
    recommendations.append({
        'title': 'Establish Clear Template Hierarchy',
        'description': 'Create organized directory structure for different template types',
        'action': 'Reorganize templates into pages/, components/, and layouts/ directories',
        'effort': '2-3 hours',
        'priority': 'medium',
        'files_affected': list(audit_results["template_inventory"].keys())
    })
    
    # Recommendation 3: Component standardization
    recommendations.append({
        'title': 'Standardize Component Interfaces',
        'description': 'Create consistent interfaces for all reusable components',
        'action': 'Define standard parameters and data structures for components',
        'effort': '2 hours',
        'priority': 'medium',
        'files_affected': [name for name, info in audit_results["template_inventory"].items() 
                          if info['category'] in ['block_partial', 'ui_partial']]
    })
    
    # Recommendation 4: Performance optimization
    recommendations.append({
        'title': 'Implement Performance Optimizations',
        'description': 'Add template caching and conditional loading for better performance',
        'action': 'Implement lazy loading and caching strategies',
        'effort': '1-2 hours',
        'priority': 'low',
        'files_affected': list(audit_results["template_inventory"].keys())
    })
    
    return recommendations

if __name__ == "__main__":
    results = execute_phase_1_templates_audit()

#!/usr/bin/env python3
"""
🎪 NUCLEAR BUILD SYSTEM - Ultimate JavaScript Consolidation
Creates the final production bundles from nuclear simplified files
"""

import os
import sys
import gzip
from pathlib import Path

def minify_js(content):
    """Basic JavaScript minification"""
    # Remove comments
    lines = content.split('\n')
    minified_lines = []
    
    for line in lines:
        line = line.strip()
        # Skip empty lines and comments
        if not line or line.startswith('//') or line.startswith('/*') or line.startswith('*'):
            continue
        # Remove inline comments (basic)
        if '//' in line:
            comment_pos = line.find('//')
            # Make sure it's not inside a string
            in_string = False
            quote_char = None
            for i, char in enumerate(line[:comment_pos]):
                if char in ['"', "'"] and (i == 0 or line[i-1] != '\\'):
                    if not in_string:
                        in_string = True
                        quote_char = char
                    elif char == quote_char:
                        in_string = False
                        quote_char = None
            
            if not in_string:
                line = line[:comment_pos].strip()
        
        if line:
            minified_lines.append(line)
    
    # Join and remove extra spaces
    minified = ' '.join(minified_lines)
    # Basic space optimization
    minified = minified.replace('  ', ' ')
    minified = minified.replace(' {', '{')
    minified = minified.replace('{ ', '{')
    minified = minified.replace(' }', '}')
    minified = minified.replace('} ', '}')
    minified = minified.replace(' (', '(')
    minified = minified.replace('( ', '(')
    minified = minified.replace(' )', ')')
    minified = minified.replace(') ', ')')
    
    return minified

def build_nuclear_bundles():
    print("🎪 NUCLEAR BUILD SYSTEM - Creating ultimate production bundles...")
    
    # Ensure dist directory exists
    dist_dir = Path("static/dist")
    dist_dir.mkdir(exist_ok=True)
    
    # Build nuclear quiz engine bundle
    print("📦 Building nuclear quiz engine...")
    
    try:
        with open("static/js/quiz_engine_nuclear.js", "r", encoding="utf-8") as f:
            quiz_content = f.read()
        
        # Minify
        quiz_minified = minify_js(quiz_content)
        
        # Write bundle
        with open("static/dist/quiz_engine.min.js", "w", encoding="utf-8") as f:
            f.write(quiz_minified)
        
        quiz_size = len(quiz_minified)
        print(f"   ✅ Quiz Engine: {quiz_size/1024:.1f}KB")
        
    except Exception as e:
        print(f"   ❌ Quiz Engine failed: {e}")
        return False
    
    # Build nuclear dashboard bundle
    print("📦 Building nuclear dashboard...")
    
    try:
        with open("static/js/dashboard_nuclear.js", "r", encoding="utf-8") as f:
            dashboard_content = f.read()
        
        # Minify
        dashboard_minified = minify_js(dashboard_content)
        
        # Write bundle
        with open("static/dist/dashboard.min.js", "w", encoding="utf-8") as f:
            f.write(dashboard_minified)
        
        dashboard_size = len(dashboard_minified)
        print(f"   ✅ Dashboard: {dashboard_size/1024:.1f}KB")
        
    except Exception as e:
        print(f"   ❌ Dashboard failed: {e}")
        return False
    
    # Copy CSS bundle (keep existing)
    print("📦 Building CSS bundle...")
    
    css_files = [
        "static/css/theme.css",
        "static/css/quiz_core.css",
        "static/css/accessibility-enhancements.css",
        "static/css/pycoin-icon.css",
        "static/css/course_dashboard.css"
    ]
    
    css_content = ""
    for css_file in css_files:
        if os.path.exists(css_file):
            with open(css_file, "r", encoding="utf-8") as f:
                css_content += f.read() + "\n"
    
    # Basic CSS minification
    css_minified = css_content.replace('\n', '').replace('  ', ' ').replace('{ ', '{').replace(' }', '}').replace('; ', ';')
    
    with open("static/dist/styles.min.css", "w", encoding="utf-8") as f:
        f.write(css_minified)
    
    css_size = len(css_minified)
    print(f"   ✅ CSS Bundle: {css_size/1024:.1f}KB")
    
    # Create nuclear utilities (minimal)
    print("📦 Building nuclear utilities...")
    
    utils_content = """
// Nuclear Utilities - Minimal essentials only
window.Utils = {
    dom: {
        get: (selector) => document.querySelector(selector),
        getAll: (selector) => Array.from(document.querySelectorAll(selector)),
        on: (element, event, handler) => element && element.addEventListener(event, handler),
        create: (tag, attrs = {}, content = '') => {
            const el = document.createElement(tag);
            Object.entries(attrs).forEach(([k, v]) => {
                if (k === 'className') el.className = v;
                else if (k === 'textContent') el.textContent = v;
                else el.setAttribute(k, v);
            });
            if (content) el.innerHTML = content;
            return el;
        }
    },
    storage: {
        get: (key) => localStorage.getItem(key),
        set: (key, value) => localStorage.setItem(key, value),
        remove: (key) => localStorage.removeItem(key)
    },
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
console.log('✅ Nuclear Utilities loaded');
"""
    
    utils_minified = minify_js(utils_content)
    
    with open("static/dist/utils.min.js", "w", encoding="utf-8") as f:
        f.write(utils_minified)
    
    utils_size = len(utils_minified)
    print(f"   ✅ Utilities: {utils_size/1024:.1f}KB")
    
    # Calculate total savings
    total_size = quiz_size + dashboard_size + css_size + utils_size
    
    print("\n🎯 NUCLEAR BUILD COMPLETE!")
    print("=" * 50)
    print(f"📄 Quiz Engine:  {quiz_size/1024:.1f}KB")
    print(f"📄 Dashboard:    {dashboard_size/1024:.1f}KB") 
    print(f"📄 CSS Bundle:   {css_size/1024:.1f}KB")
    print(f"📄 Utilities:    {utils_size/1024:.1f}KB")
    print("-" * 30)
    print(f"📦 TOTAL:        {total_size/1024:.1f}KB")
    print()
    print("🚀 BEFORE: ~117KB (multiple files)")
    print(f"🎪 AFTER:  {total_size/1024:.1f}KB (4 optimized files)")
    print(f"💰 SAVINGS: {((117*1024 - total_size) / (117*1024) * 100):.1f}% reduction!")
    print()
    print("✅ All bundles ready for production deployment!")
    
    return True

if __name__ == "__main__":
    success = build_nuclear_bundles()
    sys.exit(0 if success else 1)

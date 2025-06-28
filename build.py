#!/usr/bin/env python3
"""
Quiz Master 3.0 - Simple Build Script
Optimizes assets without Node.js dependencies
"""

import os
import re
from pathlib import Path

def build_assets():
    """Build optimized assets"""
    print("🏗️ Building optimized assets...")
    
    # Create dist directory
    dist_dir = Path("static/dist")
    dist_dir.mkdir(exist_ok=True)
    
    # Combine and optimize CSS
    css_files = list(Path("static/css").glob("*.css"))
    combined_css = ""
    
    for css_file in css_files:
        if css_file.name.endswith('.min.css'):
            continue
        content = css_file.read_text(encoding='utf-8')
        combined_css += f"/* {css_file.name} */\n{content}\n"
    
    # Basic CSS optimization
    combined_css = re.sub(r'\s+', ' ', combined_css)
    combined_css = re.sub(r';\s*}', '}', combined_css)
    
    (dist_dir / "styles.min.css").write_text(combined_css, encoding='utf-8')
    
    # Combine JavaScript (preserve quiz_master.js structure)
    js_files = list(Path("static/js").glob("*.js"))
    combined_js = ""
    
    for js_file in js_files:
        if js_file.name.endswith('.min.js'):
            continue
        content = js_file.read_text(encoding='utf-8')
        combined_js += f"/* {js_file.name} */\n{content}\n"
    
    (dist_dir / "app.min.js").write_text(combined_js, encoding='utf-8')
    
    # Calculate sizes
    css_size = (dist_dir / "styles.min.css").stat().st_size / 1024
    js_size = (dist_dir / "app.min.js").stat().st_size / 1024
    
    print("✅ Build complete!")
    print(f"   📄 {dist_dir}/styles.min.css ({css_size:.1f}KB)")
    print(f"   📄 {dist_dir}/app.min.js ({js_size:.1f}KB)")
    print(f"   📦 Total bundle: {css_size + js_size:.1f}KB")

if __name__ == "__main__":
    build_assets()

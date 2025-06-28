#!/usr/bin/env python3
"""
Quiz Master 3.0 - Asset Mode Switcher
Switch between development and production assets
"""

import os
import shutil
from pathlib import Path

def switch_to_production():
    """Switch to production-optimized assets"""
    print("🚀 Switching to PRODUCTION assets...")
    
    # Backup current base template
    base_path = Path("templates/layouts/base.html")
    if base_path.exists():
        shutil.copy2(base_path, "templates/layouts/base_dev.html")
    
    # Copy optimized templates
    shutil.copy2("templates/layouts/base_optimized.html", "templates/layouts/base.html")
    shutil.copy2("templates/layouts/head_optimized.html", "templates/layouts/head.html")
    
    print("   ✅ Switched to production templates")
    print("   📦 Using bundled assets: static/dist/")
    print("   ⚡ Performance: Optimized for production")

def switch_to_development():
    """Switch to development assets"""
    print("🛠️ Switching to DEVELOPMENT assets...")
    
    # Restore development templates if backup exists
    dev_base = Path("templates/layouts/base_dev.html")
    if dev_base.exists():
        shutil.copy2(dev_base, "templates/layouts/base.html")
    
    print("   ✅ Switched to development templates")
    print("   📄 Using individual assets: static/js/, static/css/")
    print("   🔧 Performance: Optimized for debugging")

def check_current_mode():
    """Check which mode is currently active"""
    base_path = Path("templates/layouts/base.html")
    if base_path.exists():
        content = base_path.read_text(encoding='utf-8')
        if 'dist/app.min.js' in content:
            return 'production'
        else:
            return 'development'
    return 'unknown'

if __name__ == "__main__":
    import sys
    
    current_mode = check_current_mode()
    print(f"📊 Current mode: {current_mode.upper()}")
    
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        if mode in ['prod', 'production']:
            switch_to_production()
        elif mode in ['dev', 'development']:
            switch_to_development()
        else:
            print("Usage: python asset_switcher.py [production|development]")
    else:
        print("\nUsage:")
        print("  python asset_switcher.py production   # Switch to optimized bundles")
        print("  python asset_switcher.py development  # Switch to individual files")

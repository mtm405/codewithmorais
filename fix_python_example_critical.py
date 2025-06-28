#!/usr/bin/env python3
"""
CRITICAL FIX: Python-Example ACE Editor Not Loading
Fixes the issue where code snippets don't display after optimization
"""

import os
from pathlib import Path

def fix_python_example_ace_editor():
    """Fix the python-example ACE editor not loading issue"""
    print("🔧 CRITICAL FIX: Python-Example ACE Editor Not Loading")
    print("=" * 60)
    
    fixes_applied = []
    
    # 1. ADD ACE EDITOR CDN TO BASE TEMPLATE
    print("🌐 FIX 1: Adding ACE Editor CDN to base template")
    base_template_path = Path("templates/layouts/head.html")
    
    if base_template_path.exists():
        content = base_template_path.read_text(encoding='utf-8')
        
        # Check if ACE Editor is already included
        if "ace.js" not in content and "ace-builds" not in content:
            # Add ACE Editor before the Firebase config
            ace_cdn_insertion = '''    
    <!-- ACE Editor CDN for code snippets -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-python.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/theme-monokai.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
'''
            
            # Insert before Firebase config
            if "<!-- Firebase Config -->" in content:
                content = content.replace("<!-- Firebase Config -->", f"{ace_cdn_insertion}\n    <!-- Firebase Config -->")
            else:
                # Insert before closing </head>
                content = content.replace("</head>", f"{ace_cdn_insertion}\n</head>")
                
            base_template_path.write_text(content, encoding='utf-8')
            print(f"   ✅ Added ACE Editor CDN to {base_template_path}")
            fixes_applied.append("ACE Editor CDN added to base template")
        else:
            print(f"   ✅ ACE Editor CDN already exists in {base_template_path}")
    
    # 2. FIX CODE SNIPPET TEMPLATE TO PROPERLY INITIALIZE ACE
    print("🎨 FIX 2: Fixing code snippet template ACE initialization")
    code_snippet_path = Path("templates/blocks/code_snippet.html")
    
    if code_snippet_path.exists():
        # Create a working version that initializes ACE properly
        fixed_template = '''<!-- Optimized code snippet block with performance enhancements -->
<div class="code-snippet-block" data-code="{{ block.code|tojson|safe }}">
  <div class="code-snippet-title">
    <span class="material-symbols-outlined" style="vertical-align: middle;">lightbulb</span>
    Example
  </div>
  <div class="python-example" aria-label="Code example">
    <div class="code-snippet-container">
      <div class="code-snippet-ace ace-editor-pending"></div>
    </div>
  </div>
</div>
<script>
// Optimized code snippet initialization with immediate fix
(function() {
  const codeSnippetBlock = document.currentScript.previousElementSibling;
  const aceContainer = codeSnippetBlock.querySelector('.code-snippet-ace');
  const code = JSON.parse(codeSnippetBlock.dataset.code || '""');
  
  // Generate unique ID for this ACE editor
  const uniqueId = 'ace-snippet-' + Math.random().toString(36).substr(2, 8);
  aceContainer.id = uniqueId;
  
  function initializeAceEditor() {
    if (typeof ace === 'undefined') {
      // ACE not loaded yet, wait
      setTimeout(initializeAceEditor, 100);
      return;
    }
    
    try {
      // Remove pending class
      aceContainer.classList.remove('ace-editor-pending');
      
      // Initialize ACE Editor
      const editor = ace.edit(uniqueId);
      editor.setTheme("ace/theme/monokai");
      editor.session.setMode("ace/mode/python");
      editor.setValue(code, -1);
      editor.setReadOnly(true);
      
      // Configure editor options for read-only display
      editor.setOptions({
        highlightActiveLine: false,
        highlightGutterLine: false,
        showPrintMargin: false,
        showLineNumbers: true,
        showGutter: true,
        displayIndentGuides: false,
        fontSize: "1.08em",
        maxLines: Infinity,
        minLines: 3,
        wrap: true
      });
      
      // Hide cursor and make it look like example code
      editor.renderer.$cursorLayer.element.style.display = "none";
      editor.renderer.setShowGutter(true);
      editor.renderer.setScrollMargin(8,8,8,8);
      editor.setBehavioursEnabled(false);
      
      // Style the container
      editor.container.style.background = '#000';
      editor.container.style.border = 'none';
      editor.container.style.boxShadow = 'none';
      
      // Store reference for potential cleanup
      if (!window.aceEditors) window.aceEditors = {};
      window.aceEditors[uniqueId] = editor;
      
      console.log(`✅ Initialized code snippet ACE editor: ${uniqueId}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize ACE editor:', error);
      // Fallback: show code as plain text
      aceContainer.innerHTML = `<pre style="background: var(--bg-accent); color: var(--text-main); padding: 12px; margin: 0; border-radius: 4px; font-family: monospace; overflow-x: auto;"><code>${code}</code></pre>`;
    }
  }
  
  // Initialize when DOM is ready or immediately if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAceEditor);
  } else {
    initializeAceEditor();
  }
})();
</script>'''
        
        code_snippet_path.write_text(fixed_template, encoding='utf-8')
        print(f"   ✅ Fixed code snippet template: {code_snippet_path}")
        fixes_applied.append("Code snippet template ACE initialization fixed")
    
    # 3. ENSURE PRODUCTION BUNDLES INCLUDE ACE SUPPORT
    print("📦 FIX 3: Ensuring production bundles support ACE Editor")
    
    # Check if we need to update any JavaScript files
    js_files_to_check = [
        Path("static/js/quiz_master.js"),
        Path("static/dist/app.min.js")
    ]
    
    for js_file in js_files_to_check:
        if js_file.exists():
            content = js_file.read_text(encoding='utf-8')
            if "CodeSnippetManager" not in content:
                print(f"   ⚠️  {js_file} missing CodeSnippetManager - this is expected for production")
            else:
                print(f"   ✅ {js_file} has CodeSnippetManager support")
    
    # 4. CREATE A TEST LESSON TO VERIFY THE FIX
    print("🧪 FIX 4: Creating test lesson to verify python-example works")
    test_lesson = {
        "objective": "Test that python-example code snippets display correctly after optimization fix",
        "blocks": [
            {
                "type": "text",
                "content": "# 🔧 CRITICAL FIX TEST: Python-Example Display\n\nThis lesson tests if the python-example read-only IDE displays correctly after our optimization fix."
            },
            {
                "type": "code_snippet",
                "id": "test_basic_python",
                "code": "# Basic Python example\nprint(\"Hello, World!\")\n\n# Variables\nname = \"Python\"\nage = 30\nprint(f\"My name is {name} and I am {age} years old\")"
            },
            {
                "type": "text", 
                "content": "The code above should display in a dark-themed ACE editor with syntax highlighting."
            },
            {
                "type": "code_snippet",
                "id": "test_functions_python",
                "code": "# Function example\ndef greet(name):\n    return f\"Hello, {name}!\"\n\n# Using the function\nmessage = greet(\"World\")\nprint(message)\n\n# List comprehension\nnumbers = [1, 2, 3, 4, 5]\nsquares = [n**2 for n in numbers]\nprint(f\"Squares: {squares}\")"
            },
            {
                "type": "text",
                "content": "Both code examples above should:\n- Display with Python syntax highlighting\n- Be read-only (not editable)\n- Have line numbers\n- Use the dark monokai theme\n- Show proper scrollbars if content overflows"
            }
        ]
    }
    
    test_path = Path("lessons/test_python_example_fix.json")
    with open(test_path, 'w', encoding='utf-8') as f:
        import json
        json.dump(test_lesson, f, indent=2)
    
    print(f"   ✅ Created test lesson: {test_path}")
    fixes_applied.append("Test lesson created")
    
    return fixes_applied

def rebuild_production_assets():
    """Rebuild production assets with the fixes"""
    print("🏗️ REBUILDING: Production assets with ACE Editor fixes")
    
    try:
        import subprocess
        result = subprocess.run(['python', 'build.py'], 
                              capture_output=True, 
                              text=True, 
                              cwd=Path.cwd())
        
        if result.returncode == 0:
            print("   ✅ Production assets rebuilt successfully")
            print(f"   📊 Build output: {result.stdout}")
            return True
        else:
            print(f"   ❌ Build failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"   ⚠️  Could not rebuild automatically: {e}")
        print("   📝 Please run 'python build.py' manually")
        return False

if __name__ == "__main__":
    import json
    
    print("🚨 CRITICAL FIX: Python-Example ACE Editor Issue")
    print("Issue: Code snippets not displaying after optimization")
    print("Root Cause: ACE Editor CDN missing from base template")
    print("=" * 60)
    
    # Apply fixes
    fixes = fix_python_example_ace_editor()
    
    # Rebuild production assets
    rebuild_success = rebuild_production_assets()
    
    print("\n" + "=" * 60)
    print("🎯 FIXES APPLIED:")
    for i, fix in enumerate(fixes, 1):
        print(f"   {i}. ✅ {fix}")
    
    if rebuild_success:
        print(f"   {len(fixes) + 1}. ✅ Production assets rebuilt")
    
    print(f"\n🧪 TESTING INSTRUCTIONS:")
    print(f"   1. Start Flask app: python app.py")
    print(f"   2. Visit: http://localhost:5000/lesson/test_python_example_fix")
    print(f"   3. Verify code snippets display with syntax highlighting")
    print(f"   4. Check browser console for ACE initialization messages")
    
    print(f"\n✅ EXPECTED RESULT:")
    print(f"   - Code snippets display in dark ACE editors")
    print(f"   - Python syntax highlighting visible")
    print(f"   - Read-only editors with line numbers")
    print(f"   - No console errors related to ACE")
    print(f"   - Console shows: '✅ Initialized code snippet ACE editor: ace-snippet-...'")
    
    print(f"\n📋 IF ISSUES PERSIST:")
    print(f"   - Check browser console for JavaScript errors")
    print(f"   - Verify ACE Editor CDN loads (Network tab)")
    print(f"   - Test with different browsers")
    print(f"   - Check if ad blockers are interfering")
    
    print(f"\n🎊 CRITICAL FIX COMPLETE!")

#!/usr/bin/env python3
"""
Debug Script: Code Not Displaying in ACE Editor
Identifies why Python code examples aren't showing in the IDE
"""

import json
from pathlib import Path

def debug_code_display_issue():
    """Debug why code isn't displaying in ACE editor"""
    print("🔍 DEBUG: Code Not Displaying in ACE Editor")
    print("=" * 50)
    
    # 1. CHECK TEST LESSON DATA
    print("📚 STEP 1: Checking test lesson data")
    test_lesson_path = Path("lessons/test_python_example_fix.json")
    
    if test_lesson_path.exists():
        with open(test_lesson_path, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        print(f"   ✅ Test lesson exists: {test_lesson_path}")
        
        # Check code snippet blocks
        for i, block in enumerate(lesson_data.get('blocks', [])):
            if block.get('type') == 'code_snippet':
                print(f"   📝 Code snippet block {i}:")
                print(f"      ID: {block.get('id', 'NO_ID')}")
                print(f"      Code length: {len(block.get('code', ''))}")
                print(f"      Code preview: {repr(block.get('code', '')[:50])}...")
    else:
        print(f"   ❌ Test lesson not found: {test_lesson_path}")
    
    # 2. CHECK EXISTING LESSON WITH CODE SNIPPETS
    print("\n📚 STEP 2: Checking existing lesson with code snippets")
    lesson_1_1_path = Path("lessons/lesson_1_1.json")
    
    if lesson_1_1_path.exists():
        with open(lesson_1_1_path, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        print(f"   ✅ Lesson 1.1 exists: {lesson_1_1_path}")
        
        # Find first code snippet
        for i, block in enumerate(lesson_data.get('blocks', [])):
            if block.get('type') == 'code_snippet':
                print(f"   📝 First code snippet found at block {i}:")
                print(f"      ID: {block.get('id', 'NO_ID')}")
                print(f"      Language: {block.get('language', 'NOT_SET')}")
                print(f"      Code: {repr(block.get('code', 'NO_CODE'))}")
                break
    else:
        print(f"   ❌ Lesson 1.1 not found: {lesson_1_1_path}")
    
    # 3. CREATE SIMPLE DEBUG TEMPLATE
    print("\n🛠️ STEP 3: Creating debug template to test data flow")
    debug_template = '''<!-- DEBUG: Code snippet template with extensive logging -->
<div class="code-snippet-block" data-code="{{ block.code|tojson|safe }}">
  <div class="code-snippet-title">
    <span class="material-symbols-outlined" style="vertical-align: middle;">lightbulb</span>
    Example (DEBUG MODE)
  </div>
  <div class="python-example" aria-label="Code example">
    <div class="code-snippet-container">
      <div class="code-snippet-ace ace-editor-pending" style="border: 2px solid red; min-height: 150px;"></div>
    </div>
  </div>
  
  <!-- DEBUG: Show raw data -->
  <div style="background: #1a1a1a; color: #00ff00; padding: 10px; margin-top: 10px; font-family: monospace; font-size: 12px;">
    <strong>DEBUG INFO:</strong><br>
    Raw block.code: {{ block.code|e }}<br>
    JSON block.code: {{ block.code|tojson|safe }}<br>
    Block type: {{ block.type }}<br>
    Block ID: {{ block.id }}<br>
  </div>
</div>
<script>
// DEBUG: Enhanced logging version
(function() {
  console.log("🔍 DEBUG: Starting code snippet initialization");
  
  const codeSnippetBlock = document.currentScript.previousElementSibling;
  const aceContainer = codeSnippetBlock.querySelector('.code-snippet-ace');
  
  console.log("🔍 DEBUG: Code snippet block:", codeSnippetBlock);
  console.log("🔍 DEBUG: ACE container:", aceContainer);
  console.log("🔍 DEBUG: Raw dataset.code:", codeSnippetBlock.dataset.code);
  
  let code;
  try {
    code = JSON.parse(codeSnippetBlock.dataset.code || '""');
    console.log("🔍 DEBUG: Parsed code:", code);
    console.log("🔍 DEBUG: Code type:", typeof code);
    console.log("🔍 DEBUG: Code length:", code.length);
  } catch (e) {
    console.error("❌ DEBUG: Failed to parse code:", e);
    code = "# Error parsing code";
  }
  
  // Generate unique ID for this ACE editor
  const uniqueId = 'ace-debug-' + Math.random().toString(36).substr(2, 8);
  aceContainer.id = uniqueId;
  console.log("🔍 DEBUG: Assigned ID:", uniqueId);
  
  function initializeAceEditor() {
    console.log("🔍 DEBUG: Attempting to initialize ACE editor");
    console.log("🔍 DEBUG: typeof ace:", typeof ace);
    
    if (typeof ace === 'undefined') {
      console.log("⏳ DEBUG: ACE not ready, waiting...");
      setTimeout(initializeAceEditor, 100);
      return;
    }
    
    console.log("✅ DEBUG: ACE is available, proceeding with initialization");
    
    try {
      // Remove pending class
      aceContainer.classList.remove('ace-editor-pending');
      aceContainer.style.border = "2px solid green"; // Visual confirmation
      
      console.log("🔍 DEBUG: About to call ace.edit with ID:", uniqueId);
      
      // Initialize ACE Editor
      const editor = ace.edit(uniqueId);
      console.log("✅ DEBUG: ACE editor created:", editor);
      
      editor.setTheme("ace/theme/monokai");
      console.log("✅ DEBUG: Theme set to monokai");
      
      editor.session.setMode("ace/mode/python");
      console.log("✅ DEBUG: Mode set to python");
      
      console.log("🔍 DEBUG: About to set value:", code);
      editor.setValue(code, -1);
      console.log("✅ DEBUG: Value set successfully");
      
      editor.setReadOnly(true);
      console.log("✅ DEBUG: Set to read-only");
      
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
      console.log("✅ DEBUG: Options configured");
      
      // Hide cursor and make it look like example code
      editor.renderer.$cursorLayer.element.style.display = "none";
      editor.renderer.setShowGutter(true);
      editor.renderer.setScrollMargin(8,8,8,8);
      editor.setBehavioursEnabled(false);
      
      // Style the container
      editor.container.style.background = '#2F3129';
      editor.container.style.border = '1px solid #00ff00';
      editor.container.style.boxShadow = 'none';
      
      // Store reference for potential cleanup
      if (!window.aceEditors) window.aceEditors = {};
      window.aceEditors[uniqueId] = editor;
      
      console.log(`🎉 DEBUG: Successfully initialized ACE editor: ${uniqueId}`);
      console.log("🔍 DEBUG: Editor content:", editor.getValue());
      
    } catch (error) {
      console.error('❌ DEBUG: Failed to initialize ACE editor:', error);
      console.error('❌ DEBUG: Error stack:', error.stack);
      
      // Enhanced fallback with more debug info
      aceContainer.innerHTML = `
        <pre style="background: #1a1a1a; color: #ff6b6b; padding: 12px; margin: 0; border-radius: 4px; font-family: monospace; overflow-x: auto;">
          <strong>❌ ACE EDITOR FAILED</strong>
          Error: ${error.message}
          
          <strong>📝 FALLBACK CODE:</strong>
          ${code}
        </pre>`;
    }
  }
  
  // Initialize when DOM is ready or immediately if already ready
  if (document.readyState === 'loading') {
    console.log("📅 DEBUG: DOM still loading, waiting for DOMContentLoaded");
    document.addEventListener('DOMContentLoaded', initializeAceEditor);
  } else {
    console.log("📅 DEBUG: DOM ready, initializing immediately");
    initializeAceEditor();
  }
})();
</script>'''
    
    # Save debug template
    debug_template_path = Path("templates/blocks/code_snippet_debug.html")
    debug_template_path.write_text(debug_template, encoding='utf-8')
    print(f"   ✅ Created debug template: {debug_template_path}")
    
    # 4. CREATE MINIMAL TEST CASE
    print("\n🧪 STEP 4: Creating minimal test case")
    minimal_test = {
        "objective": "Minimal test to debug code display issue",
        "blocks": [
            {
                "type": "text",
                "content": "# Debug Test: Simple Code Display\n\nThis should show a simple Python example:"
            },
            {
                "type": "code_snippet",
                "id": "debug_simple",
                "code": "print('Hello, World!')"
            }
        ]
    }
    
    debug_lesson_path = Path("lessons/debug_code_display.json")
    with open(debug_lesson_path, 'w', encoding='utf-8') as f:
        json.dump(minimal_test, f, indent=2)
    
    print(f"   ✅ Created debug lesson: {debug_lesson_path}")
    
    return debug_template_path, debug_lesson_path

def create_temporary_debug_route():
    """Create instructions for temporary debug route"""
    print("\n🛤️ STEP 5: Instructions for temporary debug route")
    print("   Add this to your Flask app for debugging:")
    print("""
@app.route('/debug/code_snippet')
def debug_code_snippet():
    # Simple test with hardcoded data
    test_block = {
        'type': 'code_snippet',
        'id': 'debug_test',
        'code': 'print("Hello from debug!")'
    }
    
    return render_template('blocks/code_snippet_debug.html', block=test_block)
    """)
    print("   Visit: http://localhost:5000/debug/code_snippet")

if __name__ == "__main__":
    print("🔍 DEBUGGING: Code Not Displaying in ACE Editor")
    print("Issue: ACE Editor shows up but code content is missing")
    print("=" * 60)
    
    debug_template_path, debug_lesson_path = debug_code_display_issue()
    create_temporary_debug_route()
    
    print("\n" + "=" * 60)
    print("🎯 DEBUG STEPS COMPLETED:")
    print("   1. ✅ Checked lesson data structure")
    print("   2. ✅ Created debug template with extensive logging")
    print("   3. ✅ Created minimal test case")
    print("   4. ✅ Provided debug route instructions")
    
    print(f"\n🧪 IMMEDIATE TESTING:")
    print(f"   1. Temporarily replace templates/blocks/code_snippet.html with templates/blocks/code_snippet_debug.html")
    print(f"   2. Visit any lesson with code snippets")
    print(f"   3. Check browser console for detailed debug messages")
    print(f"   4. Look for green border around ACE editor (visual confirmation)")
    print(f"   5. Check if DEBUG INFO section shows the raw code data")
    
    print(f"\n📋 WHAT TO LOOK FOR:")
    print(f"   - Console messages starting with '🔍 DEBUG:'")
    print(f"   - Raw block.code in the DEBUG INFO section")
    print(f"   - JSON block.code in the DEBUG INFO section") 
    print(f"   - Any error messages in red")
    print(f"   - Whether ACE editor gets the code or receives empty string")
    
    print(f"\n🔧 NEXT STEPS BASED ON RESULTS:")
    print(f"   - If raw code shows but ACE is empty: JavaScript parsing issue")
    print(f"   - If raw code is empty: Template rendering issue")
    print(f"   - If ACE fails to initialize: CDN or dependency issue")
    print(f"   - If code shows in fallback: ACE initialization problem")

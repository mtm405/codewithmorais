#!/usr/bin/env python3
"""
Add temporary debug route to test code snippet rendering
"""

def add_debug_route_instructions():
    """Instructions to add a debug route to app.py"""
    
    debug_route_code = '''
# Add this temporary debug route to app.py (after the other routes, before if __name__ == '__main__':)

@app.route('/debug/code_snippet')
def debug_code_snippet():
    """Debug route to test code snippet rendering"""
    test_block = {
        'type': 'code_snippet',
        'id': 'debug_test',
        'code': 'print("Hello from debug!")\nx = 42\nprint(f"The answer is {x}")'
    }
    
    return render_template('blocks/code_snippet.html', block=test_block)

@app.route('/debug/lesson_simple')
def debug_lesson_simple():
    """Debug route to test simple lesson with code snippet"""
    lesson_data = {
        'id': 'debug_lesson',
        'title': 'Debug Lesson: Code Snippet Test',
        'blocks': [
            {
                'type': 'text',
                'content': '# Debug Test\\n\\nThis is a simple test of code snippet rendering:'
            },
            {
                'type': 'code_snippet',
                'id': 'debug_snippet_1', 
                'code': 'print("Hello, World!")\\n\\n# Variables\\nname = "Python"\\nprint(f"Welcome to {name}!")'
            }
        ]
    }
    
    return render_template('pages/lesson.html', lesson=lesson_data, active_page='lessons')
'''
    
    print("🛠️ TEMPORARY DEBUG ROUTES")
    print("=" * 50)
    print("Add these routes to your app.py file:")
    print(debug_route_code)
    print("\n📋 Test URLs:")
    print("   http://localhost:5000/debug/code_snippet")
    print("   http://localhost:5000/debug/lesson_simple")
    print("\n🔍 What to check:")
    print("   1. Browser console for debug messages")
    print("   2. Look for red/green borders around ACE editor")
    print("   3. Check DEBUG INFO section for raw code data")
    print("   4. Verify if ACE editor initializes or shows fallback")

if __name__ == "__main__":
    add_debug_route_instructions()

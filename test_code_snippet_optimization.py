#!/usr/bin/env python3
"""
Test script to verify code snippet optimization works correctly.
"""

import os
from jinja2 import Environment, FileSystemLoader

def test_code_snippet_rendering():
    """Test that the optimized code snippet template renders correctly."""
    
    # Set up Jinja2 environment
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    
    # Load the code snippet template
    template = env.get_template('blocks/code_snippet.html')
    
    # Test data
    test_block = {
        'code': 'print("Hello, World!")\nx = 42\nprint(f"The answer is {x}")'
    }
    
    # Render the template
    rendered = template.render(block=test_block)
    
    # Verify key optimizations are present
    assert 'data-code=' in rendered, "Code data should be in HTML data attribute"
    assert 'window.CodeSnippetManager' in rendered, "Should use optimized manager"
    assert 'ace-editor-pending' in rendered, "Should have pending class for lazy loading"
    assert 'code-snippet-container' in rendered, "Should have container structure"
    
    # Verify no inline styles (moved to CSS)
    assert 'style="padding:0;margin:0;' not in rendered, "Inline styles should be removed"
    assert 'style="width:100%;min-height:80px;' not in rendered, "Size styles should be in CSS"
    
    # Verify structure is clean
    assert '<div class="code-snippet-block" data-code=' in rendered, "Should have clean structure"
    
    print("✅ Code snippet optimization test passed!")
    print(f"📏 Template size: {len(rendered)} characters")
    
    # Check for performance features
    performance_features = [
        'window.CodeSnippetManager',
        'aceReady',
        'processPending',
        'register(element)',
        'instances.has'
    ]
    
    for feature in performance_features:
        if feature in rendered:
            print(f"✅ Performance feature found: {feature}")
        else:
            print(f"❌ Missing performance feature: {feature}")
    
    return rendered

if __name__ == "__main__":
    try:
        result = test_code_snippet_rendering()
        print("\n" + "="*50)
        print("CODE SNIPPET OPTIMIZATION TEST COMPLETE")
        print("="*50)
        
        # Show a sample of the rendered output
        lines = result.split('\n')
        print("\n📋 Sample rendered output (first 10 lines):")
        for i, line in enumerate(lines[:10]):
            print(f"{i+1:2d}: {line}")
            
        if len(lines) > 10:
            print(f"... and {len(lines) - 10} more lines")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        exit(1)

# src/utils.py
from flask import request, session, g
from datetime import datetime
import re
from markupsafe import Markup
import random
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

# Helper function to determine the active page for sidebar highlighting
def get_active_page():
    path = request.path

    # Only check for dashboard now
    if path == '/dashboard':
        return 'dashboard'

    return None # Default if no match is found

# Context Processor for common template variables
def inject_global_data():
    # Retrieve from session, provide defaults if not logged in
    user_id = session.get('user_id')
    user_name = session.get('user_name', 'Guest')
    user_picture = session.get('user_picture', 'https://via.placeholder.com/45/56D364/FFFFFF?text=L') # Default if no picture
    user_currency = session.get('user_currency', 0) # Added currency to session
    user_points = session.get('user_points', 0)  # Always provide up-to-date points

    return dict(
        user_id=user_id, # Useful for frontend logic
        user_name=user_name,
        user_picture=user_picture,
        user_currency=user_currency, # Make currency available to templates
        user_points=user_points,
        active_page=get_active_page()
    )

# CSS Versioning to bust cache
def set_css_version():
    g.css_version = datetime.now().strftime('%Y%m%d%H%M%S')

def highlight_keywords(text, keywords=None):
    if not keywords:
        keywords = ["int", "float", "str", "bool"]
    # Regex to match whole words only
    pattern = r'\b(' + '|'.join(re.escape(word) for word in keywords) + r')\b'
    def replacer(match):
        return f'<span class="highlight">{match.group(0)}</span>'
    return Markup(re.sub(pattern, replacer, text))

def shuffle_filter(seq):
    seq = list(seq)
    random.shuffle(seq)
    return seq

def pygments_highlight(code):
    """
    Highlight Python code as HTML with inline styles for use in Jinja templates.
    Returns HTML with inline styles for syntax highlighting and line numbers.
    """
    formatter = HtmlFormatter(noclasses=True, style="monokai", linenos=True, nowrap=False)
    highlighted = highlight(code, PythonLexer(), formatter)
    # Remove <div> wrapper if present, keep only <pre>...
    if highlighted.startswith('<div'):
        highlighted = highlighted.split('>', 1)[1].rsplit('</div>', 1)[0]
    return Markup(highlighted)

# IDE Command Center Enhancements
def format_code_for_ide(code, language='python'):
    """
    Format code with IDE-style syntax highlighting for terminal display
    Returns HTML with terminal-friendly styling
    """
    if language == 'python':
        formatter = HtmlFormatter(
            noclasses=True, 
            style="monokai", 
            linenos=False, 
            nowrap=True,
            cssclass="ide-code-snippet"
        )
        highlighted = highlight(code, PythonLexer(), formatter)
        return Markup(highlighted)
    return Markup(f'<span class="ide-code-snippet">{code}</span>')

def create_terminal_prompt(command, user='python', host='codelab'):
    """
    Create a terminal-style prompt for the IDE interface
    """
    return Markup(f'<span class="ide-prompt">{user}@{host}:~$ {command}</span>')

def format_terminal_output(text, output_type='info'):
    """
    Format text as terminal output with appropriate styling
    """
    color_classes = {
        'info': 'terminal-text',
        'success': 'terminal-success', 
        'error': 'terminal-error',
        'warning': 'terminal-warning'
    }
    
    color_class = color_classes.get(output_type, 'terminal-text')
    return Markup(f'<span class="ide-terminal-output {color_class}">{text}</span>')

# Phase 2: Enhanced Python IDE Features
def get_code_completion_suggestions(code_snippet, cursor_position=None):
    """
    Generate autocomplete suggestions for Python code
    Returns list of completion items with metadata
    """
    import keyword
    
    suggestions = []
    
    # Add Python keywords
    for kw in keyword.kwlist:
        suggestions.append({
            'text': kw,
            'type': 'keyword',
            'description': f'Python keyword: {kw}'
        })
    
    # Add common built-in functions
    builtins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple']
    for builtin in builtins:
        suggestions.append({
            'text': builtin,
            'type': 'function',
            'description': f'Built-in function: {builtin}()'
        })
    
    return suggestions

def validate_python_syntax(code):
    """
    Validate Python code syntax and return error information
    """
    import ast
    
    try:
        ast.parse(code)
        return {
            'valid': True,
            'errors': []
        }
    except SyntaxError as e:
        return {
            'valid': False,
            'errors': [{
                'line': e.lineno,
                'column': e.offset,
                'message': e.msg,
                'type': 'SyntaxError'
            }]
        }
    except Exception as e:
        return {
            'valid': False,
            'errors': [{
                'line': 0,
                'column': 0,
                'message': str(e),
                'type': type(e).__name__
            }]
        }

def get_python_help(topic):
    """
    Get help information for Python topics
    """
    help_topics = {
        'print': {
            'signature': 'print(*values, sep=" ", end="\\n", file=sys.stdout, flush=False)',
            'description': 'Print values to a text stream, or to sys.stdout by default.',
            'example': 'print("Hello, World!")'
        },
        'range': {
            'signature': 'range(start, stop[, step])',
            'description': 'Create an arithmetic progression of integers.',
            'example': 'for i in range(5):\\n    print(i)'
        },
        'len': {
            'signature': 'len(obj)',
            'description': 'Return the length of an object.',
            'example': 'len([1, 2, 3])  # Returns 3'
        }
    }
    
    return help_topics.get(topic.lower(), {
        'signature': f'{topic}(...)',
        'description': f'Help for {topic} is not available.',
        'example': f'# Example usage of {topic}'
    })

def format_ide_breadcrumb(current_page, lesson_data=None):
    """
    Create IDE-style breadcrumb navigation
    """
    breadcrumbs = ['📁 Python Project']
    
    if current_page == 'dashboard':
        breadcrumbs.append('📊 dashboard.py')
    elif lesson_data:
        breadcrumbs.append(f'📁 {lesson_data.get("chapter", "lessons")}')
        breadcrumbs.append(f'🐍 {lesson_data.get("id", "lesson")}.py')
    
    return ' / '.join(breadcrumbs)
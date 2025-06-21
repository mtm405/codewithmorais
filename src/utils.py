# src/utils.py
from flask import request, session, g
from datetime import datetime
import re
from markupsafe import Markup
import random

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

    return dict(
        user_id=user_id, # Useful for frontend logic
        user_name=user_name,
        user_picture=user_picture,
        user_currency=user_currency, # Make currency available to templates
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
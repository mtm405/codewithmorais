# app.py
import os
from flask import Flask, render_template, session, url_for, redirect, request, jsonify, abort
import firebase_admin
from firebase_admin import credentials, firestore
import io
import contextlib
import requests
import markdown

# Import configuration and blueprints from src
from src.config import (
    SERVICE_ACCOUNT_KEY_PATH,
    FLASK_SECRET_KEY,
    FIREBASE_PROJECT_ID,
    FIREBASE_DATABASE_ID,
    PORT
)
from src.auth import auth_bp, init_db as init_auth_db
from src.routes import routes_bp, init_db as init_routes_db
from src.utils import set_css_version, inject_global_data, highlight_keywords

FIREBASE_CONFIG = {
    "apiKey": "AIzaSyCD4CfqILjDQ5Hj-CfoaSr92-Q8FOqFs0I",
    "authDomain": "sample-firebase-ai-app-66676.firebaseapp.com",
    "projectId": "sample-firebase-ai-app-66676",
    "storageBucket": "sample-firebase-ai-app-66676.firebasestorage.app",
    "messagingSenderId": "792515667615",
    "appId": "1:792515667615:web:60d86807d8103c02d2e4aa"
}

app = Flask(__name__)

# Register the highlight_keywords filter with Jinja
app.jinja_env.filters['highlight_keywords'] = highlight_keywords
# Register the markdown filter with Jinja
app.jinja_env.filters['markdown'] = lambda text: markdown.markdown(text)

def fetch_and_store_user_data(user_id):
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        session['user_title'] = user_data.get('user_title', 'Student')
        session['user_name'] = user_data.get('user_name', 'User')
        session['avatar_url'] = user_data.get('picture', url_for('static', filename='img/default_avatar.png'))
        session['user_currency'] = user_data.get('total_points', 0)
    else:
        session['user_title'] = 'Student'
        session['user_name'] = 'User'
        session['avatar_url'] = url_for('static', filename='img/default_avatar.png')
        session['user_currency'] = 0

@app.before_request
def load_user_data():
    user_id = session.get('user_id')
    if user_id:
        fetch_and_store_user_data(user_id)

@app.route('/')
def index():
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
    return render_template('index.html', google_client_id=google_client_id)

@app.route('/content/<page_name>')
def content_page(page_name):
    # Map pretty URLs to actual filenames in the content folder
    page_map = {
        'data_types': '1.1 Type Identification',
        'data_operations': '1.2 Data Manipulation',
        'operator_precedence': '1.3 Operator Precedence',
        'operator_selection': '1.4 Operator Selection',
        'branching': '2.1 Branching Statements',
        'iteration': '2.2 Loop Iteration',
        'file_io': '3.1 File Operations',
        'console_io': '3.2 Console IO',
        'documentation': '4.1 Code Documentation',
        'functions': '4.2 Function Definition',
        'fixing_errors': '5.1 Debugging Errors',
        'exceptions': '5.2 Exception Handling',
        'unit_testing': '5.3 Unit Testing',
        'system_modules': '6.1 System Modules',
        'problem_solving_modules': '6.2 Built-in Modules',
    }
    filename = page_map.get(page_name)
    if not filename:
        abort(404)
    return render_template(f'content/{filename}.html')

@app.route('/run_python', methods=['POST'])
def run_python():
    code = request.json.get('code', '')

    # Get the latest supported python version from Piston
    try:
        runtimes = requests.get('https://emkc.org/api/v2/piston/runtimes').json()
        python_runtime = next(rt for rt in runtimes if rt['language'] == 'python')
        version = python_runtime['version']
    except Exception as e:
        print("Failed to fetch Piston runtimes:", e)
        version = "3.10.0"  # fallback, may not work if not supported

    response = requests.post(
        'https://emkc.org/api/v2/piston/execute',
        json={
            "language": "python",
            "version": version,
            "files": [{"name": "main.py", "content": code}]
        }
    )
    print("Piston API status:", response.status_code)
    print("Piston API response:", response.text)
    if response.ok:
        result = response.json()
        # Use the 'output' field from the 'run' object for correct output
        output = result.get('run', {}).get('output', '')
    else:
        output = "Error contacting code execution server."
    return jsonify({'output': output})

@app.route('/api/time')
def get_online_time():
    """Fetch current UTC time from worldtimeapi.org and return as JSON."""
    try:
        response = requests.get('http://worldtimeapi.org/api/timezone/Etc/UTC')
        if response.ok:
            data = response.json()
            # Return ISO 8601 datetime string
            return jsonify({
                'utc_datetime': data.get('utc_datetime'),
                'unixtime': data.get('unixtime'),
                'raw': data
            })
        else:
            return jsonify({'error': 'Failed to fetch time from API.'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Set Flask secret key
app.secret_key = FLASK_SECRET_KEY

# Initialize Firebase Admin SDK and Firestore
db = None
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT_ID})

    db = firestore.client(database_id=FIREBASE_DATABASE_ID)
    print(f"DEBUG: Firebase Admin SDK initialized for backend, targeting '{FIREBASE_DATABASE_ID}' database.")

    # Pass Firestore client to blueprints
    init_auth_db(db)
    init_routes_db(db)
except FileNotFoundError:
    print("CRITICAL ERROR: serviceAccountKey.json not found. Please ensure it's in the root folder.")
    print("Firebase Admin SDK will not be initialized. Progress tracking and other Firebase features will fail.")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to initialize Firebase Admin SDK: {e}")
    db = None

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(routes_bp)

# Register global hooks
app.before_request(set_css_version)
app.context_processor(inject_global_data)

@app.context_processor
def inject_firebase_config():
    return dict(firebase_config=FIREBASE_CONFIG)

if __name__ == '__main__':
    app.run(debug=True, port=PORT)
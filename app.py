# app.py
import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, render_template, session, url_for, redirect, request, jsonify, abort, send_file
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
import io
import contextlib
import requests
import markdown
from datetime import datetime  # 🎪 For dazzling timestamps


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
from src.utils import set_css_version, inject_global_data, highlight_keywords, shuffle_filter, pygments_highlight
from src.dashboard_controller import dashboard_controller  # 🎪 DAZZLING DASHBOARD
from dev_data_loader import dev_data_loader  # 🎪 DEVELOPMENT DATA LOADER

import json

# Load Firebase Web config for frontend use
try:
    with open("firebase_web_config.json", "r") as f:
        FIREBASE_CONFIG = json.load(f)
except Exception:
    FIREBASE_CONFIG = {}

app = Flask(__name__)

# --- SESSION COOKIE SETTINGS FOR CLOUD RUN ---
app.config['SESSION_COOKIE_SECURE'] = True if os.environ.get('FLASK_ENV') == 'production' else False
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if os.environ.get('FLASK_ENV') == 'production' else 'Lax'

# Register the highlight_keywords filter with Jinja
app.jinja_env.filters['highlight_keywords'] = highlight_keywords
# Register the pygments_highlight filter with Jinja
app.jinja_env.filters['pygments_highlight'] = pygments_highlight
# Register the markdown filter with Jinja
app.jinja_env.filters['markdown'] = lambda text: markdown.markdown(text)
# Register the shuffle filter with Jinja
app.jinja_env.filters['shuffle'] = shuffle_filter
def zip_filter(a, b):
    return zip(a, b)
app.jinja_env.filters['zip'] = zip_filter

def fetch_and_store_user_data(user_id):
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        session['user_title'] = user_data.get('user_title', 'Student')
        session['user_name'] = user_data.get('user_name', 'User')
        session['avatar_url'] = user_data.get('picture', url_for('static', filename='img/default_avatar.png'))
        session['user_currency'] = user_data.get('currency', 0)
        session['is_admin'] = user_data.get('is_admin', False)  # Ensure admin status is in session
    else:
        session['user_title'] = 'Student'
        session['user_name'] = 'User'
        session['avatar_url'] = url_for('static', filename='img/default_avatar.png')
        session['user_currency'] = 0
        session['is_admin'] = False

@app.before_request
def load_user_data():
    # Debug: Print request headers and origin for troubleshooting
    print(f"[DEBUG] Request path: {request.path}")
    print(f"[DEBUG] Request method: {request.method}")
    print(f"[DEBUG] Request headers: {dict(request.headers)}")
    print(f"[DEBUG] Request origin: {request.headers.get('Origin')}")
    user_id = session.get('user_id')
    if user_id:
        fetch_and_store_user_data(user_id)

@app.route('/')
def index():
    # Check if user is already logged in, redirect to dashboard
    user_id = session.get('user_id')
    if user_id:
        return redirect(url_for('dashboard'))
    
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
    print(f"[DEBUG] GOOGLE_CLIENT_ID: {google_client_id}")
    print(f"[DEBUG] All environment variables containing 'GOOGLE':")
    for k, v in os.environ.items():
        if 'GOOGLE' in k:
            print(f"    {k} = {v}")
    return render_template('pages/index.html', google_client_id=google_client_id, firebase_config=FIREBASE_CONFIG)

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
    block_id = request.json.get('block_id', '')
    user_id = session.get('user_id')
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
        output = result.get('run', {}).get('output', '')
    else:
        output = "Error contacting code execution server."

    # Token award logic: Only award if code matches expected and not already rewarded
    awarded = False
    if user_id and block_id:
        # For demo: hardcode expected code for a block_id (replace with your logic)
        expected_code_map = {
            'try_hello_world': 'print("Hello, World!")',
            # Add more block_id: expected_code pairs as needed
        }
        expected_code = expected_code_map.get(block_id)
        if expected_code and code.strip() == expected_code.strip():
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            ide_rewards = user_doc.to_dict().get('ide_rewards', {})
            if not ide_rewards.get(block_id):
                user_ref.update({
                    'currency': firestore.Increment(5),
                    f'ide_rewards.{block_id}': True
                })
                session['user_currency'] = user_doc.to_dict().get('currency', 0) + 5
                awarded = True
    return jsonify({'output': output, 'awarded': awarded, 'currency': session.get('user_currency', 0)})

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

@app.route('/api/refresh_user_session', methods=['POST'])
def refresh_user_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    fetch_and_store_user_data(user_id)
    return jsonify({'success': True, 'user_name': session.get('user_name', 'User')})

@app.route('/api/get_user_info')
def get_user_info():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    user_data = user_doc.to_dict()
    return jsonify({
        'success': True,
        'user_name': user_data.get('user_name', 'User'),
        'currency': user_data.get('currency', 0),
        'user_title': user_data.get('user_title', 'Student'),
        'total_points': user_data.get('total_points', 0),
        'is_admin': user_data.get('is_admin', False)
    })

# --- SEARCH API ---
@app.route('/api/search')
def search():
    global db
    query = request.args.get('q', '').lower()
    results = []
    if db is None:
        return jsonify({'success': False, 'error': 'Database not initialized'}), 500
    lessons = db.collection('lessons').stream()
    for doc in lessons:
        data = doc.to_dict()
        if query in data.get('title', '').lower() or query in data.get('description', '').lower():
            results.append({
                'title': data.get('title'),
                'url': f"/lesson/{doc.id}",
                'description': data.get('description', '')
            })
    return jsonify({'success': True, 'results': results})

# --- NOTIFICATIONS API ---
@app.route('/api/notifications')
def notifications():
    global db
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    if db is None:
        return jsonify({'success': False, 'error': 'Database not initialized'}), 500
    notif_ref = db.collection('notifications').where('user_id', '==', user_id)
    notifications = []
    unread_count = 0
    for doc in notif_ref.stream():
        n = doc.to_dict()
        notifications.append({'id': doc.id, 'text': n['text'], 'read': n.get('read', False)})
        if not n.get('read', False):
            unread_count += 1
    return jsonify({'success': True, 'unread_count': unread_count, 'notifications': notifications})

@app.route('/api/notifications')
def get_notifications():
    # For demo: always return a notification for new daily challenge
    from datetime import datetime
    now = datetime.now()
    # Simulate a new challenge at 8AM every day
    if now.hour >= 8:
        return jsonify({
            "notifications": [
                {
                    "id": f"daily-challenge-{now.strftime('%Y-%m-%d')}",
                    "type": "daily_challenge",
                    "message": "A new Daily Challenge is available!",
                    "timestamp": now.isoformat()
                }
            ]
        })
    else:
        return jsonify({"notifications": []})

# --- MARK NOTIFICATION AS READ (OPTIONAL) ---
@app.route('/api/notifications/read', methods=['POST'])
def mark_notification_read():
    global db
    notif_id = request.json.get('id')
    user_id = session.get('user_id')
    if not notif_id or not user_id:
        return jsonify({'success': False, 'error': 'Missing notification ID or not logged in'}), 400
    if db is None:
        return jsonify({'success': False, 'error': 'Database not initialized'}), 500
    notif_doc = db.collection('notifications').document(notif_id)
    notif_doc.update({'read': True})
    return jsonify({'success': True})

@app.route('/sessionLogin', methods=['POST'])
def session_login():
    id_token = request.json.get('idToken')
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        user_email = decoded_token.get('email')
        user_name = decoded_token.get('name', user_email)
        # Set session info
        session['user_id'] = user_id
        session['user_email'] = user_email
        session['user_name'] = user_name
        # Optionally: fetch or create user doc in Firestore here
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 401

@app.route('/api/bellringer/today')
def get_bellringer_today():
    from datetime import datetime
    bellringers_ref = db.collection('bell_ringers')
    bellringers = [doc.to_dict() for doc in bellringers_ref.stream()]
    if not bellringers:
        return jsonify({'success': False, 'error': 'No bell ringers found'}), 404
    idx = datetime.utcnow().timetuple().tm_yday % len(bellringers)
    challenge = bellringers[idx]
    return jsonify({**challenge, 'success': True})

@app.route('/api/bellringer/submit', methods=['POST'])
def submit_bellringer():
    from datetime import datetime
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    data = request.get_json()
    code = data.get('code', '')
    challenge_id = data.get('challenge_id')
    if not challenge_id:
        return jsonify({'success': False, 'error': 'No challenge ID provided'}), 400
    # Fetch challenge from Firestore
    challenge_ref = db.collection('bell_ringers').document(challenge_id)
    challenge_doc = challenge_ref.get()
    if not challenge_doc.exists:
        return jsonify({'success': False, 'error': 'Challenge not found'}), 404
    challenge = challenge_doc.to_dict()
    test_cases = challenge.get('test_cases', [])
    points = challenge.get('points', 0)
    tokens = challenge.get('tokens', 0)
    # Check if already awarded today
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    daily_awards = user_doc.to_dict().get('bellringer_awards', {})
    if daily_awards.get(today_str) == challenge_id:
        # Fetch the points/tokens the user earned for this challenge (full or partial)
        # We'll assume full points/tokens if they completed it, otherwise partial if stored
        earned_points = 0
        earned_tokens = 0
        # Try to get the points/tokens from a user field (if you store per-day awards, update this logic)
        # For now, just return the challenge's points/tokens
        earned_points = points
        earned_tokens = tokens
        return jsonify({'success': True, 'output': 'Already completed today!', 'awarded': False, 'points': earned_points, 'tokens': earned_tokens})
    # Run code against all test cases using Piston
    passed = 0
    outputs = []
    for case in test_cases:
        input_data = case.get('input', '')
        expected = case.get('expected_output', '').strip()
        try:
            runtimes = requests.get('https://emkc.org/api/v2/piston/runtimes').json()
            python_runtime = next(rt for rt in runtimes if rt['language'] == 'python')
            version = python_runtime['version']
        except Exception as e:
            version = "3.10.0"
        response = requests.post(
            'https://emkc.org/api/v2/piston/execute',
            json={
                "language": "python",
                "version": version,
                "files": [{"name": "main.py", "content": code}],
                "stdin": input_data
            }
        )
        if response.ok:
            result = response.json()
            output = result.get('run', {}).get('output', '').strip()
            outputs.append({'input': input_data, 'expected': expected, 'output': output})
            if output == expected:
                passed += 1
        else:
            outputs.append({'input': input_data, 'expected': expected, 'output': 'Error'})
    # Award logic
    if passed == len(test_cases):
        # Full award
        user_ref.update({
            'currency': firestore.Increment(tokens),
            'points': firestore.Increment(points),
            'total_points': firestore.Increment(points),  # Ensure leaderboard updates
            f'bellringer_awards.{today_str}': challenge_id
        })
        return jsonify({'success': True, 'output': 'All test cases passed!', 'awarded': True, 'points': points, 'tokens': tokens})
    elif passed > 0:
        partial_points = int(points * passed / len(test_cases))
        user_ref.update({
            'points': firestore.Increment(partial_points),
            'total_points': firestore.Increment(partial_points),  # Ensure leaderboard updates
            f'bellringer_awards.{today_str}': challenge_id
        })
        return jsonify({'success': True, 'output': f'Passed {passed} of {len(test_cases)} test cases.', 'partial': True, 'partial_points': partial_points})
    else:
        return jsonify({'success': False, 'output': 'No test cases passed.', 'awarded': False})

@app.route('/api/bellringer/reset', methods=['POST'])
def reset_bellringer_award():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    user_ref = db.collection('users').document(user_id)
    user_ref.update({'bellringer_awards': {}})
    return jsonify({'success': True})

@app.route('/api/announcement', methods=['GET', 'POST'])
def announcement_api():
    import os
    ann_path = os.path.join(os.path.dirname(__file__), 'announcement.txt')
    if request.method == 'GET':
        try:
            with open(ann_path, 'r', encoding='utf-8') as f:
                text = f.read().strip()
            return jsonify({'success': True, 'announcement': text})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    elif request.method == 'POST':
        if not session.get('is_admin'):
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        data = request.get_json()
        new_text = data.get('announcement', '').strip()
        try:
            with open(ann_path, 'w', encoding='utf-8') as f:
                f.write(new_text)
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})

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

@app.context_processor
def inject_google_client_id():
    return dict(google_client_id=os.environ.get("GOOGLE_CLIENT_ID"))

@app.context_processor
def inject_user_stats():
    user_bytes = 0
    user_currency = 0
    user_id = session.get('user_id')
    if user_id:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            data = user_doc.to_dict()
            user_bytes = data.get('total_points', 0)
            user_currency = data.get('currency', 0)
    return dict(user_bytes=user_bytes, user_currency=user_currency)

@app.route('/api/daily_challenge/activities')
def get_daily_challenge_activities():
    try:
        print('DEBUG: Fetching bell_ringer activities from Firestore...')
        db = firestore.client()
        docs = db.collection('bell_ringer').stream()
        activities = []
        for doc in docs:
            data = doc.to_dict()
            print(f'DEBUG: Found activity: {data}')
            activities.append(data)
        print(f'DEBUG: Total activities fetched: {len(activities)}')
        return jsonify({"success": True, "activities": activities})
    except Exception as e:
        print(f'ERROR: Failed to fetch bell_ringer activities: {e}')
        return jsonify({"success": False, "error": str(e), "activities": []}), 500

@app.route('/ping')
def ping():
    return 'pong', 200

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
                'content': '# Debug Test\n\nThis is a simple test of code snippet rendering:'
            },
            {
                'type': 'code_snippet',
                'id': 'debug_snippet_1', 
                'code': 'print("Hello, World!")\n\n# Variables\nname = "Python"\nprint(f"Welcome to {name}!")'
            }
        ]
    }
    return render_template('pages/lesson.html', lesson=lesson_data, active_page='lessons')

@app.route('/dashboard')
def dashboard():
    """🎪 DAZZLING DASHBOARD - The ultimate interactive learning experience"""
    # Check if user is authenticated
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth_bp.login'))
    
    # Fetch user data and populate session if needed
    fetch_and_store_user_data(user_id)
    
    return render_template('pages/dashboard_course.html', active_page='dashboard')

@app.route('/dev-test')
def dev_test():
    """Development route to test sidebar and layout without authentication"""
    # Temporarily add mock data to session for this route only
    session['user_id'] = 'dev_user_123'
    session['user_name'] = 'Dev User'
    session['user_email'] = 'dev@example.com'
    session['user_points'] = 150
    session['user_currency'] = 25
    session['user_title'] = 'Developer'
    session['user_picture'] = url_for('static', filename='img/avatar1.png')
    
    return render_template('pages/dashboard_course.html', active_page='dashboard')

@app.route('/dev-dashboard')
def dev_dashboard():
    """🎪 DEVELOPMENT DASHBOARD - Shows real sample data for testing"""
    # Add mock session data for development
    session['user_id'] = 'dev_user_123'
    session['user_name'] = 'Dev Tester'
    session['user_email'] = 'dev@example.com'
    session['user_points'] = 1150
    session['user_currency'] = 425
    session['user_title'] = 'Python Explorer'
    session['user_picture'] = url_for('static', filename='img/avatar5.png')
    
    return render_template('pages/dev_dashboard.html', active_page='dashboard')

# Route for dashboard test page
@app.route('/dashboard_test')
def dashboard_test():
    return render_template('pages/dashboard_test.html')

# 🎪 DAZZLING DASHBOARD API ENDPOINTS - The most interactive learning experience ever!
# ==================================================================================

@app.route('/api/dashboard/leaderboard')
def api_dashboard_leaderboard():
    """Get real-time leaderboard data with rankings and badges"""
    try:
        period = request.args.get('period', 'weekly')  # daily, weekly, monthly, all_time
        limit = int(request.args.get('limit', 10))
        
        leaderboard_data = dashboard_controller.get_leaderboard(period=period, limit=limit)
        return jsonify({
            'success': True,
            'data': leaderboard_data,
            'period': period,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/daily_challenge')
def api_dashboard_daily_challenge():
    """Get today's daily challenge with progress tracking"""
    try:
        user_id = session.get('user_id')
        challenge_data = dashboard_controller.get_daily_challenge(user_id=user_id)
        return jsonify({
            'success': True,
            'data': challenge_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/daily_challenge/complete', methods=['POST'])
def api_dashboard_complete_challenge():
    """Mark daily challenge as completed and award rewards"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        data = request.get_json()
        challenge_id = data.get('challenge_id')
        points_earned = data.get('points_earned', 0)
        
        result = dashboard_controller.complete_daily_challenge(
            user_id=user_id,
            challenge_id=challenge_id,
            points_earned=points_earned
        )
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/notifications')
def api_dashboard_notifications():
    """Get user notifications with smart filtering"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 20))
        
        notifications = dashboard_controller.get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit
        )
        return jsonify({
            'success': True,
            'data': notifications,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/notifications/mark_read', methods=['POST'])
def api_dashboard_mark_notifications_read():
    """Mark notifications as read"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        data = request.get_json()
        notification_ids = data.get('notification_ids', [])
        
        result = dashboard_controller.mark_notifications_read(user_id=user_id, notification_ids=notification_ids)
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/activity_feed')
def api_dashboard_activity_feed():
    """Get personalized activity feed"""
    try:
        user_id = session.get('user_id')
        limit = int(request.args.get('limit', 15))
        
        activity_data = dashboard_controller.get_activity_feed(user_id=user_id, limit=limit)
        return jsonify({
            'success': True,
            'data': activity_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/user_stats')
def api_dashboard_user_stats():
    """Get comprehensive user statistics and analytics"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        stats = dashboard_controller.get_user_statistics(user_id=user_id)
        return jsonify({
            'success': True,
            'data': stats,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/gamification')
def api_dashboard_gamification():
    """Get user badges, achievements, and level progression"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        gamification_data = dashboard_controller.get_user_gamification(user_id=user_id)
        return jsonify({
            'success': True,
            'data': gamification_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard/add_activity', methods=['POST'])
def api_dashboard_add_activity():
    """Add new activity to user's feed"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        data = request.get_json()
        activity_type = data.get('activity_type')
        details = data.get('details', {})
        
        result = dashboard_controller.add_user_activity(
            user_id=user_id,
            activity_type=activity_type,
            details=details
        )
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================================================================================
# End of Dazzling Dashboard API Endpoints 🎪

# 🎪 DEVELOPMENT API ENDPOINTS - Sample Data for Testing
# ====================================================

@app.route('/api/dev/dashboard/leaderboard')
def api_dev_leaderboard():
    """Development endpoint - Get sample leaderboard data"""
    try:
        limit = int(request.args.get('limit', 10))
        leaderboard_data = dev_data_loader.get_dev_leaderboard(limit=limit)
        return jsonify({
            'success': True,
            'data': leaderboard_data,
            'dev_mode': True,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'dev_mode': True}), 500

@app.route('/api/dev/dashboard/daily_challenge')
def api_dev_daily_challenge():
    """Development endpoint - Get sample daily challenge"""
    try:
        challenge_data = dev_data_loader.get_dev_daily_challenge()
        return jsonify({
            'success': True,
            'data': challenge_data,
            'dev_mode': True,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'dev_mode': True}), 500

@app.route('/api/dev/dashboard/notifications')
def api_dev_notifications():
    """Development endpoint - Get sample notifications"""
    try:
        limit = int(request.args.get('limit', 5))
        notifications_data = dev_data_loader.get_dev_notifications(limit=limit)
        return jsonify({
            'success': True,
            'data': notifications_data,
            'dev_mode': True,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'dev_mode': True}), 500

@app.route('/api/dev/dashboard/activity_feed')
def api_dev_activity_feed():
    """Development endpoint - Get sample activity feed"""
    try:
        limit = int(request.args.get('limit', 10))
        activity_data = dev_data_loader.get_dev_activity_feed(limit=limit)
        return jsonify({
            'success': True,
            'data': activity_data,
            'dev_mode': True,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'dev_mode': True}), 500

@app.route('/api/dev/dashboard/user_stats')
def api_dev_user_stats():
    """Development endpoint - Get sample user statistics"""
    try:
        user_id = request.args.get('user_id', 'user_005')
        stats_data = dev_data_loader.get_dev_user_stats(user_id=user_id)
        return jsonify({
            'success': True,
            'data': stats_data,
            'dev_mode': True,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'dev_mode': True}), 500

@app.route('/api/dev/dashboard/all')
def api_dev_dashboard_all():
    """Get all development dashboard data in one call"""
    try:
        data = {
            'leaderboard': dev_data_loader.get_dev_leaderboard(10),
            'dailyChallenge': dev_data_loader.get_dev_daily_challenge(),
            'notifications': dev_data_loader.get_dev_notifications(5),
            'activityFeed': dev_data_loader.get_dev_activity_feed(8),
            'userStats': dev_data_loader.get_dev_user_stats(),
            'timestamp': datetime.now().isoformat(),
            'dataSource': 'development_mode'
        }
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.now().isoformat(),
            'mode': 'development'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Test route for IDE features
@app.route('/test-ide')
def test_ide():
    """Test page for IDE Command Center features"""
    return render_template('test_ide.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)
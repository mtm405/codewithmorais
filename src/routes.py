# src/routes.py
from flask import Blueprint, render_template, redirect, url_for, session, request, jsonify, current_app
import firebase_admin
import pytz
from firebase_admin import firestore
from firebase_admin.exceptions import FirebaseError
from datetime import datetime, timedelta
import traceback
import os
import json

# No need to import config if it's not directly used for variables in this file
# from .config import SERVICE_ACCOUNT_KEY_PATH, GOOGLE_CLIENT_ID, FIREBASE_PROJECT_ID, FIREBASE_DATABASE_ID

# Still need utils for context processor and active page
from .utils import get_active_page, set_css_version, inject_global_data

routes_bp = Blueprint('routes', __name__)

db = None

def init_db(app_db):
    global db
    db = app_db

@routes_bp.route('/api/daily_challenge')
def get_daily_challenge():
    eastern = pytz.timezone('America/New_York')
    now = datetime.now(eastern)
    today = now.strftime('%Y-%m-%d')
    hour = now.hour
    if hour < 8:
        today = (now - timedelta(days=1)).strftime('%Y-%m-%d')
    challenges = db.collection('daily_challenges').where('active_date', '==', today).stream()
    for challenge_doc in challenges:
        data = challenge_doc.to_dict()
        return jsonify({
            'challenge_id': data.get('challenge_id'),
            'title': data.get('title'),
            'description': data.get('description'),
            'difficulty': data.get('difficulty'),
            'test_cases': data.get('test_cases', [])
        })
    return jsonify({'error': 'No challenge for today'}), 404

@routes_bp.route('/api/submit_challenge', methods=['POST'])
def submit_challenge():
    if db is None:
        return jsonify({'error': 'Database not initialized'}), 500

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.get_json()
    code = data.get('code', '').strip()

    # Get today's challenge
    eastern = pytz.timezone('America/New_York')
    now = datetime.now(eastern)
    today = now.strftime('%Y-%m-%d')
    hour = now.hour
    if hour < 8:
        today = (now - timedelta(days=1)).strftime('%Y-%m-%d')

    challenges = db.collection('daily_challenges').where('active_date', '==', today).stream()
    challenge_doc = next(challenges, None)
    if not challenge_doc:
        return jsonify({'error': 'No challenge for today'}), 404

    challenge = challenge_doc.to_dict()
    test_cases = challenge.get('test_cases', [])
    function_name = "intToString"  # You may want to store this in Firestore for each challenge

    # Evaluate user code
    results = []
    all_passed = True
    error_message = None

    for case in test_cases:
        try:
            # Prepare the namespace for exec
            local_ns = {}
            exec(code, {}, local_ns)
            func = local_ns.get(function_name)
            if not func:
                all_passed = False
                results.append({'input': case['input'], 'passed': False, 'error': 'Function not defined'})
                continue
            output = func(case['input'])
            passed = str(output) == str(case['expected_output'])
            results.append({'input': case['input'], 'expected': case['expected_output'], 'output': output, 'passed': passed})
            if not passed:
                all_passed = False
        except Exception as e:
            all_passed = False
            results.append({'input': case['input'], 'passed': False, 'error': str(e)})
            error_message = traceback.format_exc()

    # Award points/currency if all test cases passed
    if all_passed:
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'points': firestore.Increment(challenge.get('points', 10)),
            'currency': firestore.Increment(challenge.get('currency', 5))
        })

    return jsonify({
        'correct': all_passed,
        'results': results,
        'error': error_message
    })

# --- Dashboard route ---
@routes_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        # Redirect to auth blueprint's index (login page)
        return redirect(url_for('auth.index'))
    return render_template('dashboard_course.html', active_page='dashboard')

# --- New Dashboard2 route ---
@routes_bp.route('/dashboard2')
def dashboard2():
    if 'user_id' not in session:
        return redirect(url_for('auth.index'))
    return render_template('dashboard2.html')

# --- API to fetch a user's progress for the dashboard ---
# Keeping this as it's general purpose for displaying user data on dashboard
@routes_bp.route('/api/user_progress', methods=['GET'])
def get_user_progress_api():
    if db is None:
        return jsonify({'message': 'Database not initialized'}), 500

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Authentication required. No user_id in session.'}), 401

    try:
        # Fetch all content once
        # This might still be useful if you plan to track user progress for SOME things,
        # even if not for specific topics/games directly routed.
        # If you truly only need dashboard, you might reconsider if this API is still relevant.
        all_content_docs = db.collection('content').stream()
        all_content = {doc.id: doc.to_dict() for doc in all_content_docs}

        # Fetch user's progress
        progress_docs = db.collection('user_progress').where('user_id', '==', user_id).stream()
        progress_list = []
        for doc in progress_docs:
            item = doc.to_dict()
            content_details = all_content.get(item.get('content_id'))
            if content_details:
                item['content_title'] = content_details.get('title', 'Unknown Content')
                item['content_type'] = content_details.get('type', 'Unknown Type')
            # Add a timestamp field for frontend sorting
            ts = None
            if 'last_updated' in item and hasattr(item['last_updated'], 'timestamp'):
                ts = int(item['last_updated'].timestamp() * 1000)
            elif 'completion_date' in item and hasattr(item['completion_date'], 'timestamp'):
                ts = int(item['completion_date'].timestamp() * 1000)
            item['timestamp'] = ts
            progress_list.append(item)

        return jsonify(progress_list), 200
    except FirebaseError as e:
        current_app.logger.error(f"Firebase error fetching user progress for {user_id}: {e}")
        return jsonify({'message': 'Database error while fetching progress'}), 500
    except Exception as e:
        current_app.logger.error(f"Error fetching user progress for {user_id}: {e}", exc_info=True)
        return jsonify({'message': 'Internal server error while fetching progress'}), 500

# --- API to update user progress ---
# Keeping this as it's general purpose for updating user data (e.g., currency, points)
@routes_bp.route('/api/update_progress', methods=['POST'])
def update_progress_api():
    if db is None:
        return jsonify({'message': 'Database not initialized'}), 500

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Authentication required. No user_id in session.'}), 401

    data = request.get_json()
    content_id = data.get('content_id') # Can be used for general "activities"
    status = data.get('status')
    score = data.get('score')
    points_earned = data.get('points_earned', 0)
    game_data = data.get('game_data')

    if not content_id or not status:
        return jsonify({'message': 'Missing content_id or status'}), 400

    progress_doc_id = f"{user_id}_{content_id}"
    progress_ref = db.collection('user_progress').document(progress_doc_id)

    update_data = {
        'user_id': user_id,
        'content_id': content_id,
        'status': status,
        'last_updated': firestore.SERVER_TIMESTAMP
    }
    if score is not None:
        update_data['score'] = score
    if game_data is not None:
        update_data['game_data'] = game_data
    if status in ['completed', 'passed', 'failed']:
        update_data['completion_date'] = firestore.SERVER_TIMESTAMP

    try:
        progress_ref.set(update_data, merge=True)

        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'currency': firestore.Increment(points_earned),
            'points': firestore.Increment(points_earned)
        })

        if 'user_currency' in session:
            session['user_currency'] += points_earned
        else:
            user_doc = user_ref.get()
            if user_doc.exists:
                session['user_currency'] = user_doc.to_dict().get('currency', 0)

        return jsonify({'message': 'Progress updated successfully', 'progress_id': progress_doc_id, 'new_currency': session.get('user_currency')}), 200
    except FirebaseError as e:
        current_app.logger.error(f"Firebase error updating progress for user {user_id}, content {content_id}: {e}")
        return jsonify({'message': 'Database error while updating progress'}), 500
    except Exception as e:
        current_app.logger.error(f"Error updating progress for user {user_id}, content {content_id}: {e}", exc_info=True)
        return jsonify({'message': 'Internal server error while updating progress'}), 500

# --- Leaderboard API Endpoint ---
# Keeping this for dashboard display
@routes_bp.route('/api/leaderboard')
def get_leaderboard():
    leaderboard_data = []
    current_user_uid = session.get('user_id')

    if db is None:
        current_app.logger.error("Firestore DB not initialized in get_leaderboard API.")
        return jsonify({"error": "Database not available"}), 500

    if 'user_id' not in session:
        current_app.logger.debug("Unauthorized access attempt to /api/leaderboard. No user_id in session.")
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    try:
        users_ref = db.collection('users').order_by('total_points', direction=firestore.Query.DESCENDING).limit(10)
        users = users_ref.stream()

        rank = 1
        for user_doc in users:
            user_data = user_doc.to_dict()
            if user_data:
                is_current_user = False
                if current_user_uid and user_doc.id == current_user_uid:
                    is_current_user = True

                leaderboard_data.append({
                    "rank": rank,
                    "username": user_data.get('name', 'Anonymous'),
                    "points": user_data.get('total_points', 0),
                    "is_current_user": is_current_user
                })
                rank += 1

        # --- Inject 3 fake users for UI testing ---
        fake_users = [
            {"rank": rank, "username": "TestUserA", "points": 1200, "is_current_user": False},
            {"rank": rank+1, "username": "TestUserB", "points": 1100, "is_current_user": False},
            {"rank": rank+2, "username": "TestUserC", "points": 1000, "is_current_user": False},
        ]
        leaderboard_data.extend(fake_users)

        return jsonify({"success": True, "leaderboard": leaderboard_data}), 200

    except FirebaseError as e:
        current_app.logger.error(f"Firebase error fetching leaderboard: {e}")
        return jsonify({"success": False, "error": "Failed to fetch leaderboard", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Error fetching leaderboard: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Failed to fetch leaderboard", "details": str(e)}), 500

# REMOVED: All specific topic routes
# REMOVED: Vocabulary page route
# REMOVED: Flashcards page route
# REMOVED: Dynamic game route (if you don't need general /game/<name> routing)

# If you have NO other routes in this blueprint besides dashboard and the APIs,
# you can remove these last two routes.
# @routes_bp.route('/game/<game_name>')
# def view_game(game_name):
#     if 'user_id' not in session:
#         return redirect(url_for('auth.index'))
#     template_path = f'games/{game_name}.html'
#     content_id = f"game_{game_name}"
#     return render_template(template_path, active_page='games', content_id=content_id)

@routes_bp.route('/store')
def store():
    user_currency = session.get('user_currency', 0)
    return render_template('store.html', user_currency=user_currency)

@routes_bp.route('/data-types')
def data_types():
    if 'user_id' not in session:
        return redirect(url_for('auth.index'))
    return render_template('data_types.html', active_page='data_types')

@routes_bp.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('auth.index'))
    user_id = session.get('user_id')
    user = db.collection('users').document(user_id).get().to_dict() if db else {}
    return render_template('profile.html', user=user)

@routes_bp.route('/lesson/<lesson_id>')
def lesson(lesson_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.index'))
    lesson_data = None
    # Try to load from local file if it exists
    local_path = os.path.join('lessons', f'{lesson_id}.json')
    try:
        if os.path.exists(local_path):
            with open(local_path, 'r', encoding='utf-8') as f:
                lesson_data = json.load(f)
        else:
            # Fallback to Firestore if not found locally
            if db:
                doc = db.collection('lessons').document(lesson_id).get()
                if doc.exists:
                    lesson_data = doc.to_dict()
        # Ensure lesson_data has an 'id' field for template logic
        if lesson_data is not None:
            lesson_data['id'] = lesson_id
        # --- Normalization logic for Firestore/JSON lesson blocks ---
        def normalize_blocks(blocks, parent_type=None):
            if not isinstance(blocks, list):
                return
            for block in blocks:
                # If block is a quiz_section, normalize its inner blocks recursively
                if block.get('type') == 'quiz_section' and 'content' in block and 'blocks' in block['content']:
                    normalize_blocks(block['content']['blocks'], parent_type='quiz_section')
                # If block is a comprehensive_quiz, normalize its nested questions recursively
                elif block.get('type') == 'comprehensive_quiz' and 'questions' in block and isinstance(block['questions'], list):
                    normalize_blocks(block['questions'], parent_type='comprehensive_quiz')
                # --- Unified normalization for fill-in-the-blank (single only) ---
                # Skip normalization for comprehensive_quiz blocks
                if block.get('type') in ['fill_in_the_blank', 'fill_in_blank', 'fill_in_the_blanks'] and block.get('type') != 'comprehensive_quiz':
                    # Always use 'fill_in_the_blank' as the type (single only)
                    block['type'] = 'fill_in_the_blank'
                    # Convert any legacy or multi-question fields to a single question
                    if 'questions' in block and isinstance(block['questions'], list) and block['questions']:
                        q = block['questions'][0]
                        block['question'] = q.get('text') or q.get('question', '')
                        block['answers'] = q.get('answers', [])
                    elif 'question' in block and 'answers' in block:
                        # Already single
                        pass
                    else:
                        block['question'] = ''
                        block['answers'] = []
                    # Remove questions array if present (but not for comprehensive_quiz parents)
                    if parent_type != 'comprehensive_quiz':
                        block.pop('questions', None)
                # --- End fill-in-the-blank normalization ---

                # --- Unified normalization for drag-and-drop ---
                if block.get('type') in ['drag_and_drop', 'dragdrop', 'drag_drop']:
                    block['type'] = 'drag_and_drop'
                    # Ensure pairs is a list of objects with 'left' and 'right'
                    if 'pairs' in block and isinstance(block['pairs'], list):
                        block['pairs'] = [
                            {'left': p.get('left'), 'right': p.get('right')} for p in block['pairs']
                        ]
                # --- End drag-and-drop normalization ---
        # Call normalization on all top-level blocks
        if lesson_data and 'blocks' in lesson_data and isinstance(lesson_data['blocks'], list):
            normalize_blocks(lesson_data['blocks'])
            # Debug: Log block types
            current_app.logger.info(f"Lesson {lesson_id} blocks: {[block.get('type', 'unknown') for block in lesson_data['blocks']]}")
    except Exception as e:
        current_app.logger.error(f"Error loading or normalizing lesson {lesson_id}: {e}", exc_info=True)
        return ("Lesson could not be loaded due to an internal error.", 500)

    if not lesson_data:
        return ("Lesson not found", 404) if request.args.get('ajax') else render_template('lesson.html', lesson=None, active_page='lessons')

    # AJAX: If ?ajax=1, return only the lesson content HTML (not the full page)
    if request.args.get('ajax'):
        return render_template('partials/lesson_content.html', lesson=lesson_data)

    # Map lesson_id to active_page for sidebar highlighting
    lesson_to_active = {
        'lesson_1_1': 'python-basics',
        'lesson_1_2': 'python-basics',
        'lesson_1_3': 'python-basics',
        'lesson_1_4': 'python-basics',
        'lesson_2_1': 'flow-control',
        'lesson_2_2': 'flow-control',
        'lesson_3_1': 'io-operations',
        'lesson_3_2': 'io-operations',
        'lesson_4_1': 'code-structure',
        'lesson_5_1': 'error-handling',
        'lesson_5_2': 'error-handling',
        'lesson_5_3': 'error-handling',
        'lesson_6_1': 'module-operations',
        'lesson_6_2': 'module-operations',
    }
    active_page = lesson_to_active.get(lesson_id, 'lessons')
    return render_template('lesson.html', lesson=lesson_data, active_page=active_page)

from datetime import datetime
from firebase_admin import firestore

# --- API to get the most current currency value from Firestore ---
@routes_bp.route('/api/get_currency', methods=['GET'])
def get_currency():
    if db is None:
        return jsonify({'error': 'Database not initialized'}), 500
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    currency = user_doc.to_dict().get('currency', 0) if user_doc.exists else 0
    session['user_currency'] = currency
    return jsonify({'currency': currency})

@routes_bp.route('/api/daily_login', methods=['POST'])
def daily_login():
    if db is None:
        return jsonify({'error': 'Database not initialized'}), 500
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    last_token_login = ''
    if user_doc.exists:
        last_token_login = user_doc.to_dict().get('last_token_login', '')
    if last_token_login == today_str:
        # Always fetch and return the most current value
        user_doc = user_ref.get()
        currency = user_doc.to_dict().get('currency', 0) if user_doc.exists else 0
        session['user_currency'] = currency
        return jsonify({'awarded': False, 'currency': currency})
    # Award tokens
    user_ref.update({
        'currency': firestore.Increment(10),
        'last_token_login': today_str
    })
    # Fetch the updated value
    user_doc = user_ref.get()
    currency = user_doc.to_dict().get('currency', 0) if user_doc.exists else 0
    session['user_currency'] = currency
    return jsonify({'awarded': True, 'currency': currency})

# --- IDE Code Run Token Award Endpoint ---
@routes_bp.route('/api/award_ide_token', methods=['POST'])
def award_ide_token():
    if db is None:
        return jsonify({'error': 'Database not initialized'}), 500
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.get_json()
    block_id = data.get('block_id')
    code = data.get('code', '').strip()
    # Define expected code for each block_id (expand as needed)
    expected_code_map = {
        'try_hello_world': 'print("Hello, World!")',
        # Add more block_id: expected_code pairs as needed
    }
    expected_code = expected_code_map.get(block_id)
    if not expected_code or code != expected_code:
        # Always fetch and return the most current value
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        currency = user_doc.to_dict().get('currency', 0) if user_doc.exists else 0
        session['user_currency'] = currency
        return jsonify({'awarded': False, 'currency': currency})
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    ide_rewards = user_doc.to_dict().get('ide_rewards', {})
    if ide_rewards.get(block_id):
        currency = user_doc.to_dict().get('currency', 0) if user_doc.exists else 0
        session['user_currency'] = currency
        return jsonify({'awarded': False, 'currency': currency})
    user_ref.update({
        'currency': firestore.Increment(5),
        f'ide_rewards.{block_id}': True
    })
    # Fetch the updated value
    user_doc = user_ref.get()
    currency = user_doc.to_dict().get('currency', 0) if user_doc.exists else 0
    session['user_currency'] = currency
    return jsonify({'awarded': True, 'currency': currency})

# --- API to provide the most recently completed and next topic for the user ---
@routes_bp.route('/api/whats_next', methods=['GET'])
def get_whats_next():
    if db is None:
        return jsonify({'message': 'Database not initialized'}), 500

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Authentication required. No user_id in session.'}), 401

    # Fetch all topics/lessons ordered by 'order' field
    all_content_docs = db.collection('content').order_by('order').stream()
    all_content = [doc.to_dict() for doc in all_content_docs]

    # Fetch user's completed progress
    progress_docs = db.collection('user_progress').where('user_id', '==', user_id).where('status', '==', 'completed').stream()
    completed_ids = set(doc.to_dict().get('content_id') for doc in progress_docs)

    # Find the most recent completed topic (by order)
    last_completed = None
    for content in all_content:
        if content.get('id') in completed_ids:
            last_completed = content

    # Find the next topic
    next_topic = None
    found_last = False
    for content in all_content:
        if found_last:
            next_topic = content
            break
        if last_completed and content.get('id') == last_completed.get('id'):
            found_last = True

    return jsonify({
        'last_completed': last_completed,
        'next_topic': next_topic
    }), 200

@routes_bp.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect(url_for('routes.index'))

@routes_bp.route('/api/daily_challenge/activities')
def get_daily_challenge_activities():
    """Return all daily challenge activities from the daily_challenge collection."""
    if db is None:
        return jsonify({'error': 'Database not initialized'}), 500
    try:
        docs = db.collection('daily_challenge').stream()
        activities = [doc.to_dict() for doc in docs]
        return jsonify({'success': True, 'activities': activities})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'trace': traceback.format_exc()}), 500

@routes_bp.route('/api/daily_challenge/submit', methods=['POST'])
def submit_daily_challenge():
    if db is None:
        return jsonify({'success': False, 'error': 'Database not initialized'}), 500
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    data = request.get_json()
    code = data.get('code', '')
    challenge_id = data.get('challenge_id')
    dev = data.get('dev', 0)
    if not challenge_id:
        return jsonify({'success': False, 'error': 'No challenge ID provided'}), 400
    # Fetch challenge from Firestore
    challenge_ref = db.collection('daily_challenge').document(challenge_id)
    challenge_doc = challenge_ref.get()
    if not challenge_doc.exists:
        return jsonify({'success': False, 'error': 'Challenge not found'}), 404
    challenge = challenge_doc.to_dict()
    test_cases = challenge.get('test_cases', [])
    points = challenge.get('points', 10)
    tokens = challenge.get('tokens', 5)
    from datetime import datetime, timedelta
    import pytz
    eastern = pytz.timezone('America/New_York')
    now = datetime.now(eastern)
    today_str = now.strftime('%Y-%m-%d')
    hour = now.hour
    if hour < 8:
        today_str = (now - timedelta(days=1)).strftime('%Y-%m-%d')
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    daily_awards = user_doc.to_dict().get('daily_challenge_awards', {})
    # Lock logic: only allow one try per day unless dev override
    if not dev and daily_awards.get(today_str) == challenge_id:
        return jsonify({'success': False, 'output': 'Already attempted today! Try again after 8 AM tomorrow.'})
    # Run code against all test cases using Piston
    passed = 0
    outputs = []
    for case in test_cases:
        input_data = case.get('input', '')
        expected = case.get('output', '').strip()
        try:
            import requests
            runtimes = requests.get('https://emkc.org/api/v2/piston/runtimes').json()
            python_runtime = next(rt for rt in runtimes if rt['language'] == 'python')
            version = python_runtime['version']
        except Exception:
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
    if passed == len(test_cases) and len(test_cases) > 0:
        user_ref.update({
            'currency': firestore.Increment(tokens),
            'points': firestore.Increment(points),
            'total_points': firestore.Increment(points),
            f'daily_challenge_awards.{today_str}': challenge_id
        })
        return jsonify({'success': True, 'output': 'All test cases passed!', 'awarded': True, 'points': points, 'tokens': tokens})
    else:
        # Lock for today
        user_ref.update({
            f'daily_challenge_awards.{today_str}': challenge_id
        })
        return jsonify({'success': False, 'output': f'Passed {passed} of {len(test_cases)} test cases. Try again tomorrow.'})

@routes_bp.route('/api/quiz/submit', methods=['POST'])
def submit_quiz_result():
    if db is None:
        return jsonify({'success': False, 'error': 'Database not initialized'}), 500
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    data = request.get_json()
    question_id = data.get('question_id')
    is_correct = data.get('correct', False)
    points = int(data.get('points', 0))
    currency = int(data.get('currency', 0))
    answer = data.get('answer')
    if not question_id:
        return jsonify({'success': False, 'error': 'No question ID provided'}), 400
    # Track per-question progress
    progress_doc_id = f"{user_id}_{question_id}"
    progress_ref = db.collection('user_progress').document(progress_doc_id)
    update_data = {
        'user_id': user_id,
        'content_id': question_id,
        'status': 'completed' if is_correct else 'attempted',
        'score': 1 if is_correct else 0,
        'last_updated': firestore.SERVER_TIMESTAMP,
        'answer': answer
    }
    if is_correct:
        update_data['completion_date'] = firestore.SERVER_TIMESTAMP
    try:
        progress_ref.set(update_data, merge=True)
        user_ref = db.collection('users').document(user_id)
        # Only award points/currency if correct
        if is_correct:
            user_ref.update({
                'currency': firestore.Increment(currency),
                'points': firestore.Increment(points),
                'total_points': firestore.Increment(points)
            })
            # Update session for instant feedback (legacy and new)
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                session['user_currency'] = user_data.get('currency', 0)
                session['user_points'] = user_data.get('points', 0)
                # Set both for compatibility
                session['avatar_url'] = user_data.get('picture', url_for('static', filename='img/default_avatar.png'))
                session['user_picture'] = user_data.get('picture', url_for('static', filename='img/default_avatar.png'))
        # Fetch updated user doc for return
        user_doc = user_ref.get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        return jsonify({
            'success': True,
            'points': user_data.get('points', 0),
            'currency': user_data.get('currency', 0),
            'total_points': user_data.get('total_points', 0)
        })
    except Exception as e:
        current_app.logger.error(f"Error updating quiz progress for user {user_id}, question {question_id}: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500

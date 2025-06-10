# src/routes.py
from flask import Blueprint, render_template, redirect, url_for, session, request, jsonify, current_app
import firebase_admin
import pytz
from firebase_admin import firestore
from firebase_admin.exceptions import FirebaseError
from datetime import datetime, timedelta
import traceback

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
            'total_points': firestore.Increment(challenge.get('points', 10)),
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
    return render_template('dashboard.html')

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
            'total_points': firestore.Increment(points_earned),
            'currency': firestore.Increment(points_earned)
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
    try:
        if db:
            doc = db.collection('lessons').document(lesson_id).get()
            if doc.exists:
                lesson_data = doc.to_dict()
        # Optional fallback/local data example (if Firestore is not ready)
        if not lesson_data:
            # Example local fallback for lesson 1
            if lesson_id == "1":
                lesson_data = {
                    "title": "Lesson 1: Python Data Types",
                    "blocks": [
                        {
                            "type": "text",
                            "content": "<p>Python has several basic data types including <strong>str</strong>, <strong>int</strong>, <strong>float</strong>, and <strong>bool</strong>.</p>"
                        },
                        {
                            "type": "fill_in_the_blank",
                            "prompt": "Fill in the blank: A whole number is called an ____.",
                            "answer": "int"
                        },
                        {
                            "type": "multiple_choice",
                            "question": "Which data type would you use to represent True or False?",
                            "options": ["str", "bool", "int", "float"],
                            "correct": "bool"
                        },
                        {
                            "type": "drag_and_drop",
                            "instructions": "Match the data type to its example.",
                            "pairs": [
                                {"left": "str", "right": "'Hello'"},
                                {"left": "int", "right": "42"},
                                {"left": "float", "right": "3.14"},
                                {"left": "bool", "right": "True"}
                            ]
                        },
                        {
                            "type": "ide",
                            "instructions": "Try assigning different values to variables in the editor below:",
                            "default_code": "# Assign variables\nname = 'Alice'\nage = 20\nheight = 5.7\nis_student = True\n\nprint(name, age, height, is_student)"
                        }
                    ]
                }
        # --- Normalization logic for Firestore/JSON lesson blocks ---
        if lesson_data and 'blocks' in lesson_data:
            for block in lesson_data['blocks']:
                # Normalize fill_in_the_blank
                if block.get('type') == 'fill_in_the_blank':
                    if 'prompt' not in block and 'question' in block:
                        block['prompt'] = block['question']
                    if 'answer' not in block and 'answers' in block:
                        block['answer'] = block['answers'][0] if block['answers'] else ''
                # Normalize multiple_choice
                if block.get('type') == 'multiple_choice':
                    if 'correct' not in block:
                        if 'correct_index' in block and 'options' in block:
                            idx = block['correct_index']
                            block['correct'] = block['options'][idx] if idx < len(block['options']) else ''
                # Normalize drag_and_drop
                if block.get('type') == 'drag_and_drop':
                    if 'pairs' not in block and 'items' in block:
                        block['pairs'] = [{ 'left': item['name'], 'right': item['match'] } for item in block['items']]
    except Exception as e:
        current_app.logger.error(f"Error fetching lesson {lesson_id}: {e}")
        lesson_data = None

    if not lesson_data:
        return "Lesson not found", 404

    return render_template('lesson.html', lesson=lesson_data, active_page='lessons')

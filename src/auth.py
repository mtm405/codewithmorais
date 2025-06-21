# src/auth.py
from flask import Blueprint, render_template, redirect, url_for, session, request, jsonify, current_app
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from firebase_admin import firestore  # Make sure this import is present
import os

auth_bp = Blueprint('auth', __name__)

db = None  # Global Firestore client instance

def init_db(app_db):
    """Initializes the Firestore database client for the blueprint."""
    global db
    db = app_db
    print("DEBUG: Firestore DB initialized in auth.py blueprint.")

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@auth_bp.route('/auth', methods=['POST'])
def authenticate():
    token = request.form.get('credential')
    login_time = request.form.get('login_time')  # Get the online time from the request
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    print("DEBUG: Received token:", token[:30], "...")
    print("DEBUG: Using client ID:", client_id)
    print("DEBUG: Received login_time from client:", login_time)  # Debug print
    try:
        # Verify the ID token with Google
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

        user_id = idinfo['sub']
        user_email = idinfo.get('email')
        user_name = idinfo.get('name', user_email)  # Use email as name if name not provided

        # Store or update user info in Firestore
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            # User exists, update all relevant fields but keep existing values for currency, total_points, user_title, is_admin, created_at
            first_name = user_name.split(' ')[0] if user_name else ''
            existing = user_doc.to_dict()
            user_ref.update({
                'email': user_email,
                'name': user_name,
                'user_name': first_name,
                'last_login': firestore.SERVER_TIMESTAMP,
                'last_login_online_time': login_time,
                'picture': idinfo.get('picture', ''),
                'created_at': existing.get('created_at', firestore.SERVER_TIMESTAMP),
                'currency': existing.get('currency', 10),
                'user_title': existing.get('user_title', 'Newbie'),
                'total_points': existing.get('total_points', 0),
                'is_admin': existing.get('is_admin', False),
            })
        else:
            # New user, create document with all required fields
            first_name = user_name.split(' ')[0] if user_name else ''
            user_ref.set({
                'email': user_email,
                'name': user_name,
                'user_name': first_name,
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_login': firestore.SERVER_TIMESTAMP,
                'last_login_online_time': login_time,
                'currency': 10,
                'user_title': 'Newbie',
                'total_points': 0,
                'is_admin': False,
                'picture': idinfo.get('picture', ''),
            })

        # Set session with first name
        session['user_id'] = user_id
        session['user_email'] = user_email
        session['user_name'] = first_name

        return jsonify({'success': True, 'redirect': url_for('routes.dashboard')})
    except Exception as e:
        print(f"ERROR in /auth: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/')
def index():
    return redirect(url_for('index'))
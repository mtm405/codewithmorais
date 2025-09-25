# src/config.py
import os
import json
from dotenv import load_dotenv

load_dotenv()

# --- Firebase Service Account Key Path ---
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"

# Load service account key to get project_id for explicit initialization
try:
    with open(SERVICE_ACCOUNT_KEY_PATH, 'r') as f:
        service_account_info = json.load(f)
    FIREBASE_PROJECT_ID = service_account_info.get('project_id')
    if not FIREBASE_PROJECT_ID:
        raise ValueError("Project ID not found in serviceAccountKey.json")
    print(f"DEBUG: Project ID from serviceAccountKey.json: {FIREBASE_PROJECT_ID}")
except FileNotFoundError:
    print(f"CRITICAL ERROR: {SERVICE_ACCOUNT_KEY_PATH} not found.")
    FIREBASE_PROJECT_ID = None
except json.JSONDecodeError:
    print(f"CRITICAL ERROR: {SERVICE_ACCOUNT_KEY_PATH} is not a valid JSON file.")
    FIREBASE_PROJECT_ID = None
except ValueError as e:
    print(f"CRITICAL ERROR: {e}")
    FIREBASE_PROJECT_ID = None


# --- Flask Secret Key ---
FLASK_SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'a_very_strong_fallback_secret_key_for_dev_if_missing')
print(f"DEBUG: Flask Secret Key loaded: {FLASK_SECRET_KEY[:5]}... (showing first 5 chars)")


# --- Google OAuth Configuration ---
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

if not GOOGLE_CLIENT_ID:
    print("CRITICAL ERROR: GOOGLE_CLIENT_ID is not set in environment variables.")
    raise ValueError("GOOGLE_CLIENT_ID not found in environment variables. Please ensure it's set in your .env file.")
else:
    print(f"DEBUG: GOOGLE_CLIENT_ID loaded: {GOOGLE_CLIENT_ID[:10]}...{GOOGLE_CLIENT_ID[-10:]}\n")

# --- Firestore Database ID ---
FIREBASE_DATABASE_ID = "(default)" # Or whatever your specific database ID is

# --- Application Port ---
PORT = int(os.environ.get('PORT', 8080)) # Get PORT from .env, default to 5000
import firebase_admin
from firebase_admin import credentials, firestore
import json

# Path to your Firebase service account key
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

with open('daily_challenge.json', 'r') as f:
    challenges = json.load(f)

for challenge in challenges:
    doc_ref = db.collection('daily_challenge').document(challenge['id'])
    doc_ref.set(challenge)

print("Daily challenges uploaded successfully!")

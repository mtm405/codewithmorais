import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

# Usage: python upload_lesson.py lessons/lesson_1_1.json lesson_1_1
if len(sys.argv) != 3:
    print("Usage: python upload_lesson.py <lesson_json_path> <doc_id>")
    sys.exit(1)

json_path = sys.argv[1]
doc_id = sys.argv[2]

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

with open(json_path, "r", encoding="utf-8") as file:
    lesson = json.load(file)

db.collection("lessons").document(doc_id).set(lesson)
print(f"✅ Uploaded: {doc_id}")

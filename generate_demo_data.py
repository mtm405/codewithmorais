#!/usr/bin/env python3
"""
Demo Data Generator for Student Dashboard
This script creates sample user progress data for testing the dashboard
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime, timedelta
import random

def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Try to use existing app
        app = firebase_admin.get_app()
        print("Using existing Firebase app")
    except ValueError:
        # Initialize new app
        if not os.path.exists('firebase-service-account.json'):
            print("Error: firebase-service-account.json not found")
            print("Please download your Firebase service account key and save it as 'firebase-service-account.json'")
            return None
        
        cred = credentials.Certificate('firebase-service-account.json')
        app = firebase_admin.initialize_app(cred)
        print("Initialized new Firebase app")
    
    return firestore.client()

def create_demo_user_data(db, user_id="demo-student-123"):
    """Create demo user profile data"""
    user_data = {
        'name': 'Alex Johnson',
        'email': 'alex.johnson@example.com',
        'user_title': 'Python Explorer',
        'currency': 85,
        'points': 340,
        'picture': '',
        'created_at': firestore.SERVER_TIMESTAMP,
        'last_login': firestore.SERVER_TIMESTAMP,
        'is_admin': False
    }
    
    db.collection('users').document(user_id).set(user_data)
    print(f"Created demo user: {user_data['name']}")
    return user_data

def create_demo_progress_data(db, user_id="demo-student-123"):
    """Create demo progress data for lessons"""
    
    lessons = [
        {'id': 'lesson_1_1', 'title': 'Variables & Data Types', 'status': 'completed', 'points': 25},
        {'id': 'lesson_1_2', 'title': 'Working with Numbers', 'status': 'completed', 'points': 30},
        {'id': 'lesson_1_3', 'title': 'String Operations', 'status': 'completed', 'points': 35},
        {'id': 'lesson_1_4', 'title': 'Boolean Logic', 'status': 'in_progress', 'points': 15},
        {'id': 'lesson_2_1', 'title': 'If Statements', 'status': 'not_started', 'points': 0},
        {'id': 'lesson_2_2', 'title': 'Loops & Iteration', 'status': 'not_started', 'points': 0},
        {'id': 'lesson_3_1', 'title': 'Functions Basics', 'status': 'not_started', 'points': 0},
        {'id': 'lesson_3_2', 'title': 'Advanced Functions', 'status': 'not_started', 'points': 0},
        {'id': 'lesson_4_1', 'title': 'Problem Solving', 'status': 'not_started', 'points': 0},
    ]
    
    progress_items = []
    base_time = datetime.now() - timedelta(days=7)
    
    for i, lesson in enumerate(lessons):
        if lesson['status'] != 'not_started':
            # Create timestamps for activity
            started_time = base_time + timedelta(days=i, hours=random.randint(1, 3))
            updated_time = started_time + timedelta(hours=random.randint(1, 4))
            
            progress_data = {
                'user_id': user_id,
                'content_id': lesson['id'],
                'content_title': lesson['title'],
                'content_type': 'lesson',
                'status': lesson['status'],
                'points_earned': lesson['points'],
                'score': random.randint(80, 100) if lesson['status'] == 'completed' else random.randint(60, 90),
                'started_at': started_time,
                'last_updated': updated_time,
                'completion_date': updated_time if lesson['status'] == 'completed' else None
            }
            
            # Add to Firestore
            doc_id = f"{user_id}_{lesson['id']}"
            db.collection('user_progress').document(doc_id).set(progress_data)
            progress_items.append(progress_data)
            print(f"Created progress for {lesson['title']}: {lesson['status']}")
    
    return progress_items

def create_demo_activities(db, user_id="demo-student-123"):
    """Create demo activity data"""
    activities = [
        {
            'user_id': user_id,
            'activity_type': 'lesson_completed',
            'content_id': 'lesson_1_3',
            'title': 'Completed String Operations',
            'description': 'Successfully finished lesson on string manipulation',
            'points_earned': 35,
            'timestamp': datetime.now() - timedelta(hours=2)
        },
        {
            'user_id': user_id,
            'activity_type': 'lesson_started',
            'content_id': 'lesson_1_4',
            'title': 'Started Boolean Logic',
            'description': 'Began learning about boolean values and logical operations',
            'points_earned': 0,
            'timestamp': datetime.now() - timedelta(hours=5)
        },
        {
            'user_id': user_id,
            'activity_type': 'achievement_unlocked',
            'content_id': 'first_lesson_achievement',
            'title': 'First Steps Achievement Unlocked!',
            'description': 'Completed your first lesson',
            'points_earned': 10,
            'timestamp': datetime.now() - timedelta(days=2)
        }
    ]
    
    for activity in activities:
        doc_id = f"{user_id}_{activity['activity_type']}_{int(activity['timestamp'].timestamp())}"
        db.collection('activities').document(doc_id).set(activity)
        print(f"Created activity: {activity['title']}")
    
    return activities

def main():
    """Main function to generate demo data"""
    print("🚀 Generating demo data for Student Dashboard...")
    
    # Initialize Firebase
    db = init_firebase()
    if not db:
        return
    
    # Demo user ID (you can change this)
    demo_user_id = "demo-student-123"
    
    try:
        # Create demo user
        user_data = create_demo_user_data(db, demo_user_id)
        
        # Create demo progress
        progress_data = create_demo_progress_data(db, demo_user_id)
        
        # Create demo activities
        activities = create_demo_activities(db, demo_user_id)
        
        print("\n✅ Demo data generated successfully!")
        print(f"📊 Created user: {user_data['name']}")
        print(f"📚 Created {len(progress_data)} lesson progress records")
        print(f"🎯 Created {len(activities)} activity records")
        
        print(f"\n🔑 Demo User ID: {demo_user_id}")
        print("You can use this user ID to test the dashboard APIs")
        
        print("\n📋 Next steps:")
        print("1. Update your Flask session to use this demo user ID")
        print("2. Visit /test-dashboard-api.html to test the APIs")
        print("3. Visit your student dashboard to see the real data")
        
    except Exception as e:
        print(f"❌ Error generating demo data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
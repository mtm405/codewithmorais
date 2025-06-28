#!/usr/bin/env python3
"""
🎪 DASHBOARD INTEGRATION - Connect Flask App to Firebase Dashboard
Seamlessly integrates existing Flask routes with dazzling dashboard data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Blueprint, jsonify, request, session
from dashboard_controller import dashboard_controller
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'src'))
from auth import require_auth
import logging
from datetime import datetime
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create dashboard blueprint
dashboard_api = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

# 🎪 DASHBOARD DATA ENDPOINTS

@dashboard_api.route('/data', methods=['GET'])
@require_auth
def get_dashboard_data():
    """Get complete dashboard data for current user"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401
            
        # Get comprehensive dashboard data
        dashboard_data = dashboard_controller.get_dashboard_data(user_id)
        
        if 'error' in dashboard_data:
            return jsonify({'error': dashboard_data['error']}), 500
            
        return jsonify({
            'success': True,
            'data': dashboard_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Dashboard data fetch failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

@dashboard_api.route('/leaderboard', methods=['GET'])
@require_auth  
def get_leaderboard():
    """Get real-time leaderboard data"""
    try:
        period = request.args.get('period', 'daily')  # daily, weekly, monthly
        limit = int(request.args.get('limit', 10))
        
        # Get leaderboard data
        today = datetime.now().strftime('%Y_%m_%d')
        leaderboard_data = dashboard_controller.db.collection('leaderboard').document(f'global_{period}').collection(today)
        
        # Get top users
        top_users = leaderboard_data.order_by('rank').limit(limit).get()
        leaderboard = [doc.to_dict() for doc in top_users]
        
        # Get current user's rank
        user_id = session.get('user_id')
        user_rank = dashboard_controller._get_user_rank(user_id, today)
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard,
            'user_rank': user_rank,
            'period': period,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Leaderboard fetch failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500

@dashboard_api.route('/daily-challenge', methods=['GET'])
@require_auth
def get_daily_challenge():
    """Get today's daily challenge"""
    try:
        today = datetime.now().strftime('%Y_%m_%d')
        
        challenge_doc = dashboard_controller.db.collection('daily_challenges').document(today).get()
        
        if not challenge_doc.exists:
            # Generate new challenge if none exists
            result = dashboard_controller.generate_daily_challenge(today)
            if not result.get('success'):
                return jsonify({'error': 'Failed to generate daily challenge'}), 500
                
            challenge_doc = dashboard_controller.db.collection('daily_challenges').document(today).get()
            
        challenge_data = challenge_doc.to_dict()
        
        # Check if user has already participated
        user_id = session.get('user_id')
        user_participation = challenge_data.get('participants', {}).get(user_id, {})
        
        # Remove correct answer if user hasn't attempted yet
        if not user_participation.get('attempted', False):
            if 'global_challenge' in challenge_data:
                challenge_data['global_challenge'].pop('correct_answer', None)
                
        return jsonify({
            'success': True,
            'challenge': challenge_data,
            'user_participation': user_participation,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Daily challenge fetch failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch daily challenge'}), 500

@dashboard_api.route('/daily-challenge/submit', methods=['POST'])
@require_auth
def submit_daily_challenge():
    """Submit answer to daily challenge"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        if not data or 'answer' not in data:
            return jsonify({'error': 'Answer required'}), 400
            
        today = datetime.now().strftime('%Y_%m_%d')
        user_answer = data['answer']
        time_taken = data.get('time_taken_seconds', 0)
        hints_used = data.get('hints_used', 0)
        
        # Get challenge data
        challenge_ref = dashboard_controller.db.collection('daily_challenges').document(today)
        challenge_doc = challenge_ref.get()
        
        if not challenge_doc.exists:
            return jsonify({'error': 'No challenge available for today'}), 404
            
        challenge_data = challenge_doc.to_dict()
        correct_answer = challenge_data['global_challenge']['correct_answer']
        
        # Check if user already submitted
        user_participation = challenge_data.get('participants', {}).get(user_id, {})
        if user_participation.get('attempted', False):
            return jsonify({'error': 'Already submitted today'}), 400
            
        # Calculate score and rewards
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
        base_rewards = challenge_data.get('rewards', {})
        
        points_earned = base_rewards.get('base_points', 50) if is_correct else 10
        pycoins_earned = base_rewards.get('base_pycoins', 25) if is_correct else 5
        xp_earned = base_rewards.get('base_xp', 30) if is_correct else 10
        
        # Apply bonuses
        if is_correct:
            # Speed bonus
            if time_taken < 60:
                points_earned += base_rewards.get('speed_bonus', 10)
                
            # No hints bonus
            if hints_used == 0:
                points_earned += 15
                
        # Update user participation
        participation_data = {
            'attempted': True,
            'answer': user_answer,
            'is_correct': is_correct,
            'attempt_time': datetime.now(),
            'time_taken_seconds': time_taken,
            'hints_used': hints_used,
            'points_earned': points_earned,
            'pycoins_earned': pycoins_earned,
            'feedback_rating': 0
        }
        
        # Update challenge document
        challenge_ref.update({
            f'participants.{user_id}': participation_data,
            'live_stats.total_attempts': dashboard_controller.db.firestore.Increment(1),
            'live_stats.correct_attempts': dashboard_controller.db.firestore.Increment(1 if is_correct else 0)
        })
        
        # Update user stats
        user_ref = dashboard_controller.db.collection('users').document(user_id)
        user_ref.update({
            'stats.total_points': dashboard_controller.db.firestore.Increment(points_earned),
            'stats.pycoins': dashboard_controller.db.firestore.Increment(pycoins_earned),
            'stats.total_xp': dashboard_controller.db.firestore.Increment(xp_earned)
        })
        
        # Update leaderboard
        dashboard_controller.update_leaderboard(user_id, points_earned)
        
        # Log activity
        dashboard_controller.log_activity(user_id, 'daily_challenge', {
            'points_earned': points_earned,
            'is_correct': is_correct,
            'celebration_level': 'exciting' if is_correct else 'normal'
        })
        
        # Check achievements
        new_achievements = dashboard_controller.check_achievements(user_id, {
            'daily_challenge_completed': True,
            'perfect_score': is_correct
        })
        
        return jsonify({
            'success': True,
            'correct': is_correct,
            'correct_answer': correct_answer,
            'explanation': challenge_data['global_challenge'].get('explanation', ''),
            'rewards': {
                'points': points_earned,
                'pycoins': pycoins_earned,
                'xp': xp_earned
            },
            'new_achievements': new_achievements,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Daily challenge submission failed: {str(e)}")
        return jsonify({'error': 'Failed to submit challenge'}), 500

@dashboard_api.route('/notifications', methods=['GET'])
@require_auth
def get_notifications():
    """Get user's pending notifications"""
    try:
        user_id = session.get('user_id')
        
        notif_doc = dashboard_controller.db.collection('notifications').document(user_id).get()
        
        if not notif_doc.exists:
            return jsonify({
                'success': True,
                'notifications': [],
                'unread_count': 0
            })
            
        notif_data = notif_doc.to_dict()
        notifications = notif_data.get('pending', [])
        
        # Count unread notifications
        unread_count = sum(1 for notif in notifications if not notif.get('read', False))
        
        # Sort by priority and creation time
        priority_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
        notifications.sort(key=lambda n: (priority_order.get(n.get('priority', 'low'), 3), n.get('created_at', '')))
        
        return jsonify({
            'success': True,
            'notifications': notifications,
            'unread_count': unread_count,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Notifications fetch failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@dashboard_api.route('/notifications/mark-read', methods=['POST'])
@require_auth
def mark_notification_read():
    """Mark notification as read"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        notification_id = data.get('notification_id')
        if not notification_id:
            return jsonify({'error': 'Notification ID required'}), 400
            
        # Update notification status
        notif_ref = dashboard_controller.db.collection('notifications').document(user_id)
        notif_doc = notif_ref.get()
        
        if notif_doc.exists:
            notif_data = notif_doc.to_dict()
            notifications = notif_data.get('pending', [])
            
            # Find and update the notification
            for notification in notifications:
                if notification.get('id') == notification_id:
                    notification['read'] = True
                    notification['read_time'] = datetime.now().isoformat()
                    break
                    
            # Update document
            notif_ref.update({'pending': notifications})
            
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"❌ Mark notification read failed: {str(e)}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@dashboard_api.route('/activity-feed', methods=['GET'])
@require_auth
def get_activity_feed():
    """Get real-time activity feed"""
    try:
        limit = int(request.args.get('limit', 20))
        
        activity_ref = dashboard_controller.db.collection('real_time_activity').document('live_feed')
        activity_doc = activity_ref.get()
        
        if not activity_doc.exists:
            return jsonify({
                'success': True,
                'activities': [],
                'timestamp': datetime.now().isoformat()
            })
            
        activity_data = activity_doc.to_dict()
        activities = activity_data.get('feed', [])
        
        # Sort by timestamp (most recent first) and limit
        activities.sort(key=lambda a: a.get('timestamp', ''), reverse=True)
        activities = activities[:limit]
        
        return jsonify({
            'success': True,
            'activities': activities,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Activity feed fetch failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch activity feed'}), 500

@dashboard_api.route('/analytics', methods=['GET'])
@require_auth
def get_user_analytics():
    """Get personalized user analytics and insights"""
    try:
        user_id = session.get('user_id')
        
        # Calculate fresh insights
        insights = dashboard_controller.calculate_user_insights(user_id)
        
        if 'error' in insights:
            return jsonify({'error': insights['error']}), 500
            
        return jsonify({
            'success': True,
            'analytics': insights,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Analytics fetch failed: {str(e)}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500

# 🔗 INTEGRATION WITH EXISTING QUIZ SYSTEM

def integrate_quiz_submission(quiz_result_data: Dict[str, Any]) -> bool:
    """
    Integrate existing quiz submissions with dashboard system
    Call this from your existing quiz submission endpoint
    """
    try:
        user_id = quiz_result_data.get('user_id')
        lesson_id = quiz_result_data.get('lesson_id') 
        quiz_id = quiz_result_data.get('quiz_id')
        score = quiz_result_data.get('score', 0)
        max_score = quiz_result_data.get('max_score', 100)
        
        if not all([user_id, lesson_id, quiz_id]):
            logger.error("❌ Missing required quiz data for dashboard integration")
            return False
            
        # Calculate points earned (1 point per percentage point)
        percentage = (score / max_score) * 100
        points_earned = int(percentage)
        
        # Update leaderboard
        dashboard_controller.update_leaderboard(user_id, points_earned)
        
        # Log activity
        dashboard_controller.log_activity(user_id, 'quiz_completed', {
            'lesson_name': lesson_id.replace('_', ' ').title(),
            'score': percentage,
            'points_earned': points_earned,
            'celebration_level': 'exciting' if percentage >= 90 else 'normal'
        })
        
        # Check achievements
        dashboard_controller.check_achievements(user_id, {
            'quiz_completed': True,
            'perfect_score': percentage == 100,
            'score': percentage
        })
        
        # Send encouraging notification
        if percentage >= 85:
            dashboard_controller.send_smart_notification(user_id, 'learning_recommendation', {
                'topic': 'Great job!',
                'lesson_id': lesson_id
            })
            
        logger.info(f"✅ Quiz submission integrated: {user_id} - {percentage}%")
        return True
        
    except Exception as e:
        logger.error(f"❌ Quiz integration failed: {str(e)}")
        return False

def update_user_progress(user_id: str, lesson_id: str, completion_data: Dict[str, Any]) -> bool:
    """
    Update user progress when they complete a lesson
    Call this from your lesson completion logic
    """
    try:
        # Update user's completed lessons
        user_ref = dashboard_controller.db.collection('users').document(user_id)
        user_ref.update({
            'progress.completed_lessons': dashboard_controller.db.firestore.ArrayUnion([lesson_id]),
            'stats.lessons_completed': dashboard_controller.db.firestore.Increment(1),
            'stats.current_streak': completion_data.get('maintains_streak', False) and dashboard_controller.db.firestore.Increment(1) or 0
        })
        
        # Award points for lesson completion
        points_awarded = 25  # Base points for lesson completion
        dashboard_controller.update_leaderboard(user_id, points_awarded)
        
        # Log activity
        dashboard_controller.log_activity(user_id, 'lesson_completed', {
            'lesson_name': lesson_id.replace('_', ' ').title(),
            'points_earned': points_awarded
        })
        
        logger.info(f"✅ User progress updated: {user_id} completed {lesson_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Progress update failed: {str(e)}")
        return False

# 🎪 FLASK APP INTEGRATION INSTRUCTIONS

def integrate_with_flask_app():
    """
    Instructions for integrating dashboard with existing Flask app
    Add this to your main app.py file:
    
    ```python
    from firebase_data.scripts.dashboard_integration import dashboard_api, integrate_quiz_submission
    
    # Register dashboard blueprint
    app.register_blueprint(dashboard_api)
    
    # In your existing quiz submission route:
    @app.route('/api/quiz/submit', methods=['POST'])
    def submit_quiz():
        # ... your existing logic ...
        
        # Add dashboard integration
        quiz_data = {
            'user_id': session.get('user_id'),
            'lesson_id': lesson_id,
            'quiz_id': quiz_id,
            'score': score,
            'max_score': max_score
        }
        integrate_quiz_submission(quiz_data)
        
        # ... rest of your logic ...
    ```
    """
    pass

if __name__ == "__main__":
    print("🎪 DASHBOARD INTEGRATION MODULE READY!")
    print("=" * 50)
    print("Available endpoints:")
    print("  📊 GET  /api/dashboard/data - Complete dashboard data")
    print("  🏆 GET  /api/dashboard/leaderboard - Real-time rankings")
    print("  ⚡ GET  /api/dashboard/daily-challenge - Today's challenge")
    print("  ⚡ POST /api/dashboard/daily-challenge/submit - Submit answer")
    print("  🔔 GET  /api/dashboard/notifications - User notifications")
    print("  🔔 POST /api/dashboard/notifications/mark-read - Mark as read")
    print("  📱 GET  /api/dashboard/activity-feed - Live activity")
    print("  📈 GET  /api/dashboard/analytics - User insights")
    print("\n🔗 Integration functions:")
    print("  integrate_quiz_submission() - Connect existing quiz system")
    print("  update_user_progress() - Track lesson completion")
    print("\n🚀 Ready to make your Flask app DAZZLING! 🎪")

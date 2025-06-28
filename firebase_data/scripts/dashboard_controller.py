#!/usr/bin/env python3
"""
🎪 DAZZLING DASHBOARD CONTROLLER - Firebase Data Management
Ultimate control system for interactive dashboard data
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
import os
from datetime import datetime, timedelta
import random
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DazzlingDashboardController:
    """
    Master controller for all dashboard Firebase operations
    Handles real-time updates, leaderboards, challenges, and analytics
    """
    
    def __init__(self):
        """Initialize Firebase connection and dashboard controller"""
        self.db = None
        self.initialize_firebase()
        
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            firebase_admin.get_app()
            logger.info("✅ Firebase already initialized")
        except ValueError:
            # Initialize Firebase
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred)
            logger.info("🔥 Firebase initialized successfully")
            
        self.db = firestore.client()
        logger.info("🎪 Dashboard Controller ready!")

    # 🏆 LEADERBOARD MANAGEMENT
    def update_leaderboard(self, user_id: str, points_earned: int) -> Dict[str, Any]:
        """Update real-time leaderboard after user earns points"""
        try:
            today = datetime.now().strftime('%Y_%m_%d')
            
            # Update daily leaderboard
            daily_ref = self.db.collection('leaderboard').document('global_daily').collection(today)
            
            # Get user info
            user_doc = self.db.collection('users').document(user_id).get()
            if not user_doc.exists:
                raise ValueError(f"User {user_id} not found")
                
            user_data = user_doc.to_dict()
            
            # Update user's daily points
            user_daily_ref = daily_ref.document(user_id)
            user_daily_doc = user_daily_ref.get()
            
            if user_daily_doc.exists:
                current_data = user_daily_doc.to_dict()
                new_points = current_data.get('points', 0) + points_earned
            else:
                new_points = points_earned
                
            # Update leaderboard entry
            leaderboard_entry = {
                'points': new_points,
                'display_name': user_data['profile']['name'],
                'avatar_url': user_data['profile'].get('avatar_url', ''),
                'streak': user_data['stats']['current_streak'],
                'last_updated': datetime.now(),
                'class_id': user_data['profile'].get('class_id', 'default')
            }
            
            user_daily_ref.set(leaderboard_entry, merge=True)
            
            # Recalculate rankings
            new_rank = self._recalculate_rankings(today)
            
            # Send rank change notifications
            self._check_rank_change_notifications(user_id, new_rank.get(user_id))
            
            logger.info(f"🏆 Leaderboard updated for {user_id}: +{points_earned} points")
            return {'success': True, 'new_rank': new_rank.get(user_id), 'points': new_points}
            
        except Exception as e:
            logger.error(f"❌ Leaderboard update failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _recalculate_rankings(self, date: str) -> Dict[str, int]:
        """Recalculate all user rankings for given date"""
        daily_ref = self.db.collection('leaderboard').document('global_daily').collection(date)
        
        # Get all users sorted by points
        users = daily_ref.order_by('points', direction=firestore.Query.DESCENDING).get()
        
        rankings = {}
        batch = self.db.batch()
        
        for rank, user_doc in enumerate(users, 1):
            user_id = user_doc.id
            rankings[user_id] = rank
            
            # Update rank in document
            user_ref = daily_ref.document(user_id)
            batch.update(user_ref, {'rank': rank})
            
        batch.commit()
        logger.info(f"📊 Rankings recalculated for {len(rankings)} users")
        return rankings

    # ⚡ DAILY CHALLENGE MANAGEMENT
    def generate_daily_challenge(self, target_date: Optional[str] = None) -> Dict[str, Any]:
        """Generate AI-powered daily challenge based on class weak areas"""
        try:
            if not target_date:
                target_date = datetime.now().strftime('%Y_%m_%d')
                
            # Analyze class weak areas
            weak_areas = self._analyze_class_weak_areas()
            
            # Generate challenge based on weak areas
            challenge = self._create_adaptive_challenge(weak_areas)
            
            # Save to Firebase
            challenge_ref = self.db.collection('daily_challenges').document(target_date)
            challenge_ref.set(challenge)
            
            # Notify all users about new challenge
            self._notify_users_new_challenge(target_date)
            
            logger.info(f"🎯 Daily challenge generated for {target_date}")
            return {'success': True, 'challenge_id': target_date, 'topic': challenge['global_challenge']['topic']}
            
        except Exception as e:
            logger.error(f"❌ Daily challenge generation failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _analyze_class_weak_areas(self) -> List[str]:
        """Analyze all users' quiz results to find class-wide weak areas"""
        try:
            # Get all users' aggregated stats
            users_ref = self.db.collection('users')
            users = users_ref.get()
            
            topic_scores = {
                'variables': [],
                'loops': [],
                'functions': [],
                'data_structures': [],
                'error_handling': []
            }
            
            for user_doc in users:
                user_data = user_doc.to_dict()
                mastery = user_data.get('progress', {}).get('mastery_levels', {})
                
                for topic, score in mastery.items():
                    if topic in topic_scores:
                        topic_scores[topic].append(score)
            
            # Calculate average scores and identify weak areas
            weak_areas = []
            for topic, scores in topic_scores.items():
                if scores:
                    avg_score = sum(scores) / len(scores)
                    if avg_score < 75:  # Below 75% is considered weak
                        weak_areas.append(topic)
            
            # Sort by weakness (lowest average first)
            weak_areas.sort(key=lambda topic: sum(topic_scores[topic]) / len(topic_scores[topic]) if topic_scores[topic] else 0)
            
            logger.info(f"📊 Class weak areas identified: {weak_areas}")
            return weak_areas
            
        except Exception as e:
            logger.error(f"❌ Weak area analysis failed: {str(e)}")
            return ['loops']  # Default fallback

    def _create_adaptive_challenge(self, weak_areas: List[str]) -> Dict[str, Any]:
        """Create a challenge targeting the weakest areas"""
        primary_topic = weak_areas[0] if weak_areas else 'variables'
        
        # Challenge templates based on topics
        challenge_templates = {
            'variables': {
                'question': 'What will be the output of this code?\n\nx = 5\ny = x + 3\nprint(f"Result: {y}")',
                'options': ['Result: 5', 'Result: 8', 'Result: 53', 'Error'],
                'correct_answer': 'Result: 8',
                'explanation': 'x is assigned 5, then y is assigned x + 3 = 8, so the f-string prints "Result: 8"'
            },
            'loops': {
                'question': 'How many times will this loop run?\n\nfor i in range(3, 8, 2):\n    print(i)',
                'options': ['2 times', '3 times', '4 times', '5 times'],
                'correct_answer': '3 times',
                'explanation': 'range(3, 8, 2) creates [3, 5, 7] - three numbers, so loop runs 3 times'
            },
            'functions': {
                'question': 'What does this function return?\n\ndef mystery(x, y=2):\n    return x * y\n\nresult = mystery(4)',
                'options': ['4', '6', '8', 'Error'],
                'correct_answer': '8', 
                'explanation': 'mystery(4) uses default y=2, so returns 4 * 2 = 8'
            }
        }
        
        template = challenge_templates.get(primary_topic, challenge_templates['variables'])
        
        challenge = {
            'global_challenge': {
                'id': f'daily_{datetime.now().strftime("%Y_%m_%d")}',
                'type': 'mcq',
                'topic': primary_topic,
                'difficulty': 'medium',
                'question': template['question'],
                'options': template['options'],
                'correct_answer': template['correct_answer'],
                'explanation': template['explanation'],
                'hints': [
                    'Read the code carefully line by line',
                    f'This question focuses on {primary_topic} - think about how they work',
                    'Try tracing through the code step by step'
                ],
                'time_limit_seconds': 300
            },
            'rewards': {
                'base_points': 50,
                'base_pycoins': 25,
                'base_xp': 30,
                'streak_multiplier': 1.5,
                'perfect_score_bonus': 25,
                'speed_bonus': 10
            },
            'metadata': {
                'created_by': 'auto',
                'target_class_weaknesses': weak_areas,
                'estimated_time_minutes': 5,
                'success_criteria': 70,
                'curriculum_alignment': f'{primary_topic}_reinforcement'
            },
            'participants': {},
            'live_stats': {
                'total_attempts': 0,
                'correct_attempts': 0,
                'success_rate': 0,
                'average_time_seconds': 0,
                'most_common_mistake': '',
                'class_averages': {}
            }
        }
        
        return challenge

    # 🔔 SMART NOTIFICATION SYSTEM
    def send_smart_notification(self, user_id: str, notification_type: str, context: Dict[str, Any] = None) -> bool:
        """Send intelligent, contextual notifications to users"""
        try:
            notification_templates = {
                'streak_reminder': {
                    'title': '🔥 Don\'t Break Your Streak!',
                    'message': f'You have a {context.get("streak", 0)}-day streak! Complete today\'s challenge to keep it going.',
                    'action_url': '/daily-challenge',
                    'action_text': 'Take Challenge',
                    'priority': 'high'
                },
                'rank_change': {
                    'title': '🏆 Rank Update!',
                    'message': f'You moved to rank #{context.get("new_rank", "?")}! {context.get("change_text", "")}',
                    'action_url': '/leaderboard',
                    'action_text': 'View Leaderboard',
                    'priority': 'medium'
                },
                'achievement_unlocked': {
                    'title': '🏅 Achievement Unlocked!',
                    'message': f'Congratulations! You earned the "{context.get("badge_name", "")}" badge!',
                    'action_url': '/achievements',
                    'action_text': 'View Achievement',
                    'priority': 'high'
                },
                'learning_recommendation': {
                    'title': '🎯 Perfect Time to Study!',
                    'message': f'Based on your progress, we recommend reviewing {context.get("topic", "")}.',
                    'action_url': f'/lesson/{context.get("lesson_id", "")}',
                    'action_text': 'Start Learning',
                    'priority': 'medium'
                }
            }
            
            template = notification_templates.get(notification_type)
            if not template:
                logger.error(f"❌ Unknown notification type: {notification_type}")
                return False
                
            notification = {
                'id': f'{notification_type}_{datetime.now().isoformat()}',
                'type': notification_type,
                'priority': template['priority'],
                'title': template['title'],
                'message': template['message'],
                'action_url': template['action_url'],
                'action_text': template['action_text'],
                'icon': template['title'].split()[0],  # Extract emoji
                'created_at': datetime.now(),
                'expires_at': datetime.now() + timedelta(days=7),
                'read': False,
                'dismissed': False,
                'interaction_data': {
                    'clicked': False,
                    'time_to_read': 0,
                    'effectiveness_score': 0
                }
            }
            
            # Add to user's pending notifications
            user_notif_ref = self.db.collection('notifications').document(user_id)
            user_notif_ref.update({
                'pending': firestore.ArrayUnion([notification])
            })
            
            logger.info(f"🔔 Notification sent to {user_id}: {notification_type}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Notification sending failed: {str(e)}")
            return False

    # 📊 ANALYTICS AND INSIGHTS
    def calculate_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Calculate personalized learning insights for dashboard"""
        try:
            # Get user's quiz results
            quiz_results_ref = self.db.collection('quiz_results').document(user_id)
            quiz_data = quiz_results_ref.get()
            
            if not quiz_data.exists:
                return {'error': 'No quiz data found'}
                
            quiz_results = quiz_data.to_dict()
            
            # Calculate insights
            insights = {
                'strengths': [],
                'weaknesses': [],
                'recommendations': [],
                'learning_velocity': 0,
                'consistency_score': 0,
                'next_milestone': {},
                'study_patterns': {}
            }
            
            # Analyze topic performance
            if 'aggregated_analytics' in quiz_results:
                topic_mastery = quiz_results['aggregated_analytics'].get('topic_mastery', {})
                
                for topic, data in topic_mastery.items():
                    success_rate = data.get('success_rate', 0)
                    if success_rate >= 85:
                        insights['strengths'].append(topic)
                    elif success_rate < 70:
                        insights['weaknesses'].append(topic)
                        
                # Generate recommendations
                if insights['weaknesses']:
                    weakest_topic = min(insights['weaknesses'], 
                                      key=lambda t: topic_mastery.get(t, {}).get('success_rate', 0))
                    insights['recommendations'].append({
                        'type': 'review',
                        'topic': weakest_topic,
                        'reason': f'Only {topic_mastery.get(weakest_topic, {}).get("success_rate", 0)}% mastery',
                        'lesson_suggestion': f'lesson_{weakest_topic}_review'
                    })
                    
            # Update user's progress data
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({
                'progress.weak_topics': insights['weaknesses'],
                'progress.strong_topics': insights['strengths'],
                'progress.recommended_lessons': [r.get('lesson_suggestion') for r in insights['recommendations']]
            })
            
            logger.info(f"📊 Insights calculated for {user_id}")
            return insights
            
        except Exception as e:
            logger.error(f"❌ Insights calculation failed: {str(e)}")
            return {'error': str(e)}

    # 🎮 GAMIFICATION FEATURES
    def check_achievements(self, user_id: str, context: Dict[str, Any]) -> List[str]:
        """Check if user has unlocked any new achievements"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                return []
                
            user_data = user_doc.to_dict()
            current_badges = user_data.get('achievements', {}).get('badges_earned', [])
            
            # Get all available badges
            badges_ref = self.db.collection('gamification').document('badges')
            badges_doc = badges_ref.get()
            
            if not badges_doc.exists:
                return []
                
            all_badges = badges_doc.to_dict()
            new_badges = []
            
            # Check each badge criteria
            for badge_id, badge_data in all_badges.items():
                if badge_id in current_badges:
                    continue  # Already earned
                    
                if self._check_badge_criteria(user_data, badge_data['criteria'], context):
                    new_badges.append(badge_id)
                    
                    # Award the badge
                    self._award_badge(user_id, badge_id, badge_data)
                    
            logger.info(f"🏅 Achievements checked for {user_id}: {len(new_badges)} new badges")
            return new_badges
            
        except Exception as e:
            logger.error(f"❌ Achievement checking failed: {str(e)}")
            return []

    def _check_badge_criteria(self, user_data: Dict[str, Any], criteria: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """Check if user meets badge criteria"""
        criteria_type = criteria.get('type')
        requirement = criteria.get('requirement', {})
        
        if criteria_type == 'quiz_performance':
            stats = user_data.get('stats', {})
            quizzes_taken = stats.get('quizzes_taken', 0)
            average_score = stats.get('average_score', 0)
            
            return (quizzes_taken >= requirement.get('min_quizzes', 0) and 
                   average_score >= requirement.get('min_score', 0))
                   
        elif criteria_type == 'streak':
            current_streak = user_data.get('stats', {}).get('current_streak', 0)
            return current_streak >= requirement.get('min_streak', 0)
            
        elif criteria_type == 'completion':
            lessons_completed = user_data.get('stats', {}).get('lessons_completed', 0)
            return lessons_completed >= requirement.get('min_lessons', 0)
            
        return False

    def _award_badge(self, user_id: str, badge_id: str, badge_data: Dict[str, Any]):
        """Award a badge to user and give rewards"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            
            # Add badge to user's collection
            user_ref.update({
                'achievements.badges_earned': firestore.ArrayUnion([badge_id]),
                'achievements.recent_unlocks': firestore.ArrayUnion([{
                    'badge_id': badge_id,
                    'unlocked_at': datetime.now()
                }])
            })
            
            # Award rewards
            rewards = badge_data.get('rewards', {})
            if rewards:
                user_ref.update({
                    'stats.total_points': firestore.Increment(rewards.get('points', 0)),
                    'stats.pycoins': firestore.Increment(rewards.get('pycoins', 0)),
                    'stats.total_xp': firestore.Increment(rewards.get('xp', 0))
                })
                
            # Send achievement notification
            self.send_smart_notification(user_id, 'achievement_unlocked', {
                'badge_name': badge_data.get('name', badge_id)
            })
            
            logger.info(f"🏆 Badge {badge_id} awarded to {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Badge awarding failed: {str(e)}")

    # 🚀 DASHBOARD DATA AGGREGATION
    def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get all data needed for user's dashboard"""
        try:
            dashboard_data = {
                'user_profile': {},
                'leaderboard': {},
                'daily_challenge': {},
                'notifications': {},
                'analytics': {},
                'achievements': {},
                'live_activity': {}
            }
            
            # Get user profile and stats
            user_doc = self.db.collection('users').document(user_id).get()
            if user_doc.exists:
                dashboard_data['user_profile'] = user_doc.to_dict()
                
            # Get today's leaderboard
            today = datetime.now().strftime('%Y_%m_%d')
            leaderboard_ref = self.db.collection('leaderboard').document('global_daily').collection(today)
            leaderboard_docs = leaderboard_ref.order_by('rank').limit(10).get()
            
            dashboard_data['leaderboard'] = {
                'top_10': [doc.to_dict() for doc in leaderboard_docs],
                'user_rank': self._get_user_rank(user_id, today)
            }
            
            # Get today's daily challenge
            challenge_doc = self.db.collection('daily_challenges').document(today).get()
            if challenge_doc.exists:
                dashboard_data['daily_challenge'] = challenge_doc.to_dict()
                
            # Get pending notifications
            notif_doc = self.db.collection('notifications').document(user_id).get()
            if notif_doc.exists:
                notif_data = notif_doc.to_dict()
                dashboard_data['notifications'] = notif_data.get('pending', [])
                
            # Get user insights
            dashboard_data['analytics'] = self.calculate_user_insights(user_id)
            
            # Get recent activity
            activity_ref = self.db.collection('real_time_activity').document('live_feed')
            activity_doc = activity_ref.get()
            if activity_doc.exists:
                activity_data = activity_doc.to_dict()
                dashboard_data['live_activity'] = activity_data.get('feed', [])[:10]  # Last 10 activities
                
            logger.info(f"📊 Dashboard data compiled for {user_id}")
            return dashboard_data
            
        except Exception as e:
            logger.error(f"❌ Dashboard data compilation failed: {str(e)}")
            return {'error': str(e)}

    def _get_user_rank(self, user_id: str, date: str) -> Optional[int]:
        """Get user's current rank for given date"""
        try:
            user_doc = self.db.collection('leaderboard').document('global_daily').collection(date).document(user_id).get()
            if user_doc.exists:
                return user_doc.to_dict().get('rank')
            return None
        except:
            return None

    # 🔄 REAL-TIME ACTIVITY TRACKING
    def log_activity(self, user_id: str, action_type: str, context: Dict[str, Any]):
        """Log user activity to real-time feed"""
        try:
            # Get user info
            user_doc = self.db.collection('users').document(user_id).get()
            if not user_doc.exists:
                return
                
            user_data = user_doc.to_dict()
            
            activity = {
                'id': f'{user_id}_{action_type}_{datetime.now().isoformat()}',
                'userId': user_id,
                'user_name': user_data['profile']['name'],
                'user_avatar': user_data['profile'].get('avatar_url', ''),
                'action_type': action_type,
                'action_description': self._generate_activity_description(action_type, context),
                'points_earned': context.get('points_earned', 0),
                'timestamp': datetime.now(),
                'visibility': 'public',
                'celebration_level': context.get('celebration_level', 'normal'),
                'context': context
            }
            
            # Add to live feed
            feed_ref = self.db.collection('real_time_activity').document('live_feed')
            feed_ref.update({
                'feed': firestore.ArrayUnion([activity])
            })
            
            # Keep only last 100 activities (cleanup)
            self._cleanup_activity_feed()
            
            logger.info(f"📱 Activity logged: {user_id} - {action_type}")
            
        except Exception as e:
            logger.error(f"❌ Activity logging failed: {str(e)}")

    def _generate_activity_description(self, action_type: str, context: Dict[str, Any]) -> str:
        """Generate human-readable activity descriptions"""
        descriptions = {
            'quiz_completed': f'completed {context.get("lesson_name", "a quiz")} with {context.get("score", 0)}% score!',
            'achievement_unlocked': f'unlocked the {context.get("achievement_name", "achievement")} badge!',
            'streak_milestone': f'reached a {context.get("streak", 0)}-day study streak!',
            'level_up': f'leveled up to {context.get("new_level", "next level")}!',
            'daily_challenge': f'completed today\'s daily challenge!'
        }
        
        return descriptions.get(action_type, 'did something awesome!')

    def _cleanup_activity_feed(self):
        """Keep activity feed to reasonable size"""
        try:
            feed_ref = self.db.collection('real_time_activity').document('live_feed')
            feed_doc = feed_ref.get()
            
            if feed_doc.exists:
                feed_data = feed_doc.to_dict()
                activities = feed_data.get('feed', [])
                
                if len(activities) > 100:
                    # Keep only the most recent 50 activities
                    recent_activities = sorted(activities, 
                                             key=lambda x: x.get('timestamp', datetime.min), 
                                             reverse=True)[:50]
                    
                    feed_ref.update({'feed': recent_activities})
                    logger.info(f"🧹 Activity feed cleaned up: {len(activities)} -> {len(recent_activities)}")
                    
        except Exception as e:
            logger.error(f"❌ Activity feed cleanup failed: {str(e)}")

# 🎪 GLOBAL CONTROLLER INSTANCE
dashboard_controller = DazzlingDashboardController()

if __name__ == "__main__":
    print("🎪 DAZZLING DASHBOARD CONTROLLER READY!")
    print("=" * 50)
    print("Available features:")
    print("  🏆 Real-time leaderboard updates")
    print("  ⚡ AI-powered daily challenges")
    print("  🔔 Smart notification system")
    print("  📊 Personalized analytics")
    print("  🏅 Achievement tracking")
    print("  📱 Real-time activity logging")
    print("  🎮 Complete gamification system")
    print("\n Ready to dazzle students with data-driven learning! 🚀")

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

    # =====================================
    # 🎪 DAZZLING DASHBOARD API METHODS
    # =====================================

    def get_leaderboard(self, period: str = 'weekly', limit: int = 10) -> List[Dict[str, Any]]:
        """Get leaderboard data for specified period"""
        try:
            today = datetime.now().strftime('%Y_%m_%d')
            leaderboard_ref = self.db.collection('leaderboard')
            
            # Get leaderboard data based on period
            if period == 'daily':
                docs = leaderboard_ref.document('global_daily').collection(today).order_by('rank').limit(limit).get()
            else:  # weekly, monthly, all_time
                docs = leaderboard_ref.document('global_weekly').collection('current').order_by('rank').limit(limit).get()
            
            return [doc.to_dict() for doc in docs]
            
        except Exception as e:
            logger.error(f"❌ Get leaderboard failed: {str(e)}")
            return []

    def get_daily_challenge(self, user_id: str = None) -> Dict[str, Any]:
        """Get today's daily challenge with user progress"""
        try:
            today = datetime.now().strftime('%Y_%m_%d')
            challenge_doc = self.db.collection('daily_challenges').document(today).get()
            
            if not challenge_doc.exists:
                return {'error': 'No challenge for today'}
            
            challenge_data = challenge_doc.to_dict()
            
            # Add user progress if user_id provided
            if user_id:
                user_progress_doc = self.db.collection('user_progress').document(user_id).collection('daily_challenges').document(today).get()
                if user_progress_doc.exists:
                    challenge_data['user_progress'] = user_progress_doc.to_dict()
                else:
                    challenge_data['user_progress'] = {'completed': False, 'progress': 0}
            
            return challenge_data
            
        except Exception as e:
            logger.error(f"❌ Get daily challenge failed: {str(e)}")
            return {'error': str(e)}

    def complete_daily_challenge(self, user_id: str, challenge_id: str, points_earned: int = 50) -> Dict[str, Any]:
        """Mark daily challenge as completed and award points"""
        try:
            today = datetime.now().strftime('%Y_%m_%d')
            
            # Update user progress
            progress_doc = self.db.collection('user_progress').document(user_id).collection('daily_challenges').document(today)
            progress_doc.set({
                'completed': True,
                'progress': 100,
                'points_earned': points_earned,
                'completed_at': datetime.now(),
                'challenge_id': challenge_id
            })
            
            # Update leaderboard
            self.update_leaderboard(user_id, points_earned)
            
            # Log activity
            self.log_activity(user_id, 'daily_challenge_completed', {
                'challenge_id': challenge_id,
                'points_earned': points_earned
            })
            
            return {'success': True, 'points_earned': points_earned}
            
        except Exception as e:
            logger.error(f"❌ Complete daily challenge failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_user_notifications(self, user_id: str, unread_only: bool = True, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user notifications with filtering"""
        try:
            notif_doc = self.db.collection('notifications').document(user_id).get()
            
            if not notif_doc.exists:
                return []
            
            notif_data = notif_doc.to_dict()
            notifications = notif_data.get('pending', [])
            
            if unread_only:
                notifications = [n for n in notifications if not n.get('read', False)]
            
            # Sort by created_at descending and limit
            notifications.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
            return notifications[:limit]
            
        except Exception as e:
            logger.error(f"❌ Get user notifications failed: {str(e)}")
            return []

    def mark_notifications_read(self, user_id: str, notification_ids: List[str]) -> Dict[str, Any]:
        """Mark specified notifications as read"""
        try:
            notif_doc_ref = self.db.collection('notifications').document(user_id)
            notif_doc = notif_doc_ref.get()
            
            if not notif_doc.exists:
                return {'success': False, 'error': 'No notifications found'}
            
            notif_data = notif_doc.to_dict()
            notifications = notif_data.get('pending', [])
            
            # Mark specified notifications as read
            for notification in notifications:
                if notification.get('id') in notification_ids:
                    notification['read'] = True
                    notification['read_at'] = datetime.now()
            
            # Update document
            notif_doc_ref.update({'pending': notifications})
            
            return {'success': True, 'marked_count': len(notification_ids)}
            
        except Exception as e:
            logger.error(f"❌ Mark notifications read failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_activity_feed(self, user_id: str = None, limit: int = 15) -> List[Dict[str, Any]]:
        """Get activity feed, optionally personalized for user"""
        try:
            activity_ref = self.db.collection('real_time_activity').document('live_feed')
            activity_doc = activity_ref.get()
            
            if not activity_doc.exists:
                return []
            
            activity_data = activity_doc.to_dict()
            activities = activity_data.get('feed', [])
            
            # Sort by timestamp descending and limit
            activities.sort(key=lambda x: x.get('timestamp', datetime.min), reverse=True)
            return activities[:limit]
            
        except Exception as e:
            logger.error(f"❌ Get activity feed failed: {str(e)}")
            return []

    def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        try:
            user_doc = self.db.collection('users').document(user_id).get()
            
            if not user_doc.exists:
                return {'error': 'User not found'}
            
            user_data = user_doc.to_dict()
            today = datetime.now().strftime('%Y_%m_%d')
            
            return {
                'total_points': user_data.get('stats', {}).get('total_points', 0),
                'lessons_completed': user_data.get('stats', {}).get('lessons_completed', 0),
                'current_streak': user_data.get('stats', {}).get('current_streak', 0),
                'weekly_rank': self._get_user_rank(user_id, today) or 'Unranked',
                'join_date': user_data.get('profile', {}).get('created_at'),
                'level': user_data.get('gamification', {}).get('level', 1),
                'badges_count': len(user_data.get('gamification', {}).get('badges', [])),
                'weekly_points': user_data.get('stats', {}).get('weekly_points', 0)
            }
            
        except Exception as e:
            logger.error(f"❌ Get user statistics failed: {str(e)}")
            return {'error': str(e)}

    def get_user_gamification(self, user_id: str) -> Dict[str, Any]:
        """Get user badges, achievements, and level progression"""
        try:
            user_doc = self.db.collection('users').document(user_id).get()
            
            if not user_doc.exists:
                return {'error': 'User not found'}
            
            user_data = user_doc.to_dict()
            gamification_data = user_data.get('gamification', {})
            
            # Get badges
            badges_data = self.db.collection('badges').get()
            all_badges = {doc.id: doc.to_dict() for doc in badges_data}
            
            user_badges = []
            for badge_id in gamification_data.get('badges', []):
                if badge_id in all_badges:
                    badge_info = all_badges[badge_id].copy()
                    badge_info['id'] = badge_id
                    user_badges.append(badge_info)
            
            # Calculate level progress
            current_level = gamification_data.get('level', 1)
            current_xp = gamification_data.get('experience_points', 0)
            xp_for_next_level = current_level * 100  # Simple formula
            
            level_progress = {
                'current_level': current_level,
                'level_title': self._get_level_title(current_level),
                'current_xp': current_xp,
                'xp_to_next_level': xp_for_next_level,
                'progress_percent': min((current_xp % 100) / 100 * 100, 100)
            }
            
            return {
                'badges': user_badges,
                'level_progress': level_progress,
                'achievements': gamification_data.get('achievements', []),
                'total_badges': len(user_badges),
                'total_achievements': len(gamification_data.get('achievements', []))
            }
            
        except Exception as e:
            logger.error(f"❌ Get user gamification failed: {str(e)}")
            return {'error': str(e)}

    def add_user_activity(self, user_id: str, activity_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Add new activity to user's feed"""
        try:
            self.log_activity(user_id, activity_type, details)
            return {'success': True}
            
        except Exception as e:
            logger.error(f"❌ Add user activity failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _get_level_title(self, level: int) -> str:
        """Get level title based on level number"""
        if level >= 50:
            return "Python Master"
        elif level >= 25:
            return "Code Wizard"
        elif level >= 15:
            return "Algorithm Expert"
        elif level >= 10:
            return "Logic Ninja"
        elif level >= 5:
            return "Syntax Scholar"
        else:
            return "Code Apprentice"
        
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

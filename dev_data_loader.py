#!/usr/bin/env python3
"""
🎪 DEVELOPMENT DATA LOADER
Automatically loads sample data into the dashboard for testing
"""

import json
import os
from datetime import datetime, timedelta
import random

class DevDataLoader:
    """Load and serve sample data for development dashboard"""
    
    def __init__(self):
        self.sample_data = self.load_sample_data()
    
    def load_sample_data(self):
        """Load sample data from JSON file"""
        try:
            with open('firebase_sample_data.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ firebase_sample_data.json not found")
            return {}
    
    def get_dev_leaderboard(self, limit=10):
        """Get formatted leaderboard data for dashboard"""
        users = self.sample_data.get('users', {})
        
        # Convert users to leaderboard format
        leaderboard = []
        for user_id, user_data in users.items():
            profile = user_data.get('profile', {})
            stats = user_data.get('stats', {})
            
            leaderboard.append({
                'rank': stats.get('global_rank', 999),
                'name': profile.get('name', 'Anonymous'),
                'points': stats.get('total_points', 0),
                'avatar': profile.get('avatar_url', '/static/img/avatar1.png'),
                'badges': self.get_user_badges(user_data),
                'isCurrentUser': user_id == 'user_005'  # Make user_005 the current user
            })
        
        # Sort by points and assign proper ranks
        leaderboard.sort(key=lambda x: x['points'], reverse=True)
        for i, user in enumerate(leaderboard):
            user['rank'] = i + 1
        
        return leaderboard[:limit]
    
    def get_user_badges(self, user_data):
        """Get user badges as emoji list"""
        stats = user_data.get('stats', {})
        badges = []
        
        if stats.get('current_streak', 0) >= 5:
            badges.append('🔥')
        if stats.get('lessons_completed', 0) >= 10:
            badges.append('⭐')
        if stats.get('average_score', 0) >= 90:
            badges.append('🏆')
        if stats.get('total_points', 0) >= 1000:
            badges.append('💎')
        
        return badges[:3]  # Limit to 3 badges
    
    def get_dev_daily_challenge(self):
        """Get today's daily challenge"""
        challenges = self.sample_data.get('daily_challenges', {})
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Find today's challenge or create one
        challenge = None
        for challenge_id, challenge_data in challenges.items():
            if challenge_data.get('active_date') == today:
                challenge = challenge_data
                break
        
        if not challenge:
            # Create a sample challenge for today
            challenge = {
                'id': f'challenge_{today}',
                'title': 'Master Python List Comprehensions',
                'description': 'Practice advanced list operations and filtering techniques',
                'difficulty': 'intermediate',
                'points_reward': 50,
                'pycoins_reward': 25,
                'progress': random.randint(0, 100),
                'completed': False,
                'time_remaining': '14h 23m'
            }
        
        return challenge
    
    def get_dev_notifications(self, limit=5):
        """Get user notifications"""
        notifications = self.sample_data.get('notifications', {})
        
        # Convert to list format
        notification_list = []
        for notif_id, notif_data in notifications.items():
            notification_list.append({
                'id': notif_id,
                'title': notif_data.get('title', 'Notification'),
                'message': notif_data.get('message', 'You have a new update'),
                'type': notif_data.get('type', 'info'),
                'priority': notif_data.get('priority', 'medium'),
                'time': notif_data.get('created_at', datetime.now().isoformat()),
                'read': notif_data.get('read', False)
            })
        
        # Sort by time (newest first)
        notification_list.sort(key=lambda x: x['time'], reverse=True)
        return notification_list[:limit]
    
    def get_dev_activity_feed(self, limit=10):
        """Get recent activity feed"""
        real_time_data = self.sample_data.get('real_time_activity', {})
        activities = real_time_data.get('live_feed', [])
        
        # Convert to list format
        activity_list = []
        for activity_data in activities:
            activity_list.append({
                'id': activity_data.get('id', 'activity'),
                'text': f"{activity_data.get('user_name', 'Someone')} {activity_data.get('action_description', 'did something')}",
                'time': activity_data.get('timestamp', datetime.now().isoformat()),
                'type': activity_data.get('action_type', 'general'),
                'points': activity_data.get('points_earned', 0),
                'icon': self.get_activity_icon(activity_data.get('action_type', 'general'))
            })
        
        # Sort by time (newest first)
        activity_list.sort(key=lambda x: x['time'], reverse=True)
        return activity_list[:limit]
    
    def get_activity_icon(self, activity_type):
        """Get icon for activity type"""
        icons = {
            'lesson_completed': '🏆',
            'quiz_completed': '🎯',
            'quiz_passed': '🎯',
            'badge_earned': '🏅',
            'streak_achieved': '🔥',
            'challenge_completed': '⚡',
            'level_up': '📈',
            'general': '📚'
        }
        return icons.get(activity_type, '📚')
    
    def get_dev_user_stats(self, user_id='user_005'):
        """Get current user statistics"""
        users = self.sample_data.get('users', {})
        user_data = users.get(user_id, {})
        
        stats = user_data.get('stats', {})
        progress = user_data.get('progress', {})
        
        return {
            'total_points': stats.get('total_points', 0),
            'current_streak': stats.get('current_streak', 0),
            'lessons_completed': stats.get('lessons_completed', 0),
            'average_score': stats.get('average_score', 0),
            'weekly_rank': stats.get('global_rank', 0),
            'level': stats.get('level', 1),
            'current_xp': stats.get('current_xp', 0),
            'next_level_xp': (stats.get('level', 1) * 500),
            'pycoins': stats.get('pycoins', 0),
            'badges_earned': len(self.get_user_badges(user_data))
        }

# Global instance for easy access
dev_data_loader = DevDataLoader()

if __name__ == "__main__":
    print("🎪 DEVELOPMENT DATA LOADER TEST")
    print("=" * 40)
    
    loader = DevDataLoader()
    
    print("🏆 Sample Leaderboard:")
    leaderboard = loader.get_dev_leaderboard(5)
    for user in leaderboard:
        print(f"  {user['rank']}. {user['name']} - {user['points']} pts {' '.join(user['badges'])}")
    
    print(f"\n⚡ Daily Challenge: {loader.get_dev_daily_challenge()['title']}")
    print(f"🔔 Notifications: {len(loader.get_dev_notifications())} items")
    print(f"📱 Activities: {len(loader.get_dev_activity_feed())} items")
    
    stats = loader.get_dev_user_stats()
    print(f"📊 User Stats: {stats['total_points']} pts, Level {stats['level']}")

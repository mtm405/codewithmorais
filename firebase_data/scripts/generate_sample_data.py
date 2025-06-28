#!/usr/bin/env python3
"""
🎪 DAZZLING DASHBOARD - Sample Data Generator
Creates realistic sample data for testing the ultimate dashboard
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import names  # For generating realistic names

class DashboardSampleDataGenerator:
    """Generate realistic sample data for dashboard testing"""
    
    def __init__(self):
        self.sample_lessons = [
            'variables_intro', 'variables_advanced', 'basic_syntax',
            'loops_for', 'loops_while', 'loops_nested',
            'functions_basic', 'functions_parameters', 'functions_return',
            'data_structures_lists', 'data_structures_dicts', 'data_structures_tuples',
            'error_handling', 'file_operations', 'modules_import'
        ]
        
        self.topic_mapping = {
            'variables': ['variables_intro', 'variables_advanced'],
            'loops': ['loops_for', 'loops_while', 'loops_nested'],
            'functions': ['functions_basic', 'functions_parameters', 'functions_return'],
            'data_structures': ['data_structures_lists', 'data_structures_dicts', 'data_structures_tuples'],
            'error_handling': ['error_handling', 'file_operations']
        }

    def generate_sample_users(self, count: int = 20) -> Dict[str, Any]:
        """Generate realistic user profiles with varied performance levels"""
        users = {}
        
        for i in range(count):
            user_id = f"user_{i+1:03d}"
            
            # Generate realistic performance distribution
            performance_level = random.choice(['struggling', 'average', 'excellent'])
            
            if performance_level == 'struggling':
                avg_score = random.randint(45, 65)
                streak = random.randint(0, 3)
                lessons_completed = random.randint(2, 6)
                total_points = random.randint(200, 800)
            elif performance_level == 'average':
                avg_score = random.randint(70, 85)
                streak = random.randint(2, 8)
                lessons_completed = random.randint(5, 12)
                total_points = random.randint(800, 2000)
            else:  # excellent
                avg_score = random.randint(85, 98)
                streak = random.randint(5, 15)
                lessons_completed = random.randint(10, 15)
                total_points = random.randint(2000, 4000)
                
            # Generate mastery levels based on performance
            mastery_levels = {}
            for topic in ['variables', 'loops', 'functions', 'data_structures', 'error_handling']:
                if performance_level == 'struggling':
                    mastery = random.randint(30, 60)
                elif performance_level == 'average':
                    mastery = random.randint(60, 85)
                else:
                    mastery = random.randint(80, 95)
                mastery_levels[topic] = mastery
                
            # Identify weak and strong topics
            weak_topics = [topic for topic, score in mastery_levels.items() if score < 70]
            strong_topics = [topic for topic, score in mastery_levels.items() if score > 85]
            
            user_data = {
                "profile": {
                    "name": names.get_full_name(),
                    "email": f"student{i+1}@school.edu",
                    "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
                    "join_date": (datetime.now() - timedelta(days=random.randint(30, 120))).isoformat(),
                    "last_active": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
                    "timezone": "America/New_York",
                    "class_id": f"class_{'ABCD'[i // 5]}",  # Distribute across 4 classes
                    "student_id": f"STU{1000 + i}"
                },
                "stats": {
                    "total_points": total_points,
                    "current_streak": streak,
                    "max_streak": streak + random.randint(0, 5),
                    "lessons_completed": lessons_completed,
                    "quizzes_taken": lessons_completed * random.randint(1, 3),
                    "average_score": avg_score,
                    "time_studied_minutes": lessons_completed * random.randint(15, 45),
                    "level": min(10, total_points // 500 + 1),
                    "current_xp": total_points % 500,
                    "total_xp": total_points,
                    "pycoins": random.randint(50, 500),
                    "global_rank": 0,  # Will be calculated
                    "class_rank": 0   # Will be calculated
                },
                "progress": {
                    "current_lesson": random.choice(self.sample_lessons),
                    "completed_lessons": random.sample(self.sample_lessons, lessons_completed),
                    "mastery_levels": mastery_levels,
                    "weak_topics": weak_topics,
                    "strong_topics": strong_topics,
                    "recommended_lessons": self._generate_recommendations(weak_topics),
                    "learning_velocity": random.uniform(2.0, 6.0),
                    "consistency_score": random.randint(60, 95)
                },
                "preferences": {
                    "notifications_enabled": random.choice([True, True, True, False]),  # 75% enable
                    "daily_challenge_reminder": random.choice([True, True, False]),
                    "competitive_mode": random.choice([True, True, True, False]),
                    "dashboard_layout": random.choice(['preferred', 'compact', 'detailed']),
                    "theme": random.choice(['dark', 'light', 'auto']),
                    "study_goal_minutes": random.choice([30, 45, 60, 90]),
                    "difficulty_preference": random.choice(['adaptive', 'medium', 'hard'])
                },
                "achievements": {
                    "badges_earned": self._generate_earned_badges(performance_level, lessons_completed),
                    "recent_unlocks": [],
                    "progress_towards": {},
                    "showcase_badges": [],
                    "total_badges": 0
                }
            }
            
            users[user_id] = user_data
            
        return {"users": users}

    def _generate_recommendations(self, weak_topics: List[str]) -> List[str]:
        """Generate lesson recommendations based on weak topics"""
        recommendations = []
        for topic in weak_topics[:2]:  # Focus on top 2 weak areas
            topic_lessons = self.topic_mapping.get(topic, [])
            if topic_lessons:
                recommendations.extend(random.sample(topic_lessons, min(2, len(topic_lessons))))
        return recommendations

    def _generate_earned_badges(self, performance_level: str, lessons_completed: int) -> List[str]:
        """Generate realistic badge collections based on performance"""
        all_badges = [
            'first_quiz', 'early_bird', 'quick_learner', 'perfect_score',
            'streak_5', 'streak_10', 'lesson_master', 'quiz_master',
            'loop_expert', 'function_guru', 'variable_master', 'helper',
            'consistent_learner', 'speed_demon', 'perfectionist'
        ]
        
        if performance_level == 'struggling':
            earned = random.sample(all_badges[:5], random.randint(1, 3))
        elif performance_level == 'average':
            earned = random.sample(all_badges[:10], random.randint(3, 7))
        else:  # excellent
            earned = random.sample(all_badges, random.randint(7, 12))
            
        return earned

    def generate_leaderboard_data(self, users: Dict[str, Any]) -> Dict[str, Any]:
        """Generate leaderboard data based on user stats"""
        today = datetime.now().strftime('%Y_%m_%d')
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y_%m_%d')
        
        # Sort users by points for ranking
        user_list = [(user_id, data) for user_id, data in users.items()]
        user_list.sort(key=lambda x: x[1]['stats']['total_points'], reverse=True)
        
        leaderboard_data = {
            "global_daily": {
                today: {},
                yesterday: {}
            }
        }
        
        # Generate today's leaderboard
        for rank, (user_id, user_data) in enumerate(user_list, 1):
            profile = user_data['profile']
            stats = user_data['stats']
            
            # Simulate daily points (portion of total)
            daily_points = random.randint(50, 200) if rank <= 10 else random.randint(0, 100)
            
            leaderboard_entry = {
                "points": daily_points,
                "rank": rank,
                "display_name": profile['name'].split()[0],  # First name only
                "avatar_url": profile['avatar_url'],
                "change_from_yesterday": random.randint(-3, 5),
                "streak": stats['current_streak'],
                "lessons_today": random.randint(0, 3),
                "last_updated": datetime.now().isoformat(),
                "class_id": profile['class_id']
            }
            
            leaderboard_data["global_daily"][today][user_id] = leaderboard_entry
            
            # Generate yesterday's data (slightly different)
            yesterday_points = max(0, daily_points + random.randint(-50, 30))
            yesterday_entry = leaderboard_entry.copy()
            yesterday_entry.update({
                "points": yesterday_points,
                "rank": rank + random.randint(-2, 2),
                "last_updated": (datetime.now() - timedelta(days=1)).isoformat()
            })
            
            leaderboard_data["global_daily"][yesterday][user_id] = yesterday_entry
            
        return {"leaderboard": leaderboard_data}

    def generate_daily_challenges(self, days: int = 7) -> Dict[str, Any]:
        """Generate daily challenges for the past week"""
        challenges = {}
        
        challenge_templates = [
            {
                "topic": "variables",
                "question": "What will be the output?\n\nx = 10\ny = x + 5\nprint(y)",
                "options": ["10", "15", "105", "Error"],
                "correct_answer": "15",
                "explanation": "x is 10, y is x + 5 = 15"
            },
            {
                "topic": "loops", 
                "question": "How many times will this print?\n\nfor i in range(4):\n    print('Hello')",
                "options": ["3", "4", "5", "Infinite"],
                "correct_answer": "4",
                "explanation": "range(4) creates [0,1,2,3] - 4 numbers"
            },
            {
                "topic": "functions",
                "question": "What does this return?\n\ndef add(a, b=5):\n    return a + b\n\nresult = add(3)",
                "options": ["3", "5", "8", "Error"],
                "correct_answer": "8", 
                "explanation": "add(3) uses default b=5, so 3 + 5 = 8"
            }
        ]
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y_%m_%d')
            template = random.choice(challenge_templates)
            
            challenge = {
                "global_challenge": {
                    "id": f"daily_{date}",
                    "type": "mcq",
                    "topic": template["topic"],
                    "difficulty": random.choice(["easy", "medium", "hard"]),
                    "question": template["question"],
                    "options": template["options"],
                    "correct_answer": template["correct_answer"],
                    "explanation": template["explanation"],
                    "hints": [
                        "Read the code line by line",
                        f"This focuses on {template['topic']}",
                        "Try running it in your head"
                    ],
                    "time_limit_seconds": 300
                },
                "rewards": {
                    "base_points": random.randint(40, 60),
                    "base_pycoins": random.randint(20, 30),
                    "base_xp": random.randint(25, 35),
                    "streak_multiplier": 1.5,
                    "perfect_score_bonus": 25,
                    "speed_bonus": 10
                },
                "participants": self._generate_challenge_participants(date),
                "live_stats": {
                    "total_attempts": random.randint(15, 25),
                    "correct_attempts": random.randint(10, 20),
                    "success_rate": random.randint(60, 85),
                    "average_time_seconds": random.randint(120, 240),
                    "most_common_mistake": random.choice(template["options"]),
                    "class_averages": {}
                }
            }
            
            challenges[date] = challenge
            
        return {"daily_challenges": challenges}

    def _generate_challenge_participants(self, date: str) -> Dict[str, Any]:
        """Generate realistic challenge participation data"""
        participants = {}
        
        # Simulate participation from random users
        num_participants = random.randint(12, 20)
        
        for i in range(num_participants):
            user_id = f"user_{random.randint(1, 20):03d}"
            
            attempted = random.choice([True, True, True, False])  # 75% participation
            
            if attempted:
                is_correct = random.choice([True, True, False])  # 67% success rate
                time_taken = random.randint(60, 300)
                hints_used = random.randint(0, 2)
                
                participants[user_id] = {
                    "attempted": True,
                    "answer": "correct_answer" if is_correct else "wrong_answer",
                    "is_correct": is_correct,
                    "attempt_time": (datetime.now() - timedelta(days=random.randint(0, 1))).isoformat(),
                    "time_taken_seconds": time_taken,
                    "hints_used": hints_used,
                    "points_earned": 50 if is_correct else 10,
                    "pycoins_earned": 25 if is_correct else 5,
                    "feedback_rating": random.randint(3, 5)
                }
            else:
                participants[user_id] = {
                    "attempted": False,
                    "answer": "",
                    "is_correct": False,
                    "attempt_time": "",
                    "time_taken_seconds": 0,
                    "hints_used": 0,
                    "points_earned": 0,
                    "pycoins_earned": 0,
                    "feedback_rating": 0
                }
                
        return participants

    def generate_notifications(self, users: Dict[str, Any]) -> Dict[str, Any]:
        """Generate realistic notifications for users"""
        notifications = {}
        
        notification_types = [
            {
                "type": "streak_reminder",
                "title": "🔥 Keep Your Streak!",
                "message": "Don't break your {streak}-day streak! Complete today's challenge.",
                "priority": "high"
            },
            {
                "type": "achievement_unlocked",
                "title": "🏅 New Achievement!",
                "message": "You unlocked the '{badge}' badge! Great work!",
                "priority": "medium"
            },
            {
                "type": "rank_change",
                "title": "🏆 Rank Update!",
                "message": "You moved to #{rank}! Keep climbing the leaderboard!",
                "priority": "medium"
            },
            {
                "type": "social",
                "title": "👥 Friend Activity",
                "message": "{friend} just earned 100 points! Can you beat that?",
                "priority": "low"
            }
        ]
        
        for user_id, user_data in list(users.items())[:10]:  # Generate for first 10 users
            user_notifications = []
            
            # Generate 2-5 notifications per user
            num_notifications = random.randint(2, 5)
            
            for _ in range(num_notifications):
                template = random.choice(notification_types)
                
                notification = {
                    "id": f"{template['type']}_{datetime.now().isoformat()}_{random.randint(1000, 9999)}",
                    "type": template["type"],
                    "priority": template["priority"],
                    "title": template["title"],
                    "message": self._personalize_notification_message(template["message"], user_data),
                    "action_url": self._get_notification_action_url(template["type"]),
                    "action_text": self._get_notification_action_text(template["type"]),
                    "icon": template["title"].split()[0],
                    "created_at": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
                    "expires_at": (datetime.now() + timedelta(days=7)).isoformat(),
                    "read": random.choice([True, False]),
                    "dismissed": False,
                    "interaction_data": {
                        "clicked": False,
                        "time_to_read": 0,
                        "effectiveness_score": 0
                    }
                }
                
                user_notifications.append(notification)
                
            notifications[user_id] = {
                "pending": user_notifications,
                "preferences": {
                    "push_enabled": True,
                    "email_enabled": random.choice([True, False]),
                    "types_enabled": ["achievement", "reminder", "social"],
                    "quiet_hours": {"start": "22:00", "end": "08:00"},
                    "frequency_limits": {"max_per_day": 5, "spacing_minutes": 60}
                }
            }
            
        return {"notifications": notifications}

    def _personalize_notification_message(self, template: str, user_data: Dict[str, Any]) -> str:
        """Personalize notification messages with user data"""
        stats = user_data['stats']
        
        replacements = {
            '{streak}': str(stats['current_streak']),
            '{rank}': str(stats.get('global_rank', random.randint(1, 20))),
            '{badge}': random.choice(['Quiz Master', 'Loop Expert', 'Streak Warrior']),
            '{friend}': random.choice(['Alex', 'Sarah', 'Mike', 'Emma', 'David'])
        }
        
        message = template
        for placeholder, value in replacements.items():
            message = message.replace(placeholder, value)
            
        return message

    def _get_notification_action_url(self, notification_type: str) -> str:
        """Get appropriate action URL for notification type"""
        urls = {
            "streak_reminder": "/daily-challenge",
            "achievement_unlocked": "/achievements", 
            "rank_change": "/leaderboard",
            "social": "/leaderboard"
        }
        return urls.get(notification_type, "/dashboard")

    def _get_notification_action_text(self, notification_type: str) -> str:
        """Get appropriate action text for notification type"""
        texts = {
            "streak_reminder": "Take Challenge",
            "achievement_unlocked": "View Achievement",
            "rank_change": "View Leaderboard", 
            "social": "Check Leaderboard"
        }
        return texts.get(notification_type, "View")

    def generate_activity_feed(self, users: Dict[str, Any]) -> Dict[str, Any]:
        """Generate realistic activity feed data"""
        activities = []
        
        activity_types = [
            "quiz_completed", "achievement_unlocked", "streak_milestone", 
            "level_up", "daily_challenge", "perfect_score"
        ]
        
        # Generate 20 recent activities
        for i in range(20):
            user_id = random.choice(list(users.keys()))
            user_data = users[user_id]
            action_type = random.choice(activity_types)
            
            activity = {
                "id": f"{user_id}_{action_type}_{i}",
                "userId": user_id,
                "user_name": user_data['profile']['name'],
                "user_avatar": user_data['profile']['avatar_url'],
                "action_type": action_type,
                "action_description": self._generate_activity_description(action_type, user_data),
                "points_earned": random.randint(10, 100),
                "timestamp": (datetime.now() - timedelta(minutes=random.randint(10, 1440))).isoformat(),
                "visibility": "public",
                "celebration_level": random.choice(["normal", "exciting", "epic"]),
                "context": self._generate_activity_context(action_type)
            }
            
            activities.append(activity)
            
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {
            "real_time_activity": {
                "live_feed": activities,
                "current_online": self._generate_online_users(users),
                "study_sessions": {}
            }
        }

    def _generate_activity_description(self, action_type: str, user_data: Dict[str, Any]) -> str:
        """Generate activity descriptions"""
        name = user_data['profile']['name'].split()[0]
        
        descriptions = {
            "quiz_completed": f"completed Python Basics Quiz with {random.randint(85, 100)}%!",
            "achievement_unlocked": f"unlocked the '{random.choice(['Quiz Master', 'Loop Expert', 'Speed Demon'])}' badge!",
            "streak_milestone": f"reached a {random.randint(5, 20)}-day study streak!",
            "level_up": f"leveled up to Level {random.randint(2, 8)}!",
            "daily_challenge": "aced today's daily challenge!",
            "perfect_score": f"got a perfect score on {random.choice(['Variables', 'Loops', 'Functions'])} Quiz!"
        }
        
        return descriptions.get(action_type, "did something awesome!")

    def _generate_activity_context(self, action_type: str) -> Dict[str, Any]:
        """Generate context data for activities"""
        contexts = {
            "quiz_completed": {
                "lesson_name": random.choice(["Python Basics", "Loop Mastery", "Function Fundamentals"]),
                "score": random.randint(85, 100),
                "time_taken": random.randint(300, 900)
            },
            "achievement_unlocked": {
                "achievement_name": random.choice(["Quiz Master", "Loop Expert", "Speed Demon"]),
                "rarity": random.choice(["common", "rare", "epic"])
            },
            "streak_milestone": {
                "streak_length": random.randint(5, 20),
                "milestone_type": "daily_study"
            }
        }
        
        return contexts.get(action_type, {})

    def _generate_online_users(self, users: Dict[str, Any]) -> Dict[str, Any]:
        """Generate current online user status"""
        online_users = {}
        
        # Simulate 30% of users being online
        online_count = len(users) // 3
        online_user_ids = random.sample(list(users.keys()), online_count)
        
        for user_id in online_user_ids:
            online_users[user_id] = {
                "last_seen": datetime.now().isoformat(),
                "status": random.choice(["online", "studying", "quiz_taking"]),
                "current_activity": random.choice(["browsing", "studying", "taking_quiz"]),
                "current_lesson": random.choice(self.sample_lessons),
                "study_session_start": (datetime.now() - timedelta(minutes=random.randint(10, 120))).isoformat(),
                "visible_to": ["public"]
            }
            
        return online_users

    def generate_all_sample_data(self) -> Dict[str, Any]:
        """Generate complete sample dataset for dashboard"""
        print("🎪 Generating comprehensive sample data...")
        
        # Generate users first (foundation for everything else)
        print("👥 Generating sample users...")
        users_data = self.generate_sample_users(20)
        users = users_data["users"]
        
        # Generate leaderboard based on users
        print("🏆 Generating leaderboard data...")
        leaderboard_data = self.generate_leaderboard_data(users)
        
        # Generate daily challenges
        print("⚡ Generating daily challenges...")
        challenges_data = self.generate_daily_challenges(7)
        
        # Generate notifications
        print("🔔 Generating notifications...")
        notifications_data = self.generate_notifications(users)
        
        # Generate activity feed
        print("📱 Generating activity feed...")
        activity_data = self.generate_activity_feed(users)
        
        # Combine all data
        complete_data = {
            **users_data,
            **leaderboard_data, 
            **challenges_data,
            **notifications_data,
            **activity_data,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "data_version": "1.0",
                "total_users": len(users),
                "description": "Dazzling Dashboard Sample Data for Testing"
            }
        }
        
        print("✅ Sample data generation complete!")
        return complete_data

if __name__ == "__main__":
    generator = DashboardSampleDataGenerator()
    sample_data = generator.generate_all_sample_data()
    
    # Save to file
    with open('firebase_sample_data.json', 'w') as f:
        json.dump(sample_data, f, indent=2)
        
    print("💾 Sample data saved to firebase_sample_data.json")
    print(f"📊 Generated data includes:")
    print(f"   👥 {len(sample_data['users'])} realistic users")
    print(f"   🏆 {len(sample_data['leaderboard']['global_daily'])} days of leaderboard data")
    print(f"   ⚡ {len(sample_data['daily_challenges'])} daily challenges")
    print(f"   🔔 {len(sample_data['notifications'])} users with notifications")
    print(f"   📱 {len(sample_data['real_time_activity']['live_feed'])} activity feed items")
    print("\n🎪 Ready to upload to Firebase and dazzle students! 🚀")

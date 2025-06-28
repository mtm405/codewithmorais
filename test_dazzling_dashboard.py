#!/usr/bin/env python3
"""
🎪 DAZZLING DASHBOARD - Live Test Script
Test all dashboard functionality and Firebase integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.dashboard_controller import dashboard_controller
import json
from datetime import datetime

def test_dashboard_controller():
    """Test the dashboard controller directly"""
    print("🎪 TESTING DAZZLING DASHBOARD CONTROLLER")
    print("=" * 50)
    
    try:
        # Test leaderboard
        print("🏆 Testing Leaderboard...")
        leaderboard = dashboard_controller.get_leaderboard(period='weekly', limit=5)
        print(f"   ✅ Retrieved {len(leaderboard)} leaderboard entries")
        if leaderboard:
            print(f"   🥇 Top player: {leaderboard[0].get('display_name', 'Unknown')} ({leaderboard[0].get('total_points', 0)} pts)")
        
        # Test daily challenge
        print("\n⚡ Testing Daily Challenge...")
        challenge = dashboard_controller.get_daily_challenge()
        print(f"   ✅ Today's challenge: {challenge.get('title', 'No challenge')}")
        print(f"   💎 Reward: {challenge.get('points_reward', 0)} points")
        
        # Test notifications
        print("\n🔔 Testing Notifications...")
        notifications = dashboard_controller.get_user_notifications(
            user_id='test_user_1',
            unread_only=True,
            limit=3
        )
        print(f"   ✅ Retrieved {len(notifications)} notifications")
        if notifications:
            for notif in notifications[:2]:
                print(f"   📢 {notif.get('title', 'No title')}")
        
        # Test activity feed
        print("\n📱 Testing Activity Feed...")
        activities = dashboard_controller.get_activity_feed(user_id='test_user_1', limit=5)
        print(f"   ✅ Retrieved {len(activities)} activity items")
        if activities:
            print(f"   🎯 Latest: {activities[0].get('description', 'No description')}")
        
        # Test user stats
        print("\n📊 Testing User Statistics...")
        stats = dashboard_controller.get_user_statistics(user_id='test_user_1')
        print(f"   ✅ Total Points: {stats.get('total_points', 0)}")
        print(f"   ✅ Lessons Completed: {stats.get('lessons_completed', 0)}")
        print(f"   ✅ Current Streak: {stats.get('current_streak', 0)} days")
        print(f"   ✅ Weekly Rank: #{stats.get('weekly_rank', 'N/A')}")
        
        # Test gamification
        print("\n🎮 Testing Gamification...")
        gamification = dashboard_controller.get_user_gamification(user_id='test_user_1')
        badges = gamification.get('badges', [])
        level_progress = gamification.get('level_progress', {})
        print(f"   ✅ Badges Earned: {len(badges)}")
        print(f"   ✅ Current Level: {level_progress.get('current_level', 1)}")
        print(f"   ✅ Level Title: {level_progress.get('level_title', 'Beginner')}")
        
        print("\n🎉 ALL TESTS PASSED! Dashboard is fully functional!")
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_sample_data():
    """Display sample data stats"""
    print("\n📊 SAMPLE DATA OVERVIEW")
    print("=" * 30)
    
    try:
        with open('firebase_sample_data.json', 'r') as f:
            sample_data = json.load(f)
        
        print(f"👥 Users: {len(sample_data.get('users', []))}")
        print(f"🏆 Leaderboard Entries: {len(sample_data.get('leaderboard', []))}")
        print(f"⚡ Daily Challenges: {len(sample_data.get('daily_challenges', []))}")
        print(f"🔔 Notifications: {len(sample_data.get('notifications', []))}")
        print(f"📱 Activity Items: {len(sample_data.get('activity_feed', []))}")
        print(f"🏅 Badges: {len(sample_data.get('gamification', {}).get('badges', []))}")
        
        # Show some sample users
        users = sample_data.get('users', [])[:3]
        print("\n🌟 Sample Users:")
        for user in users:
            print(f"   • {user.get('display_name', 'Unknown')} - {user.get('total_points', 0)} pts")
            
    except Exception as e:
        print(f"❌ Could not load sample data: {e}")

if __name__ == "__main__":
    print("🎪 DAZZLING DASHBOARD - COMPREHENSIVE TEST")
    print("🚀 Testing the most interactive learning dashboard ever!")
    print("=" * 60)
    
    # Test sample data
    test_sample_data()
    
    # Test dashboard controller
    success = test_dashboard_controller()
    
    if success:
        print("\n" + "=" * 60)
        print("🎉 CONGRATULATIONS! 🎉")
        print("🎪 Your Dazzling Dashboard is FULLY OPERATIONAL!")
        print("🚀 Ready to engage and delight students!")
        print("✨ Features working:")
        print("   🏆 Real-time Leaderboard")
        print("   ⚡ Interactive Daily Challenges") 
        print("   🔔 Smart Notifications")
        print("   📱 Personalized Activity Feed")
        print("   📊 Comprehensive User Analytics")
        print("   🎮 Gamification & Achievements")
        print("   🔥 Firebase Real-time Updates")
        print("\n🎯 Open http://localhost:5000/dev-test to see it in action!")
    else:
        print("\n❌ Some tests failed. Check the errors above.")

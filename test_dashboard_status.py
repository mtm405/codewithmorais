#!/usr/bin/env python3
"""
🎪 DASHBOARD STATUS CHECKER
Quick verification that dashboard is working correctly
"""

import requests
import json
from datetime import datetime

def test_dashboard_status():
    """Test if dashboard is accessible and working"""
    print("🎪 DASHBOARD STATUS CHECK")
    print("=" * 50)
    
    try:
        # Test main dashboard page
        print("\n1. Testing main dashboard route...")
        response = requests.get('http://localhost:8080/dashboard', timeout=5)
        if response.status_code == 200:
            print("✅ Dashboard page accessible")
            if 'course-dashboard' in response.text:
                print("✅ Dashboard HTML structure present")
            if 'simple_dashboard.js' in response.text:
                print("✅ Simple dashboard JS loaded")
        else:
            print(f"❌ Dashboard not accessible: {response.status_code}")
            return False
            
        # Test API endpoints
        print("\n2. Testing API endpoints...")
        api_endpoints = [
            '/api/dashboard/leaderboard',
            '/api/dashboard/daily_challenge',
            '/api/dashboard/notifications',
            '/api/dashboard/activity_feed',
            '/api/dashboard/user_stats'
        ]
        
        for endpoint in api_endpoints:
            try:
                api_response = requests.get(f'http://localhost:8080{endpoint}', timeout=3)
                if api_response.status_code == 200:
                    print(f"✅ {endpoint} - Working")
                else:
                    print(f"⚠️  {endpoint} - Status {api_response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint} - Error: {str(e)}")
        
        print("\n3. Dashboard Expected Behavior:")
        print("   🎯 Should show sample leaderboard data")
        print("   🎯 Should show daily challenge")
        print("   🎯 Should show notifications")
        print("   🎯 Should show activity feed")
        print("   🎯 Should have modern, animated interface")
        print("   🎯 Should NOT show any blue modals")
        
        print("\n✅ Dashboard test complete!")
        print("🌐 Open: http://localhost:8080/dashboard")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Flask app not running!")
        print("Run: python app.py")
        return False
    except Exception as e:
        print(f"❌ Error testing dashboard: {str(e)}")
        return False

if __name__ == "__main__":
    test_dashboard_status()

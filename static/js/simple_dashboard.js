/**
 * 🎪 SIMPLE WORKING DASHBOARD - Shows Real Data Immediately
 * No complex API calls - just displays beautiful sample data
 */

class SimpleDashboard {
    constructor() {
        console.log('🎪 Simple Dashboard starting...');
        this.init();
    }

    async init() {
        // Remove any blue modals first
        this.removeModals();
        
        // Populate with sample data immediately
        this.populateLeaderboard();
        this.populateDailyChallenge();
        this.populateNotifications();
        this.populateActivityFeed();
        this.populateUserStats();
        this.populateGamification();
        
        console.log('✅ Dashboard populated with sample data!');
    }

    removeModals() {
        // Remove any existing overlays/modals
        const overlays = document.querySelectorAll('.welcome-overlay, .celebration-overlay, .modal, .overlay');
        overlays.forEach(overlay => overlay.remove());
    }

    populateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        const sampleLeaderboard = [
            { rank: 1, name: 'Sarah Chen', points: 1450, avatar: '/static/img/avatar1.png', badges: ['🔥', '⭐'] },
            { rank: 2, name: 'Mike Johnson', points: 1398, avatar: '/static/img/avatar2.png', badges: ['🚀'] },
            { rank: 3, name: 'Emma Davis', points: 1245, avatar: '/static/img/avatar3.png', badges: ['💎', '🏆'] },
            { rank: 4, name: 'Alex Wu', points: 1190, avatar: '/static/img/avatar4.png', badges: ['⚡'] },
            { rank: 5, name: 'You', points: 1150, avatar: '/static/img/avatar5.png', badges: ['🎯'], isCurrentUser: true }
        ];

        const html = sampleLeaderboard.map(user => `
            <tr class="leaderboard-entry ${user.isCurrentUser ? 'current-user' : ''}" style="animation: fadeInUp 0.5s ease-out ${user.rank * 0.1}s both;">
                <td class="rank-cell">
                    <div class="rank-display">
                        <span class="rank-number">${user.rank}</span>
                        ${user.rank === 1 ? '<span class="rank-icon gold">👑</span>' : ''}
                        ${user.rank === 2 ? '<span class="rank-icon silver">🥈</span>' : ''}
                        ${user.rank === 3 ? '<span class="rank-icon bronze">🥉</span>' : ''}
                    </div>
                </td>
                <td class="name-cell">
                    <div class="user-info">
                        <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                        <div class="user-details">
                            <span class="user-name">${user.name}</span>
                            <div class="user-badges">
                                ${user.badges.map(badge => `<span class="badge-mini">${badge}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="points-cell">
                    <div class="points-display">
                        <span class="points-value">${user.points.toLocaleString()}</span>
                        <span class="points-label">pts</span>
                    </div>
                </td>
            </tr>
        `).join('');

        leaderboardList.innerHTML = html;
        console.log('🏆 Leaderboard populated');
    }

    populateDailyChallenge() {
        const challengeContent = document.getElementById('daily-challenge-content');
        if (!challengeContent) return;

        const challenge = {
            title: 'Python Loop Master Challenge',
            description: 'Write a for loop that prints numbers 1 to 10, but skip number 7',
            points: 50,
            progress: 0,
            completed: false
        };

        challengeContent.innerHTML = `
            <div class="challenge-card" style="animation: slideInRight 0.5s ease-out;">
                <div class="challenge-header">
                    <div class="challenge-icon">⚡</div>
                    <div class="challenge-title">${challenge.title}</div>
                    <div class="challenge-points">+${challenge.points} pts</div>
                </div>
                
                <div class="challenge-description">
                    ${challenge.description}
                </div>
                
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${challenge.progress}%"></div>
                    </div>
                    <span class="progress-text">${challenge.progress}% Complete</span>
                </div>
                
                <div class="challenge-actions">
                    <button class="btn-start-challenge" onclick="simpleDashboard.startChallenge()">
                        <span class="material-symbols-outlined">play_arrow</span>Start Challenge
                    </button>
                </div>
                
                <div class="challenge-timer">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>Resets in <span class="time-remaining">8h 32m</span></span>
                </div>
            </div>
        `;
        console.log('⚡ Daily challenge populated');
    }

    populateNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        const notifications = [
            { icon: '🔥', title: 'Streak Alert!', message: 'You have a 5-day streak! Keep it going!', time: '2 min ago', priority: 'high' },
            { icon: '🏆', title: 'Rank Change', message: 'You moved up to #5 in the leaderboard!', time: '1 hour ago', priority: 'medium' },
            { icon: '🎯', title: 'New Badge', message: 'You earned the "Loop Master" badge!', time: '3 hours ago', priority: 'high' }
        ];

        const html = notifications.map((notif, index) => `
            <div class="notification-item ${notif.priority}" style="animation: fadeInUp 0.5s ease-out ${index * 0.2}s both;">
                <div class="notification-icon">${notif.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${notif.time}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.style.display='none'">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `).join('');

        notificationList.innerHTML = html;
        console.log('🔔 Notifications populated');
    }

    populateActivityFeed() {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        const activities = [
            { icon: '🏆', text: 'Sarah Chen completed "Advanced Functions" lesson', time: '5 min ago', points: 50 },
            { icon: '⚡', text: 'Mike Johnson finished today\'s daily challenge', time: '12 min ago', points: 40 },
            { icon: '🎯', text: 'Emma Davis earned "Quiz Master" badge', time: '28 min ago', points: null },
            { icon: '📚', text: 'Alex Wu started "Data Structures" module', time: '45 min ago', points: null },
            { icon: '🔥', text: 'You achieved a 5-day learning streak!', time: '1 hour ago', points: 25 }
        ];

        const html = activities.map((activity, index) => `
            <div class="activity-item" style="animation: slideInRight 0.5s ease-out ${index * 0.1}s both;">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                ${activity.points ? `<div class="activity-points">+${activity.points}</div>` : ''}
            </div>
        `).join('');

        activityFeed.innerHTML = html;
        console.log('📱 Activity feed populated');
    }

    populateUserStats() {
        const stats = {
            totalPoints: 1150,
            lessonsCompleted: 23,
            currentStreak: 5,
            weeklyRank: 5
        };

        this.animateStatValue('total-points', stats.totalPoints);
        this.animateStatValue('lessons-completed', stats.lessonsCompleted);
        this.animateStatValue('current-streak', stats.currentStreak);
        
        const weeklyRankElement = document.getElementById('weekly-rank');
        if (weeklyRankElement) {
            weeklyRankElement.textContent = `#${stats.weeklyRank}`;
        }

        console.log('📊 User stats populated');
    }

    animateStatValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let currentValue = 0;
        const increment = targetValue / 30; // 30 frames
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue).toLocaleString();
        }, 50);
    }

    populateGamification() {
        // Level progress
        const levelProgress = document.getElementById('level-progress');
        if (levelProgress) {
            levelProgress.innerHTML = `
                <div class="level-display">
                    <div class="level-number">Level 3</div>
                    <div class="level-title">Code Scholar</div>
                </div>
                <div class="xp-progress">
                    <div class="xp-bar">
                        <div class="xp-fill" style="width: 75%; animation: slideInRight 1s ease-out;"></div>
                    </div>
                    <div class="xp-text">750 / 1000 XP</div>
                </div>
            `;
        }

        // Badges
        const badgeShowcase = document.getElementById('badge-showcase');
        if (badgeShowcase) {
            const badges = [
                { icon: '🔥', name: 'Streak Master', rarity: 'rare', date: 'Today' },
                { icon: '🎯', name: 'Quiz Expert', rarity: 'common', date: 'Yesterday' },
                { icon: '⚡', name: 'Fast Learner', rarity: 'epic', date: '2 days ago' },
                { icon: '🏆', name: 'Challenge Champion', rarity: 'legendary', date: '1 week ago' }
            ];

            const html = badges.map((badge, index) => `
                <div class="badge-item ${badge.rarity}" style="animation: fadeInUp 0.5s ease-out ${index * 0.2}s both;">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-date">Earned ${badge.date}</div>
                </div>
            `).join('');

            badgeShowcase.innerHTML = html;
        }

        console.log('🎮 Gamification populated');
    }

    startChallenge() {
        const button = document.querySelector('.btn-start-challenge');
        if (button) {
            button.innerHTML = '<span class="loading-spinner"></span>Starting...';
            button.disabled = true;

            // Simulate challenge completion
            setTimeout(() => {
                this.showCelebration('Challenge Completed!', '+50 Points Earned!');
                this.populateDailyChallenge(); // Refresh with completed state
            }, 2000);
        }
    }

    showCelebration(title, subtitle) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-text">${title}</div>
                <div class="celebration-points">${subtitle}</div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.classList.add('fade-out');
            setTimeout(() => celebration.remove(), 500);
        }, 2000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard pages
    if (document.querySelector('.course-dashboard') || document.querySelector('.dashboard-main-grid')) {
        window.simpleDashboard = new SimpleDashboard();
        console.log('🎪 Simple Dashboard initialized!');
    }
});

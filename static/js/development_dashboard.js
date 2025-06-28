/**
 * 🎪 DEVELOPMENT DASHBOARD - Real Sample Data Display
 * Uses actual Firebase sample data for realistic testing experience
 */

class DevelopmentDashboard {
    constructor() {
        console.log('🎪 Development Dashboard starting...');
        this.devMode = true;
        this.apiBase = '/api/dev/dashboard';
        this.init();
    }

    async init() {
        // Remove any modals first
        this.removeModals();
        
        // Show loading state
        this.showLoadingState();
        
        try {
            // Load all dashboard data
            await this.loadAllDashboardData();
            
            // Hide loading and show content
            this.hideLoadingState();
            this.showSuccessMessage();
            
            console.log('✅ Development Dashboard loaded with real sample data!');
        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            this.showErrorState(error);
        }
    }

    removeModals() {
        // Remove any existing overlays/modals
        const overlays = document.querySelectorAll('.welcome-overlay, .celebration-overlay, .modal, .overlay');
        overlays.forEach(overlay => overlay.remove());
        
        // Add CSS to hide any remaining modals
        const style = document.createElement('style');
        style.textContent = `
            .modal, .overlay, .welcome-overlay, .celebration-overlay { 
                display: none !important; 
                visibility: hidden !important; 
            }
        `;
        document.head.appendChild(style);
    }

    showLoadingState() {
        // Add loading indicators to each section
        const sections = [
            { id: 'leaderboard-list', text: 'Loading leaderboard...' },
            { id: 'daily-challenge-content', text: 'Loading daily challenge...' },
            { id: 'notification-list', text: 'Loading notifications...' },
            { id: 'activity-feed-list', text: 'Loading activity feed...' }
        ];

        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                element.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <span>${section.text}</span>
                    </div>
                `;
            }
        });
    }

    hideLoadingState() {
        document.querySelectorAll('.loading-state').forEach(el => el.remove());
    }

    async loadAllDashboardData() {
        try {
            const response = await fetch(`${this.apiBase}/all`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load dashboard data');
            }
            
            const data = result.data;
            
            // Populate each section
            this.populateLeaderboard(data.leaderboard);
            this.populateDailyChallenge(data.daily_challenge);
            this.populateNotifications(data.notifications);
            this.populateActivityFeed(data.activity_feed);
            this.populateUserStats(data.user_stats);
            
            return data;
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    populateLeaderboard(leaderboardData) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList || !leaderboardData) return;

        const html = leaderboardData.map(user => `
            <tr class="leaderboard-entry ${user.isCurrentUser ? 'current-user' : ''}" 
                style="animation: fadeInUp 0.5s ease-out ${user.rank * 0.1}s both;">
                <td class="rank-cell">
                    <div class="rank-display">
                        <span class="rank-number">${user.rank}</span>
                        ${user.rank <= 3 ? this.getRankIcon(user.rank) : ''}
                    </div>
                </td>
                <td class="name-cell">
                    <div class="user-info">
                        <img src="${user.avatar}" class="user-avatar" alt="${user.name}" 
                             onerror="this.src='/static/img/avatar${user.rank}.png'">
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-badges">
                                ${user.badges.map(badge => `<span class="badge-mini">${badge}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="points-cell">
                    <div class="points-display">
                        <div class="points-value">${user.points.toLocaleString()}</div>
                        <div class="points-label">Points</div>
                    </div>
                </td>
            </tr>
        `).join('');

        leaderboardList.innerHTML = html;
    }

    getRankIcon(rank) {
        const icons = {
            1: '<span class="rank-icon gold">👑</span>',
            2: '<span class="rank-icon silver">🥈</span>',
            3: '<span class="rank-icon bronze">🥉</span>'
        };
        return icons[rank] || '';
    }

    populateDailyChallenge(challengeData) {
        const challengeContent = document.getElementById('daily-challenge-content');
        if (!challengeContent || !challengeData) return;

        const progressWidth = challengeData.progress || 0;
        const isCompleted = challengeData.completed;

        challengeContent.innerHTML = `
            <div class="challenge-card ${isCompleted ? 'completed' : ''}">
                <div class="challenge-header">
                    <div class="challenge-icon">${isCompleted ? '✅' : '⚡'}</div>
                    <div class="challenge-title">${challengeData.title}</div>
                    <div class="challenge-points">+${challengeData.points_reward} pts</div>
                </div>
                <div class="challenge-description">
                    ${challengeData.description}
                </div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressWidth}%"></div>
                    </div>
                    <div class="progress-text">${progressWidth}% Complete</div>
                </div>
                <div class="challenge-actions">
                    ${isCompleted ? 
                        '<button class="btn-completed"><span>✅</span> Completed!</button>' :
                        '<button class="btn-start-challenge"><span>🚀</span> Start Challenge</button>'
                    }
                </div>
                <div class="challenge-timer">
                    <span>⏰</span>
                    <span class="time-remaining">${challengeData.time_remaining || '24h 0m'} remaining</span>
                </div>
            </div>
        `;

        // Add click handler for start button
        const startBtn = challengeContent.querySelector('.btn-start-challenge');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startChallenge(challengeData));
        }
    }

    populateNotifications(notificationsData) {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList || !notificationsData) return;

        if (notificationsData.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <span class="material-symbols-outlined">notifications_off</span>
                    <div>No new notifications</div>
                </div>
            `;
            return;
        }

        const html = notificationsData.map((notification, index) => `
            <div class="notification-item ${notification.priority}" 
                 style="animation: fadeInUp 0.5s ease-out ${index * 0.1}s both;">
                <div class="notification-icon">${this.getNotificationIcon(notification.type)}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.time)}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.style.display='none'">×</button>
            </div>
        `).join('');

        notificationList.innerHTML = html;
    }

    populateActivityFeed(activityData) {
        const activityList = document.getElementById('activity-feed-list');
        if (!activityList || !activityData) return;

        const html = activityData.map((activity, index) => `
            <div class="activity-item" style="animation: slideInRight 0.5s ease-out ${index * 0.1}s both;">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${this.formatTime(activity.time)}</div>
                </div>
                ${activity.points > 0 ? `<div class="activity-points">+${activity.points}</div>` : ''}
            </div>
        `).join('');

        activityList.innerHTML = html;
    }

    populateUserStats(statsData) {
        // Update user stats in various places
        this.updateStatsGrid(statsData);
        this.updateProgressBars(statsData);
    }

    updateStatsGrid(stats) {
        const statsElements = {
            'total-points': stats.total_points?.toLocaleString() || '0',
            'current-streak': stats.current_streak || '0',
            'lessons-completed': stats.lessons_completed || '0',
            'average-score': `${stats.average_score || 0}%`,
            'weekly-rank': `#${stats.weekly_rank || 'N/A'}`,
            'pycoins': stats.pycoins?.toLocaleString() || '0'
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateProgressBars(stats) {
        // Update XP progress bar
        const xpProgress = document.querySelector('.xp-fill');
        if (xpProgress && stats.current_xp && stats.next_level_xp) {
            const percentage = Math.min((stats.current_xp / stats.next_level_xp) * 100, 100);
            xpProgress.style.width = `${percentage}%`;
        }

        // Update level display
        const levelDisplay = document.querySelector('.level-number');
        if (levelDisplay) {
            levelDisplay.textContent = stats.level || 1;
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'achievement': '🏆',
            'lesson': '📚',
            'challenge': '⚡',
            'social': '👥',
            'system': '🔔',
            'info': 'ℹ️'
        };
        return icons[type] || '🔔';
    }

    formatTime(timeString) {
        try {
            const date = new Date(timeString);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
            return `${Math.floor(diff / 86400000)}d ago`;
        } catch {
            return 'Recently';
        }
    }

    startChallenge(challenge) {
        this.showNotification(`Started: ${challenge.title}`, 'success');
        // Here you could redirect to the actual challenge or open a modal
    }

    showSuccessMessage() {
        this.showNotification('🎪 Dashboard loaded with real sample data!', 'success');
    }

    showErrorState(error) {
        const message = `Failed to load dashboard: ${error.message}`;
        this.showNotification(message, 'error');
        
        // Show fallback content
        this.populateWithFallbackData();
    }

    populateWithFallbackData() {
        // Fallback to hardcoded data if API fails
        console.log('🔄 Loading fallback data...');
        // ... implement fallback data similar to simple_dashboard.js
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `dev-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard pages
    if (document.querySelector('.course-dashboard') || document.querySelector('.dashboard-main-grid')) {
        window.developmentDashboard = new DevelopmentDashboard();
        console.log('🎪 Development Dashboard initialized with real sample data!');
    }
});

// Add necessary CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 40px 20px;
        color: #64748b;
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e2e8f0;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .current-user {
        background: linear-gradient(135dge, #ddd6fe 0%, #e0e7ff 100%) !important;
        border: 2px solid #6366f1 !important;
    }
    
    .dev-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;
document.head.appendChild(style);

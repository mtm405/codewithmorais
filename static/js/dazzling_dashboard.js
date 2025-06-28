/**
 * 🎪 DAZZLING DASHBOARD - The Ultimate Interactive Learning Experience
 * Real-time Firebase-powered dashboard with gamification, notifications, and smart analytics
 * ====================================================================================
 */

class DazzlingDashboard {
    constructor() {
        this.apiBase = '/api/dashboard';
        this.refreshInterval = 30000; // 30 seconds
        this.animationDuration = 300;
        this.notificationSound = null;
        this.currentUser = null;
        this.realTimeListeners = [];
        
        // Initialize dashboard
        this.init();
    }

    async init() {
        console.log('🎪 Initializing Dazzling Dashboard...');
        
        try {
            // Get current user info
            this.currentUser = await this.getCurrentUser();
            
            // Initialize all dashboard components
            await Promise.all([
                this.initializeLeaderboard(),
                this.initializeDailyChallenge(),
                this.initializeNotifications(),
                this.initializeActivityFeed(),
                this.initializeUserStats(),
                this.initializeGamification()
            ]);
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Initialize notification sound
            this.initializeNotificationSound();
            
            console.log('🚀 Dazzling Dashboard initialized successfully!');
            this.showWelcomeAnimation();
            
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showErrorState('Failed to initialize dashboard');
        }
    }

    // =====================================
    // 🏆 REAL-TIME LEADERBOARD
    // =====================================
    
    async initializeLeaderboard() {
        try {
            const response = await fetch(`${this.apiBase}/leaderboard?period=weekly&limit=10`);
            const data = await response.json();
            
            if (data.success) {
                this.renderLeaderboard(data.data);
                this.animateLeaderboardEntrance();
            }
        } catch (error) {
            console.error('❌ Leaderboard initialization failed:', error);
        }
    }

    renderLeaderboard(leaderboardData) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        const html = leaderboardData.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user_id === this.currentUser?.uid;
            const rankIcon = this.getRankIcon(rank);
            const badgeHtml = entry.badges ? entry.badges.map(badge => 
                `<span class="badge-mini" title="${badge.name}">${badge.icon}</span>`
            ).join('') : '';

            return `
                <tr class="leaderboard-entry ${isCurrentUser ? 'current-user' : ''}" data-rank="${rank}">
                    <td class="rank-cell">
                        <div class="rank-display">
                            <span class="rank-number">${rank}</span>
                            ${rankIcon}
                        </div>
                    </td>
                    <td class="name-cell">
                        <div class="user-info">
                            <img src="${entry.avatar_url || '/static/img/avatar1.png'}" 
                                 alt="${entry.display_name}" class="user-avatar">
                            <div class="user-details">
                                <span class="user-name">${entry.display_name}</span>
                                <div class="user-badges">${badgeHtml}</div>
                            </div>
                        </div>
                    </td>
                    <td class="points-cell">
                        <div class="points-display">
                            <span class="points-value">${entry.total_points.toLocaleString()}</span>
                            <span class="points-label">pts</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        leaderboardList.innerHTML = html;
    }

    getRankIcon(rank) {
        if (rank === 1) return '<span class="rank-icon gold">👑</span>';
        if (rank === 2) return '<span class="rank-icon silver">🥈</span>';
        if (rank === 3) return '<span class="rank-icon bronze">🥉</span>';
        return '';
    }

    animateLeaderboardEntrance() {
        const entries = document.querySelectorAll('.leaderboard-entry');
        entries.forEach((entry, index) => {
            entry.style.opacity = '0';
            entry.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.style.transition = `all ${this.animationDuration}ms ease-out`;
                entry.style.opacity = '1';
                entry.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // =====================================
    // ⚡ INTERACTIVE DAILY CHALLENGE
    // =====================================
    
    async initializeDailyChallenge() {
        try {
            const response = await fetch(`${this.apiBase}/daily_challenge`);
            const data = await response.json();
            
            if (data.success) {
                this.renderDailyChallenge(data.data);
            }
        } catch (error) {
            console.error('❌ Daily challenge initialization failed:', error);
        }
    }

    renderDailyChallenge(challengeData) {
        const challengeContent = document.getElementById('daily-challenge-content');
        if (!challengeContent) return;

        const isCompleted = challengeData.user_progress?.completed || false;
        const progress = challengeData.user_progress?.progress || 0;
        
        const html = `
            <div class="challenge-card ${isCompleted ? 'completed' : ''}" data-challenge-id="${challengeData.id}">
                <div class="challenge-header">
                    <div class="challenge-icon">${challengeData.icon}</div>
                    <div class="challenge-title">${challengeData.title}</div>
                    <div class="challenge-points">+${challengeData.points_reward} pts</div>
                </div>
                
                <div class="challenge-description">
                    ${challengeData.description}
                </div>
                
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}% Complete</span>
                </div>
                
                <div class="challenge-actions">
                    ${isCompleted ? 
                        '<button class="btn-completed" disabled><span class="material-symbols-outlined">check_circle</span>Completed!</button>' :
                        `<button class="btn-start-challenge" onclick="dazzlingDashboard.startChallenge('${challengeData.id}')"><span class="material-symbols-outlined">play_arrow</span>Start Challenge</button>`
                    }
                </div>
                
                <div class="challenge-timer">
                    <span class="material-symbols-outlined">schedule</span>
                    <span id="challenge-timer-text">Resets in <span class="time-remaining"></span></span>
                </div>
            </div>
        `;
        
        challengeContent.innerHTML = html;
        this.startChallengeTimer();
    }

    async startChallenge(challengeId) {
        try {
            const button = document.querySelector('.btn-start-challenge');
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span>Starting...';
            
            // Here you would integrate with your lesson/quiz system
            // For now, we'll simulate completing the challenge
            await this.simulateChallenge(challengeId);
            
        } catch (error) {
            console.error('❌ Challenge start failed:', error);
        }
    }

    async simulateChallenge(challengeId) {
        // Simulate challenge completion after 3 seconds
        setTimeout(async () => {
            try {
                const response = await fetch(`${this.apiBase}/daily_challenge/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        challenge_id: challengeId,
                        points_earned: 50
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showChallengeCompletionAnimation();
                    this.initializeDailyChallenge(); // Refresh
                    this.initializeUserStats(); // Update stats
                    this.playNotificationSound();
                }
            } catch (error) {
                console.error('❌ Challenge completion failed:', error);
            }
        }, 3000);
    }

    showChallengeCompletionAnimation() {
        // Create celebration animation
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-text">Challenge Completed!</div>
                <div class="celebration-points">+50 Points Earned!</div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.classList.add('fade-out');
            setTimeout(() => celebration.remove(), 500);
        }, 2000);
    }

    startChallengeTimer() {
        const timerElement = document.querySelector('.time-remaining');
        if (!timerElement) return;
        
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const timeLeft = tomorrow - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            timerElement.textContent = `${hours}h ${minutes}m`;
        };
        
        updateTimer();
        setInterval(updateTimer, 60000); // Update every minute
    }

    // =====================================
    // 🔔 SMART NOTIFICATIONS
    // =====================================
    
    async initializeNotifications() {
        try {
            const response = await fetch(`${this.apiBase}/notifications?unread_only=true&limit=5`);
            const data = await response.json();
            
            if (data.success) {
                this.renderNotifications(data.data);
                this.updateNotificationBadge(data.data.length);
            }
        } catch (error) {
            console.error('❌ Notifications initialization failed:', error);
        }
    }

    renderNotifications(notifications) {
        const notificationContainer = document.getElementById('notification-list');
        if (!notificationContainer) return;

        if (notifications.length === 0) {
            notificationContainer.innerHTML = `
                <div class="no-notifications">
                    <span class="material-symbols-outlined">notifications_off</span>
                    <span>All caught up!</span>
                </div>
            `;
            return;
        }

        const html = notifications.map(notification => `
            <div class="notification-item ${notification.priority}" data-id="${notification.id}">
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatRelativeTime(notification.created_at)}</div>
                </div>
                <button class="notification-close" onclick="dazzlingDashboard.markNotificationRead('${notification.id}')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `).join('');

        notificationContainer.innerHTML = html;
    }

    async markNotificationRead(notificationId) {
        try {
            const response = await fetch(`${this.apiBase}/notifications/mark_read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_ids: [notificationId] })
            });
            
            if (response.ok) {
                const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
                if (notificationElement) {
                    notificationElement.classList.add('fade-out');
                    setTimeout(() => notificationElement.remove(), 300);
                }
                this.initializeNotifications(); // Refresh
            }
        } catch (error) {
            console.error('❌ Mark notification read failed:', error);
        }
    }

    updateNotificationBadge(count) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    // =====================================
    // 📱 ACTIVITY FEED
    // =====================================
    
    async initializeActivityFeed() {
        try {
            const response = await fetch(`${this.apiBase}/activity_feed?limit=10`);
            const data = await response.json();
            
            if (data.success) {
                this.renderActivityFeed(data.data);
            }
        } catch (error) {
            console.error('❌ Activity feed initialization failed:', error);
        }
    }

    renderActivityFeed(activities) {
        const feedContainer = document.getElementById('activity-feed');
        if (!feedContainer) return;

        const html = activities.map(activity => `
            <div class="activity-item ${activity.activity_type}">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.description}</div>
                    <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                </div>
                ${activity.points ? `<div class="activity-points">+${activity.points}</div>` : ''}
            </div>
        `).join('');

        feedContainer.innerHTML = html;
    }

    // =====================================
    // 📊 USER STATISTICS
    // =====================================
    
    async initializeUserStats() {
        try {
            const response = await fetch(`${this.apiBase}/user_stats`);
            const data = await response.json();
            
            if (data.success) {
                this.renderUserStats(data.data);
            }
        } catch (error) {
            console.error('❌ User stats initialization failed:', error);
        }
    }

    renderUserStats(stats) {
        // Update various stat displays
        this.updateStatDisplay('total-points', stats.total_points);
        this.updateStatDisplay('lessons-completed', stats.lessons_completed);
        this.updateStatDisplay('current-streak', stats.current_streak);
        this.updateStatDisplay('weekly-rank', stats.weekly_rank);
        
        // Update progress charts if they exist
        this.updateProgressCharts(stats);
    }

    updateStatDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            this.animateNumber(element, value);
        }
    }

    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // =====================================
    // 🎮 GAMIFICATION
    // =====================================
    
    async initializeGamification() {
        try {
            const response = await fetch(`${this.apiBase}/gamification`);
            const data = await response.json();
            
            if (data.success) {
                this.renderGamification(data.data);
            }
        } catch (error) {
            console.error('❌ Gamification initialization failed:', error);
        }
    }

    renderGamification(gamificationData) {
        this.renderBadges(gamificationData.badges);
        this.renderLevelProgress(gamificationData.level_progress);
        this.renderAchievements(gamificationData.achievements);
    }

    renderBadges(badges) {
        const badgeContainer = document.getElementById('badge-showcase');
        if (!badgeContainer) return;

        const html = badges.map(badge => `
            <div class="badge-item ${badge.rarity}" title="${badge.description}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                ${badge.earned_at ? `<div class="badge-date">Earned ${this.formatDate(badge.earned_at)}</div>` : ''}
            </div>
        `).join('');

        badgeContainer.innerHTML = html;
    }

    renderLevelProgress(levelProgress) {
        const levelContainer = document.getElementById('level-progress');
        if (!levelContainer) return;

        const progressPercent = (levelProgress.current_xp / levelProgress.xp_to_next_level) * 100;

        levelContainer.innerHTML = `
            <div class="level-display">
                <div class="level-number">Level ${levelProgress.current_level}</div>
                <div class="level-title">${levelProgress.level_title}</div>
            </div>
            <div class="xp-progress">
                <div class="xp-bar">
                    <div class="xp-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="xp-text">${levelProgress.current_xp} / ${levelProgress.xp_to_next_level} XP</div>
            </div>
        `;
    }

    // =====================================
    // 🔄 REAL-TIME UPDATES
    // =====================================
    
    setupRealTimeUpdates() {
        // Set up periodic refresh for dynamic content
        setInterval(() => {
            this.refreshDashboard();
        }, this.refreshInterval);
        
        // Set up visibility change listener to refresh when tab becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshDashboard();
            }
        });
    }

    async refreshDashboard() {
        try {
            // Only refresh if user is still authenticated
            if (this.currentUser) {
                await Promise.all([
                    this.initializeLeaderboard(),
                    this.initializeNotifications(),
                    this.initializeActivityFeed(),
                    this.initializeUserStats()
                ]);
            }
        } catch (error) {
            console.error('❌ Dashboard refresh failed:', error);
        }
    }

    // =====================================
    // 🔧 UTILITY FUNCTIONS
    // =====================================
    
    async getCurrentUser() {
        try {
            const response = await fetch('/api/get_user_info');
            const data = await response.json();
            return data.success ? data.user : null;
        } catch (error) {
            console.error('❌ Get current user failed:', error);
            return null;
        }
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    initializeNotificationSound() {
        // Create audio context for notification sounds
        try {
            this.notificationSound = new Audio('/static/sounds/notification.mp3');
            this.notificationSound.volume = 0.3;
        } catch (error) {
            console.log('Notification sound not available');
        }
    }

    playNotificationSound() {
        if (this.notificationSound) {
            this.notificationSound.play().catch(() => {
                // Ignore if audio play fails (browser restrictions)
            });
        }
    }

    showWelcomeAnimation() {
        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.className = 'welcome-overlay';
        welcomeOverlay.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">🎪</div>
                <div class="welcome-title">Welcome to Your Dazzling Dashboard!</div>
                <div class="welcome-subtitle">Your personalized learning experience awaits</div>
            </div>
        `;
        
        document.body.appendChild(welcomeOverlay);
        
        setTimeout(() => {
            welcomeOverlay.classList.add('fade-out');
            setTimeout(() => welcomeOverlay.remove(), 500);
        }, 2500);
    }

    showErrorState(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'dashboard-error';
        errorContainer.innerHTML = `
            <div class="error-content">
                <span class="material-symbols-outlined">error</span>
                <div class="error-message">${message}</div>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
        
        document.body.appendChild(errorContainer);
    }
}

// =====================================
// 🚀 INITIALIZE DAZZLING DASHBOARD
// =====================================

let dazzlingDashboard;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard pages
    if (document.querySelector('.course-dashboard') || document.querySelector('.dashboard-main-grid')) {
        dazzlingDashboard = new DazzlingDashboard();
    }
});

// Export for global access
window.DazzlingDashboard = DazzlingDashboard;
window.dazzlingDashboard = dazzlingDashboard;

// Real Data Integration for Student Dashboard
// This script connects your dashboard to real Firebase/Flask data

class RealDataDashboard {
    constructor() {
        this.apiEndpoint = '/api/dashboard_data';
        this.updateInterval = 30000; // Update every 30 seconds
        this.init();
    }

    async init() {
        console.log('Initializing real data dashboard...');
        
        // Load initial data
        await this.loadDashboardData();
        
        // Set up periodic updates
        this.setupPeriodicUpdates();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    async loadDashboardData() {
        try {
            console.log('Loading dashboard data from API...');
            
            const response = await fetch(this.apiEndpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Dashboard data loaded:', data);
            
            this.updateDashboardUI(data);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data. Using cached/default values.');
        }
    }

    updateDashboardUI(data) {
        // Update user information
        this.updateUserInfo(data.user);
        
        // Update statistics
        this.updateStats(data.stats);
        
        // Update recent activity
        this.updateRecentActivity(data.recent_activity);
        
        // Update learning path
        this.updateLearningPath(data.learning_path);
        
        // Update achievements
        this.updateAchievements(data.achievements);
        
        // Update progress bars
        this.updateProgressBars(data.stats);
        
        console.log('Dashboard UI updated with real data');
    }

    updateUserInfo(user) {
        // Update user name
        const userNameElements = document.querySelectorAll('#user-name, .user-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = user.name || 'Student';
        });

        // Update user title
        const userTitleElements = document.querySelectorAll('#user-title, .user-title');
        userTitleElements.forEach(el => {
            if (el) el.textContent = user.title || 'Newbie';
        });

        // Update user avatar
        const avatarElements = document.querySelectorAll('#user-avatar, .user-avatar');
        avatarElements.forEach(el => {
            if (el && user.avatar) {
                el.src = user.avatar;
            }
        });
    }

    updateStats(stats) {
        // Update currency
        const currencyElements = document.querySelectorAll('#currency-amount, .currency-amount');
        currencyElements.forEach(el => {
            if (el) el.textContent = stats.currency || 0;
        });

        // Update points
        const pointsElements = document.querySelectorAll('#points-amount, .points-amount');
        pointsElements.forEach(el => {
            if (el) el.textContent = stats.points || 0;
        });

        // Update progress percentage
        const progressElements = document.querySelectorAll('#progress-percentage, .progress-percentage');
        progressElements.forEach(el => {
            if (el) el.textContent = `${stats.progress_percentage}%`;
        });

        // Update lessons completed
        const lessonsElements = document.querySelectorAll('#lessons-completed, .lessons-completed');
        lessonsElements.forEach(el => {
            if (el) el.textContent = `${stats.lessons_completed}/${stats.total_lessons}`;
        });
    }

    updateRecentActivity(activities) {
        const activityContainers = document.querySelectorAll('.activity-list, .recent-activity, #recent-activity');
        
        activityContainers.forEach(container => {
            if (!container) return;

            container.innerHTML = '';

            if (!activities || activities.length === 0) {
                container.innerHTML = `
                    <div class="activity-item no-activity">
                        <div class="activity-icon">📚</div>
                        <div class="activity-content">
                            <div class="activity-title">No recent activity</div>
                            <div class="activity-description">Start learning to see your progress here!</div>
                        </div>
                    </div>
                `;
                return;
            }

            activities.forEach(activity => {
                const statusIcon = this.getStatusIcon(activity.status);
                const timeAgo = this.getTimeAgo(activity.timestamp);
                
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-icon">${statusIcon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.content_title || activity.content_id}</div>
                        <div class="activity-meta">
                            <span class="activity-status">${this.formatStatus(activity.status)}</span>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                    </div>
                    ${activity.points_earned ? `<div class="activity-points">+${activity.points_earned} pts</div>` : ''}
                `;
                
                container.appendChild(activityItem);
            });
        });
    }

    updateLearningPath(learningPath) {
        const pathContainers = document.querySelectorAll('.learning-path, .path-items');
        
        pathContainers.forEach(container => {
            if (!container) return;

            // If we have predefined path items, update their status
            const existingItems = container.querySelectorAll('.path-item, .lesson-item');
            
            if (existingItems.length > 0) {
                existingItems.forEach((item, index) => {
                    if (learningPath[index]) {
                        const lesson = learningPath[index];
                        const statusElement = item.querySelector('.lesson-status, .path-status');
                        
                        if (statusElement) {
                            statusElement.textContent = this.formatStatus(lesson.status);
                            statusElement.className = `lesson-status ${lesson.status.replace('_', '-')}`;
                        }
                        
                        // Update item classes
                        item.classList.remove('completed', 'in-progress', 'not-started');
                        item.classList.add(lesson.status.replace('_', '-'));
                    }
                });
            } else {
                // Create new path items if none exist
                container.innerHTML = '';
                learningPath.forEach(lesson => {
                    const pathItem = document.createElement('div');
                    pathItem.className = `path-item ${lesson.status.replace('_', '-')}`;
                    pathItem.innerHTML = `
                        <div class="path-content">
                            <div class="path-title">${lesson.title}</div>
                        </div>
                        <div class="lesson-status ${lesson.status.replace('_', '-')}">
                            ${this.formatStatus(lesson.status)}
                        </div>
                    `;
                    container.appendChild(pathItem);
                });
            }
        });
    }

    updateAchievements(achievements) {
        const achievementContainers = document.querySelectorAll('.achievements-grid, .achievements-list, #achievements-container');
        
        achievementContainers.forEach(container => {
            if (!container) return;

            container.innerHTML = '';

            achievements.forEach(achievement => {
                const achievementItem = document.createElement('div');
                achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
                achievementItem.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-content">
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        <div class="achievement-status">
                            ${achievement.unlocked ? 'Unlocked!' : 'Locked'}
                        </div>
                    </div>
                `;
                
                container.appendChild(achievementItem);
            });
        });
    }

    updateProgressBars(stats) {
        // Update main progress bar
        const progressBars = document.querySelectorAll('.progress-fill, .progress-bar-fill');
        progressBars.forEach(bar => {
            if (bar) {
                bar.style.width = `${stats.progress_percentage}%`;
            }
        });

        // Update any circular progress indicators
        const circularProgress = document.querySelectorAll('.circular-progress');
        circularProgress.forEach(circle => {
            if (circle) {
                const percentage = stats.progress_percentage;
                circle.style.setProperty('--progress', `${percentage}%`);
                
                // Update text inside circular progress
                const text = circle.querySelector('.progress-text');
                if (text) text.textContent = `${percentage}%`;
            }
        });
    }

    setupPeriodicUpdates() {
        // Update data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, this.updateInterval);
    }

    setupEventListeners() {
        // Refresh button listener
        const refreshButtons = document.querySelectorAll('.refresh-btn, #refresh-dashboard');
        refreshButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        });

        // Window focus event to refresh data
        window.addEventListener('focus', () => {
            this.loadDashboardData();
        });
    }

    // Utility functions
    getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✅';
            case 'in_progress': return '🔄';
            default: return '📚';
        }
    }

    formatStatus(status) {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in_progress': return 'In Progress';
            case 'not_started': return 'Not Started';
            default: return 'Not Started';
        }
    }

    getTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    showError(message) {
        console.error(message);
        
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Public method to manually refresh data
    refresh() {
        return this.loadDashboardData();
    }

    // Public method to get current data
    getCurrentData() {
        return this.currentData;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a dashboard page
    if (document.querySelector('.dashboard-container, .dashboard-grid, #dashboard-content')) {
        window.realDataDashboard = new RealDataDashboard();
        console.log('Real data dashboard initialized successfully');
    }
});

// Export for manual initialization if needed
window.RealDataDashboard = RealDataDashboard;
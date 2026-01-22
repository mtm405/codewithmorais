// Real Firebase configuration for student dashboard
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    getDocs,
    collection, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    updateDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Import Firebase configuration
const firebaseConfig = {
    "apiKey": "AIzaSyAIwwM2V2qfPCB3TLVVeb8IW3FGxdNDhiY",
    "authDomain": "code-with-morais-405.firebaseapp.com",
    "projectId": "code-with-morais-405",
    "storageBucket": "code-with-morais-405.firebasestorage.app",
    "messagingSenderId": "208072504611",
    "appId": "1:208072504611:web:8ebd20260a9e16ceff8896",
    "measurementId": "G-JLH66GJNFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global state
let currentUser = null;
let userProfile = null;
let userProgress = [];
let unsubscribeCallbacks = [];

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const dashboardContent = document.getElementById('dashboard-content');
const loginPrompt = document.getElementById('login-prompt');

// Real data dashboard class
class StudentDashboard {
    constructor() {
        this.init();
    }

    async init() {
        // Show loading screen
        this.showLoading();
        
        // Set up auth state listener
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                this.loadUserData();
            } else {
                currentUser = null;
                this.showLoginPrompt();
            }
        });
    }

    showLoading() {
        loadingScreen.style.display = 'flex';
        dashboardContent.style.display = 'none';
        loginPrompt.style.display = 'none';
    }

    showLoginPrompt() {
        loadingScreen.style.display = 'none';
        dashboardContent.style.display = 'none';
        loginPrompt.style.display = 'flex';
    }

    showDashboard() {
        loadingScreen.style.display = 'none';
        loginPrompt.style.display = 'none';
        dashboardContent.style.display = 'block';
    }

    async loadUserData() {
        try {
            // Load user profile
            await this.loadUserProfile();
            
            // Load user progress
            await this.loadUserProgress();
            
            // Set up real-time listeners
            this.setupRealtimeListeners();
            
            // Render dashboard
            this.renderDashboard();
            
            // Show dashboard
            this.showDashboard();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Failed to load user data. Please try refreshing the page.');
        }
    }

    async loadUserProfile() {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            userProfile = userDoc.data();
        } else {
            // Create default user profile
            userProfile = {
                name: currentUser.displayName || 'Student',
                email: currentUser.email,
                currency: 10,
                points: 0,
                user_title: 'Newbie',
                created_at: new Date()
            };
            await setDoc(doc(db, 'users', currentUser.uid), userProfile);
        }
    }

    async loadUserProgress() {
        const progressQuery = query(
            collection(db, 'user_progress'),
            where('user_id', '==', currentUser.uid),
            orderBy('last_updated', 'desc')
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        userProgress = [];
        progressSnapshot.forEach((doc) => {
            userProgress.push({
                id: doc.id,
                ...doc.data()
            });
        });
    }

    setupRealtimeListeners() {
        // Listen for user profile changes
        const userUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
            if (doc.exists()) {
                userProfile = doc.data();
                this.updateUserStats();
            }
        });

        // Listen for progress changes
        const progressQuery = query(
            collection(db, 'user_progress'),
            where('user_id', '==', currentUser.uid)
        );
        
        const progressUnsubscribe = onSnapshot(progressQuery, (snapshot) => {
            userProgress = [];
            snapshot.forEach((doc) => {
                userProgress.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            this.updateProgressDisplay();
        });

        // Store unsubscribe callbacks
        unsubscribeCallbacks.push(userUnsubscribe, progressUnsubscribe);
    }

    renderDashboard() {
        this.updateUserInfo();
        this.updateUserStats();
        this.updateProgressDisplay();
        this.updateLearningPath();
        this.updateAchievements();
        this.updateQuickActions();
    }

    updateUserInfo() {
        document.getElementById('user-name').textContent = userProfile?.name || currentUser.displayName || 'Student';
        document.getElementById('user-title').textContent = userProfile?.user_title || 'Newbie';
        
        const avatar = document.getElementById('user-avatar');
        if (currentUser.photoURL) {
            avatar.src = currentUser.photoURL;
        }
    }

    updateUserStats() {
        // Update currency
        document.getElementById('currency-amount').textContent = userProfile?.currency || 0;
        
        // Update points
        document.getElementById('points-amount').textContent = userProfile?.points || 0;
        
        // Calculate and update progress stats
        const completedLessons = userProgress.filter(p => p.status === 'completed' && p.content_type === 'lesson').length;
        const totalLessons = 12; // Based on your lesson files
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;
        document.getElementById('lessons-completed').textContent = `${completedLessons}/${totalLessons}`;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
    }

    updateProgressDisplay() {
        // Update recent activity
        const recentActivity = userProgress.slice(0, 5);
        const activityList = document.querySelector('.activity-list');
        
        if (activityList) {
            activityList.innerHTML = '';
            
            if (recentActivity.length === 0) {
                activityList.innerHTML = '<div class="activity-item">No recent activity. Start learning to see your progress here!</div>';
                return;
            }
            
            recentActivity.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                const statusIcon = activity.status === 'completed' ? '✅' : 
                                 activity.status === 'in_progress' ? '🔄' : '📚';
                
                const timeAgo = this.getTimeAgo(activity.last_updated);
                
                activityItem.innerHTML = `
                    <div class="activity-info">
                        <span class="activity-icon">${statusIcon}</span>
                        <span class="activity-title">${activity.content_title || activity.content_id}</span>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-status">${this.formatStatus(activity.status)}</span>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
        }
    }

    updateLearningPath() {
        // Map lessons to learning path
        const lessonMap = {
            'lesson_1_1': 'Variables & Data Types',
            'lesson_1_2': 'Working with Numbers',
            'lesson_1_3': 'String Operations',
            'lesson_1_4': 'Boolean Logic',
            'lesson_2_1': 'If Statements',
            'lesson_2_2': 'Loops & Iteration',
            'lesson_3_1': 'Functions Basics',
            'lesson_3_2': 'Advanced Functions',
            'lesson_4_1': 'Problem Solving'
        };

        const pathItems = document.querySelectorAll('.path-item');
        pathItems.forEach((item, index) => {
            const lessonId = `lesson_${Math.floor(index/2) + 1}_${(index % 2) + 1}`;
            const lessonProgress = userProgress.find(p => p.content_id === lessonId);
            
            const statusEl = item.querySelector('.lesson-status');
            const titleEl = item.querySelector('h4');
            
            if (titleEl && lessonMap[lessonId]) {
                titleEl.textContent = lessonMap[lessonId];
            }
            
            if (statusEl) {
                if (lessonProgress?.status === 'completed') {
                    statusEl.textContent = 'Completed';
                    statusEl.className = 'lesson-status completed';
                    item.classList.add('completed');
                } else if (lessonProgress?.status === 'in_progress') {
                    statusEl.textContent = 'In Progress';
                    statusEl.className = 'lesson-status in-progress';
                    item.classList.add('in-progress');
                } else {
                    statusEl.textContent = 'Not Started';
                    statusEl.className = 'lesson-status not-started';
                    item.classList.remove('completed', 'in-progress');
                }
            }
        });
    }

    updateAchievements() {
        const completedLessons = userProgress.filter(p => p.status === 'completed').length;
        const totalPoints = userProfile?.points || 0;
        
        // Define achievements based on real progress
        const achievements = [
            {
                id: 'first-lesson',
                title: 'First Steps',
                description: 'Complete your first lesson',
                icon: '🎯',
                unlocked: completedLessons >= 1
            },
            {
                id: 'five-lessons',
                title: 'Getting Started',
                description: 'Complete 5 lessons',
                icon: '🏆',
                unlocked: completedLessons >= 5
            },
            {
                id: 'point-collector',
                title: 'Point Collector',
                description: 'Earn 100 points',
                icon: '💎',
                unlocked: totalPoints >= 100
            },
            {
                id: 'dedicated-learner',
                title: 'Dedicated Learner',
                description: 'Complete all lessons in a section',
                icon: '📚',
                unlocked: completedLessons >= 4 // Complete section 1
            }
        ];

        const achievementsList = document.querySelector('.achievements-grid');
        if (achievementsList) {
            achievementsList.innerHTML = '';
            
            achievements.forEach(achievement => {
                const achievementEl = document.createElement('div');
                achievementEl.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
                
                achievementEl.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h4>${achievement.title}</h4>
                        <p>${achievement.description}</p>
                        <span class="achievement-status">
                            ${achievement.unlocked ? 'Unlocked!' : 'Locked'}
                        </span>
                    </div>
                `;
                
                achievementsList.appendChild(achievementEl);
            });
        }
    }

    updateQuickActions() {
        // Update quick action buttons based on current progress
        const nextLesson = this.getNextLesson();
        const continueBtn = document.querySelector('.action-btn[href*="lesson"]');
        
        if (continueBtn && nextLesson) {
            continueBtn.textContent = `Continue: ${nextLesson.title}`;
            continueBtn.href = `/lesson/${nextLesson.id}`;
        }
    }

    getNextLesson() {
        const lessonOrder = [
            'lesson_1_1', 'lesson_1_2', 'lesson_1_3', 'lesson_1_4',
            'lesson_2_1', 'lesson_2_2', 'lesson_3_1', 'lesson_3_2', 'lesson_4_1'
        ];

        const lessonTitles = {
            'lesson_1_1': 'Variables & Data Types',
            'lesson_1_2': 'Working with Numbers',
            'lesson_1_3': 'String Operations',
            'lesson_1_4': 'Boolean Logic',
            'lesson_2_1': 'If Statements',
            'lesson_2_2': 'Loops & Iteration',
            'lesson_3_1': 'Functions Basics',
            'lesson_3_2': 'Advanced Functions',
            'lesson_4_1': 'Problem Solving'
        };

        for (const lessonId of lessonOrder) {
            const progress = userProgress.find(p => p.content_id === lessonId);
            if (!progress || progress.status !== 'completed') {
                return {
                    id: lessonId,
                    title: lessonTitles[lessonId]
                };
            }
        }

        return null; // All lessons completed
    }

    getTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    formatStatus(status) {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in_progress': return 'In Progress';
            default: return 'Not Started';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Cleanup function
    destroy() {
        unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
        unsubscribeCallbacks = [];
    }
}

// Authentication functions
async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await signInWithPopup(auth, provider);
        console.log('Successfully signed in:', result.user);
    } catch (error) {
        console.error('Sign-in error:', error);
        alert('Failed to sign in. Please try again.');
    }
}

async function signOutUser() {
    try {
        await signOut(auth);
        console.log('Successfully signed out');
    } catch (error) {
        console.error('Sign-out error:', error);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new StudentDashboard();
    
    // Add event listeners for auth buttons
    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    
    if (signInBtn) {
        signInBtn.addEventListener('click', signInWithGoogle);
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOutUser);
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        dashboard.destroy();
    });
});

// Export for debugging
window.StudentDashboard = StudentDashboard;
window.firebaseAuth = auth;
window.firebaseDb = db;
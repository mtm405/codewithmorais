import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase Configuration
let firebaseConfig;
try {
    const cfg = await import('./firebase-config.js');
    firebaseConfig = cfg.firebaseConfig;
} catch (err) {
    console.error('Missing ./firebase-config.js — copy firebase-config.js.example and fill values.');
    showError('Configuration Error', 'Missing firebase-config.js — see README for setup instructions.');
    throw err;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Global state
let currentUser = null;
let userProgress = null;
let isLoading = true;

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const mainContent = document.getElementById('main-content');
const userNameElement = document.getElementById('user-name');
const userAvatarElement = document.getElementById('user-avatar');
const welcomeNameElement = document.getElementById('welcome-name');
const signoutBtn = document.getElementById('signout-btn');

// Statistics elements
const completionRateElement = document.getElementById('completion-rate');
const projectsCompletedElement = document.getElementById('projects-completed');
const studyStreakElement = document.getElementById('study-streak');
const totalTimeElement = document.getElementById('total-time');

// Content containers
const progressOverview = document.getElementById('progress-overview');
const learningPath = document.getElementById('learning-path');
const achievements = document.getElementById('achievements');
const recentActivity = document.getElementById('recent-activity');

// Course Structure
const courseStructure = {
    'python-fundamentals': {
        title: 'Python Fundamentals',
        description: 'Master the basics of Python programming',
        lessons: [
            { id: 'variables', title: 'Variables & Data Types', projects: 4 },
            { id: 'operators', title: 'Operators & Expressions', projects: 6 },
            { id: 'lists', title: 'Lists & Collections', projects: 8 },
            { id: 'control-flow', title: 'Control Flow', projects: 4 },
            { id: 'functions', title: 'Functions', projects: 4 },
            { id: 'file-handling', title: 'File Operations', projects: 4 }
        ]
    }
};

// Achievement definitions
const achievementDefinitions = [
    {
        id: 'first-project',
        title: 'First Steps',
        description: 'Complete your first project',
        icon: 'fas fa-baby',
        condition: (progress) => progress.projectsCompleted >= 1
    },
    {
        id: 'project-master',
        title: 'Project Master',
        description: 'Complete 10 projects',
        icon: 'fas fa-trophy',
        condition: (progress) => progress.projectsCompleted >= 10
    },
    {
        id: 'speed-coder',
        title: 'Speed Coder',
        description: 'Complete a project in under 5 minutes',
        icon: 'fas fa-bolt',
        condition: (progress) => progress.fastestProject <= 300
    },
    {
        id: 'consistent-learner',
        title: 'Consistent Learner',
        description: 'Study for 7 days in a row',
        icon: 'fas fa-calendar-check',
        condition: (progress) => progress.studyStreak >= 7
    },
    {
        id: 'python-explorer',
        title: 'Python Explorer',
        description: 'Complete all fundamental lessons',
        icon: 'fas fa-compass',
        condition: (progress) => progress.lessonsCompleted >= 6
    }
];

// Initialize the dashboard
async function initialize() {
    console.log('Initializing Student Dashboard...');
    
    // Set up authentication listener
    onAuthStateChanged(auth, handleAuthStateChange);
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for redirect result from Google Sign-In
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            console.log('User signed in via redirect:', result.user.email);
        }
    } catch (error) {
        console.error('Error getting redirect result:', error);
    }
}

// Handle authentication state changes
async function handleAuthStateChange(user) {
    console.log('Auth state changed:', user ? user.email : 'No user');
    
    if (user) {
        currentUser = user;
        await loadUserDashboard(user);
    } else {
        showSignInPrompt();
    }
}

// Load user dashboard data
async function loadUserDashboard(user) {
    try {
        showLoading('Loading your dashboard...');
        
        // Update UI with user info
        updateUserInterface(user);
        
        // Load user progress data
        await loadUserProgress(user.uid);
        
        // Set up real-time progress updates
        setupProgressListener(user.uid);
        
        // Render dashboard content
        renderDashboard();
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Loading Error', 'Failed to load dashboard data. Please try refreshing the page.');
    }
}

// Update user interface elements
function updateUserInterface(user) {
    const displayName = user.displayName || user.email.split('@')[0];
    const photoURL = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
    
    userNameElement.textContent = displayName;
    welcomeNameElement.textContent = displayName;
    userAvatarElement.src = photoURL;
    userAvatarElement.alt = `${displayName}'s avatar`;
}

// Load user progress from Firestore
async function loadUserProgress(uid) {
    try {
        const docRef = doc(db, 'userProgress', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            userProgress = docSnap.data();
        } else {
            // Initialize new user progress
            userProgress = createDefaultProgress();
            await setDoc(docRef, userProgress);
        }
        
        console.log('User progress loaded:', userProgress);
        
    } catch (error) {
        console.error('Error loading user progress:', error);
        // Use demo data as fallback
        userProgress = createDemoProgress();
    }
}

// Create default progress structure for new users
function createDefaultProgress() {
    return {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectsCompleted: 0,
        lessonsCompleted: 0,
        totalTimeSpent: 0,
        studyStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        courseProgress: {
            'python-fundamentals': {
                progress: 0,
                lessonsCompleted: [],
                projectsCompleted: []
            }
        },
        achievements: [],
        recentActivity: []
    };
}

// Create demo progress for demonstration
function createDemoProgress() {
    const demoDate = new Date();
    return {
        createdAt: new Date(demoDate - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: demoDate.toISOString(),
        projectsCompleted: 12,
        lessonsCompleted: 3,
        totalTimeSpent: 840, // 14 hours in minutes
        studyStreak: 5,
        lastActiveDate: demoDate.toISOString().split('T')[0],
        courseProgress: {
            'python-fundamentals': {
                progress: 60,
                lessonsCompleted: ['variables', 'operators', 'lists'],
                projectsCompleted: [
                    'type-conversion-guided',
                    'type-conversion-challenge',
                    'string-methods-guided',
                    'string-methods-challenge',
                    'list-basics-guided',
                    'list-basics-challenge',
                    'list-operations-guided',
                    'list-operations-challenge',
                    'list-slicing-guided',
                    'list-slicing-challenge',
                    'sorting-numbers-guided',
                    'sorting-strings-challenge'
                ]
            }
        },
        achievements: ['first-project', 'project-master'],
        recentActivity: [
            {
                type: 'project_completed',
                title: 'Completed "Sorting Strings Challenge"',
                timestamp: demoDate.toISOString(),
                icon: 'fas fa-check-circle'
            },
            {
                type: 'lesson_started',
                title: 'Started "Control Flow" lesson',
                timestamp: new Date(demoDate - 2 * 60 * 60 * 1000).toISOString(),
                icon: 'fas fa-book-open'
            },
            {
                type: 'achievement_earned',
                title: 'Earned "Project Master" achievement',
                timestamp: new Date(demoDate - 6 * 60 * 60 * 1000).toISOString(),
                icon: 'fas fa-trophy'
            }
        ]
    };
}

// Set up real-time progress listener
function setupProgressListener(uid) {
    const docRef = doc(db, 'userProgress', uid);
    
    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const newProgress = doc.data();
            
            // Check for changes that warrant updates
            if (JSON.stringify(newProgress) !== JSON.stringify(userProgress)) {
                console.log('Progress updated in real-time');
                userProgress = newProgress;
                renderDashboard();
            }
        }
    }, (error) => {
        console.error('Error listening to progress updates:', error);
    });
}

// Render the dashboard content
function renderDashboard() {
    renderStatistics();
    renderProgressOverview();
    renderLearningPath();
    renderAchievements();
    renderRecentActivity();
}

// Render statistics in welcome section
function renderStatistics() {
    const courseProgress = userProgress.courseProgress['python-fundamentals'] || { progress: 0 };
    const completionRate = Math.round(courseProgress.progress || 0);
    const totalHours = Math.round((userProgress.totalTimeSpent || 0) / 60 * 10) / 10;
    
    completionRateElement.textContent = `${completionRate}%`;
    projectsCompletedElement.textContent = userProgress.projectsCompleted || 0;
    studyStreakElement.textContent = userProgress.studyStreak || 0;
    totalTimeElement.textContent = `${totalHours}h`;
}

// Render progress overview
function renderProgressOverview() {
    const courseProgress = userProgress.courseProgress['python-fundamentals'] || { progress: 0 };
    const lessons = courseStructure['python-fundamentals'].lessons;
    
    progressOverview.innerHTML = '';
    
    lessons.forEach(lesson => {
        const isCompleted = courseProgress.lessonsCompleted?.includes(lesson.id) || false;
        const progress = isCompleted ? 100 : (lesson.id === getCurrentLesson() ? 45 : 0);
        
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        
        progressItem.innerHTML = `
            <div class="progress-info">
                <h4>${lesson.title}</h4>
                <p>${lesson.projects} projects • ${isCompleted ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}</p>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <span class="progress-percentage">${progress}%</span>
        `;
        
        progressOverview.appendChild(progressItem);
    });
}

// Render learning path
function renderLearningPath() {
    const courseProgress = userProgress.courseProgress['python-fundamentals'] || { lessonsCompleted: [] };
    const lessons = courseStructure['python-fundamentals'].lessons;
    const currentLessonIndex = getCurrentLessonIndex();
    
    learningPath.innerHTML = '';
    
    lessons.forEach((lesson, index) => {
        const isCompleted = courseProgress.lessonsCompleted?.includes(lesson.id) || false;
        const isCurrent = index === currentLessonIndex;
        const isLocked = index > currentLessonIndex;
        
        const pathItem = document.createElement('div');
        pathItem.className = `path-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;
        
        if (!isLocked) {
            pathItem.onclick = () => navigateToLesson(lesson.id);
        }
        
        const iconClass = isCompleted ? 'fas fa-check' : isCurrent ? 'fas fa-play' : isLocked ? 'fas fa-lock' : 'fas fa-circle';
        
        pathItem.innerHTML = `
            <div class="path-icon ${isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}">
                <i class="${iconClass}"></i>
            </div>
            <div class="path-details">
                <h4>${lesson.title}</h4>
                <p>${lesson.projects} projects • ${isCompleted ? 'Completed' : isCurrent ? 'Continue' : isLocked ? 'Locked' : 'Start'}</p>
            </div>
        `;
        
        learningPath.appendChild(pathItem);
    });
}

// Render achievements
function renderAchievements() {
    achievements.innerHTML = '';
    
    achievementDefinitions.forEach(achievement => {
        const isEarned = userProgress.achievements?.includes(achievement.id) || false;
        
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement ${isEarned ? 'earned' : ''}`;
        
        achievementEl.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-details">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            </div>
        `;
        
        achievements.appendChild(achievementEl);
    });
}

// Render recent activity
function renderRecentActivity() {
    const activities = userProgress.recentActivity || [];
    
    recentActivity.innerHTML = '';
    
    if (activities.length === 0) {
        recentActivity.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent activity</p>';
        return;
    }
    
    activities.slice(0, 5).forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        
        const timeAgo = getTimeAgo(new Date(activity.timestamp));
        
        activityEl.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <h5>${activity.title}</h5>
                <p>${timeAgo}</p>
            </div>
        `;
        
        recentActivity.appendChild(activityEl);
    });
}

// Helper functions
function getCurrentLesson() {
    const courseProgress = userProgress.courseProgress['python-fundamentals'] || { lessonsCompleted: [] };
    const completedLessons = courseProgress.lessonsCompleted || [];
    const lessons = courseStructure['python-fundamentals'].lessons;
    
    const nextLesson = lessons.find(lesson => !completedLessons.includes(lesson.id));
    return nextLesson ? nextLesson.id : lessons[lessons.length - 1].id;
}

function getCurrentLessonIndex() {
    const currentLesson = getCurrentLesson();
    const lessons = courseStructure['python-fundamentals'].lessons;
    return lessons.findIndex(lesson => lesson.id === currentLesson);
}

function navigateToLesson(lessonId) {
    // Navigate to the appropriate lesson/project page
    window.location.href = `/projects.html?lesson=${lessonId}`;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

// Event handlers
function setupEventListeners() {
    signoutBtn.addEventListener('click', handleSignOut);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'p':
                    e.preventDefault();
                    window.location.href = '/projects.html';
                    break;
                case 'i':
                    e.preventDefault();
                    window.location.href = '/ide.html';
                    break;
            }
        }
    });
}

async function handleSignOut() {
    try {
        await signOut(auth);
        console.log('User signed out');
    } catch (error) {
        console.error('Error signing out:', error);
        showError('Sign Out Error', 'Failed to sign out. Please try again.');
    }
}

// UI state management
function showLoading(message = 'Loading...') {
    loadingOverlay.classList.remove('hidden');
    mainContent.style.opacity = '0';
    
    const loadingText = loadingOverlay.querySelector('h3');
    if (loadingText) loadingText.textContent = message;
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    mainContent.style.opacity = '1';
}

function showError(title, message) {
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #f56565;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="window.location.reload()" style="
                background: white;
                color: var(--primary);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 1rem;
            ">
                Reload Page
            </button>
        </div>
    `;
    loadingOverlay.classList.remove('hidden');
}

function showSignInPrompt() {
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div style="font-size: 3rem; margin-bottom: 1rem;">
                <i class="fas fa-sign-in-alt"></i>
            </div>
            <h3>Welcome to Code with Morais</h3>
            <p>Please sign in to access your learning dashboard</p>
            <button onclick="signInWithGoogle()" style="
                background: white;
                color: var(--primary);
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 1rem auto 0;
            ">
                <i class="fab fa-google"></i>
                Sign in with Google
            </button>
        </div>
    `;
    loadingOverlay.classList.remove('hidden');
}

// Make sign in function globally available
window.signInWithGoogle = async function() {
    try {
        showLoading('Signing you in...');
        
        // Use popup for better UX, fallback to redirect
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('User signed in via popup:', result.user.email);
        } catch (popupError) {
            if (popupError.code === 'auth/popup-blocked') {
                console.log('Popup blocked, using redirect method');
                await signInWithRedirect(auth, provider);
            } else {
                throw popupError;
            }
        }
    } catch (error) {
        console.error('Error signing in:', error);
        showError('Sign In Error', 'Failed to sign in. Please try again.');
    }
};

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initialize);

// Export functions for debugging
window.studentDashboard = {
    currentUser: () => currentUser,
    userProgress: () => userProgress,
    reloadDashboard: () => renderDashboard()
};
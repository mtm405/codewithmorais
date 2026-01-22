/**
 * Production Firebase Integration for Lessons
 * 
 * This script connects lesson pages to the real Firebase database
 * Add this script to your lesson pages to enable real progress tracking
 */

// Firebase imports (use same as production dashboard)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Firebase configuration - SAME AS PRODUCTION DASHBOARD
const firebaseConfig = {
    apiKey: "AIzaSyAIwwM2V2qfPCB3TLVVeb8IW3FGxdNDhiY",
    authDomain: "code-with-morais-405.firebaseapp.com",
    projectId: "code-with-morais-405",
    storageBucket: "code-with-morais-405.firebasestorage.app",
    messagingSenderId: "208072504611",
    appId: "1:208072504611:web:8ebd20260a9e16ceff8896",
    measurementId: "G-JLH66GJNFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentUser = null;

// Authentication state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('User authenticated for lesson integration:', user.uid);
        
        // Show authenticated lesson content
        showAuthenticatedContent();
        
        // Check if lesson is already completed
        checkLessonCompletion();
    } else {
        console.log('User not authenticated');
        showUnauthenticatedContent();
    }
});

/**
 * Complete a lesson and save to Firebase
 * @param {string} lessonId - The lesson ID (e.g., 'lesson_1_1')
 * @param {number} points - Points to award (default: 100)
 * @param {number} coins - Coins to award (default: 50)
 */
window.completeLesson = async function(lessonId, points = 100, coins = 50) {
    if (!currentUser) {
        console.log('User not authenticated - cannot complete lesson');
        showAuthenticationPrompt();
        return false;
    }

    try {
        const userRef = doc(db, 'userProgress', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            console.log('User progress document not found');
            return false;
        }

        const userData = userSnap.data();
        const completedLessons = userData.completedLessons || [];
        
        // Check if lesson already completed
        if (completedLessons.includes(lessonId)) {
            console.log('Lesson already completed');
            showAlreadyCompletedMessage();
            return true;
        }

        // Create new activity entry
        const newActivity = {
            timestamp: new Date().toISOString(),
            description: `Completed ${lessonId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
        };

        // Update user progress
        const updates = {
            completedLessons: [...completedLessons, lessonId],
            totalPoints: (userData.totalPoints || 0) + points,
            totalCoins: (userData.totalCoins || 0) + coins,
            lastActive: new Date().toISOString(),
            recentActivity: [...(userData.recentActivity || []), newActivity]
        };

        await updateDoc(userRef, updates);
        
        // Show success message
        showLessonCompletedMessage(points, coins);
        
        console.log(`Lesson ${lessonId} completed successfully`);
        return true;
        
    } catch (error) {
        console.error('Error completing lesson:', error);
        showErrorMessage('Failed to save lesson progress. Please try again.');
        return false;
    }
};

/**
 * Check if current lesson is already completed
 */
async function checkLessonCompletion() {
    if (!currentUser) return;
    
    const lessonId = getCurrentLessonId();
    if (!lessonId) return;
    
    try {
        const userRef = doc(db, 'userProgress', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const completedLessons = userData.completedLessons || [];
            
            if (completedLessons.includes(lessonId)) {
                showAlreadyCompletedBanner();
            }
        }
    } catch (error) {
        console.error('Error checking lesson completion:', error);
    }
}

/**
 * Get current lesson ID from page
 */
function getCurrentLessonId() {
    // Try to get from meta tag first
    const metaLessonId = document.querySelector('meta[name="lesson-id"]');
    if (metaLessonId) {
        return metaLessonId.getAttribute('content');
    }
    
    // Try to get from URL
    const pathname = window.location.pathname;
    const lessonMatch = pathname.match(/lesson[_-](\d+)[_-](\d+)/);
    if (lessonMatch) {
        return `lesson_${lessonMatch[1]}_${lessonMatch[2]}`;
    }
    
    // Try to get from data attribute on body
    const bodyLessonId = document.body.getAttribute('data-lesson-id');
    if (bodyLessonId) {
        return bodyLessonId;
    }
    
    console.warn('Could not determine lesson ID. Add <meta name="lesson-id" content="lesson_X_Y"> to your lesson page.');
    return null;
}

/**
 * Show content for authenticated users
 */
function showAuthenticatedContent() {
    // Show user info if elements exist
    const userNameElements = document.querySelectorAll('.user-name, #user-name');
    const userEmailElements = document.querySelectorAll('.user-email, #user-email');
    
    userNameElements.forEach(el => {
        el.textContent = currentUser.displayName || 'Student';
    });
    
    userEmailElements.forEach(el => {
        el.textContent = currentUser.email || '';
    });
    
    // Show authenticated-only content
    const authContent = document.querySelectorAll('.auth-required');
    authContent.forEach(el => {
        el.style.display = 'block';
    });
    
    // Hide unauthenticated content
    const unauthContent = document.querySelectorAll('.unauth-required');
    unauthContent.forEach(el => {
        el.style.display = 'none';
    });
}

/**
 * Show content for unauthenticated users
 */
function showUnauthenticatedContent() {
    // Hide authenticated-only content
    const authContent = document.querySelectorAll('.auth-required');
    authContent.forEach(el => {
        el.style.display = 'none';
    });
    
    // Show unauthenticated content
    const unauthContent = document.querySelectorAll('.unauth-required');
    unauthContent.forEach(el => {
        el.style.display = 'block';
    });
}

/**
 * Show authentication prompt
 */
function showAuthenticationPrompt() {
    const message = document.createElement('div');
    message.className = 'auth-prompt';
    message.innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Authentication Required</strong><br>
            Please sign in to track your progress and complete lessons.
            <br><br>
            <a href="/production-dashboard" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px;">
                Sign In to Dashboard
            </a>
        </div>
    `;
    
    // Insert after lesson content or at top of body
    const lessonContent = document.querySelector('.lesson-content, main, .container');
    if (lessonContent) {
        lessonContent.insertBefore(message, lessonContent.firstChild);
    } else {
        document.body.insertBefore(message, document.body.firstChild);
    }
}

/**
 * Show lesson completed success message
 */
function showLessonCompletedMessage(points, coins) {
    const message = document.createElement('div');
    message.className = 'lesson-completed';
    message.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 10px;">🎉</div>
            <strong>Lesson Completed!</strong><br>
            You earned <strong>+${points} points</strong> and <strong>+${coins} coins</strong>
            <br><br>
            <a href="/production-dashboard" style="background: #16a34a; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View Dashboard
            </a>
        </div>
    `;
    
    // Show at top of page
    document.body.insertBefore(message, document.body.firstChild);
    
    // Scroll to top to show message
    window.scrollTo(0, 0);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        message.remove();
    }, 10000);
}

/**
 * Show already completed message
 */
function showAlreadyCompletedMessage() {
    const message = document.createElement('div');
    message.className = 'lesson-already-completed';
    message.innerHTML = `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; color: #ea580c; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <strong>Already Completed</strong><br>
            You've already completed this lesson. Great job!
            <br><br>
            <a href="/production-dashboard" style="background: #ea580c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View Dashboard
            </a>
        </div>
    `;
    
    document.body.insertBefore(message, document.body.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

/**
 * Show already completed banner (for page load)
 */
function showAlreadyCompletedBanner() {
    const banner = document.createElement('div');
    banner.className = 'completed-banner';
    banner.innerHTML = `
        <div style="background: linear-gradient(90deg, #10b981, #059669); color: white; padding: 10px; text-align: center; font-weight: 600;">
            ✅ Lesson Completed - Well done! Check your dashboard for progress updates.
        </div>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'lesson-error';
    errorDiv.innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Error:</strong> ${message}
        </div>
    `;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 8000);
}

/**
 * Quick setup function for lesson pages
 * Call this in your lesson page scripts
 */
window.setupLessonIntegration = function(lessonId) {
    // Set lesson ID if provided
    if (lessonId && !document.querySelector('meta[name="lesson-id"]')) {
        const meta = document.createElement('meta');
        meta.name = 'lesson-id';
        meta.content = lessonId;
        document.head.appendChild(meta);
    }
    
    // Add complete lesson button if not exists
    if (!document.querySelector('.complete-lesson-btn')) {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-lesson-btn';
        completeBtn.innerHTML = '🎯 Complete Lesson';
        completeBtn.style.cssText = `
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            margin: 20px 0;
            display: block;
            width: fit-content;
            transition: all 0.3s ease;
        `;
        
        completeBtn.addEventListener('click', () => {
            const currentLessonId = getCurrentLessonId();
            if (currentLessonId) {
                completeLesson(currentLessonId);
            } else {
                console.error('Cannot determine lesson ID');
            }
        });
        
        completeBtn.addEventListener('mouseover', () => {
            completeBtn.style.transform = 'translateY(-2px)';
            completeBtn.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
        });
        
        completeBtn.addEventListener('mouseout', () => {
            completeBtn.style.transform = 'translateY(0)';
            completeBtn.style.boxShadow = 'none';
        });
        
        // Add to lesson content area or bottom of body
        const lessonContent = document.querySelector('.lesson-content, main, .container');
        if (lessonContent) {
            lessonContent.appendChild(completeBtn);
        } else {
            document.body.appendChild(completeBtn);
        }
    }
    
    console.log('Lesson integration setup complete');
};

// Auto-setup on DOM load if lesson ID can be determined
document.addEventListener('DOMContentLoaded', () => {
    const lessonId = getCurrentLessonId();
    if (lessonId) {
        console.log('Auto-setting up lesson integration for:', lessonId);
        // Don't auto-add button, let pages choose to call setupLessonIntegration()
    }
});

console.log('Firebase lesson integration loaded');

export { completeLesson, setupLessonIntegration };
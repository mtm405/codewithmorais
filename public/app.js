import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  getRedirectResult
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Import Firebase configuration
let firebaseConfig;
if (typeof window !== 'undefined' && window.firebaseConfig) {
  firebaseConfig = window.firebaseConfig;
} else {
  // Fallback config if window.firebaseConfig is not available
  firebaseConfig = {
    apiKey: "AIzaSyAIwwM2V2qfPCB3TLVVeb8IW3FGxdNDhiY",
    authDomain: "codewithmorais.com",
    projectId: "code-with-morais-405",
    storageBucket: "code-with-morais-405.firebasestorage.app",
    messagingSenderId: "208072504611",
    appId: "1:208072504611:web:8ebd20260a9e16ceff8896",
    measurementId: "G-JLH66GJNFL"
  };
}

// Check if config is available
if (!firebaseConfig) {
  console.error('Missing Firebase configuration');
  const statusElFallback = document.getElementById('status');
  if (statusElFallback) {
    statusElFallback.textContent = 'Missing firebase configuration — see README.';
  }
  throw new Error('Firebase configuration not found');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Make auth and db available globally for debugging
window.auth = auth;
window.db = db;

// Google auth provider
const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

// DOM elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const statusElement = document.getElementById('status');

// Auth state containers
const authLoadingEl = document.getElementById('auth-loading');
const authSignedOutEl = document.getElementById('auth-signed-out');
const authSignedInEl = document.getElementById('auth-signed-in');

// User info elements
const userPhotoWelcome = document.getElementById('user-photo-welcome');
const userNameWelcome = document.getElementById('user-name-welcome');
const userEmailWelcome = document.getElementById('user-email-welcome');

// Update status
function updateStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Show loading state
function showLoading(message = 'Loading...') {
  // Update the auth loading message (inside the auth card)
  if (authLoadingEl) {
    authLoadingEl.hidden = false;
    const loadingText = authLoadingEl.querySelector('p');
    if (loadingText) loadingText.textContent = message;
  }
  
  // Hide other auth states
  if (authSignedOutEl) authSignedOutEl.hidden = true;
  if (authSignedInEl) authSignedInEl.hidden = true;
  
  // Clear the global status (we use the auth loading instead)
  if (statusElement) statusElement.textContent = '';
}

// Show signed out state
function showSignedOut() {
  // Clear any loading text
  if (statusElement) statusElement.textContent = '';
  
  if (authLoadingEl) authLoadingEl.hidden = true;
  if (authSignedOutEl) authSignedOutEl.hidden = false;
  if (authSignedInEl) authSignedInEl.hidden = true;
}

// Show signed in state
function showSignedIn(user) {
  // Clear any loading text
  if (statusElement) statusElement.textContent = '';
  
  if (authLoadingEl) authLoadingEl.hidden = true;
  if (authSignedOutEl) authSignedOutEl.hidden = true;
  if (authSignedInEl) authSignedInEl.hidden = false;
  
  // Update user info
  if (userNameWelcome) userNameWelcome.textContent = user.displayName || 'User';
  if (userEmailWelcome) userEmailWelcome.textContent = user.email;
  if (userPhotoWelcome && user.photoURL) {
    userPhotoWelcome.src = user.photoURL;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    updateStatus('Redirecting to Google...');
    showLoading('Redirecting to Google...');
    await signInWithRedirect(auth, provider);
    // Note: After redirect, the page will reload and onAuthStateChanged will handle the result
  } catch (error) {
    console.error('Sign-in error:', error);
    updateStatus('Sign-in failed. Please try again.');
    showSignedOut();
  }
}

// Sign out
async function handleSignOut() {
  try {
    showLoading('Signing out...');
    await signOut(auth);
    showSignedOut();
  } catch (error) {
    console.error('Sign-out error:', error);
    updateStatus('Sign-out failed. Please try again.');
  }
}

// Set up event listeners
if (loginBtn) {
  loginBtn.addEventListener('click', signInWithGoogle);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', handleSignOut);
}

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? `Signed in as ${user.email}` : 'Not signed in');
  if (user) {
    showSignedIn(user);
    
    // Check if user was redirected here for authentication
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    
    // If we're on the main page and signed in, redirect based on preference
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      console.log('User is signed in, checking preferred main page...');
      
      // Check if user has set a preferred main page
      const preferredMainPage = localStorage.getItem('preferredMainPage');
      
      if (preferredMainPage === 'projects') {
        console.log('Redirecting to projects page (preferred main page)...');
        window.location.href = '/projects.html';
      } else {
        console.log('Redirecting to projects page (new default)...');
        if (redirectParam === 'dashboard') {
          // Clear the redirect parameter from URL
          window.history.replaceState({}, document.title, '/');
          window.location.href = '/dashboard.html';
        } else {
          window.location.href = '/projects.html';
        }
      }
    }
  } else {
    showSignedOut();
  }
});

// Progress Tracking Functions
window.ProgressTracker = {
  // Initialize user progress document
  async initializeUserProgress(userId) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const userProgressDoc = await getDoc(userProgressRef);
      
      if (!userProgressDoc.exists()) {
        // Create initial progress document
        await setDoc(userProgressRef, {
          userId: userId,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          courses: {
            'python-fundamentals': {
              courseName: 'Python Fundamentals',
              progress: 0,
              completedLessons: [],
              totalLessons: 4,
              lessons: {
                'variables': { completed: false, completedAt: null, timeSpent: 0 },
                'operators-mastery': { 
                  completed: false, 
                  completedAt: null, 
                  timeSpent: 0,
                  categories: {
                    arithmetic: { completed: 0, unlocked: true },
                    assignment: { completed: 0, unlocked: false },
                    comparison: { completed: 0, unlocked: false },
                    logical: { completed: 0, unlocked: false },
                    identity: { completed: 0, unlocked: false },
                    membership: { completed: 0, unlocked: false },
                    bitwise: { completed: 0, unlocked: false }
                  },
                  totalActivities: 350,
                  completedActivities: 0,
                  powerups: {
                    streak: 0,
                    perfect: 0,
                    speed: 0,
                    combo: 0
                  }
                },
                'data-types': { completed: false, completedAt: null, timeSpent: 0 },
                'input-output': { completed: false, completedAt: null, timeSpent: 0 }
              }
            },
            'control-flow': {
              courseName: 'Control Flow',
              progress: 0,
              completedLessons: [],
              totalLessons: 8,
              locked: true,
              lessons: {
                'if-statements': { completed: false, completedAt: null, timeSpent: 0 },
                'elif-else': { completed: false, completedAt: null, timeSpent: 0 },
                'for-loops': { completed: false, completedAt: null, timeSpent: 0 },
                'while-loops': { completed: false, completedAt: null, timeSpent: 0 },
                'nested-loops': { completed: false, completedAt: null, timeSpent: 0 },
                'loop-control': { completed: false, completedAt: null, timeSpent: 0 },
                'logical-operators': { completed: false, completedAt: null, timeSpent: 0 },
                'practice-problems': { completed: false, completedAt: null, timeSpent: 0 }
              }
            },
            'data-structures': {
              courseName: 'Data Structures',
              progress: 0,
              completedLessons: [],
              totalLessons: 10,
              locked: true,
              lessons: {}
            },
            'functions': {
              courseName: 'Functions',
              progress: 0,
              completedLessons: [],
              totalLessons: 6,
              locked: true,
              lessons: {}
            }
          },
          totalProgress: 0,
          achievements: [],
          streakDays: 0,
          lastActiveDate: null
        });
        console.log('User progress initialized');
      }
      
      return await this.getUserProgress(userId);
    } catch (error) {
      console.error('Error initializing user progress:', error);
      throw error;
    }
  },

  // Get user progress
  async getUserProgress(userId) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const userProgressDoc = await getDoc(userProgressRef);
      
      if (userProgressDoc.exists()) {
        return userProgressDoc.data();
      } else {
        return await this.initializeUserProgress(userId);
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  },

  // Mark lesson as completed
  async markLessonComplete(userId, courseId, lessonId, timeSpent = 0) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const progressData = await this.getUserProgress(userId);
      
      if (!progressData.courses[courseId]) {
        console.error('Course not found:', courseId);
        return;
      }

      // Update lesson completion
      progressData.courses[courseId].lessons[lessonId] = {
        completed: true,
        completedAt: serverTimestamp(),
        timeSpent: timeSpent
      };

      // Update completed lessons array
      if (!progressData.courses[courseId].completedLessons.includes(lessonId)) {
        progressData.courses[courseId].completedLessons.push(lessonId);
      }

      // Calculate course progress
      const totalLessons = progressData.courses[courseId].totalLessons;
      const completedCount = progressData.courses[courseId].completedLessons.length;
      progressData.courses[courseId].progress = Math.round((completedCount / totalLessons) * 100);

      // Check if course is completed and unlock next course
      if (completedCount === totalLessons) {
        this.unlockNextCourse(progressData, courseId);
      }

      // Update total progress
      const allCourses = Object.values(progressData.courses);
      const totalProgress = Math.round(
        allCourses.reduce((sum, course) => sum + course.progress, 0) / allCourses.length
      );
      progressData.totalProgress = totalProgress;

      // Update last activity
      progressData.lastUpdated = serverTimestamp();
      progressData.lastActiveDate = new Date().toISOString().split('T')[0];

      // Save to Firestore
      await updateDoc(userProgressRef, progressData);
      
      console.log(`Lesson ${lessonId} marked as completed for course ${courseId}`);
      return progressData;
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  },

  // Unlock next course in sequence
  unlockNextCourse(progressData, completedCourseId) {
    const courseSequence = ['python-fundamentals', 'control-flow', 'data-structures', 'functions'];
    const currentIndex = courseSequence.indexOf(completedCourseId);
    
    if (currentIndex >= 0 && currentIndex < courseSequence.length - 1) {
      const nextCourseId = courseSequence[currentIndex + 1];
      if (progressData.courses[nextCourseId]) {
        progressData.courses[nextCourseId].locked = false;
        console.log(`Course ${nextCourseId} unlocked!`);
      }
    }
  },

  // Update time spent on lesson
  async updateTimeSpent(userId, courseId, lessonId, timeSpent) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const updatePath = `courses.${courseId}.lessons.${lessonId}.timeSpent`;
      
      await updateDoc(userProgressRef, {
        [updatePath]: timeSpent,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating time spent:', error);
    }
  },

  // Save exercise-level progress within a lesson
  async saveExerciseProgress(userId, courseId, lessonId, exerciseData) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      
      // First ensure the user progress document exists
      const userDoc = await getDoc(userProgressRef);
      if (!userDoc.exists()) {
        console.log('User progress document does not exist, initializing...');
        await this.initializeUserProgress(userId);
      }
      
      const updatePath = `courses.${courseId}.lessons.${lessonId}.exerciseProgress`;
      
      // Save the exercise progress
      await updateDoc(userProgressRef, {
        [updatePath]: exerciseData,
        lastUpdated: serverTimestamp()
      });
      
      // Then recalculate course progress based on all lessons
      await this.updateCourseProgress(userId, courseId);
      
      console.log(`Exercise progress saved for ${lessonId}:`, exerciseData);
    } catch (error) {
      console.error('Error saving exercise progress:', error);
      throw error;
    }
  },

  // Update course progress based on lesson exercise completion
  async updateCourseProgress(userId, courseId) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const progressData = await this.getUserProgress(userId);
      
      if (!progressData.courses[courseId]) return;
      
      const course = progressData.courses[courseId];
      const lessons = course.lessons;
      
      // Calculate completion based on exercises
      let totalExercises = 0;
      let completedExercises = 0;
      let completedLessons = [];
      
      Object.entries(lessons).forEach(([lessonId, lesson]) => {
        if (lesson.exerciseProgress) {
          const exerciseTotal = lesson.exerciseProgress.totalExercises || 0;
          const exerciseCompleted = lesson.exerciseProgress.completed || 0;
          
          totalExercises += exerciseTotal;
          completedExercises += exerciseCompleted;
          
          // Mark lesson as completed if all exercises are done
          if (exerciseTotal > 0 && exerciseCompleted === exerciseTotal) {
            if (!completedLessons.includes(lessonId)) {
              completedLessons.push(lessonId);
            }
          }
        }
      });
      
      // Calculate course progress percentage
      const courseProgress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
      
      // Update course data
      await updateDoc(userProgressRef, {
        [`courses.${courseId}.progress`]: courseProgress,
        [`courses.${courseId}.completedLessons`]: completedLessons,
        lastUpdated: serverTimestamp()
      });
      
      console.log(`Course ${courseId} progress updated: ${courseProgress}% (${completedExercises}/${totalExercises} exercises)`);
      
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  },

  // Operators Mastery specific functions
  async saveOperatorsMasteryProgress(userId, categoryData, powerups) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      
      // Calculate total completed activities across all categories
      const totalCompleted = Object.values(categoryData).reduce((sum, categoryData) => {
        const completed = typeof categoryData === 'object' ? (categoryData.completed || 0) : categoryData;
        return sum + completed;
      }, 0);
      
      // Get current user info to store with progress
      const currentUser = auth.currentUser;
      const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Anonymous User';
      const userEmail = currentUser?.email || 'unknown@example.com';
      
      // Update operators-mastery lesson progress and user info
      await updateDoc(userProgressRef, {
        'courses.python-fundamentals.lessons.operators-mastery.categories': categoryData,
        'courses.python-fundamentals.lessons.operators-mastery.completedActivities': totalCompleted,
        'courses.python-fundamentals.lessons.operators-mastery.powerups': powerups,
        'courses.python-fundamentals.lessons.operators-mastery.lastUpdated': serverTimestamp(),
        'displayName': userDisplayName,
        'email': userEmail,
        lastUpdated: serverTimestamp()
      });

      // Check if operators mastery is complete (all 350 activities)
      if (totalCompleted >= 350) {
        await updateDoc(userProgressRef, {
          'courses.python-fundamentals.lessons.operators-mastery.completed': true,
          'courses.python-fundamentals.lessons.operators-mastery.completedAt': serverTimestamp()
        });
      }

      // Update leaderboard with user progress
      await this.updateLeaderboard(userId, totalCompleted, powerups);

      // Update course progress
      await this.updateCourseProgress(userId, 'python-fundamentals');
      
      console.log(`Operators mastery progress saved: ${totalCompleted}/350 activities`);
      
    } catch (error) {
      console.error('Error saving operators mastery progress:', error);
      throw error;
    }
  },

  async getOperatorsMasteryProgress(userId) {
    try {
      const progressData = await this.getUserProgress(userId);
      const operatorsLesson = progressData.courses['python-fundamentals']?.lessons?.['operators-mastery'];
      
      if (!operatorsLesson) {
        // Return default progress if not found
        return {
          categories: {
            arithmetic: { completed: 0, unlocked: true },
            assignment: { completed: 0, unlocked: true },
            comparison: { completed: 0, unlocked: true },
            logical: { completed: 0, unlocked: true },
            identity: { completed: 0, unlocked: true },
            membership: { completed: 0, unlocked: true },
            bitwise: { completed: 0, unlocked: true }
          },
          totalActivities: 350,
          completedActivities: 0,
          powerups: {
            streak: 0,
            perfect: 0,
            speed: 0,
            combo: 0,
            skips: 0
          }
        };
      }
      
      return {
        categories: operatorsLesson.categories || {},
        totalActivities: operatorsLesson.totalActivities || 350,
        completedActivities: operatorsLesson.completedActivities || 0,
        powerups: operatorsLesson.powerups || { streak: 0, perfect: 0, speed: 0, combo: 0, skips: 0 }
      };
      
    } catch (error) {
      console.error('Error getting operators mastery progress:', error);
      throw error;
    }
  },

  // Leaderboard functions
  async updateLeaderboard(userId, completedActivities, powerups) {
    try {
      // Get user info first
      const userInfo = await this.getUserInfo(userId);
      
      const leaderboardRef = doc(db, 'leaderboard', userId);
      
      // Calculate total score based on activities and powerups
      const totalScore = completedActivities * 10 + 
                        (powerups.streak * 5) + 
                        (powerups.perfect * 10) + 
                        (powerups.speed * 3) + 
                        (powerups.combo * 7) + 
                        (powerups.skips * 2); // Lower value since skips are helpful but not achievements
      
      await setDoc(leaderboardRef, {
        userId: userId,
        displayName: userInfo.displayName || 'Anonymous User',
        email: userInfo.email,
        teacher: userInfo.email === 'marco.morais@imaginenorthport.com', // Set teacher status for Marco
        activitiesCompleted: completedActivities,
        powerups: powerups,
        totalScore: totalScore,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      console.log('Leaderboard updated for user:', userId, 'Activities:', completedActivities, 'Score:', totalScore);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  },

  async getLeaderboard() {
    try {
      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(leaderboardRef, orderBy('totalScore', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const leaderboard = [];
      querySnapshot.forEach((doc) => {
        leaderboard.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  async getUserInfo(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'userProgress', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          displayName: data.displayName || data.email?.split('@')[0] || 'Anonymous User',
          email: data.email || 'unknown@example.com'
        };
      } else {
        // If user document doesn't exist, create it with current user info
        const currentUser = auth.currentUser;
        if (currentUser) {
          return {
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
            email: currentUser.email || 'unknown@example.com'
          };
        }
      }
      return {
        displayName: 'Anonymous User',
        email: 'unknown@example.com'
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return {
        displayName: 'Anonymous User',
        email: 'unknown@example.com'
      };
    }
  }
};

// Initialize with loading state
showLoading('Checking authentication...');

// Check for redirect result first
getRedirectResult(auth)
  .then((result) => {
    if (result) {
      console.log('Main: Redirect result found, user signed in:', result.user.email);
      // User just completed sign-in, redirect to projects page
      window.location.href = '/projects.html';
    } else {
      console.log('Main: No redirect result, checking current auth state');
    }
  })
  .catch((error) => {
    console.error('Main: Error checking redirect result:', error);
    updateStatus('Sign-in error. Please try again.');
    showSignedOut();
  });

// Add a timeout to prevent indefinite loading
setTimeout(() => {
  // If still in loading state after 5 seconds, show sign out state
  if (authLoadingEl && !authLoadingEl.hidden) {
    console.log('Authentication check timed out, showing sign-out state');
    showSignedOut();
  }
}, 5000); // Reduced from 10000 to 5000 for faster response

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, getRedirectResult } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let firebaseConfig;
try {
  const cfg = await import('./firebase-config.js');
  firebaseConfig = cfg.firebaseConfig;
} catch (err) {
  console.error('Missing ./firebase-config.js — copy firebase-config.js.example and fill values.');
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.innerHTML = '<div class="error-content"><h2>Configuration Error</h2><p>Missing firebase-config.js — see README.</p></div>';
  }
  throw err;
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// State management to prevent race conditions
let isCheckingAuth = true;
let authCheckComplete = false;
let currentUIState = 'loading'; // Track current UI state

// Make auth object available globally for debugging
window.auth = auth;
window.isCheckingAuth = isCheckingAuth;
window.authCheckComplete = authCheckComplete;

// DOM elements
const loadingState = document.getElementById('loading-state');
const notSignedIn = document.getElementById('not-signed-in');
const dashboardContent = document.getElementById('dashboard-content');

// Header user info
const userAvatar = document.getElementById('user-avatar');
const userPhoto = document.getElementById('user-photo');
const userNameHeader = document.getElementById('user-name-header');
const userNameWelcome = document.getElementById('user-name-welcome');
const signoutBtn = document.getElementById('signout');

// Show loading state
function showLoading(message = 'Loading your dashboard...') {
  if (currentUIState === 'loading' && loadingState && !loadingState.hidden) {
    // Already showing loading, just update message
    const loadingText = loadingState.querySelector('p');
    if (loadingText) loadingText.textContent = message;
    return;
  }
  
  console.log('Dashboard: Showing loading state -', message);
  console.log('Dashboard: Hiding all other states');
  currentUIState = 'loading';
  
  // Show loading
  if (loadingState) {
    loadingState.hidden = false;
    const loadingText = loadingState.querySelector('p');
    if (loadingText) loadingText.textContent = message;
  }
  
  // Hide all other states
  if (notSignedIn) notSignedIn.hidden = true;
  if (dashboardContent) dashboardContent.hidden = true;
  
  console.log('Dashboard: Loading state set - loading visible:', loadingState ? !loadingState.hidden : 'null');
}

// Show not signed in state
function showNotSignedIn() {
  if (currentUIState === 'notSignedIn') {
    console.log('Dashboard: Already showing not signed in state');
    return;
  }
  
  console.log('Dashboard: Showing not signed in state');
  console.log('Dashboard: Hiding all other states');
  currentUIState = 'notSignedIn';
  
  // Hide all other states first
  if (loadingState) loadingState.hidden = true;
  if (dashboardContent) dashboardContent.hidden = true;
  
  // Show not signed in
  if (notSignedIn) notSignedIn.hidden = false;
  
  console.log('Dashboard: Not signed in state set - notSignedIn visible:', notSignedIn ? !notSignedIn.hidden : 'null');
}

// Show dashboard content
async function showDashboard(user) {
  if (currentUIState === 'dashboard') {
    console.log('Dashboard: Already showing dashboard state');
    return;
  }
  
  console.log('Dashboard: Showing dashboard for user:', user.email);
  console.log('Dashboard: Hiding all other states');
  currentUIState = 'dashboard';
  
  // Hide all other states first
  if (loadingState) loadingState.hidden = true;
  if (notSignedIn) notSignedIn.hidden = true;
  
  // Show dashboard
  if (dashboardContent) dashboardContent.hidden = false;
  
  console.log('Dashboard: Dashboard state set - dashboard visible:', dashboardContent ? !dashboardContent.hidden : 'null');
  
  // Update user info in header
  if (userNameHeader) userNameHeader.textContent = user.displayName || user.email || 'User';
  if (userNameWelcome) userNameWelcome.textContent = user.displayName || user.email || 'User';
  
  // Update user avatar
  if (userAvatar) userAvatar.hidden = false;
  if (userPhoto && user.photoURL) {
    userPhoto.src = user.photoURL;
  }

  // Load and display user progress
  await syncPendingProgress(user.uid);
  await loadUserProgress(user.uid);
}

// Simple authentication check - try multiple approaches
// Handle sign out
async function handleSignOut() {
  try {
    showLoading('Signing out...');
    await signOut(auth);
    window.location.href = '/';
  } catch (error) {
    console.error('Sign-out error:', error);
    alert('Failed to sign out. Please try again.');
  }
}

// Set up event listeners
if (signoutBtn) {
  signoutBtn.addEventListener('click', handleSignOut);
}

// Start authentication check
showLoading('Checking authentication...');

// Add debug flag for testing with sample data
const useSampleData = window.location.search.includes('demo=true');

// Single, simple auth state listener
onAuthStateChanged(auth, async (user) => {
  console.log('Dashboard: Auth state changed:', user ? `User: ${user.email}` : 'No user');
  
  if (user) {
    // User is authenticated
    authCheckComplete = true;
    isCheckingAuth = false;
    window.authCheckComplete = true;
    window.isCheckingAuth = false;
    await showDashboard(user);
  } else {
    // User is not authenticated
    authCheckComplete = true;
    isCheckingAuth = false;
    
    // Show demo data if requested, otherwise redirect to sign-in
    if (useSampleData) {
      showDemoData();
    } else {
      showNotSignedIn();
    }
  }
});

// Fallback timeout - reduced and simplified
setTimeout(() => {
  if (!authCheckComplete) {
    console.log('Dashboard: Authentication timeout, redirecting to login');
    window.location.href = '/';
  }
}, 2000); // Reduced to 2 seconds

// Show demo data for testing/preview purposes
function showDemoData() {
  console.log('Dashboard: Showing demo data');
  currentUIState = 'dashboard';
  
  // Hide loading and not signed in states
  if (loadingState) loadingState.hidden = true;
  if (notSignedIn) notSignedIn.hidden = true;
  
  // Show dashboard
  if (dashboardContent) dashboardContent.hidden = false;
  
  // Update with sample user info
  if (userNameHeader) userNameHeader.textContent = 'Demo Student';
  if (userNameWelcome) userNameWelcome.textContent = 'Demo Student';
  if (userAvatar) userAvatar.hidden = false;
  
  // Load sample progress data
  const sampleProgressData = {
    courses: {
      'python-fundamentals': {
        progress: 65,
        lessons: {
          'variables': { 
            completed: true, 
            exerciseProgress: { completed: 8, totalExercises: 8 }
          },
          'operators-mastery': { 
            completed: false, 
            exerciseProgress: { completed: 45, totalExercises: 95 }
          }
        }
      }
    }
  };
  
  updateDashboardProgress(sampleProgressData);
}

// Sync any pending progress from localStorage to Firebase
async function syncPendingProgress(userId) {
  console.log('Checking for pending progress to sync...');
  
  const pendingKeys = Object.keys(localStorage).filter(key => key.startsWith('pendingProgress_'));
  
  for (const key of pendingKeys) {
    try {
      const pendingData = JSON.parse(localStorage.getItem(key));
      
      // Check if the progress is for the current user and is recent (within 24 hours)
      if (pendingData.userId === userId && 
          (Date.now() - pendingData.timestamp) < 24 * 60 * 60 * 1000) {
        
        console.log(`Syncing pending progress for ${pendingData.lessonId}:`, pendingData.progressData);
        
        // Use ProgressTracker to save the pending progress
        if (window.ProgressTracker) {
          await window.ProgressTracker.saveExerciseProgress(
            pendingData.userId,
            pendingData.courseId,
            pendingData.lessonId,
            pendingData.progressData
          );
          
          console.log(`Successfully synced progress for ${pendingData.lessonId}`);
        }
      }
      
      // Remove the pending progress after syncing (or if too old)
      localStorage.removeItem(key);
      
    } catch (error) {
      console.error('Error syncing pending progress:', error);
      // Remove corrupted data
      localStorage.removeItem(key);
    }
  }
}

async function loadUserProgress(userId) {
  try {
    console.log('Loading progress for user:', userId);
    
    // Initialize progress if needed and get data
    let progressData;
    
    // Check if ProgressTracker is available (from app.js)
    if (window.ProgressTracker) {
      progressData = await window.ProgressTracker.initializeUserProgress(userId);
    } else {
      // Fallback to direct Firestore call
      const userProgressRef = doc(db, 'userProgress', userId);
      const userProgressDoc = await getDoc(userProgressRef);
      
      if (userProgressDoc.exists()) {
        progressData = userProgressDoc.data();
      } else {
        console.log('No progress data found, user needs to start lessons');
        return;
      }
    }
    
    console.log('Progress data loaded:', progressData);
    
    // Update dashboard with real progress
    updateDashboardProgress(progressData);
    
  } catch (error) {
    console.error('Error loading user progress:', error);
  }
}

// Update dashboard UI with progress data
function updateDashboardProgress(progressData) {
  console.log('Updating dashboard with progress data:', progressData);
  
  // Update progress stats - match the new dashboard structure
  const statsElements = {
    pythonConcepts: document.querySelector('.stat-card:nth-child(1) .stat-value'),
    moduleProgress: document.querySelector('.stat-card:nth-child(2) .stat-value'),
    exercisesSolved: document.querySelector('.stat-card:nth-child(3) .stat-value'),
    timeSpent: document.querySelector('.stat-card:nth-child(4) .stat-value')
  };
  
  // Calculate concepts learned (topics completed across all modules)
  let conceptsLearned = 0;
  let totalExercisesCompleted = 0;
  let moduleProgressPercentage = 0;
  
  // Count completed concepts and exercises
  Object.values(progressData.courses).forEach(course => {
    if (course.lessons) {
      Object.values(course.lessons).forEach(lesson => {
        if (lesson.exerciseProgress) {
          totalExercisesCompleted += lesson.exerciseProgress.completed || 0;
          
          // Count concepts learned based on exercise completion
          if (lesson.exerciseProgress.completed > 0) {
            conceptsLearned++;
          }
        }
      });
    }
  });
  
  // Calculate time spent (estimate based on progress)
  let totalTimeSpent = 0;
  Object.values(progressData.courses).forEach(course => {
    if (course.lessons) {
      Object.values(course.lessons).forEach(lesson => {
        if (lesson.exerciseProgress && lesson.exerciseProgress.completed > 0) {
          // Estimate 5 minutes per completed exercise
          totalTimeSpent += lesson.exerciseProgress.completed * 5;
        }
      });
    }
  });
  
  // Calculate module progress (focus on python-fundamentals for Module 1)
  if (progressData.courses['python-fundamentals']) {
    moduleProgressPercentage = progressData.courses['python-fundamentals'].progress || 0;
  }
  
  // Update stats with real data
  if (statsElements.pythonConcepts) {
    statsElements.pythonConcepts.textContent = conceptsLearned;
  }
  if (statsElements.moduleProgress) {
    statsElements.moduleProgress.textContent = `${moduleProgressPercentage}%`;
  }
  if (statsElements.exercisesSolved) {
    statsElements.exercisesSolved.textContent = totalExercisesCompleted;
  }
  if (statsElements.timeSpent) {
    const hours = Math.floor(totalTimeSpent / 60);
    const minutes = totalTimeSpent % 60;
    if (hours > 0) {
      statsElements.timeSpent.textContent = `${hours}h ${minutes}m`;
    } else {
      statsElements.timeSpent.textContent = `${minutes}m`;
    }
  }
  
  // Update module cards with real progress
  updateModuleCards(progressData.courses);
  
  // Update current learning section
  updateCurrentLearning(progressData.courses);
  
  // Mark dashboard as fully loaded to prevent flickering
  const dashboardMain = document.querySelector('.dashboard-main');
  if (dashboardMain) {
    dashboardMain.classList.add('loaded');
  }
}

// Update current learning section with actual next lesson
function updateCurrentLearning(courses) {
  const currentLearningCard = document.querySelector('.current-learning-card');
  if (!currentLearningCard) return;
  
  // Find the next lesson to work on
  let nextLesson = null;
  let nextLessonName = '';
  let moduleTitle = '';
  
  // Check Module 1 first
  if (courses['python-fundamentals']) {
    const course = courses['python-fundamentals'];
    const nextLessonId = findNextLesson(course);
    
    if (nextLessonId && course.progress < 100) {
      nextLesson = nextLessonId;
      moduleTitle = 'Module 1: Operations & Data Types';
      
      const lessonNames = {
        'variables': 'Variables & Data Types',
        'operators-mastery': 'Operators Mastery',
        'data-types': 'Advanced Data Types',
        'input-output': 'Input & Output'
      };
      nextLessonName = lessonNames[nextLessonId] || nextLessonId;
    }
  }
  
  // If Module 1 is complete, check Module 2
  if (!nextLesson && courses['python-fundamentals'] && courses['python-fundamentals'].progress === 100) {
    nextLesson = 'control-flow';
    nextLessonName = 'Conditional Statements';
    moduleTitle = 'Module 2: Flow Control';
  }
  
  // Update the current learning card
  if (nextLesson) {
    const titleElement = currentLearningCard.querySelector('h3');
    const descElement = currentLearningCard.querySelector('p');
    const buttonElement = currentLearningCard.querySelector('.btn-primary');
    
    if (titleElement) {
      titleElement.textContent = nextLessonName;
    }
    
    if (descElement) {
      descElement.textContent = `Continue your learning journey with ${moduleTitle}`;
    }
    
    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-play"></i> Continue Learning';
      buttonElement.onclick = () => {
        if (nextLesson === 'operators-mastery') {
          window.location.href = '/operators-mastery';
        } else if (nextLesson === 'control-flow') {
          window.location.href = '/lesson-control-flow';
        } else {
          window.location.href = `/lesson-${nextLesson}`;
        }
      };
    }
  } else {
    // All lessons complete
    const titleElement = currentLearningCard.querySelector('h3');
    const descElement = currentLearningCard.querySelector('p');
    const buttonElement = currentLearningCard.querySelector('.btn-primary');
    
    if (titleElement) {
      titleElement.textContent = 'Congratulations! 🎉';
    }
    
    if (descElement) {
      descElement.textContent = 'You\'ve completed all available modules. Check back for new content!';
    }
    
    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-trophy"></i> View Certificate';
      buttonElement.className = 'btn-secondary btn-full';
    }
  }
}

// Update module cards with real progress
function updateModuleCards(courses) {
  // Module 1: Operations & Data Types
  const module1Card = document.querySelector('.module-card.current');
  if (module1Card && courses['python-fundamentals']) {
    const course = courses['python-fundamentals'];
    
    // Update progress bar
    const progressFill = module1Card.querySelector('.progress-fill');
    const progressText = module1Card.querySelector('.progress-text');
    
    if (progressFill && progressText) {
      const progress = course.progress || 0;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}% Complete`;
    }
    
    // Update topic completion status
    updateTopicStatus(module1Card, course);
    
    // Update primary action button
    const primaryBtn = module1Card.querySelector('.btn-primary, .btn-disabled');
    if (primaryBtn) {
      if (course.progress === 100) {
        primaryBtn.innerHTML = '<i class="fas fa-trophy"></i> Module Complete!';
        primaryBtn.className = 'btn-disabled';
        primaryBtn.disabled = true;
      } else {
        const nextLesson = findNextLesson(course);
        if (nextLesson) {
          primaryBtn.innerHTML = '<i class="fas fa-play"></i> Continue Learning';
          primaryBtn.className = 'btn-primary';
          primaryBtn.disabled = false;
          
          // Set up click handler
          primaryBtn.onclick = () => {
            if (nextLesson === 'operators-mastery') {
              window.location.href = '/operators-mastery';
            } else {
              window.location.href = `/lesson-${nextLesson}`;
            }
          };
        } else {
          primaryBtn.innerHTML = '<i class="fas fa-play"></i> Start Module';
          primaryBtn.className = 'btn-primary';
          primaryBtn.disabled = false;
          primaryBtn.onclick = () => window.location.href = '/operators-mastery';
        }
      }
    }
  }
  
  // Module 2: Flow Control - Check if Module 1 is complete
  const module2Card = document.querySelector('.module-card.next');
  if (module2Card) {
    const module1Complete = courses['python-fundamentals'] && courses['python-fundamentals'].progress === 100;
    
    if (module1Complete) {
      // Unlock Module 2
      module2Card.classList.remove('next');
      module2Card.classList.add('current');
      
      const statusBadge = module2Card.querySelector('.status-badge');
      if (statusBadge) {
        statusBadge.textContent = 'Available Now';
        statusBadge.className = 'status-badge in-progress';
      }
      
      const primaryBtn = module2Card.querySelector('.btn-disabled');
      if (primaryBtn) {
        primaryBtn.innerHTML = '<i class="fas fa-play"></i> Start Module 2';
        primaryBtn.className = 'btn-primary';
        primaryBtn.disabled = false;
        primaryBtn.onclick = () => window.location.href = '/lesson-control-flow';
      }
      
      // Update topic icons to unlocked
      const topicIcons = module2Card.querySelectorAll('.topic-icon.locked');
      topicIcons.forEach(icon => {
        icon.classList.remove('locked');
        icon.classList.add('pending');
        icon.className = icon.className.replace('fa-lock', 'fa-circle');
      });
    }
  }
}

// Update topic completion status within a module
function updateTopicStatus(moduleCard, courseData) {
  const topicItems = moduleCard.querySelectorAll('.topic-item');
  
  // Define which topics correspond to which lessons/exercises
  const topicMapping = [
    { text: 'Data Types', lessons: ['variables'] },
    { text: 'Arithmetic Operators', lessons: ['operators-mastery'] },
    { text: 'Assignment Operators', lessons: ['operators-mastery'] },
    { text: 'Comparison Operators', lessons: ['operators-mastery'] },
    { text: 'Logical Operators', lessons: ['operators-mastery'] },
    { text: 'Identity & Containment', lessons: ['operators-mastery'] },
    { text: 'Operator Precedence', lessons: ['operators-mastery'] }
  ];
  
  topicItems.forEach((item, index) => {
    const icon = item.querySelector('.topic-icon');
    const mapping = topicMapping[index];
    
    if (mapping && icon) {
      let isCompleted = false;
      
      // Check if any of the related lessons are completed
      for (const lessonId of mapping.lessons) {
        if (courseData.lessons && courseData.lessons[lessonId]) {
          const lesson = courseData.lessons[lessonId];
          // Consider completed if exercises are fully done
          if (lesson.exerciseProgress && 
              lesson.exerciseProgress.completed === lesson.exerciseProgress.totalExercises) {
            isCompleted = true;
            break;
          }
        }
      }
      
      if (isCompleted) {
        icon.classList.remove('pending', 'locked');
        icon.className = icon.className.replace('fa-circle', 'fa-check-circle');
        icon.style.color = '#48bb78';
      } else {
        // Check if lesson has started (has some progress)
        let hasProgress = false;
        for (const lessonId of mapping.lessons) {
          if (courseData.lessons && courseData.lessons[lessonId] && 
              courseData.lessons[lessonId].exerciseProgress &&
              courseData.lessons[lessonId].exerciseProgress.completed > 0) {
            hasProgress = true;
            break;
          }
        }
        
        if (hasProgress) {
          icon.classList.remove('locked');
          icon.classList.add('pending');
          icon.className = icon.className.replace('fa-lock', 'fa-circle');
          icon.style.color = '#ed8936';
        }
      }
    }
  });
}

// Update course cards with real progress
function updateCourseCards(courses) {
  // Python Fundamentals course
  const fundamentalsCard = document.querySelector('.course-card:nth-child(1)');
  if (fundamentalsCard && courses['python-fundamentals']) {
    const course = courses['python-fundamentals'];
    const progressSpan = fundamentalsCard.querySelector('.course-progress span');
    const metaSpans = fundamentalsCard.querySelectorAll('.course-meta span');
    const button = fundamentalsCard.querySelector('button');
    
    if (progressSpan) {
      progressSpan.textContent = `${course.progress}%`;
    }
    
    // Update course meta information
    if (metaSpans.length >= 2) {
      // First span - time remaining (estimate based on progress)
      const completed = course.completedLessons ? course.completedLessons.length : 0;
      const remaining = course.totalLessons - completed;
      const timeRemaining = remaining * 30; // 30 minutes per lesson estimate
      metaSpans[0].innerHTML = `<i class="fas fa-clock"></i> ${timeRemaining} min left`;
      
      // Second span - lesson progress
      metaSpans[1].innerHTML = `<i class="fas fa-book"></i> ${completed}/${course.totalLessons} lessons`;
    }
    
    // Update lesson links
    updateLessonLinks(fundamentalsCard, course, 'python-fundamentals');
    
    // Update button based on progress
    if (button) {
      if (course.progress === 100) {
        button.textContent = 'Course Complete!';
        button.className = 'btn-secondary btn-full';
        button.disabled = true;
      } else {
        // Find next incomplete lesson and update button
        const nextLesson = findNextLesson(course);
        if (nextLesson) {
          button.textContent = 'Continue Learning';
          button.className = 'btn-primary btn-full';
          button.disabled = false;
          
          // Handle special case for operators-mastery lesson
          if (nextLesson === 'operators-mastery') {
            button.onclick = () => window.location.href = '/operators-mastery.html';
          } else {
            button.onclick = () => window.location.href = `/lesson-${nextLesson}.html`;
          }
        } else {
          button.textContent = 'Start Course';
          button.className = 'btn-primary btn-full';
          button.disabled = false;
          button.onclick = () => window.location.href = '/lesson-variables.html';
        }
      }
    }
  }
  
  // Control Flow course
  const controlFlowCard = document.querySelector('.course-card:nth-child(2)');
  if (controlFlowCard && courses['control-flow']) {
    const course = courses['control-flow'];
    const button = controlFlowCard.querySelector('button');
    
    if (!course.locked) {
      button.textContent = 'Start Course';
      button.disabled = false;
      button.className = 'btn-primary btn-full';
      button.onclick = () => window.location.href = '/lesson-control-flow.html';
    }
  }
}

// Update lesson links within course cards
function updateLessonLinks(courseCard, courseData, courseId) {
  const lessonLinks = courseCard.querySelectorAll('.lesson-link');
  
  // Define consistent lesson order for python-fundamentals
  const lessonOrder = {
    'python-fundamentals': ['variables', 'operators-mastery', 'data-types', 'input-output']
  };
  
  // Lesson names mapping
  const lessonNames = {
    'variables': 'Variables & Data Types',
    'operators-mastery': 'Operators Mastery',
    'operators': 'Operators', // Keep old mapping for backward compatibility
    'data-types': 'Data Types',
    'input-output': 'Input/Output'
  };
  
  // Use the defined order instead of Object.keys()
  const orderedLessonIds = lessonOrder[courseId] || Object.keys(courseData.lessons || {});
  
  lessonLinks.forEach((link, index) => {
    const lessonId = orderedLessonIds[index];
    
    if (lessonId) {
      const lesson = courseData.lessons && courseData.lessons[lessonId];
      
      // Update lesson name
      const lessonName = lessonNames[lessonId] || lessonId;
      
      if (lesson) {
        // Check if lesson has exercise progress
        const hasExerciseProgress = lesson.exerciseProgress && lesson.exerciseProgress.completed > 0;
        
        // A lesson is only fully complete if all exercises are completed
        const isFullyComplete = lesson.exerciseProgress && 
          lesson.exerciseProgress.completed === lesson.exerciseProgress.totalExercises;
        
        if (isFullyComplete) {
          link.classList.remove('locked');
          link.classList.add('completed');
          link.innerHTML = `<i class="fas fa-check-circle"></i> ${lessonName}`;
          // Handle special case for operators-mastery lesson
          if (lessonId === 'operators-mastery') {
            link.href = '/operators-mastery.html';
          } else {
            link.href = `/lesson-${lessonId}.html`;
          }
        } else if (hasExerciseProgress || index === 0 || (index > 0 && isLessonCompleteOrInProgress(courseData.lessons[orderedLessonIds[index-1]]))) {
          // Available if it has progress, is first lesson, or previous lesson is complete/in progress
          link.classList.remove('locked', 'completed');
          link.innerHTML = `<i class="fas fa-play-circle"></i> ${lessonName}`;
          // Handle special case for operators-mastery lesson
          if (lessonId === 'operators-mastery') {
            link.href = '/operators-mastery.html';
          } else {
            link.href = `/lesson-${lessonId}.html`;
          }
          
          // Add "in progress" indicator
          if (hasExerciseProgress && !isFullyComplete) {
            const progressText = link.querySelector('.progress-indicator') || document.createElement('span');
            if (!link.querySelector('.progress-indicator')) {
              progressText.className = 'progress-indicator';
              progressText.style.cssText = 'font-size: 0.8em; color: #666; margin-left: auto;';
              link.appendChild(progressText);
            }
            progressText.textContent = `${lesson.exerciseProgress.completed}/${lesson.exerciseProgress.totalExercises}`;
          }
        } else {
          // Locked
          link.classList.add('locked');
          link.classList.remove('completed');
          link.innerHTML = `<i class="fas fa-lock"></i> ${lessonName}`;
          link.href = '#';
        }
      } else {
        // No lesson data yet - show as available for first lesson, locked for others
        if (index === 0) {
          link.classList.remove('locked', 'completed');
          link.innerHTML = `<i class="fas fa-play-circle"></i> ${lessonName}`;
          // Handle special case for operators-mastery lesson
          if (lessonId === 'operators-mastery') {
            link.href = '/operators-mastery.html';
          } else {
            link.href = `/lesson-${lessonId}.html`;
          }
        } else {
          link.classList.add('locked');
          link.classList.remove('completed');
          link.innerHTML = `<i class="fas fa-lock"></i> ${lessonName}`;
          link.href = '#';
        }
      }
    } else {
      // No lesson ID for this position - hide the link
      link.style.display = 'none';
    }
  });
}

// Helper function to check if lesson is complete or has progress
function isLessonCompleteOrInProgress(lesson) {
  return lesson.completed || (lesson.exerciseProgress && lesson.exerciseProgress.completed > 0);
}

// Find next incomplete lesson
function findNextLesson(courseData) {
  // Use consistent lesson order
  const lessonOrder = ['variables', 'operators-mastery', 'data-types', 'input-output'];
  
  for (const lessonId of lessonOrder) {
    if (courseData.lessons[lessonId]) {
      const lesson = courseData.lessons[lessonId];
      // Check if lesson is not fully complete based on exercise progress
      const isFullyComplete = lesson.exerciseProgress && 
        lesson.exerciseProgress.completed === lesson.exerciseProgress.totalExercises;
      
      if (!isFullyComplete) {
        return lessonId;
      }
    }
  }
  return null;
}

// Update notifications with recent activity
function updateNotifications(progressData) {
  const notificationItem = document.querySelector('.notification-item');
  if (notificationItem && progressData.courses) {
    // Find most recently completed lesson
    let mostRecent = null;
    let mostRecentTime = 0;
    
    Object.entries(progressData.courses).forEach(([courseId, course]) => {
      if (course.lessons) {
        Object.entries(course.lessons).forEach(([lessonId, lesson]) => {
          if (lesson.completed && lesson.completedAt) {
            const completedTime = lesson.completedAt.seconds ? lesson.completedAt.seconds * 1000 : Date.parse(lesson.completedAt);
            if (completedTime > mostRecentTime) {
              mostRecentTime = completedTime;
              mostRecent = { courseId, lessonId, course: course.courseName };
            }
          }
        });
      }
    });
    
    if (mostRecent) {
      const timeAgo = getTimeAgo(mostRecentTime);
      notificationItem.innerHTML = `
        <i class="fas fa-check-circle notification-icon success"></i>
        <span>Completed: ${formatLessonName(mostRecent.lessonId)} • ${mostRecent.course} • ${timeAgo}</span>
      `;
    }
  }
}

// Helper function to format lesson names
function formatLessonName(lessonId) {
  const nameMap = {
    'variables': 'Variables & Data Types',
    'operators': 'Operators',
    'operators-mastery': 'Operators Mastery',
    'data-types': 'Data Types',
    'input-output': 'Input & Output',
    'if-statements': 'If Statements',
    'elif-else': 'Elif & Else',
    'for-loops': 'For Loops',
    'while-loops': 'While Loops'
  };
  return nameMap[lessonId] || lessonId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Helper function to get time ago string
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Firebase Lesson Progress Tracking System
// This module handles lesson completion, progress tracking, and synchronization with Firebase

import { auth, db } from '/firebase-config.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onAuthStateChanged,
  collection,
  query,
  orderBy,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

class LessonProgressTracker {
  constructor() {
    this.currentUser = null;
    this.progressData = {
      completedLessons: [],
      currentSection: 1,
      totalProgress: 0,
      achievements: [],
      timeSpent: {}
    };
    
    this.initializeAuth();
    this.bindEvents();
  }

  initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log('User signed in:', user.email);
        this.loadUserProgress();
        this.setupRealtimeSync();
      } else {
        console.log('User signed out - using local storage');
        this.loadLocalProgress();
      }
    });
  }

  async loadUserProgress() {
    if (!this.currentUser) return;

    try {
      const userProgressRef = doc(db, 'userProgress', this.currentUser.uid);
      const progressSnapshot = await getDoc(userProgressRef);
      
      if (progressSnapshot.exists()) {
        this.progressData = { ...this.progressData, ...progressSnapshot.data() };
        console.log('Loaded user progress from Firebase:', this.progressData);
      } else {
        // First time user - create initial progress document
        await this.saveProgressToFirebase();
      }
      
      this.updateUI();
    } catch (error) {
      console.error('Error loading user progress:', error);
      this.loadLocalProgress(); // Fallback to local storage
    }
  }

  async saveProgressToFirebase() {
    if (!this.currentUser) {
      this.saveLocalProgress();
      return;
    }

    try {
      const userProgressRef = doc(db, 'userProgress', this.currentUser.uid);
      const progressUpdate = {
        ...this.progressData,
        userId: this.currentUser.uid,
        email: this.currentUser.email,
        lastUpdated: new Date().toISOString(),
        displayName: this.currentUser.displayName || 'Anonymous Student'
      };
      
      await setDoc(userProgressRef, progressUpdate, { merge: true });
      console.log('Progress saved to Firebase successfully');
      
      // Also save to local storage as backup
      this.saveLocalProgress();
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      this.saveLocalProgress(); // Fallback to local storage
    }
  }

  setupRealtimeSync() {
    if (!this.currentUser) return;

    const userProgressRef = doc(db, 'userProgress', this.currentUser.uid);
    onSnapshot(userProgressRef, (doc) => {
      if (doc.exists()) {
        const newData = doc.data();
        // Only update if the data is different to avoid loops
        if (JSON.stringify(newData) !== JSON.stringify(this.progressData)) {
          this.progressData = { ...this.progressData, ...newData };
          this.updateUI();
          console.log('Progress updated from real-time sync');
        }
      }
    });
  }

  completeLesson(sectionId, lessonId) {
    const lessonKey = `${sectionId}.${lessonId}`;
    
    // Add to completed lessons if not already completed
    if (!this.progressData.completedLessons.includes(lessonKey)) {
      this.progressData.completedLessons.push(lessonKey);
      
      // Update current section if needed
      const section = parseInt(sectionId);
      if (section > this.progressData.currentSection) {
        this.progressData.currentSection = section;
      }
      
      // Calculate total progress
      this.progressData.totalProgress = this.calculateTotalProgress();
      
      // Check for achievements
      this.checkAchievements(lessonKey);
      
      // Track time spent (placeholder for future enhancement)
      this.progressData.timeSpent[lessonKey] = new Date().toISOString();
      
      console.log(`Lesson ${lessonKey} completed!`);
      
      // Save progress
      this.saveProgressToFirebase();
      
      // Update UI
      this.updateUI();
      
      // Show completion notification
      this.showCompletionNotification(sectionId, lessonId);
      
      return true;
    }
    
    return false; // Already completed
  }

  calculateTotalProgress() {
    const totalLessons = 22; // Total lessons across all 6 sections
    return Math.round((this.progressData.completedLessons.length / totalLessons) * 100);
  }

  checkAchievements(completedLesson) {
    const achievements = [];
    const completedCount = this.progressData.completedLessons.length;
    
    // First lesson achievement
    if (completedCount === 1) {
      achievements.push({
        id: 'first-lesson',
        title: 'Getting Started!',
        description: 'Completed your first Python lesson',
        icon: 'fas fa-star',
        earnedAt: new Date().toISOString()
      });
    }
    
    // Section completion achievements
    const section1Complete = this.progressData.completedLessons.filter(l => l.startsWith('1.')).length === 4;
    const section2Complete = this.progressData.completedLessons.filter(l => l.startsWith('2.')).length === 2;
    
    if (section1Complete && !this.progressData.achievements.some(a => a.id === 'data-master')) {
      achievements.push({
        id: 'data-master',
        title: 'Data Master',
        description: 'Mastered Python data types and operators',
        icon: 'fas fa-database',
        earnedAt: new Date().toISOString()
      });
    }
    
    if (section2Complete && !this.progressData.achievements.some(a => a.id === 'flow-controller')) {
      achievements.push({
        id: 'flow-controller',
        title: 'Flow Controller',
        description: 'Mastered Python control flow',
        icon: 'fas fa-route',
        earnedAt: new Date().toISOString()
      });
    }
    
    // Progress milestones
    if (completedCount === 5) {
      achievements.push({
        id: 'quarter-way',
        title: 'Quarter Way There',
        description: 'Completed 25% of the course',
        icon: 'fas fa-trophy',
        earnedAt: new Date().toISOString()
      });
    }
    
    if (completedCount === 11) {
      achievements.push({
        id: 'halfway',
        title: 'Halfway Champion',
        description: 'Completed 50% of the course',
        icon: 'fas fa-medal',
        earnedAt: new Date().toISOString()
      });
    }
    
    // Add new achievements to progress data
    achievements.forEach(achievement => {
      if (!this.progressData.achievements.some(a => a.id === achievement.id)) {
        this.progressData.achievements.push(achievement);
        this.showAchievementNotification(achievement);
      }
    });
  }

  showCompletionNotification(sectionId, lessonId) {
    // Create toast notification for lesson completion
    const notification = document.createElement('div');
    notification.className = 'lesson-completion-toast';
    notification.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>
        <span>Lesson ${sectionId}.${lessonId} completed!</span>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      border-left: 4px solid #10b981;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showAchievementNotification(achievement) {
    // Create achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-toast';
    notification.innerHTML = `
      <div class="toast-content">
        <i class="${achievement.icon}" style="color: #f59e0b; margin-right: 0.5rem; font-size: 1.2em;"></i>
        <div>
          <div style="font-weight: 600;">Achievement Unlocked!</div>
          <div style="font-size: 0.9em; color: #666;">${achievement.title}</div>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #fef3c7, #fbbf24);
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      border-left: 4px solid #f59e0b;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  updateUI() {
    // Update progress displays across the application
    this.updateDashboardProgress();
    this.updateLessonNavigation();
    this.updateAchievementBadges();
  }

  updateDashboardProgress() {
    // Update dashboard elements if they exist
    const completedElement = document.getElementById('completed-lessons');
    const progressElement = document.getElementById('completion-percent');
    const progressFill = document.getElementById('progress-fill');
    const currentSectionElement = document.getElementById('current-section');
    
    if (completedElement) {
      completedElement.textContent = this.progressData.completedLessons.length;
    }
    
    if (progressElement) {
      progressElement.textContent = this.progressData.totalProgress + '%';
    }
    
    if (progressFill) {
      progressFill.style.width = this.progressData.totalProgress + '%';
    }
    
    if (currentSectionElement) {
      currentSectionElement.textContent = this.progressData.currentSection;
    }
  }

  updateLessonNavigation() {
    // Update lesson status indicators
    const lessonItems = document.querySelectorAll('.lesson-item');
    
    lessonItems.forEach(item => {
      const lessonNumber = item.querySelector('.lesson-number')?.textContent;
      if (lessonNumber) {
        const statusElement = item.querySelector('.lesson-status');
        const statusIcon = item.querySelector('.lesson-status i');
        
        if (this.progressData.completedLessons.includes(lessonNumber)) {
          // Mark as completed
          statusIcon.className = 'fas fa-check-circle';
          statusElement.className = 'lesson-status status-completed';
          statusElement.style.color = '#10b981';
        } else if (this.isLessonUnlocked(lessonNumber)) {
          // Mark as available
          statusIcon.className = 'fas fa-play-circle';
          statusElement.className = 'lesson-status status-available';
          statusElement.style.color = '#f59e0b';
        } else {
          // Keep locked
          statusIcon.className = 'fas fa-lock';
          statusElement.className = 'lesson-status status-locked';
          statusElement.style.color = '#9ca3af';
        }
      }
    });
  }

  updateAchievementBadges() {
    // Update achievement displays if they exist
    const achievementContainer = document.getElementById('achievements-container');
    if (achievementContainer && this.progressData.achievements.length > 0) {
      achievementContainer.innerHTML = this.progressData.achievements.map(achievement => `
        <div class="achievement-badge">
          <i class="${achievement.icon}"></i>
          <span>${achievement.title}</span>
        </div>
      `).join('');
    }
  }

  isLessonUnlocked(lessonNumber) {
    // Simple unlocking logic - can be enhanced
    const [section, lesson] = lessonNumber.split('.').map(Number);
    
    // First lesson of first section is always unlocked
    if (section === 1 && lesson === 1) return true;
    
    // Check if previous lesson is completed
    const prevLessonNumber = lesson === 1 ? 
      `${section - 1}.${this.getLessonsInSection(section - 1)}` : 
      `${section}.${lesson - 1}`;
    
    return this.progressData.completedLessons.includes(prevLessonNumber);
  }

  getLessonsInSection(section) {
    const lessonCounts = { 1: 4, 2: 2, 3: 4, 4: 4, 5: 4, 6: 4 };
    return lessonCounts[section] || 0;
  }

  // Local storage fallback methods
  loadLocalProgress() {
    const stored = localStorage.getItem('pythonLessonProgress');
    if (stored) {
      this.progressData = { ...this.progressData, ...JSON.parse(stored) };
    }
    this.updateUI();
  }

  saveLocalProgress() {
    localStorage.setItem('pythonLessonProgress', JSON.stringify(this.progressData));
  }

  // Public methods for lesson pages
  markCurrentLessonComplete() {
    // Extract lesson info from URL or page data
    const pathParts = window.location.pathname.split('/');
    const lessonFile = pathParts[pathParts.length - 1];
    
    // Parse lesson number from filename (e.g., "lesson3-1.html" -> "3.1")
    const match = lessonFile.match(/lesson(\d+)-(\d+)\.html/);
    if (match) {
      const sectionId = match[1];
      const lessonId = match[2];
      return this.completeLesson(sectionId, lessonId);
    }
    
    return false;
  }

  getUserProgress() {
    return { ...this.progressData };
  }

  bindEvents() {
    // Listen for lesson completion events
    document.addEventListener('lessonComplete', (event) => {
      const { sectionId, lessonId } = event.detail;
      this.completeLesson(sectionId, lessonId);
    });
    
    // Listen for manual completion triggers
    document.addEventListener('markLessonComplete', () => {
      this.markCurrentLessonComplete();
    });
  }
}

// Create global instance
window.lessonProgressTracker = new LessonProgressTracker();

// Export for module use
export default LessonProgressTracker;
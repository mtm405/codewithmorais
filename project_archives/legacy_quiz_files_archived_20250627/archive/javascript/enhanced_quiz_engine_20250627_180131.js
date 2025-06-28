/**
 * Enhanced Quiz Core - Unified Implementation
 * Consolidates all quiz functionality into a single, maintainable system
 * 
 * Features:
 * - Multi-factor scoring algorithm
 * - Achievement system
 * - Advanced feedback with animations
 * - Mobile-optimized interactions
 * - Accessibility compliant
 */

class QuizEngine {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      enableAchievements: true,
      enableTimer: true,
      enableHints: true,
      difficultyAdaptation: true,
      animationsEnabled: true,
      ...config
    };
    
    this.state = new QuizState();
    this.scorer = new AdvancedScorer();
    this.achievements = new AchievementEngine();
    this.renderer = new QuizRenderer(container);
    this.analytics = new QuizAnalytics();
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadQuizData();
    this.initializeAccessibility();
    this.startQuiz();
  }
  
  async loadQuizData() {
    const quizId = this.container.dataset.quizId;
    try {
      this.quizData = await this.fetchQuizData(quizId);
      this.state.initialize(this.quizData);
    } catch (error) {
      this.handleError('Failed to load quiz', error);
    }
  }
  
  setupEventListeners() {
    // Answer selection
    this.container.addEventListener('click', this.handleAnswerSelection.bind(this));
    
    // Keyboard navigation
    this.container.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    
    // Touch gestures for mobile
    this.setupTouchGestures();
  }
  
  handleAnswerSelection(event) {
    const answerElement = event.target.closest('[data-answer]');
    if (!answerElement) return;
    
    const questionId = this.state.getCurrentQuestionId();
    const answer = answerElement.dataset.answer;
    
    this.submitAnswer(questionId, answer);
  }
  
  async submitAnswer(questionId, userAnswer) {
    const question = this.state.getCurrentQuestion();
    const startTime = this.state.getQuestionStartTime();
    const timeElapsed = Date.now() - startTime;
    
    // Grade the answer
    const result = this.gradeAnswer(question, userAnswer);
    
    // Calculate advanced score
    const scoreData = this.scorer.calculateScore({
      isCorrect: result.isCorrect,
      timeElapsed,
      targetTime: question.timeTarget || 30000,
      difficulty: question.difficulty || 1,
      attemptNumber: this.state.getAttemptNumber(questionId),
      hintsUsed: this.state.getHintsUsed(questionId)
    });
    
    // Update state
    this.state.recordAnswer(questionId, {
      userAnswer,
      isCorrect: result.isCorrect,
      timeElapsed,
      score: scoreData.totalScore,
      feedback: result.feedback
    });
    
    // Show enhanced feedback
    await this.showEnhancedFeedback(result, scoreData);
    
    // Check for achievements
    const newAchievements = this.achievements.checkAchievements(this.state.getPerformanceData());
    if (newAchievements.length > 0) {
      await this.celebrateAchievements(newAchievements);
    }
    
    // Send to backend
    await this.syncWithBackend(questionId, result, scoreData);
    
    // Auto-advance or show summary
    setTimeout(() => {
      if (this.state.hasMoreQuestions()) {
        this.moveToNextQuestion();
      } else {
        this.showQuizSummary();
      }
    }, 2000);
  }
  
  gradeAnswer(question, userAnswer) {
    switch (question.type) {
      case 'multiple_choice':
        return this.gradeMultipleChoice(question, userAnswer);
      case 'fill_in_the_blank':
        return this.gradeFillInTheBlank(question, userAnswer);
      case 'drag_and_drop':
        return this.gradeDragAndDrop(question, userAnswer);
      case 'code':
        return this.gradeCode(question, userAnswer);
      default:
        throw new Error(`Unknown question type: ${question.type}`);
    }
  }
  
  gradeMultipleChoice(question, userAnswer) {
    const correctIndex = question.correct_index;
    const isCorrect = parseInt(userAnswer) === correctIndex;
    
    return {
      isCorrect,
      feedback: isCorrect ? 
        question.correct_feedback || 'Correct! Well done!' :
        question.incorrect_feedback || 'Not quite right. Try again!',
      explanation: question.explanation
    };
  }
  
  gradeFillInTheBlank(question, userAnswer) {
    const acceptableAnswers = question.answers || [];
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    const isCorrect = acceptableAnswers.some(answer => 
      answer.toLowerCase() === normalizedUserAnswer
    );
    
    return {
      isCorrect,
      feedback: isCorrect ?
        'Excellent! That\'s the correct answer.' :
        'Not quite. Check your spelling and try again.',
      explanation: question.explanation
    };
  }
  
  async showEnhancedFeedback(result, scoreData) {
    const feedbackElement = this.renderer.createFeedbackElement(result, scoreData);
    
    if (this.config.animationsEnabled) {
      await this.animateFeedback(feedbackElement, result.isCorrect);
    }
    
    // Add score animation if points were earned
    if (scoreData.totalScore > 0) {
      this.animateScoreIncrease(scoreData.totalScore);
    }
    
    // Show streak indicator
    if (this.state.getCurrentStreak() >= 3) {
      this.showStreakIndicator(this.state.getCurrentStreak());
    }
  }
  
  async animateFeedback(element, isCorrect) {
    if (isCorrect) {
      // Success animation with confetti
      element.classList.add('feedback-success');
      if (Math.random() > 0.7) { // 30% chance for confetti
        this.triggerConfetti();
      }
    } else {
      // Gentle shake animation for incorrect
      element.classList.add('feedback-incorrect');
    }
    
    // Slide in animation
    element.style.transform = 'translateY(20px)';
    element.style.opacity = '0';
    
    await this.renderer.animate(element, {
      transform: 'translateY(0)',
      opacity: '1'
    }, { duration: 300, easing: 'ease-out' });
  }
  
  triggerConfetti() {
    // Create confetti effect
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.backgroundColor = this.getRandomColor();
      confettiContainer.appendChild(confetti);
    }
    
    this.container.appendChild(confettiContainer);
    
    // Remove after animation
    setTimeout(() => {
      confettiContainer.remove();
    }, 3000);
  }
  
  getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  showQuizSummary() {
    const performance = this.state.getPerformanceData();
    const summary = this.generateSummary(performance);
    
    this.renderer.showSummary(summary);
    
    // Analytics tracking
    this.analytics.recordQuizCompletion(performance);
  }
  
  generateSummary(performance) {
    return {
      totalScore: performance.totalScore,
      maxPossibleScore: performance.maxPossibleScore,
      accuracy: Math.round((performance.correctAnswers / performance.totalQuestions) * 100),
      timeElapsed: performance.totalTimeElapsed,
      achievements: performance.newAchievements,
      personalBest: performance.isPersonalBest,
      nextRecommendation: this.generateNextSteps(performance)
    };
  }
  
  handleError(message, error) {
    console.error('[Quiz Engine]', message, error);
    
    this.renderer.showErrorMessage(
      'We encountered an issue with this quiz. Your progress has been saved.',
      {
        retry: () => this.retryCurrentQuestion(),
        skip: () => this.skipToNextQuestion(),
        report: () => this.reportIssue(error)
      }
    );
  }
}

class QuizState {
  constructor() {
    this.currentQuestionIndex = 0;
    this.answers = new Map();
    this.questionStartTimes = new Map();
    this.attempts = new Map();
    this.hintsUsed = new Map();
    this.streak = 0;
    this.totalScore = 0;
    this.startTime = null;
  }
  
  initialize(quizData) {
    this.quizData = quizData;
    this.startTime = Date.now();
    this.markQuestionStart(this.getCurrentQuestionId());
  }
  
  getCurrentQuestion() {
    return this.quizData.questions[this.currentQuestionIndex];
  }
  
  getCurrentQuestionId() {
    return this.getCurrentQuestion()?.id || `q_${this.currentQuestionIndex}`;
  }
  
  markQuestionStart(questionId) {
    this.questionStartTimes.set(questionId, Date.now());
  }
  
  recordAnswer(questionId, answerData) {
    this.answers.set(questionId, answerData);
    this.totalScore += answerData.score;
    
    if (answerData.isCorrect) {
      this.streak++;
    } else {
      this.streak = 0;
    }
  }
  
  getPerformanceData() {
    const answers = Array.from(this.answers.values());
    return {
      totalQuestions: this.quizData.questions.length,
      correctAnswers: answers.filter(a => a.isCorrect).length,
      totalScore: this.totalScore,
      maxPossibleScore: this.calculateMaxPossibleScore(),
      currentStreak: this.streak,
      averageTimePerQuestion: this.calculateAverageTime(),
      totalTimeElapsed: Date.now() - this.startTime,
      answerPattern: answers.map(a => a.isCorrect)
    };
  }
}

class AdvancedScorer {
  calculateScore(attempt) {
    const baseScore = attempt.isCorrect ? 10 : 0;
    
    if (!attempt.isCorrect) {
      return { baseScore: 0, timeBonus: 0, totalScore: 0 };
    }
    
    const timeBonus = this.calculateTimeBonus(attempt.timeElapsed, attempt.targetTime);
    const difficultyMultiplier = this.getDifficultyMultiplier(attempt.difficulty);
    const attemptPenalty = this.getAttemptPenalty(attempt.attemptNumber);
    const hintPenalty = this.getHintPenalty(attempt.hintsUsed);
    
    const totalScore = Math.round(
      (baseScore + timeBonus) * difficultyMultiplier * attemptPenalty * hintPenalty
    );
    
    return {
      baseScore,
      timeBonus,
      difficultyMultiplier,
      attemptPenalty,
      hintPenalty,
      totalScore: Math.max(1, totalScore) // Minimum 1 point for correct answers
    };
  }
  
  calculateTimeBonus(timeElapsed, targetTime) {
    if (timeElapsed <= targetTime * 0.5) return 15; // Very fast
    if (timeElapsed <= targetTime * 0.75) return 10; // Fast  
    if (timeElapsed <= targetTime) return 5; // On time
    return 0; // Overtime
  }
  
  getDifficultyMultiplier(difficulty) {
    const multipliers = {
      1: 1.0,   // Easy
      2: 1.2,   // Medium
      3: 1.5,   // Hard
      4: 2.0,   // Expert
      5: 2.5    // Master
    };
    return multipliers[difficulty] || 1.0;
  }
  
  getAttemptPenalty(attemptNumber) {
    if (attemptNumber === 1) return 1.0;
    if (attemptNumber === 2) return 0.8;
    if (attemptNumber === 3) return 0.6;
    return 0.4; // 4+ attempts
  }
  
  getHintPenalty(hintsUsed) {
    return Math.max(0.5, 1.0 - (hintsUsed * 0.2));
  }
}

class AchievementEngine {
  constructor() {
    this.achievements = this.loadAchievementDefinitions();
  }
  
  loadAchievementDefinitions() {
    return {
      'first_quiz': {
        name: 'Getting Started',
        description: 'Complete your first quiz',
        icon: '🎯',
        points: 10,
        rarity: 'common'
      },
      'perfect_score': {
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: '💯',
        points: 50,
        rarity: 'rare'
      },
      'speed_demon': {
        name: 'Speed Demon',
        description: 'Complete a quiz in half the target time',
        icon: '⚡',
        points: 75,
        rarity: 'epic'
      },
      'streak_master': {
        name: 'Streak Master',
        description: 'Get 10 questions right in a row',
        icon: '🔥',
        points: 100,
        rarity: 'legendary'
      }
    };
  }
  
  checkAchievements(performanceData) {
    const newAchievements = [];
    
    // Check for perfect score
    if (performanceData.correctAnswers === performanceData.totalQuestions) {
      newAchievements.push(this.awardAchievement('perfect_score'));
    }
    
    // Check for speed achievement
    if (performanceData.averageTimePerQuestion < 15000) { // 15 seconds
      newAchievements.push(this.awardAchievement('speed_demon'));
    }
    
    // Check for streak achievement
    if (performanceData.currentStreak >= 10) {
      newAchievements.push(this.awardAchievement('streak_master'));
    }
    
    return newAchievements.filter(Boolean);
  }
  
  awardAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return null;
    
    // Check if already earned
    if (this.hasAchievement(achievementId)) return null;
    
    // Mark as earned
    this.markAchievementEarned(achievementId);
    
    return {
      ...achievement,
      id: achievementId,
      earnedAt: new Date().toISOString()
    };
  }
  
  hasAchievement(achievementId) {
    // Check localStorage or API
    const earned = localStorage.getItem('achievements') || '[]';
    return JSON.parse(earned).includes(achievementId);
  }
  
  markAchievementEarned(achievementId) {
    const earned = JSON.parse(localStorage.getItem('achievements') || '[]');
    earned.push(achievementId);
    localStorage.setItem('achievements', JSON.stringify(earned));
  }
}

class QuizRenderer {
  constructor(container) {
    this.container = container;
  }
  
  createFeedbackElement(result, scoreData) {
    const feedback = document.createElement('div');
    feedback.className = `quiz-feedback ${result.isCorrect ? 'correct' : 'incorrect'}`;
    
    feedback.innerHTML = `
      <div class="feedback-content">
        <div class="feedback-icon">${result.isCorrect ? '✅' : '❌'}</div>
        <div class="feedback-text">
          <div class="feedback-message">${result.feedback}</div>
          ${scoreData.totalScore > 0 ? `
            <div class="score-gained">+${scoreData.totalScore} points</div>
          ` : ''}
          ${result.explanation ? `
            <div class="feedback-explanation">${result.explanation}</div>
          ` : ''}
        </div>
      </div>
    `;
    
    return feedback;
  }
  
  async animate(element, properties, options = {}) {
    return new Promise(resolve => {
      element.animate(properties, {
        duration: options.duration || 300,
        easing: options.easing || 'ease',
        fill: 'forwards'
      }).addEventListener('finish', resolve);
    });
  }
}

// Initialize quiz engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-quiz-engine]').forEach(container => {
    new QuizEngine(container);
  });
});

export { QuizEngine, QuizState, AdvancedScorer, AchievementEngine };

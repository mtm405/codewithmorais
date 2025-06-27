// Comprehensive Quiz JavaScript Logic
// Handles multi-question quizzes with timer, progress tracking, and detailed scoring

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all comprehensive quizzes on the page
  document.querySelectorAll('.comprehensive-quiz-container').forEach(initComprehensiveQuiz);
});

function initComprehensiveQuiz(quizContainer) {
  if (!quizContainer) return;

  const questions = Array.from(quizContainer.querySelectorAll('.comprehensive-question-wrapper'));
  const progressFill = quizContainer.querySelector('.quiz-progress-fill');
  const currentQuestionSpan = quizContainer.querySelector('.current-question');
  const totalQuestionsSpan = quizContainer.querySelector('.total-questions');
  const currentScoreSpan = quizContainer.querySelector('.current-score');
  const maxScoreSpan = quizContainer.querySelector('.max-score');
  const feedbackDiv = quizContainer.querySelector('.quiz-feedback');
  const prevBtn = quizContainer.querySelector('.prev-question-btn');
  const nextBtn = quizContainer.querySelector('.next-question-btn');
  const submitBtn = quizContainer.querySelector('.submit-quiz-btn');
  const pauseBtn = quizContainer.querySelector('.pause-quiz-btn');
  const quizBody = quizContainer.querySelector('.comprehensive-quiz-body');
  const quizSummary = quizContainer.querySelector('.comprehensive-quiz-summary');
  const retryBtn = quizContainer.querySelector('.retry-quiz-btn');
  const continueBtn = quizContainer.querySelector('.continue-lesson-btn');
  const timerDisplay = quizContainer.querySelector('.timer-display');
  const timerElement = quizContainer.querySelector('.quiz-timer');
  
  // Debug information
  console.log('Comprehensive Quiz Initialized');
  console.log('Questions found:', questions.length);
  
  let currentQuestionIndex = 0;
  let quizAnswers = [];
  let totalScore = 0;
  let maxPossibleScore = 0;
  let timerInterval = null;
  let timeRemaining = null;
  let quizPaused = false;
  let quizStartTime = Date.now();
  
  // Calculate max possible score
  questions.forEach(q => {
    const points = parseInt(q.dataset.points) || 1;
    maxPossibleScore += points;
  });
  
  // Initialize timer if present
  if (timerElement && timerElement.dataset.timeLimit) {
    timeRemaining = parseInt(timerElement.dataset.timeLimit);
    startTimer();
  }
  
  // Initialize UI
  if (totalQuestionsSpan) totalQuestionsSpan.textContent = questions.length;
  if (maxScoreSpan) maxScoreSpan.textContent = maxPossibleScore;
  
  // Set up event listeners
  if (prevBtn) prevBtn.addEventListener('click', showPreviousQuestion);
  if (nextBtn) nextBtn.addEventListener('click', handleNextQuestionClick);
  if (submitBtn) submitBtn.addEventListener('click', () => submitQuiz(false));
  if (pauseBtn) pauseBtn.addEventListener('click', pauseQuiz);
  if (retryBtn) retryBtn.addEventListener('click', resetQuiz);
  if (continueBtn) continueBtn.addEventListener('click', continueLessonAfterQuiz);
  
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      if (quizPaused) return;
      
      timeRemaining--;
      updateTimerDisplay();
      
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        handleTimeUp();
      } else if (timeRemaining <= 60) {
        // Add urgency styling when under 1 minute
        timerDisplay.style.color = 'var(--accent-red)';
        timerDisplay.style.fontWeight = '700';
      } else if (timeRemaining <= 300) {
        // Warning at 5 minutes
        timerDisplay.style.color = 'var(--accent-yellow)';
      }
    }, 1000);
  }
  
  function updateTimerDisplay() {
    if (!timerDisplay || timeRemaining === null) return;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  function handleTimeUp() {
    alert('Time is up! Submitting your current answers.');
    submitQuiz(true); // Auto-submit when time runs out
  }
  
  function pauseQuiz() {
    quizPaused = !quizPaused;
    
    if (pauseBtn) {
      if (quizPaused) {
        pauseBtn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span> Resume';
      } else {
        pauseBtn.innerHTML = '<span class="material-symbols-outlined">pause</span> Pause';
      }
    }
  }
  
  function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    
    questions.forEach((q, i) => {
      q.classList.toggle('d-none', i !== index);
      
      // Ensure ARIA state is updated correctly for screen readers
      if (i === index) {
        q.removeAttribute('aria-hidden');
        setTimeout(() => {
          const firstInput = q.querySelector('input, button, .drag-item, textarea');
          if (firstInput) firstInput.focus();
        }, 100);
      } else {
        q.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Update UI state
    currentQuestionIndex = index;
    
    if (currentQuestionSpan) {
      currentQuestionSpan.textContent = index + 1;
    }
    
    if (prevBtn) {
      prevBtn.disabled = index === 0;
    }
    
    if (nextBtn && submitBtn) {
      const isLastQuestion = index === questions.length - 1;
      nextBtn.classList.toggle('d-none', isLastQuestion);
      submitBtn.classList.toggle('d-none', !isLastQuestion);
    }
    
    // Update progress bar
    if (progressFill) {
      const progress = ((index + 1) / questions.length) * 100;
      progressFill.style.width = `${progress}%`;
    }
  }
  
  function showPreviousQuestion() {
    showQuestion(currentQuestionIndex - 1);
  }
  
  function showNextQuestion() {
    showQuestion(currentQuestionIndex + 1);
  }
  
  function handleNextQuestionClick() {
    // Get the current question element
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Validate the current question
    const questionType = currentQuestion.dataset.questionType;
    const isAnswered = checkQuestionAnswered(currentQuestion, questionType);
    
    if (!isAnswered) {
      alert('Please answer the question before continuing.');
      return;
    }
    
    // Store the answer
    const answer = getQuestionAnswer(currentQuestion, questionType);
    quizAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.dataset.questionId,
      type: questionType,
      answer: answer
    };
    
    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      submitQuiz(false);
    } else {
      showNextQuestion();
    }
  }
  
  function checkQuestionAnswered(questionEl, type) {
    switch (type) {
      case 'multiple_choice':
        return questionEl.querySelector('input[type="radio"]:checked') !== null;
      
      case 'fill_in_the_blank':
        const input = questionEl.querySelector('input[type="text"]');
        return input && input.value.trim() !== '';
      
      case 'drag_and_drop':
        const dropZones = questionEl.querySelectorAll('.drop-zone');
        return Array.from(dropZones).every(zone => zone.querySelector('.drag-item') !== null);
      
      default:
        // For unsupported types, allow proceeding
        return true;
    }
  }
  
  function getQuestionAnswer(questionEl, type) {
    switch (type) {
      case 'multiple_choice':
        const selected = questionEl.querySelector('input[type="radio"]:checked');
        return selected ? parseInt(selected.value) : null;
      
      case 'fill_in_the_blank':
        const input = questionEl.querySelector('input[type="text"]');
        return input ? input.value.trim() : '';
      
      case 'drag_and_drop':
        const mapping = {};
        const dropZones = questionEl.querySelectorAll('.drop-zone');
        
        dropZones.forEach(zone => {
          const dragItem = zone.querySelector('.drag-item');
          if (dragItem) {
            const stem = dragItem.dataset.stem;
            const category = zone.dataset.category;
            mapping[stem] = category;
          }
        });
        
        return mapping;
      
      default:
        return null;
    }
  }
  
  function submitQuiz(isAutoSubmit = false) {
    // Clear any timers
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    // Ensure all questions are answered
    if (!isAutoSubmit) {
      const unansweredIndex = quizAnswers.findIndex(a => a === undefined);
      
      if (unansweredIndex !== -1) {
        alert(`Please answer question ${unansweredIndex + 1} before submitting.`);
        showQuestion(unansweredIndex);
        return;
      }
    }
    
    // Calculate score
    const results = gradeQuiz();
    
    // Update UI to show results
    showQuizResults(results);
    
    // Submit results to backend (if implemented)
    try {
      const quizData = {
        quizId: quizContainer.dataset.blockId,
        answers: quizAnswers,
        score: results.score,
        maxScore: results.maxScore,
        timeTaken: Math.floor((Date.now() - quizStartTime) / 1000)
      };
      
      // Example of how to submit data to backend
      // fetch('/api/submit-quiz', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(quizData)
      // });
      
      console.log('Quiz submission data:', quizData);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  }
  
  function gradeQuiz() {
    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let questionResults = [];
    
    questions.forEach((questionEl, index) => {
      const questionType = questionEl.dataset.questionType;
      const questionId = questionEl.dataset.questionId;
      const points = parseInt(questionEl.dataset.points) || 1;
      maxScore += points;
      
      // Get user answer (or use empty/default values if auto-submitted)
      const userAnswer = quizAnswers[index]?.answer || getDefaultAnswer(questionType);
      
      // Get correct answer from the question element
      const correctAnswer = getCorrectAnswer(questionEl, questionType);
      
      // Grade based on question type
      let isCorrect = false;
      
      switch (questionType) {
        case 'multiple_choice':
          isCorrect = userAnswer === correctAnswer;
          break;
        
        case 'fill_in_the_blank':
          isCorrect = (Array.isArray(correctAnswer) 
            ? correctAnswer.some(ans => ans.toLowerCase() === userAnswer.toLowerCase())
            : correctAnswer.toLowerCase() === userAnswer.toLowerCase());
          break;
        
        case 'drag_and_drop':
          isCorrect = Object.keys(correctAnswer).every(key => 
            correctAnswer[key] === userAnswer[key]
          );
          break;
      }
      
      // Update score
      if (isCorrect) {
        score += points;
        correctCount++;
      }
      
      // Store result for this question
      questionResults.push({
        questionId,
        type: questionType,
        userAnswer,
        correctAnswer,
        isCorrect,
        points: isCorrect ? points : 0,
        maxPoints: points
      });
    });
    
    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      correctCount,
      totalQuestions: questions.length,
      questionResults
    };
  }
  
  function getDefaultAnswer(type) {
    switch (type) {
      case 'multiple_choice':
        return null;
      case 'fill_in_the_blank':
        return '';
      case 'drag_and_drop':
        return {};
      default:
        return null;
    }
  }
  
  function getCorrectAnswer(questionEl, type) {
    switch (type) {
      case 'multiple_choice':
        const correctOption = questionEl.querySelector('.option[data-correct="true"]');
        return correctOption ? parseInt(correctOption.dataset.index) : null;
      
      case 'fill_in_the_blank':
        const answersJSON = questionEl.querySelector('.fill-blank-question')?.dataset.answers;
        return answersJSON ? JSON.parse(answersJSON) : [];
      
      case 'drag_and_drop':
        const mappingJSON = questionEl.querySelector('.drag-and-drop-container')?.dataset.correctMapping;
        return mappingJSON ? JSON.parse(mappingJSON) : {};
      
      default:
        return null;
    }
  }
  
  function showQuizResults(results) {
    // Hide questions and show summary
    if (quizBody) quizBody.classList.add('d-none');
    if (quizSummary) quizSummary.classList.remove('d-none');
    
    // Hide navigation
    if (prevBtn) prevBtn.classList.add('d-none');
    if (nextBtn) nextBtn.classList.add('d-none');
    if (submitBtn) submitBtn.classList.add('d-none');
    if (pauseBtn) pauseBtn.classList.add('d-none');
    
    // Update summary content
    if (quizSummary) {
      const percentage = quizSummary.querySelector('.final-percentage');
      const correctAnswers = quizSummary.querySelector('.correct-answers');
      const totalQuestions = quizSummary.querySelector('.total-questions-summary');
      const pointsEarned = quizSummary.querySelector('.total-points-earned');
      const pointsPossible = quizSummary.querySelector('.total-points-possible');
      
      if (percentage) percentage.textContent = results.percentage;
      if (correctAnswers) correctAnswers.textContent = results.correctCount;
      if (totalQuestions) totalQuestions.textContent = results.totalQuestions;
      if (pointsEarned) pointsEarned.textContent = results.score;
      if (pointsPossible) pointsPossible.textContent = results.maxScore;
      
      // Show pass/fail message if applicable
      const passingScore = parseInt(quizContainer.dataset.passingScore);
      if (!isNaN(passingScore)) {
        const passed = results.percentage >= passingScore;
        const passingMsg = quizSummary.querySelector('.passing-message');
        const failingMsg = quizSummary.querySelector('.failing-message');
        
        if (passingMsg) passingMsg.classList.toggle('d-none', !passed);
        if (failingMsg) failingMsg.classList.toggle('d-none', passed);
      }
    }
    
    // Announce results to screen readers
    const summaryForSR = `Quiz complete. You got ${results.correctCount} out of ${results.totalQuestions} questions correct, for a score of ${results.percentage}%.`;
    
    // Create an ARIA live region for announcements
    let ariaLive = document.getElementById('quiz-completion-announcement');
    if (!ariaLive) {
      ariaLive = document.createElement('div');
      ariaLive.id = 'quiz-completion-announcement';
      ariaLive.className = 'sr-only';
      ariaLive.setAttribute('aria-live', 'assertive');
      document.body.appendChild(ariaLive);
    }
    
    ariaLive.textContent = summaryForSR;
  }
  
  function resetQuiz() {
    // Reset all questions
    questions.forEach(question => {
      const type = question.dataset.questionType;
      
      switch (type) {
        case 'multiple_choice':
          question.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
          });
          break;
        
        case 'fill_in_the_blank':
          question.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
          });
          break;
        
        case 'drag_and_drop':
          // Reset drag items to their original position
          const dragItems = question.querySelectorAll('.drag-item');
          const itemContainer = question.querySelector('.drag-items-container');
          
          if (itemContainer) {
            dragItems.forEach(item => {
              itemContainer.appendChild(item);
            });
          }
          break;
      }
    });
    
    // Reset state variables
    currentQuestionIndex = 0;
    quizAnswers = [];
    totalScore = 0;
    quizStartTime = Date.now();
    
    // Reset UI
    if (quizBody) quizBody.classList.remove('d-none');
    if (quizSummary) quizSummary.classList.add('d-none');
    
    if (prevBtn) {
      prevBtn.classList.remove('d-none');
      prevBtn.disabled = true;
    }
    
    if (nextBtn) {
      nextBtn.classList.remove('d-none');
      nextBtn.classList.remove('d-none');
    }
    
    if (submitBtn) {
      submitBtn.classList.add('d-none');
    }
    
    if (pauseBtn) {
      pauseBtn.classList.remove('d-none');
      pauseBtn.innerHTML = '<span class="material-symbols-outlined">pause</span> Pause';
    }
    
    if (progressFill) {
      progressFill.style.width = '0%';
    }
    
    if (currentScoreSpan) {
      currentScoreSpan.textContent = '0';
    }
    
    // Reset timer if there was one
    if (timerElement && timerElement.dataset.timeLimit) {
      timeRemaining = parseInt(timerElement.dataset.timeLimit);
      updateTimerDisplay();
      startTimer();
    }
    
    // Show the first question
    showQuestion(0);
  }
  
  function continueLessonAfterQuiz() {
    // This function would navigate to the next part of the lesson
    // For example, we could scroll to the next element
    const nextElement = quizContainer.nextElementSibling;
    if (nextElement) {
      nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // Initialize the quiz by showing the first question
  showQuestion(0);
}
  
  function updateTimerDisplay() {
    if (!timerDisplay || timeRemaining === null) return;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  function handleTimeUp() {
    alert('Time is up! Submitting your current answers.');
    submitQuiz(true); // Auto-submit when time runs out
  }
  
  function pauseQuiz() {
    quizPaused = !quizPaused;
    
    if (quizPaused) {
      // Safely update button content
      pauseBtn.innerHTML = '';
      const iconSpan = document.createElement('span');
      iconSpan.className = 'material-symbols-outlined';
      iconSpan.textContent = 'play_arrow';
      pauseBtn.appendChild(iconSpan);
      pauseBtn.appendChild(document.createTextNode(' Resume'));
      
      pauseBtn.classList.add('btn-warning');
      // Optionally blur/hide quiz content
      quizBody.style.filter = 'blur(5px)';
      quizBody.style.pointerEvents = 'none';
    } else {
      // Safely update button content
      pauseBtn.innerHTML = '';
      const iconSpan = document.createElement('span');
      iconSpan.className = 'material-symbols-outlined';
      iconSpan.textContent = 'pause';
      pauseBtn.appendChild(iconSpan);
      pauseBtn.appendChild(document.createTextNode(' Pause'));
      
      pauseBtn.classList.remove('btn-warning');
      quizBody.style.filter = 'none';
      quizBody.style.pointerEvents = 'auto';
    }
  }
  
  function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    if (progressFill) progressFill.style.width = progress + '%';
    if (currentQuestionSpan) currentQuestionSpan.textContent = currentQuestionIndex + 1;
    if (currentScoreSpan) currentScoreSpan.textContent = totalScore;
  }
  
  function showQuestion(index) {
    questions.forEach((q, i) => {
      q.classList.toggle('d-none', i !== index);
    });
    
    // Update navigation buttons
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.classList.toggle('d-none', index === questions.length - 1);
    if (submitBtn) submitBtn.classList.toggle('d-none', index !== questions.length - 1);
    
    updateProgress();
    
    // Clear any previous feedback
    if (feedbackDiv) feedbackDiv.textContent = '';
  }
  
  function moveToNext() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
    }
  }
  
  function moveToPrev() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
    }
  }
  
  async function submitQuiz(autoSubmit = false) {
    if (timerInterval) clearInterval(timerInterval);
    
    if (!autoSubmit) {
      const confirmSubmit = confirm('Are you sure you want to submit your quiz? You cannot change your answers after submission.');
      if (!confirmSubmit) return;
    }
    
    // Disable all inputs to prevent further changes
    questions.forEach(q => {
      q.querySelectorAll('button, input').forEach(el => {
        el.disabled = true;
      });
    });
    
    // Submit all answers to backend
    const submissionPromises = quizAnswers.map(answer => {
      return handleQuizSubmit({
        questionId: answer.questionId,
        type: answer.type,
        userInput: answer.userInput,
        correctAnswer: answer.correctAnswer,
        points: answer.isCorrect ? answer.points : 0,
        currency: answer.isCorrect ? 1 : 0,
        feedbackElement: null // No individual feedback in comprehensive mode
      });
    });
    
    try {
      await Promise.all(submissionPromises);
      showQuizSummary();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('There was an error submitting your quiz. Please try again.');
      
      // Re-enable inputs if submission failed
      questions.forEach(q => {
        q.querySelectorAll('button, input').forEach(el => {
          el.disabled = false;
        });
      });
    }
  }
  
  function showQuizSummary() {
    if (quizBody) quizBody.classList.add('d-none');
    if (quizSummary) quizSummary.classList.remove('d-none');
    
    const correctAnswers = quizAnswers.filter(a => a.isCorrect).length;
    const percentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    const pointsEarned = quizAnswers.filter(a => a.isCorrect).reduce((sum, a) => sum + a.points, 0);
    
    // Update summary displays
    const percentageSpan = quizSummary.querySelector('.final-percentage');
    const correctSpan = quizSummary.querySelector('.correct-answers');
    const totalSpan = quizSummary.querySelector('.total-questions-summary');
    const pointsEarnedSpan = quizSummary.querySelector('.total-points-earned');
    const totalPointsSpan = quizSummary.querySelector('.total-points-possible');
    
    if (percentageSpan) percentageSpan.textContent = percentage;
    if (correctSpan) correctSpan.textContent = correctAnswers;
    if (totalSpan) totalSpan.textContent = questions.length;
    if (pointsEarnedSpan) pointsEarnedSpan.textContent = pointsEarned;
    if (totalPointsSpan) totalPointsSpan.textContent = maxPossibleScore;
    
    // Show passing/failing status
    const passingMessage = quizSummary.querySelector('.passing-message');
    const failingMessage = quizSummary.querySelector('.failing-message');
    const passingScore = quizContainer.dataset.passingScore ? parseInt(quizContainer.dataset.passingScore) : null;
    
    if (passingScore && passingMessage && failingMessage) {
      if (percentage >= passingScore) {
        passingMessage.classList.remove('d-none');
        failingMessage.classList.add('d-none');
      } else {
        passingMessage.classList.add('d-none');
        failingMessage.classList.remove('d-none');
      }
    }
    
    // Update score circle color based on performance
    const scoreCircle = quizSummary.querySelector('.score-circle');
    if (scoreCircle) {
      if (percentage >= 90) {
        scoreCircle.style.background = 'var(--accent-green)';
      } else if (percentage >= 70) {
        scoreCircle.style.background = 'var(--accent-blue)';
      } else if (percentage >= 50) {
        scoreCircle.style.background = 'var(--accent-yellow)';
      } else {
        scoreCircle.style.background = 'var(--accent-red)';
      }
    }
  }
  
  function resetQuiz() {
    currentQuestionIndex = 0;
    totalScore = 0;
    quizAnswers = [];
    quizPaused = false;
    quizStartTime = Date.now();
    
    // Reset timer
    if (timerElement && timerElement.dataset.timeLimit) {
      timeRemaining = parseInt(timerElement.dataset.timeLimit);
      if (timerDisplay) {
        timerDisplay.style.color = '';
        timerDisplay.style.fontWeight = '';
      }
      startTimer();
    }
    
    // Reset UI
    if (quizBody) quizBody.classList.remove('d-none');
    if (quizSummary) quizSummary.classList.add('d-none');
    if (feedbackDiv) feedbackDiv.textContent = '';
    
    // Reset all question states
    questions.forEach(q => {
      q.querySelectorAll('button, input').forEach(el => {
        el.disabled = false;
        el.classList.remove('selected', 'correct', 'incorrect');
      });
      
      // Reset text inputs
      q.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
      });
      
      // Reset drag and drop
      if (q.dataset.questionType === 'drag_and_drop') {
        const bank = q.querySelector('.drag-item-bank');
        const dropZones = q.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
          zone.classList.remove('correct', 'incorrect');
          if (zone.firstChild && bank) {
            bank.appendChild(zone.firstChild);
          }
        });
      }
    });
    
    showQuestion(0);
  }
  
  // Event Listeners
  if (nextBtn) nextBtn.addEventListener('click', moveToNext);
  if (prevBtn) prevBtn.addEventListener('click', moveToPrev);
  if (submitBtn) submitBtn.addEventListener('click', () => submitQuiz(false));
  if (pauseBtn) pauseBtn.addEventListener('click', pauseQuiz);
  if (retryBtn) retryBtn.addEventListener('click', resetQuiz);
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      // Navigate to next lesson or dashboard
      window.location.href = '/dashboard';
    });
  }
  
  // Listen for question answers
  quizContainer.addEventListener('quizAnswered', (event) => {
    const { questionId, isCorrect, userInput, correctAnswer, type, points } = event.detail;
    
    // Update or add answer
    const existingAnswerIndex = quizAnswers.findIndex(a => a.questionId === questionId);
    const answerData = { questionId, isCorrect, userInput, correctAnswer, type, points };
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      const oldAnswer = quizAnswers[existingAnswerIndex];
      if (oldAnswer.isCorrect && !isCorrect) {
        totalScore -= oldAnswer.points;
      } else if (!oldAnswer.isCorrect && isCorrect) {
        totalScore += points;
      }
      quizAnswers[existingAnswerIndex] = answerData;
    } else {
      // New answer
      quizAnswers.push(answerData);
      if (isCorrect) {
        totalScore += points;
      }
    }
    
    updateProgress();
    
    // Auto-advance after correct answer (with delay)
    if (isCorrect && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        moveToNext();
      }, 1500);
    }
  });
  
  // Handle window beforeunload to warn about losing progress
  window.addEventListener('beforeunload', (e) => {
    if (quizAnswers.length > 0 && !quizSummary.classList.contains('d-none') === false) {
      e.preventDefault();
      e.returnValue = 'You have an unfinished quiz. Are you sure you want to leave?';
    }
  });
  
  // Initialize first question
  showQuestion(0);
}

// Export for use in other modules
window.initComprehensiveQuiz = initComprehensiveQuiz;

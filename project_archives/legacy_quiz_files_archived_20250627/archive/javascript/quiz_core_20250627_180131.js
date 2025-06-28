// Removed ES6 import - will use global API functions instead
// import { submitQuizResult, purchaseHint } from "./api.js";

/**
 * Centralized Quiz Logic for all quiz types (MCQ, fill-in-the-blank, drag-and-drop, code, debug, etc.)
 * Supports inline and modal quiz modes, instant feedback, backend progress, points, and currency updates.
 * Each question must have a unique ID for user progress tracking.
 *
 * Supported types: multiple_choice, fill_in_the_blank, drag_and_drop, code, debug
 *
 * To add a new type, extend the grading logic in handleQuizSubmit and add a grading function.
 */

// Centralized Quiz Logic for all quiz types (MCQ, fill-in-the-blank, drag-and-drop, etc.)
// This module should be imported by all quiz-related templates and scripts.

function gradeMCQ(selectedIdx, correctIdx) {
  return selectedIdx === correctIdx;
}
window.gradeMCQ = gradeMCQ;

// Unified grading for fill_in_the_blank (single answer)
function gradeFillInTheBlank(userAnswer, correctAnswers) {
  if (!Array.isArray(correctAnswers)) return false;
  return correctAnswers.some(ans => String(ans).trim().toLowerCase() === String(userAnswer).trim().toLowerCase());
}
window.gradeFillInTheBlank = gradeFillInTheBlank;

function showFeedback(element, isCorrect, feedback = "") {
  if (!element) return;
  
  // Remove hidden class and add show class
  element.classList.remove("display-none");
  element.classList.add("show");
  
  // Set the feedback text
  element.textContent = isCorrect ? (feedback || "Correct! ✅") : (feedback || "Try again. ❌");
  
  // Remove old state classes and add new ones
  element.classList.remove("correct", "incorrect");
  element.classList.add(isCorrect ? "correct" : "incorrect");
  
  // Make sure it's visible
  element.style.display = "block";
  element.style.opacity = "1";
}
window.showFeedback = showFeedback;

function nextQuizStep(container, currentStep) {
  // Hide current, show next
  const steps = container.querySelectorAll(".quiz-card");
  if (steps[currentStep]) steps[currentStep].classList.add("d-none");
  if (steps[currentStep + 1]) steps[currentStep + 1].classList.remove("d-none");
  // Update progress bar, etc.
}
window.nextQuizStep = nextQuizStep;

function resetQuiz(container) {
  // Reset all quiz state in the container
  const steps = container.querySelectorAll(".quiz-card");
  steps.forEach((step, idx) => {
    step.classList.toggle("d-none", idx !== 0);
    // Reset feedback, inputs, etc.
    const feedback = step.querySelector(".quiz-feedback");
    if (feedback) feedback.classList.add("display-none");
    const inputs = step.querySelectorAll("input, button");
    inputs.forEach(input => {
      if (input.type === "text") input.value = "";
      if (input.classList.contains("selected")) input.classList.remove("selected");
    });
  });
}
window.resetQuiz = resetQuiz;

// Modular grading for drag-and-drop (Quiz 2.0 with partial scoring)
function gradeDragAndDrop(userInput, correctAnswer) {
  // Handle array-based drag and drop (ordered sequences)
  if (Array.isArray(userInput) && Array.isArray(correctAnswer)) {
    if (userInput.length !== correctAnswer.length) return 0;
    const correctCount = userInput.filter((val, idx) => val === correctAnswer[idx]).length;
    return correctCount / correctAnswer.length; // Partial score as ratio
  }
  
  // Handle object-based drag and drop (item-to-zone mappings) - Quiz 2.0 partial grading
  if (typeof userInput === 'object' && typeof correctAnswer === 'object') {
    const correctKeys = Object.keys(correctAnswer);
    const totalItems = correctKeys.length;
    
    if (totalItems === 0) return 0;
    
    let correctCount = 0;
    correctKeys.forEach(key => {
      if (userInput.hasOwnProperty(key) && userInput[key] === correctAnswer[key]) {
        correctCount++;
      }
    });
    
    return correctCount / totalItems; // Return partial score as ratio (0.0 to 1.0)
  }
  
  return 0;
}
window.gradeDragAndDrop = gradeDragAndDrop;

// Modular grading for code (run code and compare output)
function gradeCode(userOutput, expectedOutput) {
  // Simple string comparison, can be extended to check for [object Object]
  return String(userOutput).trim() === String(expectedOutput).trim();
}
window.gradeCode = gradeCode;

// Modular grading for debug (user must fix buggy code)
function gradeDebug(userCode, testCases, runCodeFn) {
  // runCodeFn should execute userCode with testCases and return pass/fail
  try {
    return runCodeFn(userCode, testCases);
  } catch (error) {
    console.error("Debug grading error:", error);
    return false;
  }
}
window.gradeDebug = gradeDebug;

// Function to update currency display on the page
function updateUserCurrency(newAmount) {
    const currencyElements = document.querySelectorAll(".user-currency-display"); 
    if (currencyElements) {
        currencyElements.forEach(el => {
            el.textContent = newAmount;
        });
    }
}

// Function to update points display on the page
function updateUserPoints(newAmount) {
    // Update sidebar points display
    const sidebarPointsElement = document.getElementById("sidebar-user-points");
    if (sidebarPointsElement) {
        sidebarPointsElement.textContent = newAmount;
    }
    
    // Also update any other points display elements if they exist
    const pointsElement = document.getElementById("user-points-display");
    if (pointsElement) {
        pointsElement.textContent = newAmount;
    }
}

// Function to update currency display on the page
function updateUserCurrency(newAmount) {
    // Update sidebar currency display
    const sidebarCurrencyElement = document.getElementById("sidebar-user-currency");
    if (sidebarCurrencyElement) {
        sidebarCurrencyElement.textContent = newAmount;
    }
    
    // Update header currency display (if present on current page)
    const headerCurrencyElement = document.getElementById("header-currency-display");
    if (headerCurrencyElement) {
        headerCurrencyElement.textContent = newAmount;
    }
    
    // Also update any other currency display elements if they exist
    const currencyElement = document.getElementById("user-currency-display");
    if (currencyElement) {
        currencyElement.textContent = newAmount;
    }
}

// Accessibility: focus feedback and announce result
function announceFeedback(element, isCorrect) {
  if (element) {
    element.setAttribute("aria-live", "polite");
    element.focus && element.focus();
    // Optionally use speechSynthesis for audio feedback
    if (window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(isCorrect ? "Correct!" : "Try again.");
      window.speechSynthesis.speak(msg);
    }
  }
}
window.announceFeedback = announceFeedback;

// Analytics/progress: update dashboard after quiz
function updateDashboardProgress() {
  fetch("/api/progress")
    .then(res => res.json())
    .then(progress => {
      const progressBar = document.getElementById("progress-bar-fill");
      const progressLabel = document.getElementById("progress-bar-label");
      if (progressBar && progressLabel && progress.percent !== undefined) {
        progressBar.style.width = progress.percent + "%";
        progressLabel.textContent = progress.percent + "% Complete";
      }
      // Optionally update progress-list here
    });
}
window.updateDashboardProgress = updateDashboardProgress;

// Generalized quiz handler (for inline or modal, all types)
async function handleQuizSubmit({
  questionId,
  type,
  userInput,
  correctAnswer,
  points = 1,
  currency = 1,
  feedbackElement,
  extra = {}
}) {
  let isCorrect = false;
  const answerForBackend = userInput;

  // Grading logic by type (Quiz 2.0 with partial scoring support)
  let partialScore = 0; // For drag-and-drop partial grading
  
  switch (type) {
    case "multiple_choice":
      isCorrect = gradeMCQ(userInput, correctAnswer);
      break;
    case "multiple_choice_quiz":
      isCorrect = gradeMCQ(userInput, correctAnswer);
      break;
    case "fill_in_the_blank":
    case "fill_in_the_blanks":
      isCorrect = gradeFillInTheBlank(userInput, correctAnswer);
      break;
    case "drag_and_drop":
      partialScore = gradeDragAndDrop(userInput, correctAnswer);
      isCorrect = partialScore === 1.0; // Perfect score means correct
      break;
    case "code":
      isCorrect = gradeCode(userInput, correctAnswer);
      break;
    case "debug":
      if (typeof extra.runCodeFn === "function") {
        isCorrect = gradeDebug(userInput, correctAnswer, extra.runCodeFn);
      }
      break;
    default:
      isCorrect = false;
  }

  // Show feedback with partial scoring support (Quiz 2.0)
  if (feedbackElement) {
    console.log('Showing feedback:', { feedbackElement, isCorrect, points, partialScore });
    let message;
    let earnedPoints;
    
    if (type === "drag_and_drop" && partialScore > 0 && partialScore < 1) {
      // Partial credit for drag-and-drop
      earnedPoints = Math.round(points * partialScore);
      const percentage = Math.round(partialScore * 100);
      message = `Partial Credit: ${percentage}% correct! +${earnedPoints} XP`;
    } else if (isCorrect) {
      earnedPoints = points;
      message = `Correct! +${points} XP`;
    } else {
      earnedPoints = 0;
      message = "Incorrect. Try again!";
    }
    
    showFeedback(feedbackElement, isCorrect || partialScore > 0, message);
    announceFeedback(feedbackElement, isCorrect || partialScore > 0);
  } else {
    console.log('No feedback element found for question:', questionId);
  }

  // Calculate final points (with partial credit for drag-and-drop)
  const finalPoints = type === "drag_and_drop" ? Math.round(points * partialScore) : (isCorrect ? points : 0);
  const finalCurrency = type === "drag_and_drop" ? Math.round(currency * partialScore) : (isCorrect ? currency : 0);

  // Send result to backend for progress, points, currency
  const backendRes = await submitQuizResult({
    questionId,
    isCorrect: isCorrect || partialScore > 0, // Partial credit counts as "correct" for progress
    points: finalPoints,
    currency: finalCurrency,
    answer: answerForBackend,
    partialScore: type === "drag_and_drop" ? partialScore : (isCorrect ? 1.0 : 0.0)
  });

  if (backendRes.success && isCorrect) {
    if (backendRes.new_points) {
        updateUserPoints(backendRes.new_points);
    }
    if (backendRes.new_currency) {
        updateUserCurrency(backendRes.new_currency);
    }
  }

  // Optionally update dashboard/progress
  updateDashboardProgress();

  // Check if this is within a quiz section and dispatch event
  const quizSection = feedbackElement?.closest('.quiz-section-container');
  if (quizSection) {
    dispatchQuizSubmitted(quizSection, {
      questionId: questionId,
      isCorrect: isCorrect,
      points: isCorrect ? points : 0
    });
  }

  return { isCorrect, backendRes };
}
window.handleQuizSubmit = handleQuizSubmit;



document.addEventListener("DOMContentLoaded", () => {
    // Initialize multi-question quiz sections
    initializeQuizSections();
    
    // Event listener for multiple choice questions (Quiz 2.0 with instant feedback)
    document.querySelectorAll(".mcq-option-btn").forEach(button => {
        button.addEventListener("click", e => {
            // Look for either question-wrapper (multi-question) or quiz-block (single question)
            const wrapper = e.target.closest(".question-wrapper") || e.target.closest(".quiz-block");
            if (!wrapper) return;

            // Check if already answered (one-time attempt)
            if (wrapper.dataset.answered === "true") {
                return;
            }

            const selectedIdx = parseInt(e.target.dataset.optionIdx, 10);
            const optionsGrid = wrapper.querySelector(".mcq-options-grid");
            const correctIdx = parseInt(optionsGrid.dataset.correctIdx, 10);
            const questionId = wrapper.dataset.blockId;
            const feedbackElement = wrapper.querySelector(".quiz-feedback");
            const points = parseInt(wrapper.dataset.points, 10) || 0;

            // Mark as answered to prevent multiple attempts
            wrapper.dataset.answered = "true";

            // Apply Quiz 2.1 instant visual feedback - ensure red shows for incorrect
            const allButtons = wrapper.querySelectorAll(".mcq-option-btn");
            const isCorrect = selectedIdx === correctIdx;

            allButtons.forEach((btn, idx) => {
                btn.disabled = true;
                
                if (idx === correctIdx) {
                    // Correct answer - always green
                    btn.classList.add("correct-answer");
                    btn.classList.remove("incorrect-answer");
                    btn.style.cssText = "background-color: #28a745 !important; color: white !important; border: 2px solid #28a745 !important; opacity: 1 !important;";
                } else if (idx === selectedIdx && !isCorrect) {
                    // Selected wrong answer - always red  
                    btn.classList.add("incorrect-answer");
                    btn.classList.remove("correct-answer");
                    btn.style.cssText = "background-color: #dc3545 !important; color: white !important; border: 2px solid #dc3545 !important; opacity: 1 !important;";
                } else {
                    // Other options - dimmed gray
                    btn.classList.remove("correct-answer", "incorrect-answer");
                    btn.style.cssText = "background-color: #f8f9fa !important; color: #6c757d !important; border: 2px solid #dee2e6 !important; opacity: 0.6 !important;";
                }
            });

            console.log('MCQ submission (Quiz 2.0):', {
                wrapper: wrapper.className,
                selectedIdx,
                correctIdx,
                questionId,
                isCorrect,
                feedbackElement: !!feedbackElement
            });

            // Handle submission with enhanced feedback
            handleQuizSubmit({
                questionId: questionId,
                type: "multiple_choice",
                userInput: selectedIdx,
                correctAnswer: correctIdx,
                points: points,
                feedbackElement: feedbackElement
            }).then(result => {
                // Auto-navigate after 1.5s - show inline summary instead of external navigation
                setTimeout(() => {
                    showInlineQuizSummary(wrapper, {
                        isCorrect: isCorrect,
                        questionType: 'multiple_choice',
                        points: points,
                        selectedAnswer: selectedIdx,
                        correctAnswer: correctIdx
                    });
                }, 1500);
            });
        });
    });

    // Event listener for fill-in-the-blank questions (Quiz 2.0 Enhanced)
    document.querySelectorAll(".fitb-submit-btn").forEach(button => {
        button.addEventListener("click", e => {
            // Look for fitb-container or quiz-block
            const container = e.target.closest(".fitb-container") || e.target.closest(".quiz-block");
            if (!container) return;

            // Check if already submitted (one-time attempt)
            if (container.dataset.submitted === "true") {
                return;
            }

            const input = container.querySelector(".fitb-input");
            const userAnswer = input.value.trim();
            const answersData = container.dataset.answers;
            const correctAnswers = answersData ? answersData.split(',') : [];
            const questionId = container.dataset.blockId;
            const feedbackElement = container.querySelector(".quiz-feedback");
            const points = parseInt(container.dataset.points, 10) || 1;

            // Mark as submitted to prevent multiple attempts
            container.dataset.submitted = "true";

            console.log('FITB submission (Quiz 2.0):', {
                container: container.className,
                userAnswer,
                correctAnswers,
                questionId,
                feedbackElement: !!feedbackElement
            });

            // Apply visual feedback
            const isCorrect = correctAnswers.some(answer => 
                userAnswer.toLowerCase() === answer.toLowerCase().trim()
            );
            
            input.classList.add(isCorrect ? "correct-answer" : "incorrect-answer");
            if (isCorrect) {
                input.style.borderColor = "var(--success-green, #28a745)";
                input.style.backgroundColor = "rgba(40, 167, 69, 0.1)";
            } else {
                input.style.borderColor = "var(--error-red, #dc3545)";
                input.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
                
                // Show correct answer(s) after incorrect attempt
                if (feedbackElement && correctAnswers.length > 0) {
                    const correctDisplay = document.createElement('div');
                    correctDisplay.className = 'correct-answer-display';
                    correctDisplay.innerHTML = `
                        <small class="text-muted">
                            Correct answer${correctAnswers.length > 1 ? 's' : ''}: 
                            <strong>${correctAnswers.join(', ')}</strong>
                        </small>
                    `;
                    feedbackElement.appendChild(correctDisplay);
                }
            }

            handleQuizSubmit({
                questionId: questionId,
                type: "fill_in_the_blank",
                userInput: userAnswer,
                correctAnswer: correctAnswers,
                points: points,
                feedbackElement: feedbackElement
            }).then(() => {
                // Auto-navigate after 1.5 seconds using Quiz 2.1 inline summary
                setTimeout(() => {
                    showInlineQuizSummary(container, {
                        isCorrect: isCorrect,
                        questionType: 'fill_in_the_blank',
                        points: points,
                        userAnswer: userAnswer,
                        correctAnswers: correctAnswers
                    });
                }, 1500);
            });

            // Disable input and button after submission
            input.disabled = true;
            button.disabled = true;
        });
    });

    // Enable Enter key for fill-in-the-blank inputs
    document.querySelectorAll(".fitb-input").forEach(input => {
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                const submitBtn = input.closest(".fitb-container").querySelector(".fitb-submit-btn");
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        });
    });

    // Hint button listener
    document.querySelectorAll(".btn-hint").forEach(button => {
        button.addEventListener("click", async (e) => {
            const blockId = e.target.dataset.blockId;
            const hintCost = parseInt(e.target.dataset.hintCost, 10);
            const hintContainer = document.getElementById(`hint-${blockId}`);

            e.target.disabled = true;
            e.target.textContent = "Unlocking...";

            const result = await purchaseHint(blockId, hintCost);

            if (result.success) {
                // Safely update hint content
                hintContainer.textContent = result.hint;
                hintContainer.classList.remove("display-none");
                e.target.classList.add("display-none");
                updateUserCurrency(result.new_currency);
            } else {
                alert(result.error || "Could not purchase hint.");
                e.target.disabled = false;
                e.target.textContent = `Show Hint (${hintCost} PyCoins)`;
            }
        });
    });

    // Initialize drag-and-drop functionality
    initializeDragAndDrop();
    
    // Initialize Quiz 2.0 features
    initializeRetakeSystem();
    // Initialize quiz sections
    initializeQuizSections();
});

/**
 * Comprehensive Quiz Logic (multi-question quizzes)
 * Handles initialization, navigation, timer, progress, scoring, and summary for comprehensive quizzes.
 * All grading and submission uses the unified handleQuizSubmit and grading functions above.
 */

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
  if (totalQuestionsSpan) totalQuestionsSpan.textContent = questions.length;
  if (maxScoreSpan) maxScoreSpan.textContent = maxPossibleScore;

  // Timer logic
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
        timerDisplay.style.color = 'var(--accent-red)';
        timerDisplay.style.fontWeight = '700';
      } else if (timeRemaining <= 300) {
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
    submitQuiz(true);
  }
  if (timerElement && timerElement.dataset.timeLimit) {
    timeRemaining = parseInt(timerElement.dataset.timeLimit);
    startTimer();
  }

  // Navigation
  function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    questions.forEach((q, i) => {
      q.classList.toggle('d-none', i !== index);
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
    currentQuestionIndex = index;
    if (currentQuestionSpan) currentQuestionSpan.textContent = index + 1;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn && submitBtn) {
      const isLastQuestion = index === questions.length - 1;
      nextBtn.classList.toggle('d-none', isLastQuestion);
      submitBtn.classList.toggle('d-none', !isLastQuestion);
    }
    if (progressFill) {
      const progress = ((index + 1) / questions.length) * 100;
      progressFill.style.width = `${progress}%`;
    }
  }
  function showPreviousQuestion() { showQuestion(currentQuestionIndex - 1); }
  function showNextQuestion() { showQuestion(currentQuestionIndex + 1); }

  // Answer collection and validation
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

  // Main quiz submission logic
  async function submitQuiz(isAutoSubmit = false) {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (!isAutoSubmit) {
      const unansweredIndex = quizAnswers.findIndex(a => a === undefined);
      if (unansweredIndex !== -1) {
        alert(`Please answer question ${unansweredIndex + 1} before submitting.`);
        showQuestion(unansweredIndex);
        return;
      }
    }
    // Grade all questions
    let score = 0;
    let correctCount = 0;
    let results = [];
    for (let i = 0; i < questions.length; i++) {
      const qEl = questions[i];
      const type = qEl.dataset.questionType;
      const questionId = qEl.dataset.questionId;
      const points = parseInt(qEl.dataset.points) || 1;
      const userInput = quizAnswers[i]?.answer || getQuestionAnswer(qEl, type);
      let correctAnswer;
      if (type === 'multiple_choice') {
        const correctOption = qEl.querySelector('.option[data-correct="true"]');
        correctAnswer = correctOption ? parseInt(correctOption.dataset.index) : null;
      } else if (type === 'fill_in_the_blank') {
        const answersJSON = qEl.querySelector('.fill-blank-question')?.dataset.answers;
        correctAnswer = answersJSON ? JSON.parse(answersJSON) : [];
      } else if (type === 'drag_and_drop') {
        const mappingJSON = qEl.querySelector('.drag-and-drop-container')?.dataset.correctMapping;
        correctAnswer = mappingJSON ? JSON.parse(mappingJSON) : {};
      }
      // Use unified grading
      let isCorrect = false;
      switch (type) {
        case 'multiple_choice':
          isCorrect = gradeMCQ(userInput, correctAnswer); break;
        case 'fill_in_the_blank':
          isCorrect = gradeFillInTheBlank(userInput, correctAnswer); break;
        case 'drag_and_drop':
          isCorrect = gradeDragAndDrop(userInput, correctAnswer); break;
        default:
          isCorrect = false;
      }
      if (isCorrect) { score += points; correctCount++; }
      results.push({ questionId, type, userInput, correctAnswer, isCorrect, points: isCorrect ? points : 0 });
      // Optionally send to backend
      await handleQuizSubmit({ questionId, type, userInput, correctAnswer, points, feedbackElement: null });
    }
    // Show summary
    showQuizResults({ score, maxScore: maxPossibleScore, percentage: Math.round((score / maxPossibleScore) * 100), correctCount, totalQuestions: questions.length, questionResults: results });
  }

  // Show summary UI
  function showQuizResults(results) {
    if (quizBody) quizBody.classList.add('d-none');
    if (quizSummary) quizSummary.classList.remove('d-none');
    if (prevBtn) prevBtn.classList.add('d-none');
    if (nextBtn) nextBtn.classList.add('d-none');
    if (submitBtn) submitBtn.classList.add('d-none');
    if (pauseBtn) pauseBtn.classList.add('d-none');
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
      const passingScore = parseInt(quizContainer.dataset.passingScore);
      if (!isNaN(passingScore)) {
        const passed = results.percentage >= passingScore;
        const passingMsg = quizSummary.querySelector('.passing-message');
        const failingMsg = quizSummary.querySelector('.failing-message');
        if (passingMsg) passingMsg.classList.toggle('d-none', !passed);
        if (failingMsg) failingMsg.classList.toggle('d-none', passed);
      }
    }
    // ARIA live region
    let ariaLive = document.getElementById('quiz-completion-announcement');
    if (!ariaLive) {
      ariaLive = document.createElement('div');
      ariaLive.id = 'quiz-completion-announcement';
      ariaLive.className = 'sr-only';
      ariaLive.setAttribute('aria-live', 'assertive');
      document.body.appendChild(ariaLive);
    }
    ariaLive.textContent = `Quiz complete. You got ${results.correctCount} out of ${results.totalQuestions} questions correct, for a score of ${results.percentage}%.`;
  }

  // Reset logic
  function resetQuiz() {
    questions.forEach(question => {
      const type = question.dataset.questionType;
      switch (type) {
        case 'multiple_choice':
          question.querySelectorAll('input[type="radio"]').forEach(radio => { radio.checked = false; }); break;
        case 'fill_in_the_blank':
          question.querySelectorAll('input[type="text"]').forEach(input => { input.value = ''; }); break;
        case 'drag_and_drop':
          const dragItems = question.querySelectorAll('.drag-item');
          const itemContainer = question.querySelector('.drag-items-container');
          if (itemContainer) { dragItems.forEach(item => { itemContainer.appendChild(item); }); }
          break;
      }
    });
    currentQuestionIndex = 0;
    quizAnswers = [];
    totalScore = 0;
    quizStartTime = Date.now();
    if (quizBody) quizBody.classList.remove('d-none');
    if (quizSummary) quizSummary.classList.add('d-none');
    if (prevBtn) { prevBtn.classList.remove('d-none'); prevBtn.disabled = true; }
    if (nextBtn) { nextBtn.classList.remove('d-none'); }
    if (submitBtn) { submitBtn.classList.add('d-none'); }
    if (pauseBtn) { pauseBtn.classList.remove('d-none'); pauseBtn.innerHTML = '<span class="material-symbols-outlined">pause</span> Pause'; }
    if (progressFill) { progressFill.style.width = '0%'; }
    if (currentScoreSpan) { currentScoreSpan.textContent = '0'; }
    if (timerElement && timerElement.dataset.timeLimit) {
      timeRemaining = parseInt(timerElement.dataset.timeLimit);
      updateTimerDisplay();
      startTimer();
    }
    showQuestion(0);
  }

  // Pause logic
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

  // Continue lesson
  function continueLessonAfterQuiz() {
    const nextElement = quizContainer.nextElementSibling;
    if (nextElement) {
      nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', showPreviousQuestion);
  if (nextBtn) nextBtn.addEventListener('click', showNextQuestion);
  if (submitBtn) submitBtn.addEventListener('click', () => submitQuiz(false));
  if (pauseBtn) pauseBtn.addEventListener('click', pauseQuiz);
  if (retryBtn) retryBtn.addEventListener('click', resetQuiz);
  if (continueBtn) continueBtn.addEventListener('click', continueLessonAfterQuiz);

  // Initialize first question
  showQuestion(0);
}
window.initComprehensiveQuiz = initComprehensiveQuiz;

// Drag and Drop functionality
function initializeDragAndDrop() {
    console.log('Initializing drag and drop...');
    const containers = document.querySelectorAll(".dnd-container");
    console.log('Found D&D containers:', containers.length);
    
    containers.forEach(container => {
        if (container.dataset.initialized) {
            console.log('Container already initialized, skipping:', container.dataset.blockId);
            return;
        }
        container.dataset.initialized = "true";

        console.log('Setting up D&D for container:', container.dataset.blockId);
        
        const dragItems = container.querySelectorAll(".drag-item");
        const dropZones = container.querySelectorAll(".drop-zone");
        const submitBtn = container.querySelector(".dnd-check-button");
        const resetBtn = container.querySelector(".dnd-reset-button");
        const feedbackElement = container.querySelector(".quiz-feedback, .dnd-feedback");
        const questionId = container.dataset.blockId;
        const points = parseInt(container.dataset.points, 10) || 1;

        console.log('Found elements:', {
            dragItems: dragItems.length,
            dropZones: dropZones.length,
            submitBtn: !!submitBtn,
            resetBtn: !!resetBtn,
            feedbackElement: !!feedbackElement,
            questionId: questionId
        });

        let selectedItem = null;

        // Make items draggable
        dragItems.forEach(item => {
            // Mouse/touch drag events
            item.addEventListener("dragstart", e => {
                e.dataTransfer.setData("text/plain", e.target.id);
                e.target.classList.add("dragging");
            });

            item.addEventListener("dragend", e => {
                e.target.classList.remove("dragging");
            });

            // Keyboard selection
            item.addEventListener("click", () => {
                // Deselect other items
                dragItems.forEach(i => i.classList.remove("selected"));
                
                if (selectedItem === item) {
                    // Deselect if clicking the same item
                    selectedItem = null;
                    item.setAttribute("aria-grabbed", "false");
                } else {
                    // Select this item
                    selectedItem = item;
                    item.classList.add("selected");
                    item.setAttribute("aria-grabbed", "true");
                }
            });

            item.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        // Make drop zones accept drops
        dropZones.forEach(zone => {
            zone.addEventListener("dragover", e => {
                e.preventDefault();
                zone.classList.add("drag-over");
            });

            zone.addEventListener("dragleave", e => {
                zone.classList.remove("drag-over");
            });

            zone.addEventListener("drop", e => {
                e.preventDefault();
                zone.classList.remove("drag-over");
                
                const itemId = e.dataTransfer.getData("text/plain");
                const draggedItem = document.getElementById(itemId);
                
                // Check if zone is empty (only contains placeholder)
                const placeholder = zone.querySelector(".drop-zone-placeholder");
                const existingItems = zone.querySelectorAll(".drag-item");
                
                if (draggedItem && existingItems.length === 0) {
                    zone.appendChild(draggedItem);
                    draggedItem.classList.remove("dragging");
                    
                    // Hide placeholder when item is dropped
                    if (placeholder) {
                        placeholder.style.display = "none";
                    }
                }
            });

            // Keyboard drop
            zone.addEventListener("click", () => {
                const placeholder = zone.querySelector(".drop-zone-placeholder");
                const existingItems = zone.querySelectorAll(".drag-item");
                
                if (selectedItem && existingItems.length === 0) {
                    zone.appendChild(selectedItem);
                    selectedItem.classList.remove("selected");
                    selectedItem.setAttribute("aria-grabbed", "false");
                    selectedItem = null;
                    
                    // Hide placeholder when item is dropped
                    if (placeholder) {
                        placeholder.style.display = "none";
                    }
                }
            });
        });

        // Submit button
        if (submitBtn) {
            submitBtn.addEventListener("click", async () => {
                const userMapping = {};
                
                dropZones.forEach(zone => {
                    const droppedItem = zone.querySelector(".drag-item");
                    if (droppedItem) {
                        const zoneLabel = zone.dataset.zoneLabel;
                        const itemText = droppedItem.dataset.itemText;
                        userMapping[itemText] = zoneLabel;
                    }
                });

                // Build correct mapping from individual zone data
                const correctMapping = {};
                dropZones.forEach(zone => {
                    const correctItem = zone.dataset.correctItem;
                    const zoneLabel = zone.dataset.zoneLabel;
                    if (correctItem && zoneLabel) {
                        // Map from item to zone (same format as userMapping)
                        correctMapping[correctItem] = zoneLabel;
                    }
                });

                console.log('Drag and Drop Submission:');
                console.log('User mapping:', userMapping);
                console.log('Correct mapping:', correctMapping);
                console.log('Question ID:', questionId);

                // Check if already submitted (one-time attempt)
                if (container.dataset.submitted === "true") {
                    return;
                }
                container.dataset.submitted = "true";

                const result = await handleQuizSubmit({
                    questionId: questionId,
                    type: "drag_and_drop",
                    userInput: userMapping,
                    correctAnswer: correctMapping,
                    points: points,
                    feedbackElement: feedbackElement
                });

                // Quiz 2.0: Enhanced visual feedback on individual zones with partial grading
                let correctCount = 0;
                const totalItems = Object.keys(correctMapping).length;
                
                dropZones.forEach(zone => {
                    const droppedItem = zone.querySelector(".drag-item");
                    if (droppedItem) {
                        const zoneLabel = zone.dataset.zoneLabel;
                        const itemText = droppedItem.dataset.itemText;
                        const isCorrect = correctMapping[itemText] === zoneLabel;
                        
                        // Visual feedback for individual items
                        zone.classList.add(isCorrect ? "correct" : "incorrect");
                        droppedItem.classList.add(isCorrect ? "correct-placement" : "incorrect-placement");
                        
                        if (isCorrect) {
                            correctCount++;
                            zone.style.borderColor = "var(--success-green, #28a745)";
                            zone.style.backgroundColor = "rgba(40, 167, 69, 0.1)";
                        } else {
                            zone.style.borderColor = "var(--error-red, #dc3545)";
                            zone.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
                        }
                    }
                });

                // Show partial score visual indicator
                if (totalItems > 0) {
                    const scorePercentage = Math.round((correctCount / totalItems) * 100);
                    const partialScoreEl = container.querySelector('.partial-score-indicator') || 
                                          document.createElement('div');
                    partialScoreEl.className = 'partial-score-indicator';
                    partialScoreEl.innerHTML = `
                        <div class="score-breakdown">
                            <span class="score-text">${correctCount}/${totalItems} correct (${scorePercentage}%)</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${scorePercentage}%"></div>
                            </div>
                        </div>
                    `;
                    
                    if (!container.querySelector('.partial-score-indicator')) {
                        if (feedbackElement) {
                            feedbackElement.appendChild(partialScoreEl);
                        } else {
                            container.appendChild(partialScoreEl);
                        }
                    }
                }

                // Disable dragging after submission
                dragItems.forEach(item => {
                    item.draggable = false;
                    item.classList.add("disabled");
                });
                submitBtn.disabled = true;
                
                // Auto-navigate after 2 seconds for drag-and-drop (slightly longer to show feedback)
                setTimeout(() => {
                    showInlineQuizSummary(container, {
                        isCorrect: correctCount === totalItems,
                        questionType: 'drag_and_drop',
                        points: points,
                        partialScore: correctCount / totalItems,
                        correctCount: correctCount,
                        totalItems: totalItems,
                        userMapping: userMapping,
                        correctMapping: correctMapping
                    });
                }, 2000);
            });
        }

        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                const itemBank = container.querySelector(".drag-item-bank");
                
                dropZones.forEach(zone => {
                    const item = zone.querySelector(".drag-item");
                    const placeholder = zone.querySelector(".drop-zone-placeholder");
                    
                    if (item && itemBank) {
                        itemBank.appendChild(item);
                        // Show placeholder again when item is removed
                        if (placeholder) {
                            placeholder.style.display = "flex";
                        }
                    }
                    zone.classList.remove("correct", "incorrect", "drag-over");
                });

                dragItems.forEach(item => {
                    item.draggable = true;
                    item.classList.remove("disabled", "selected", "dragging");
                    item.setAttribute("aria-grabbed", "false");
                });

                if (feedbackElement) {
                    feedbackElement.classList.add("display-none");
                }

                if (submitBtn) {
                    submitBtn.disabled = false;
                }

                selectedItem = null;
            });
        }
    });
}
window.initializeDragAndDrop = initializeDragAndDrop;

// Multi-question quiz section navigation
function initializeQuizSections() {
    document.querySelectorAll('.quiz-section-container').forEach(container => {
        const questions = container.querySelectorAll('.question-wrapper');
        const nextBtn = container.querySelector('.next-question-btn');
        const currentQuestionSpan = container.querySelector('.current-question');
        const totalQuestionsSpan = container.querySelector('.total-questions');
        const feedbackDiv = container.querySelector('.quiz-feedback');
        
        let currentQuestionIndex = 0;
        let sectionAnswers = [];
        
        if (totalQuestionsSpan) {
            totalQuestionsSpan.textContent = questions.length;
        }
        
        function showQuestion(index) {
            // Hide all questions
            questions.forEach((q, i) => {
                if (i === index) {
                    q.classList.remove('d-none');
                } else {
                    q.classList.add('d-none');
                }
            });
            
            // Update progress
            if (currentQuestionSpan) {
                currentQuestionSpan.textContent = index + 1;
            }
            
            // Show/hide next button
            if (nextBtn) {
                if (index < questions.length - 1) {
                    nextBtn.classList.remove('d-none');
                    nextBtn.textContent = 'Next Question';
                } else {
                    nextBtn.classList.remove('d-none');
                    nextBtn.textContent = 'Complete Section';
                }
            }
        }
        
        function moveToNextQuestion() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            } else {
                // Section completed
                showSectionSummary();
            }
        }
        
        function showSectionSummary() {
            // Hide all questions and show summary
            questions.forEach(q => q.classList.add('d-none'));
            
            if (feedbackDiv) {
                const correctCount = sectionAnswers.filter(a => a.isCorrect).length;
                const totalCount = sectionAnswers.length;
                const percentage = Math.round((correctCount / totalCount) * 100);
                
                feedbackDiv.innerHTML = `
                    <div class="quiz-summary">
                        <h4>Section Complete!</h4>
                        <p>You got ${correctCount} out of ${totalCount} questions correct (${percentage}%)</p>
                        <button class="btn mcq-option-btn retake-section-btn">Retake Section</button>
                    </div>
                `;
                feedbackDiv.classList.remove('display-none');
                
                // Add retake functionality
                const retakeBtn = feedbackDiv.querySelector('.retake-section-btn');
                if (retakeBtn) {
                    retakeBtn.addEventListener('click', () => {
                        currentQuestionIndex = 0;
                        sectionAnswers = [];
                        showQuestion(0);
                        feedbackDiv.classList.add('display-none');
                        
                        // Reset all questions
                        questions.forEach(q => {
                            const feedback = q.querySelector('.quiz-feedback');
                            if (feedback) feedback.classList.add('display-none');
                            
                            // Reset MCQ buttons
                            const mcqBtns = q.querySelectorAll('.mcq-option-btn');
                            mcqBtns.forEach(btn => {
                                btn.classList.remove('correct', 'incorrect', 'selected');
                                btn.disabled = false;
                            });
                            
                            // Reset fill-in-blank
                            const fitbInput = q.querySelector('.fitb-input');
                            if (fitbInput) {
                                fitbInput.value = '';
                                fitbInput.disabled = false;
                            }
                            
                            // Reset drag and drop
                            const dragItems = q.querySelectorAll('.drag-item');
                            const dropZones = q.querySelectorAll('.drop-zone');
                            dragItems.forEach(item => {
                                const itemBank = container.querySelector('.drag-item-bank');
                                if (itemBank) itemBank.appendChild(item);
                            });
                            dropZones.forEach(zone => {
                                const placeholder = zone.querySelector('.drop-zone-placeholder');
                                if (placeholder) placeholder.style.display = 'block';
                            });
                        });
                    });
                }
            }
            
            if (nextBtn) {
                nextBtn.classList.add('d-none');
            }
        }
        
        // Next button click handler
        if (nextBtn) {
            nextBtn.addEventListener('click', moveToNextQuestion);
        }
        
        // Override quiz submission to handle section progression
        const originalSubmitQuizResult = window.submitQuizResult;
        container.addEventListener('quiz-submitted', (event) => {
            const { questionId, isCorrect, points } = event.detail;
            
            // Store the answer
            sectionAnswers.push({
                questionId: questionId,
                isCorrect: isCorrect,
                points: points
            });
            
            // Show next button after a short delay
            setTimeout(() => {
                if (nextBtn) nextBtn.classList.remove('d-none');
            }, 1000);
        });
        
        // Initialize first question
        showQuestion(0);
    });
}

// Quiz 2.1: Inline summary functions - no external navigation
function showInlineSummary(quizContainer, results = {}) {
    console.log('Showing inline quiz summary...', results);
    
    // Find or create inline summary section
    let summarySection = quizContainer.querySelector('.quiz-summary-inline');
    if (!summarySection) {
        summarySection = document.createElement('div');
        summarySection.className = 'quiz-summary-inline mt-4 p-3 border rounded';
        summarySection.innerHTML = `
            <div class="quiz-summary-header text-center">
                <h4 class="text-success mb-2">🎉 Quiz Complete!</h4>
                <div class="quiz-summary-stats">
                    <div class="score-display">
                        Score: <span class="summary-score font-weight-bold text-primary">--</span>
                    </div>
                    <div class="points-earned mt-2">
                        <span class="badge badge-success summary-points">+0 XP</span>
                    </div>
                </div>
            </div>
            <div class="quiz-summary-actions text-center mt-3">
                <button class="btn btn-outline-primary btn-sm retake-quiz-btn">
                    🔄 Retake Quiz (10 PyCoins)
                </button>
            </div>
        `;
        quizContainer.appendChild(summarySection);
    }
    
    // Update summary with actual results
    const scoreSpan = summarySection.querySelector('.summary-score');
    const pointsSpan = summarySection.querySelector('.summary-points');
    
    if (results.correct !== undefined && results.total !== undefined) {
        const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
        scoreSpan.textContent = `${results.correct}/${results.total} (${percentage}%)`;
    } else {
        scoreSpan.textContent = '1/1 (100%)'; // Default for single questions
    }
    
    if (results.totalPoints !== undefined) {
        pointsSpan.textContent = `+${results.totalPoints} XP`;
    }
    
    // Hide quiz content and show summary
    const quizBody = quizContainer.querySelector('.quiz-body, .mcq-options-grid, .fitb-container, .drag-drop-container');
    const quizFooter = quizContainer.querySelector('.quiz-footer');
    
    if (quizBody) quizBody.style.display = 'none';
    if (quizFooter) quizFooter.style.display = 'none';
    
    summarySection.style.display = 'block';
    
    // Setup retake functionality
    const retakeBtn = summarySection.querySelector('.retake-quiz-btn');
    if (retakeBtn) {
        retakeBtn.onclick = () => resetQuizForRetake(quizContainer);
    }
}

function autoNavigateToSummary(quizElement) {
    // This function is deprecated in Quiz 2.1 - use showInlineQuizSummary instead
    console.warn('autoNavigateToSummary is deprecated, use showInlineQuizSummary');
    
    // Fallback to inline summary for compatibility
    showInlineQuizSummary(quizElement, {
        isCorrect: true,
        questionType: 'unknown',
        points: 1
    });
}

// Quiz 2.1: Unified inline summary function for all quiz types
function showInlineQuizSummary(quizElement, results) {
    console.log('Showing inline quiz summary:', results);
    
    const quizContainer = quizElement.closest('.quiz-block') || quizElement;
    
    // Hide the main quiz content
    const quizBody = quizContainer.querySelector('.mcq-options-grid, .fitb-container, .dnd-container, .quiz-body');
    const quizFooter = quizContainer.querySelector('.quiz-footer');
    
    if (quizBody) quizBody.style.display = 'none';
    if (quizFooter) quizFooter.style.display = 'none';
    
    // Create or update inline summary
    let summarySection = quizContainer.querySelector('.quiz-summary-inline');
    if (!summarySection) {
        summarySection = document.createElement('div');
        summarySection.className = 'quiz-summary-inline';
        quizContainer.appendChild(summarySection);
    }
    
    // Calculate score and message
    let scoreMessage, scoreClass, earnedPoints;
    const totalPoints = results.points || 1;
    
    if (results.questionType === 'drag_and_drop' && results.partialScore !== undefined) {
        const percentage = Math.round(results.partialScore * 100);
        earnedPoints = Math.round(totalPoints * results.partialScore);
        
        if (results.partialScore === 1.0) {
            scoreMessage = `Perfect! +${earnedPoints} XP`;
            scoreClass = 'success';
        } else if (results.partialScore > 0) {
            scoreMessage = `Partial Credit: ${percentage}% correct! +${earnedPoints} XP`;
            scoreClass = 'partial';
        } else {
            scoreMessage = `Try again! 0 XP earned`;
            scoreClass = 'incorrect';
            earnedPoints = 0;
        }
    } else {
        earnedPoints = results.isCorrect ? totalPoints : 0;
        scoreMessage = results.isCorrect ? `Correct! +${earnedPoints} XP` : `Incorrect. Try again!`;
        scoreClass = results.isCorrect ? 'success' : 'incorrect';
    }
    
    // Generate summary HTML
    summarySection.innerHTML = `
        <div class="quiz-summary-content ${scoreClass}">
            <div class="summary-header">
                <div class="summary-icon">
                    ${results.isCorrect ? '✅' : (results.partialScore > 0 ? '🟡' : '❌')}
                </div>
                <div class="summary-score">
                    <h4>${scoreMessage}</h4>
                    <p class="score-details">Points earned: ${earnedPoints}/${totalPoints}</p>
                </div>
            </div>
            
            <div class="summary-details">
                ${generateQuestionSummaryDetails(results)}
            </div>
            
            <div class="summary-actions">
                <button class="btn btn-primary retake-quiz-btn" data-question-id="${quizContainer.dataset.blockId}">
                    🪙 Retake (10 PyCoins)
                </button>
                <button class="btn btn-secondary continue-lesson-btn">
                    Continue Lesson →
                </button>
            </div>
        </div>
    `;
    
    // Show the summary
    summarySection.style.display = 'block';
    
    // Setup retake functionality
    const retakeBtn = summarySection.querySelector('.retake-quiz-btn');
    if (retakeBtn) {
        retakeBtn.onclick = () => {
            const questionId = quizContainer.dataset.blockId;
            if (deductPyCoinsForRetake(questionId, 10)) {
                resetQuizForRetake(quizContainer);
                summarySection.style.display = 'none';
                if (quizBody) quizBody.style.display = 'block';
                if (quizFooter) quizFooter.style.display = 'block';
            } else {
                alert('Insufficient PyCoins for retake!');
            }
        };
    }
    
    // Setup continue button
    const continueBtn = summarySection.querySelector('.continue-lesson-btn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            const nextElement = quizContainer.nextElementSibling;
            if (nextElement) {
                nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
    }
}

// Helper function to generate question-specific summary details
function generateQuestionSummaryDetails(results) {
    switch (results.questionType) {
        case 'multiple_choice':
            return `
                <div class="answer-review">
                    <p><strong>Your answer:</strong> Option ${String.fromCharCode(65 + results.selectedAnswer)}</p>
                    <p><strong>Correct answer:</strong> Option ${String.fromCharCode(65 + results.correctAnswer)}</p>
                </div>
            `;
            
        case 'fill_in_the_blank':
            return `
                <div class="answer-review">
                    <p><strong>Your answer:</strong> "${results.userAnswer}"</p>
                    <p><strong>Correct answers:</strong> ${results.correctAnswers.join(', ')}</p>
                </div>
            `;
            
        case 'drag_and_drop':
            const items = Object.keys(results.correctMapping);
            const reviewItems = items.map(item => {
                const userZone = results.userMapping[item];
                const correctZone = results.correctMapping[item];
                const isCorrect = userZone === correctZone;
                return `
                    <div class="mapping-review ${isCorrect ? 'correct' : 'incorrect'}">
                        <span class="item">${item}</span> → 
                        <span class="zone ${isCorrect ? 'correct-zone' : 'incorrect-zone'}">${userZone || 'Not placed'}</span>
                        ${!isCorrect ? `<small class="correct-hint">(Correct: ${correctZone})</small>` : ''}
                    </div>
                `;
            }).join('');
            
            return `
                <div class="dnd-review">
                    <p><strong>Placement Review:</strong></p>
                    ${reviewItems}
                </div>
            `;
            
        default:
            return '<p>Question completed.</p>';
    }
}

// Helper function to show next question in multi-question quiz
function showNextQuestion(container, currentIndex) {
    const allQuestions = container.querySelectorAll('.question-wrapper, .quiz-block');
    
    // Hide current question
    if (allQuestions[currentIndex]) {
        allQuestions[currentIndex].classList.add('d-none');
    }
    
    // Show next question
    if (allQuestions[currentIndex + 1]) {
        allQuestions[currentIndex + 1].classList.remove('d-none');
        
        // Update progress indicator
        const progressIndicator = container.querySelector('.current-question');
        if (progressIndicator) {
            progressIndicator.textContent = currentIndex + 2;
        }
    }
}

// Helper function to calculate quiz results for multi-question quizzes
function calculateQuizResults(container) {
    const allQuestions = container.querySelectorAll('.question-wrapper, .quiz-block');
    let correct = 0;
    let totalPoints = 0;
    
    allQuestions.forEach(question => {
        // Check if question was answered correctly
        const hasCorrectAnswer = question.querySelector('.correct-answer') || 
                               question.querySelector('.correct-placement') ||
                               question.classList.contains('correct-answer');
        
        if (hasCorrectAnswer) {
            correct++;
        }
        
        const points = parseInt(question.dataset.points) || 1;
        totalPoints += points;
    });
    
    return {
        correct: correct,
        total: allQuestions.length,
        totalPoints: totalPoints
    };
}

// Reset quiz for retake functionality
function resetQuizForRetake(quizContainer) {
    console.log('Resetting quiz for retake...');
    
    // Hide summary and show quiz content
    const summarySection = quizContainer.querySelector('.quiz-summary-inline');
    const quizBody = quizContainer.querySelector('.quiz-body, .mcq-options-grid, .fitb-container, .dnd-container');
    const quizFooter = quizContainer.querySelector('.quiz-footer');
    
    if (summarySection) summarySection.style.display = 'none';
    if (quizBody) quizBody.style.display = 'block';
    if (quizFooter) quizFooter.style.display = 'block';
    
    // Reset quiz state flags
    quizContainer.dataset.answered = "false";
    quizContainer.dataset.submitted = "false";
    
    // Reset all visual states and interactions
    
    // Reset MCQ buttons
    const mcqButtons = quizContainer.querySelectorAll('.mcq-option-btn');
    mcqButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct-answer', 'incorrect-answer');
        btn.style.cssText = ''; // Clear all inline styles
    });
    
    // Reset fill-in-the-blank inputs
    const fitbInputs = quizContainer.querySelectorAll('.fitb-input');
    const fitbButtons = quizContainer.querySelectorAll('.fitb-submit-btn');
    fitbInputs.forEach(input => {
        input.disabled = false;
        input.value = '';
        input.classList.remove('correct-answer', 'incorrect-answer');
        input.style.cssText = ''; // Clear all inline styles
    });
    fitbButtons.forEach(btn => {
        btn.disabled = false;
    });
    
    // Reset drag-and-drop
    const dndContainer = quizContainer.querySelector('.dnd-container');
    if (dndContainer) {
        const dragItems = dndContainer.querySelectorAll('.drag-item');
        const dropZones = dndContainer.querySelectorAll('.drop-zone');
        const dndButtons = dndContainer.querySelectorAll('.dnd-check-button, .dnd-reset-button');
        const itemBank = dndContainer.querySelector('.drag-item-bank');
        
        // Reset drag items
        dragItems.forEach(item => {
            item.draggable = true;
            item.classList.remove('disabled', 'correct-placement', 'incorrect-placement');
            item.style.cssText = ''; // Clear all inline styles
            
            // Move all items back to item bank
            if (itemBank) {
                itemBank.appendChild(item);
            }
        });
        
        // Reset drop zones
        dropZones.forEach(zone => {
            zone.classList.remove('correct', 'incorrect');
            zone.style.cssText = ''; // Clear all inline styles
            
            // Show placeholder if it exists
            const placeholder = zone.querySelector('.drop-zone-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
        });
        
        // Reset buttons
        dndButtons.forEach(btn => {
            btn.disabled = false;
        });
        
        // Remove partial score indicators
        const partialScoreEl = dndContainer.querySelector('.partial-score-indicator');
        if (partialScoreEl) {
            partialScoreEl.remove();
        }
    }
    
    // Clear all feedback elements
    const feedbackElements = quizContainer.querySelectorAll('.quiz-feedback');
    feedbackElements.forEach(feedback => {
        feedback.classList.add('display-none');
        feedback.innerHTML = '';
    });
    
    // Remove any correct answer displays
    const correctAnswerDisplays = quizContainer.querySelectorAll('.correct-answer-display');
    correctAnswerDisplays.forEach(display => display.remove());
    
    console.log('Quiz reset complete for retake');
}

// Quiz 2.0: Initialize PyCoin retake system (mock implementation)
function initializeRetakeSystem() {
    console.log('Initializing PyCoin retake system...');
    
    // Store retake attempts in localStorage
    const retakeData = JSON.parse(localStorage.getItem('quizRetakeData') || '{}');
    
    // Mock PyCoin deduction for retakes
    window.deductPyCoinsForRetake = function(questionId, retakeCost = 10) {
        const currentCoins = parseInt(localStorage.getItem('userPyCoins') || '100');
        if (currentCoins >= retakeCost) {
            localStorage.setItem('userPyCoins', (currentCoins - retakeCost).toString());
            
            // Track retake
            retakeData[questionId] = (retakeData[questionId] || 0) + 1;
            localStorage.setItem('quizRetakeData', JSON.stringify(retakeData));
            
            console.log(`Deducted ${retakeCost} PyCoins for retake. Remaining: ${currentCoins - retakeCost}`);
            return true;
        } else {
            console.log('Insufficient PyCoins for retake');
            return false;
        }
    };
    
    // Reset quiz attempt for retake
    window.resetQuizForRetake = function(questionId) {
        const quizElement = document.querySelector(`[data-block-id="${questionId}"]`);
        if (quizElement) {
            // Reset answered state
            quizElement.dataset.answered = "false";
            quizElement.dataset.submitted = "false";
            
            // Reset visual states
            const buttons = quizElement.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('correct-answer', 'incorrect-answer', 'show-correct');
            });
            
            // Reset drag-and-drop states
            const dropZones = quizElement.querySelectorAll('.drop-zone');
            dropZones.forEach(zone => {
                zone.classList.remove('correct', 'incorrect');
                zone.style.borderColor = '';
                zone.style.backgroundColor = '';
            });
            
            const dragItems = quizElement.querySelectorAll('.drag-item');
            dragItems.forEach(item => {
                item.draggable = true;
                item.classList.remove('disabled', 'correct-placement', 'incorrect-placement');
            });
            
            // Clear feedback
            const feedbackElement = quizElement.querySelector('.quiz-feedback');
            if (feedbackElement) {
                feedbackElement.classList.add('display-none');
            }
            
            console.log(`Quiz ${questionId} reset for retake`);
        }
    };
}

// Export functions globally for Quiz 2.1
window.showInlineQuizSummary = showInlineQuizSummary;
window.generateQuestionSummaryDetails = generateQuestionSummaryDetails;
window.resetQuizForRetake = resetQuizForRetake;

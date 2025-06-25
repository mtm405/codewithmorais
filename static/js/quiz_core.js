/**
 * Centralized Quiz Logic for all quiz types (MCQ, fill-in-the-blank, drag-and-drop, code, debug, etc.)
 * Supports inline and modal quiz modes, instant feedback, backend progress, points, and currency updates.
 * Each question must have a unique ID for user progress tracking.
 *
 * Usage: import { handleQuizSubmit } from './quiz_core.js';
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

function gradeFillInBlank(userInput, answers) {
  if (!Array.isArray(answers)) answers = [answers];
  return answers.some(ans => userInput.trim().toLowerCase() === ans.trim().toLowerCase());
}
window.gradeFillInBlank = gradeFillInBlank;

function showFeedback(element, isCorrect, feedback = "") {
  element.classList.remove("display-none");
  element.textContent = isCorrect ? (feedback || "Correct!") : (feedback || "Try again.");
  element.classList.toggle("correct", isCorrect);
  element.classList.toggle("incorrect", !isCorrect);
}
window.showFeedback = showFeedback;

function nextQuizStep(container, currentStep, totalSteps) {
  // Hide current, show next
  const steps = container.querySelectorAll('.quiz-card');
  if (steps[currentStep]) steps[currentStep].classList.add('d-none');
  if (steps[currentStep + 1]) steps[currentStep + 1].classList.remove('d-none');
  // Update progress bar, etc.
}
window.nextQuizStep = nextQuizStep;

function resetQuiz(container) {
  // Reset all quiz state in the container
  const steps = container.querySelectorAll('.quiz-card');
  steps.forEach((step, idx) => {
    step.classList.toggle('d-none', idx !== 0);
    // Reset feedback, inputs, etc.
    const feedback = step.querySelector('.quiz-feedback');
    if (feedback) feedback.classList.add('display-none');
    const inputs = step.querySelectorAll('input, button');
    inputs.forEach(input => {
      if (input.type === 'text') input.value = '';
      if (input.classList.contains('selected')) input.classList.remove('selected');
    });
  });
}
window.resetQuiz = resetQuiz;

// Utility: Send quiz result to backend (Flask API) for progress, points, currency
async function submitQuizResult({ questionId, isCorrect, points = 0, currency = 0, answer = null }) {
  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: questionId,
        correct: isCorrect,
        points,
        currency,
        answer
      })
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}
window.submitQuizResult = submitQuizResult;

// Modular grading for drag-and-drop (expects arrays of indices or ids)
function gradeDragAndDrop(userOrder, correctOrder) {
  if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) return false;
  if (userOrder.length !== correctOrder.length) return false;
  return userOrder.every((val, idx) => val === correctOrder[idx]);
}
window.gradeDragAndDrop = gradeDragAndDrop;

// Modular grading for code (run code and compare output)
function gradeCode(userOutput, expectedOutput) {
  // Simple string comparison, can be extended for more robust checks
  return String(userOutput).trim() === String(expectedOutput).trim();
}
window.gradeCode = gradeCode;

// Modular grading for debug (user must fix buggy code)
function gradeDebug(userCode, testCases, runCodeFn) {
  // runCodeFn should execute userCode with testCases and return pass/fail
  try {
    return runCodeFn(userCode, testCases);
  } catch (e) {
    return false;
  }
}
window.gradeDebug = gradeDebug;

// Accessibility: focus feedback and announce result
function announceFeedback(element, isCorrect) {
  if (element) {
    element.setAttribute('aria-live', 'polite');
    element.focus && element.focus();
    // Optionally use speechSynthesis for audio feedback
    if (window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(isCorrect ? 'Correct!' : 'Try again.');
      window.speechSynthesis.speak(msg);
    }
  }
}
window.announceFeedback = announceFeedback;

// Analytics/progress: update dashboard after quiz
function updateDashboardProgress() {
  fetch('/api/progress')
    .then(res => res.json())
    .then(progress => {
      const progressBar = document.getElementById('progress-bar-fill');
      const progressLabel = document.getElementById('progress-bar-label');
      if (progressBar && progressLabel && progress.percent !== undefined) {
        progressBar.style.width = progress.percent + '%';
        progressLabel.textContent = progress.percent + '% Complete';
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
  mode = 'inline', // 'inline' or 'modal'
  extra = {}
}) {
  let isCorrect = false;
  let normalizedUserInput = userInput;
  let normalizedCorrect = correctAnswer;
  let answerForBackend = userInput;

  // Grading logic by type
  switch (type) {
    case 'multiple_choice':
    case 'multiple_choice_quiz':
      isCorrect = gradeMCQ(userInput, correctAnswer);
      break;
    case 'fill_in_the_blank':
    case 'fill_in_the_blanks':
      isCorrect = gradeFillInBlank(userInput, correctAnswer);
      break;
    case 'drag_and_drop':
      isCorrect = gradeDragAndDrop(userInput, correctAnswer);
      break;
    case 'code':
      isCorrect = gradeCode(userInput, correctAnswer);
      break;
    case 'debug':
      if (typeof extra.runCodeFn === 'function') {
        isCorrect = gradeDebug(userInput, correctAnswer, extra.runCodeFn);
      }
      break;
    default:
      isCorrect = false;
  }

  // Show feedback
  if (feedbackElement) {
    showFeedback(feedbackElement, isCorrect);
    announceFeedback(feedbackElement, isCorrect);
  }

  // Send result to backend for progress, points, currency
  const backendRes = await submitQuizResult({
    questionId,
    isCorrect,
    points: isCorrect ? points : 0,
    currency: isCorrect ? currency : 0,
    answer: answerForBackend
  });

  // Optionally update dashboard/progress
  updateDashboardProgress();

  // Modal support: close modal or show summary if needed
  if (mode === 'modal' && typeof extra.onModalComplete === 'function') {
    extra.onModalComplete(isCorrect, backendRes);
  }

  return { isCorrect, backendRes };
}
window.handleQuizSubmit = handleQuizSubmit;

function attachQuizHandlers() {
  // Inline MCQ blocks
  document.querySelectorAll('.block-multiple-choice').forEach(block => {
    const optionsGrid = block.querySelector('.mcq-options-grid');
    if (!optionsGrid) return;
    const optionBtns = optionsGrid.querySelectorAll('.mcq-option-btn');
    const feedbackDiv = block.querySelector('.mcq-feedback');
    const correctIdx = parseInt(optionsGrid.getAttribute('data-correct-idx'));
    let answered = false;
    optionBtns.forEach((btn, idx) => {
      btn.style.cursor = 'pointer';
      btn.disabled = false;
      btn.addEventListener('click', async function handler(e) {
        console.debug('MCQ Button Clicked', {
          blockId: block.getAttribute('data-block-id'),
          optionIdx: idx,
          correctIdx,
          answered,
          btn, block, optionsGrid, feedbackDiv
        });
        if (answered) return;
        answered = true;
        // Reset all button states
        optionBtns.forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
        btn.classList.add('selected');
        const isCorrect = gradeMCQ(idx, correctIdx);
        if (isCorrect) {
          btn.classList.add('correct');
          showFeedback(feedbackDiv, true, 'Correct! +1 point, +1 token');
        } else {
          btn.classList.add('incorrect');
          if (optionBtns[correctIdx]) optionBtns[correctIdx].classList.add('correct');
          showFeedback(feedbackDiv, false, 'Incorrect.');
        }
        feedbackDiv.classList.remove('d-none');
        // Now disable all buttons AFTER feedback classes are applied
        optionBtns.forEach(b => b.disabled = true);
        const blockId = block.getAttribute('data-block-id') || block.id || '';
        await submitQuizResult({
          questionId: blockId,
          isCorrect,
          points: isCorrect ? 1 : 0,
          currency: isCorrect ? 1 : 0,
          answer: idx
        });
        setTimeout(() => {
          const quizCard = block.closest('.quiz-card');
          if (quizCard) {
            const nextCard = quizCard.nextElementSibling;
            if (nextCard && nextCard.classList.contains('quiz-card')) {
              quizCard.classList.add('d-none');
              nextCard.classList.remove('d-none');
            } 
            // Always show summary if this is the last card (or only card)
            if (!nextCard || !nextCard.classList.contains('quiz-card')) {
              quizCard.classList.add('d-none');
              // Show summary block after this section (after 1.5s)
              const summaryContainer = quizCard.parentElement.querySelector('.quiz-summary-block-container');
              console.debug('[MCQ] Attempting to show section summary', {quizCard, summaryContainer});
              if (typeof showSectionSummaryIfComplete === 'function') {
                showSectionSummaryIfComplete(quizCard);
              }
            }
          }
        }, 1500); // 1.5s for feedback and summary
      });
    });
    // Refresh button logic
    const refreshBtn = block.querySelector('.mcq-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        answered = false;
        optionBtns.forEach(b => {
          b.disabled = false;
          b.classList.remove('selected', 'correct', 'incorrect');
        });
        if (feedbackDiv) {
          feedbackDiv.classList.add('display-none');
          feedbackDiv.textContent = '';
        }
      });
    }
  });

  // Modal MCQ blocks (if any)
  document.querySelectorAll('.block-multiple-choice-minimal').forEach(block => {
    const optionsGrid = block.querySelector('.mcq-options-grid');
    if (!optionsGrid) return;
    const optionBtns = optionsGrid.querySelectorAll('.mcq-option-btn');
    const feedbackDiv = block.querySelector('.mcq-feedback');
    const correctIdx = parseInt(optionsGrid.getAttribute('data-correct-idx'));
    let answered = false;
    optionBtns.forEach((btn, idx) => {
      btn.style.cursor = 'pointer';
      btn.disabled = false;
      btn.addEventListener('click', async function handler(e) {
        console.debug('Minimal MCQ Button Clicked', {
          blockId: block.getAttribute('data-block-id'),
          optionIdx: idx,
          correctIdx,
          answered,
          btn, block, optionsGrid, feedbackDiv
        });
        if (answered) return;
        answered = true;
        // Reset all button states
        optionBtns.forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
        btn.classList.add('selected');
        const isCorrect = gradeMCQ(idx, correctIdx);
        if (isCorrect) {
          btn.classList.add('correct');
          showFeedback(feedbackDiv, true, 'Correct! +1 point, +1 token');
        } else {
          btn.classList.add('incorrect');
          if (optionBtns[correctIdx]) optionBtns[correctIdx].classList.add('correct');
          showFeedback(feedbackDiv, false, 'Incorrect.');
        }
        feedbackDiv.classList.remove('d-none');
        // Now disable all buttons AFTER feedback classes are applied
        optionBtns.forEach(b => b.disabled = true);
        const blockId = block.getAttribute('data-block-id') || block.id || '';
        await submitQuizResult({
          questionId: blockId,
          isCorrect,
          points: isCorrect ? 1 : 0,
          currency: isCorrect ? 1 : 0,
          answer: idx
        });
        setTimeout(() => {
          const modal = block.closest('.modal');
          if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }, 1500); // 1.5s for feedback
      });
    });
  });
}
window.attachQuizHandlers = attachQuizHandlers;

// Auto-attach quiz handlers on script load
document.addEventListener('DOMContentLoaded', attachQuizHandlers);

function showSectionSummaryIfComplete(quizCard) {
  // Find the parent quiz-questions-list
  const questionsList = quizCard?.parentElement;
  console.debug('[showSectionSummaryIfComplete] quizCard:', quizCard, 'questionsList:', questionsList);
  if (!questionsList) return;
  // Find all quiz-cards in this section
  const allCards = Array.from(questionsList.querySelectorAll('.quiz-card'));
  // Check if all are hidden (answered)
  const allAnswered = allCards.every(card => card.classList.contains('d-none'));
  console.debug('[showSectionSummaryIfComplete] allCards:', allCards, 'allAnswered:', allAnswered);
  if (allAnswered) {
    // Show summary block
    const summaryContainer = questionsList.querySelector('.quiz-summary-block-container');
    console.debug('[showSectionSummaryIfComplete] summaryContainer:', summaryContainer, 'window.renderQuizSummaryBlock:', !!window.renderQuizSummaryBlock);
    if (summaryContainer && window.renderQuizSummaryBlock) {
      // Calculate correct/total for this section
      let correct = 0, total = 0;
      allCards.forEach(card => {
        // MCQ: .mcq-option-btn.correct
        if (card.querySelector('.mcq-option-btn.correct')) correct++;
        // FITB: .quiz-feedback.correct
        else if (card.querySelector('.quiz-feedback.correct')) correct++;
        total++;
      });
      console.debug('[showSectionSummaryIfComplete] correct:', correct, 'total:', total);
      window.renderQuizSummaryBlock({
        container: summaryContainer,
        topic: quizCard.getAttribute('data-topic-id') || '',
        correct,
        total,
        feedback: correct === total ? 'Great job! All correct.' : 'Keep practicing!'
      });
    }
  }
}

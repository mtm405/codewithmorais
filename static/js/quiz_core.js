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

// Unified grading for fill_in_the_blank (single answer)
function gradeFillInTheBlank(userAnswer, correctAnswers) {
  if (!Array.isArray(correctAnswers)) return false;
  return correctAnswers.some(ans => String(ans).trim().toLowerCase() === String(userAnswer).trim().toLowerCase());
}
window.gradeFillInTheBlank = gradeFillInTheBlank;

// Modular grading for drag-and-drop (expects arrays of indices or ids)
function gradeDragAndDrop(userOrder, correctOrder) {
  if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) return false;
  if (userOrder.length !== correctOrder.length) return false;
  return userOrder.every((val, idx) => val === correctOrder[idx]);
}
window.gradeDragAndDrop = gradeDragAndDrop;

// Modular grading for code (run code and compare output)
function gradeCode(userOutput, expectedOutput) {
  // Simple string comparison, can be extended to be more robust
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
      isCorrect = gradeMCQ(userInput, correctAnswer);
      break;
    case 'fill_in_the_blank':
      isCorrect = gradeFillInTheBlank(userInput, correctAnswer);
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

// Show feedback for quiz blocks (MCQ, fill-in-the-blank, drag-and-drop)
function showFeedback(feedbackDiv, isCorrect, customMsg) {
  if (!feedbackDiv) return;
  feedbackDiv.classList.remove('display-none');
  feedbackDiv.style.display = 'block';
  feedbackDiv.textContent = customMsg || (isCorrect ? 'Correct! +1 point, +1 token' : 'Try again!');
  feedbackDiv.style.color = isCorrect ? '#2ecc40' : '#e74c3c';
  feedbackDiv.style.fontWeight = 'bold';
  if (isCorrect) {
    // Optionally disable input and button
    const block = feedbackDiv.closest('.block-fill-in-blank');
    if (block) {
      const input = block.querySelector('input.fill-blank-input');
      const submitBtn = block.querySelector('.fill-blank-submit-btn');
      if (input) input.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    }
  }
}
window.showFeedback = showFeedback;

function attachQuizHandlers() {
  // Inline MCQ blocks
  document.querySelectorAll('.block-multiple-choice').forEach(block => {
    // Skip if this is part of a comprehensive quiz
    if (block.hasAttribute('data-comprehensive-quiz') || block.closest('.comprehensive-quiz-container')) {
      return;
    }
    
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
    // Skip if this is part of a comprehensive quiz
    if (block.hasAttribute('data-comprehensive-quiz') || block.closest('.comprehensive-quiz-container')) {
      return;
    }
    
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

// --- Fill in the Blank Quiz Logic ---
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.block-fill-in-blank').forEach(block => {
      // Skip if this is part of a comprehensive quiz
      if (block.hasAttribute('data-comprehensive-quiz') || block.closest('.comprehensive-quiz-container')) {
        return;
      }
      
      const input = block.querySelector('input.fill-blank-input');
      const submitBtn = block.querySelector('.fill-blank-submit-btn');
      const feedbackDiv = block.querySelector('.fill-blank-feedback');
      if (!input || !submitBtn) return;
      submitBtn.addEventListener('click', async function() {
        const userAnswer = input.value.trim();
        const correctAnswers = (input.dataset.answer || '').split(',').map(a => a.trim());
        const isCorrect = correctAnswers.some(ans => ans.toLowerCase() === userAnswer.toLowerCase());
        showFeedback(feedbackDiv, isCorrect);
        announceFeedback(feedbackDiv, isCorrect);
        // Send result to backend
        const blockId = block.getAttribute('data-block-id') || block.id || '';
        await submitQuizResult({
          questionId: blockId,
          isCorrect,
          points: isCorrect ? 1 : 0,
          currency: isCorrect ? 1 : 0,
          answer: userAnswer
        });
      });
    });

// --- Drag and Drop Quiz Logic ---
    document.querySelectorAll('.drag-drop-question, .block-drag-and-drop').forEach(block => {
      // Skip if this is part of a comprehensive quiz
      if (block.hasAttribute('data-comprehensive-quiz') || block.closest('.comprehensive-quiz-container')) {
        return;
      }
      
      const dragItems = block.querySelectorAll('.drag-item');
      const dropZones = block.querySelectorAll('.drop-zone');
      // Use .drag-items for the bank within this block (not #drag-items-bank)
      const dragItemsBank = block.querySelector('.drag-items, .drag-item-bank');
      const checkBtn = block.querySelector('.check-drag-drop-btn');
      const feedbackDiv = block.querySelector('.drag-drop-feedback');
      let draggedItem = null;
      let userOrder = Array(dropZones.length).fill(null);

      dragItems.forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', e => {
          draggedItem = item;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', item.dataset.id);
        });
        item.addEventListener('dragend', () => draggedItem = null);
      });

      dropZones.forEach((zone, idx) => {
        const target = zone.querySelector('.drop-target');
        zone.addEventListener('dragover', e => {
          e.preventDefault();
          zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
          e.preventDefault();
          zone.classList.remove('drag-over');
          if (draggedItem) {
            if (draggedItem.parentNode) draggedItem.parentNode.removeChild(draggedItem);
            target.innerHTML = '';
            target.appendChild(draggedItem);
            userOrder = userOrder.map(id => id === draggedItem.dataset.id ? null : id);
            userOrder[idx] = draggedItem.dataset.id;
          }
        });
      });

      if (dragItemsBank) {
        dragItemsBank.addEventListener('dragover', e => e.preventDefault());
        dragItemsBank.addEventListener('drop', e => {
          e.preventDefault();
          if (draggedItem) {
            if (draggedItem.parentNode) draggedItem.parentNode.removeChild(draggedItem);
            dragItemsBank.appendChild(draggedItem);
            userOrder = userOrder.map(id => id === draggedItem.dataset.id ? null : id);
          }
        });
      }

      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          const correctOrder = Array.from(dropZones).map(z => z.dataset.id);
          const isCorrect = userOrder.every((val, idx) => val === correctOrder[idx]);
          feedbackDiv.className = 'drag-drop-feedback ' + (isCorrect ? 'correct' : 'incorrect');
          feedbackDiv.textContent = isCorrect ? 'Correct!' : 'Try again!';
        });
      }
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

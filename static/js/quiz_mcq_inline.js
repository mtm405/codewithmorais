// MCQ Inline Logic
// Handles single selection, feedback, disables options, highlights correct answer, and tracks progress/score

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc as firestoreDoc, updateDoc, increment as firestoreIncrement } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = window.firebaseConfig || {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- MCQ Button Color Classes ---
const MCQ_GREEN = '#22c55e'; // Tailwind green-500
const MCQ_RED = '#ef4444';   // Tailwind red-500
const MCQ_PURPLE = '#8F00FF';

function setBtnColor(btn, color) {
  btn.style.background = color;
  btn.style.backgroundImage = 'none'; // Remove gradient
  btn.style.color = '#fff';
  btn.style.border = 'none';
}

// Award 1 byte to the user (Firebase)
async function awardByteToUser() {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = firestoreDoc(db, 'users', user.uid);
  await updateDoc(userRef, { total_points: firestoreIncrement(1) });
}

// Persistent attempt tracking key (per lesson, per user, per blockId)
function getAttemptKey(blockId) {
  const user = auth.currentUser;
  const userId = user ? user.uid : 'guest';
  const lessonId = window.lessonId || window.location.pathname;
  return `mcq_attempts_${lessonId}_${userId}_${blockId}`;
}

// Save attempt to localStorage
function saveAttempt(blockId, selectedIdx, isCorrect) {
  const key = getAttemptKey(blockId);
  localStorage.setItem(key, JSON.stringify({ selectedIdx, isCorrect }));
}

// Load attempt from localStorage
function loadAttempt(blockId) {
  const key = getAttemptKey(blockId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save per-topic progress to Firebase (optional, fallback to localStorage)
async function saveProgressToFirebase(progress) {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = firestoreDoc(db, 'users', user.uid);
  // You may want to structure this differently depending on your dashboard
  await updateDoc(userRef, { [`progress.${progress.topic}`]: progress });
}

function saveProgressToLocal(progress) {
  const user = auth.currentUser;
  const userId = user ? user.uid : 'guest';
  const lessonId = window.lessonId || window.location.pathname;
  localStorage.setItem(`mcq_progress_${lessonId}_${userId}`, JSON.stringify(progress));
}

function showMcqSummaryBlock(correctCount, totalQuestions) {
  let percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  let summary = document.createElement('div');
  summary.className = 'mcq-summary-block';
  summary.innerHTML = `<h3>Quiz Complete!</h3><p>Score: <b>${correctCount} / ${totalQuestions}</b> (${percent}%)</p>`;
  document.body.appendChild(summary);
  // Optionally, scroll to summary
  summary.scrollIntoView({ behavior: 'smooth' });
}

// --- BEGIN: Persistent attempt tracking and per-topic progress ---
// Utility: get topic/lesson id from page (assumes window.lessonId or data-lesson-id on body)
function getLessonId() {
  if (window.lessonId) return window.lessonId;
  const el = document.body;
  return el ? el.dataset.lessonId : 'unknown_lesson';
}

// Utility: localStorage key for attempts
function getMcqStorageKey() {
  return `mcq_attempts_${getLessonId()}`;
}

// Load attempts from localStorage
function loadMcqAttempts() {
  try {
    return JSON.parse(localStorage.getItem(getMcqStorageKey())) || {};
  } catch {
    return {};
  }
}
// Save attempts to localStorage
function saveMcqAttempts(attempts) {
  localStorage.setItem(getMcqStorageKey(), JSON.stringify(attempts));
}

// --- END: Persistent attempt tracking and per-topic progress ---

document.addEventListener('DOMContentLoaded', function () {
  // Add refresh button logic
  const refreshBtn = document.getElementById('mcq-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Clear all MCQ attempts for this lesson
      const lessonId = getLessonId();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mcq_attempts_' + lessonId)) localStorage.removeItem(key);
        if (key.startsWith('mcq_progress_' + lessonId)) localStorage.removeItem(key);
      });
      location.reload();
    });
  }

  const mcqBlocks = document.querySelectorAll('.block-multiple-choice');
  let totalQuestions = mcqBlocks.length;
  let answeredCount = 0;
  let correctCount = 0;
  let userAnswers = [];
  const lessonId = getLessonId();
  let attempts = loadMcqAttempts();

  mcqBlocks.forEach((block, blockIdx) => {
    const blockId = block.dataset.blockId || `block_${blockIdx}`;
    const buttons = block.querySelectorAll('.mcq-option-btn');
    const feedback = block.querySelector('.mcq-feedback');
    let answered = false;
    // Get correct answer index from data-correct-idx attribute
    const optionsGrid = block.querySelector('.mcq-options-grid');
    let correctIdx = null;
    if (optionsGrid && optionsGrid.dataset.correctIdx !== undefined) {
      correctIdx = parseInt(optionsGrid.dataset.correctIdx, 10);
    }
    // --- Prevent multiple attempts ---
    const prevAttempt = loadAttempt(blockId);
    if (prevAttempt) {
      answered = true;
      answeredCount++;
      if (prevAttempt.isCorrect) correctCount++;
      // Mark UI as answered
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === prevAttempt.selectedIdx) {
          if (prevAttempt.isCorrect) {
            btn.classList.add('mcq-correct');
            setBtnColor(btn, MCQ_GREEN);
          } else {
            btn.classList.add('mcq-incorrect');
            setBtnColor(btn, MCQ_RED);
          }
        }
        if (idx === correctIdx) {
          btn.classList.add('mcq-correct');
          setBtnColor(btn, MCQ_GREEN);
        }
      });
      if (feedback) {
        feedback.textContent = prevAttempt.isCorrect ? 'Correct!' : 'Incorrect.';
        feedback.className = 'mcq-feedback ' + (prevAttempt.isCorrect ? 'correct' : 'incorrect');
        feedback.style.display = 'block';
      }
      // Only show the first unanswered block
      if (answeredCount === blockIdx + 1 && answeredCount < totalQuestions) {
        block.style.display = '';
      } else {
        block.style.display = 'none';
      }
      userAnswers[blockIdx] = prevAttempt;
      return;
    }
    // --- End prevent multiple attempts ---
    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', function () {
        console.log('[MCQ DEBUG] Button clicked', {blockIdx, idx, answered, correctIdx, btn, block});
        if (answered) return;
        answered = true;
        answeredCount++;
        // Disable all buttons
        buttons.forEach(b => {
          b.disabled = true;
          // Remove all gradients and color classes
          b.classList.remove('mcq-correct', 'mcq-incorrect');
          setBtnColor(b, MCQ_PURPLE);
        });
        // Mark selected and correct/incorrect
        if (idx === correctIdx) {
          btn.classList.add('mcq-correct');
          setBtnColor(btn, MCQ_GREEN);
          if (feedback) {
            feedback.textContent = 'Correct!';
            feedback.className = 'mcq-feedback correct';
            feedback.style.display = 'block';
          }
          correctCount++;
          awardByteToUser(); // Award 1 byte in Firebase
        } else {
          btn.classList.add('mcq-incorrect');
          setBtnColor(btn, MCQ_RED);
          if (feedback) {
            feedback.textContent = 'Incorrect.';
            feedback.className = 'mcq-feedback incorrect';
            feedback.style.display = 'block';
          }
          if (typeof correctIdx === 'number' && buttons[correctIdx]) {
            buttons[correctIdx].classList.add('mcq-correct');
            setBtnColor(buttons[correctIdx], MCQ_GREEN);
          }
        }
        // Save attempt
        saveAttempt(blockId, idx, idx === correctIdx);
        // Hide all blocks after this one
        mcqBlocks.forEach((b, i) => {
          if (i > blockIdx) b.style.display = 'none';
        });
        // Show summary block if last question
        if (blockIdx === totalQuestions - 1) {
          setTimeout(() => {
            showMcqSummaryBlock(correctCount, totalQuestions);
          }, 500);
        } else {
          // Otherwise, show next unanswered block
          const nextBlock = Array.from(mcqBlocks).slice(blockIdx + 1).find(b => {
            const btns = b.querySelectorAll('.mcq-option-btn');
            return !btns[0].disabled; // Find first block with enabled buttons
          });
          if (nextBlock) {
            setTimeout(() => {
              nextBlock.scrollIntoView({ behavior: 'smooth' });
            }, 500);
          }
        }
      });
    });
    // --- END: MCQ Block Logic ---
  });

  // --- Auto-save progress example (optional) ---
  const saveProgressBtn = document.getElementById('mcq-save-progress');
  if (saveProgressBtn) {
    saveProgressBtn.addEventListener('click', async () => {
      const progress = {
        topic: lessonId,
        correct: correctCount,
        total: totalQuestions,
        timestamp: Date.now(),
      };
      await saveProgressToFirebase(progress);
      alert('Progress saved!');
    });
  }
});

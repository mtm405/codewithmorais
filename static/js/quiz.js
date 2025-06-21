// Quiz unlock and modal logic for MCQ quizzes
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc as firestoreDoc, getDoc as firestoreGetDoc, updateDoc, setDoc as firestoreSetDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = window.firebaseConfig || {
  // fallback config if needed
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper to fetch lesson quiz JSON from local static files ---
async function fetchLessonQuizFromStatic(lessonId) {
  try {
    const url = `/static/lessons/${lessonId}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch lesson JSON: ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch lesson quiz from static files:', e);
    return null;
  }
}

// --- Helper to update user currency in Firestore, returns a Promise ---
async function updateUserTokensInFirebase(userId, newCurrencyAmount) {
  console.log('[DEBUG] updateUserTokensInFirebase called for user:', userId, 'newCurrencyAmount:', newCurrencyAmount);
  const userRef = firestoreDoc(db, 'users', userId);
  const docSnap = await firestoreGetDoc(userRef);
  if (!docSnap.exists()) {
    console.log('[DEBUG] User doc does not exist, creating with currency:', newCurrencyAmount);
    await firestoreSetDoc(userRef, { currency: newCurrencyAmount });
  } else {
    console.log('[DEBUG] User doc exists, updating currency to:', newCurrencyAmount);
    await updateDoc(userRef, { currency: newCurrencyAmount });
  }
}

// --- Get userId from Firebase Auth (assumes user is logged in) ---
function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

// --- Fetch and display the user's currency from Firestore ---
async function fetchAndDisplayUserTokens() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = firestoreDoc(db, 'users', user.uid);
    const docSnap = await firestoreGetDoc(userRef);
    if (docSnap.exists()) {
      const currency = docSnap.data().currency;
      const currencyEl = document.getElementById('currency-value');
      if (currencyEl) currencyEl.textContent = currency;
    }
  } catch (e) {
    console.error('Error fetching user currency:', e);
  }
}

// --- On page load, after Firebase Auth is ready, fetch tokens and ensure user doc exists ---
auth.onAuthStateChanged(function(user) {
  if (user) {
    fetchAndDisplayUserTokens();
  }
});

// --- Patch all token changes to also update Firebase and refresh display ---
function updateTokensEverywhere(newTokenAmount, callback) {
  const userId = getCurrentUserId();
  console.log('[DEBUG] updateTokensEverywhere called, userId:', userId, 'newTokenAmount:', newTokenAmount);
  if (userId) {
    updateUserTokensInFirebase(userId, newTokenAmount)
      .then(() => {
        setTimeout(fetchAndDisplayUserTokens, 500);
        if (callback) callback(true);
      })
      .catch((error) => {
        console.error('[DEBUG] Error updating tokens:', error);
        if (callback) callback(false);
      });
  } else {
    console.log('[DEBUG] No userId found, cannot update tokens');
    if (callback) callback(false);
  }
}

// --- Replace static quiz data logic with dynamic fetch ---
document.addEventListener('DOMContentLoaded', function() {
  console.log('[QUIZ] DOMContentLoaded');
  // Get lessonId from a data attribute on <body> or another element
  const lessonId = document.body.getAttribute('data-lesson-id');
  let lessonQuizData = null;
  // Disable quiz buttons until data is loaded and auth is ready
  document.querySelectorAll('.quiz-unlock-btn').forEach(btn => btn.disabled = true);

  // Wait for Firebase Auth state before enabling quiz unlocks
  auth.onAuthStateChanged(function(user) {
    if (!user) {
      console.warn('[QUIZ] User not logged in, quiz unlocks disabled.');
      return;
    }
    // Now fetch quiz data
    if (lessonId) {
      console.log('[QUIZ] Fetching quiz data for lessonId:', lessonId);
      fetchLessonQuizFromStatic(lessonId).then(data => {
        lessonQuizData = data;
        console.log('[QUIZ] Quiz data loaded:', lessonQuizData);
        // Enable quiz buttons when data and auth are ready
        document.querySelectorAll('.quiz-unlock-btn').forEach(btn => btn.disabled = false);
      });
    } else {
      console.warn('[QUIZ] No lessonId found on <body>');
    }

    // Attach event listeners for quiz unlock buttons (only after auth ready)
    document.querySelectorAll('.quiz-unlock-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        console.log('[QUIZ] Quiz button clicked', btn, 'lessonQuizData:', lessonQuizData);
        if (!lessonQuizData) {
          alert('Quiz data is still loading. Please wait and try again.');
          return;
        }
        const quizId = btn.getAttribute('data-quiz-id');
        const quizPrice = parseInt(btn.getAttribute('data-quiz-price'));
        const currencyEl = document.getElementById('currency-value');
        let currentTokens = parseInt(currencyEl?.textContent || '0');
        const overlay = document.getElementById('quiz-modal-overlay');
        const modal = document.getElementById('quiz-modal');
        // Always clear modal content and remove any previous confirmation dialogs
        overlay.style.display = 'flex';
        document.getElementById('quiz-modal-content').innerHTML = '';
        Array.from(modal.children).forEach(child => {
          if (child.id !== 'quiz-modal-content') modal.removeChild(child);
        });
        // Check for saved progress
        const saved = getSavedQuizProgress(quizId);
        // Instead of static quizData, use lessonQuizData
        let quizData = null;
        if (lessonQuizData && lessonQuizData.quizzes) {
          if (quizId === 'quiz1') quizData = lessonQuizData.quizzes.easy;
          if (quizId === 'quiz2') quizData = lessonQuizData.quizzes.medium;
          if (quizId === 'quiz3') quizData = lessonQuizData.quizzes.hard;
        }
        if (!quizData) {
          alert('No quiz data found for this level.');
          console.error('[QUIZ] No quiz data for', quizId, lessonQuizData);
          return;
        }
        if (saved && quizData && saved.current < quizData.blocks.length) {
          loadQuiz(quizId, saved, quizData);
          return;
        } else if (saved && quizData && saved.current >= quizData.blocks.length) {
          // Progress is complete, clear and show unlock dialog
          clearSavedQuizProgress(quizId);
        }
        // Confirmation dialog
        const confirmDiv = document.createElement('div');
        confirmDiv.innerHTML = `<div style='background:#23272e; color:#fff; border-radius:10px; padding:2em; max-width:480px; min-width:340px; width:100%; margin:0 auto; text-align:center; box-shadow:0 2px 16px #0008;'>
          <div style='font-size:1.15em; margin-bottom:1.2em;'>Are you sure you want to spend <b>${quizPrice} <span class="material-symbols-outlined coin-icon">token</span></b>?</div>
          <div style='display:flex; justify-content:center; gap:1em; margin-top:1.2em;'>
            <button id='quiz-confirm-yes' style='background:#2b7cff; color:#fff; border:none; border-radius:8px; padding:0.7em 2em; font-size:1em; font-weight:700; cursor:pointer;'>Yes</button>
            <button id='quiz-confirm-no' style='background:#444; color:#fff; border:none; border-radius:8px; padding:0.7em 2em; font-size:1em; font-weight:700; cursor:pointer;'>No</button>
          </div>
        </div>`;
        modal.appendChild(confirmDiv);
        document.getElementById('quiz-confirm-yes').onclick = function() {
          if (!auth.currentUser) {
            alert('You must be logged in to unlock quizzes.');
            overlay.style.display = 'none';
            confirmDiv.remove();
            return;
          }
          if (currentTokens < quizPrice) {
            alert('Not enough tokens to unlock this quiz!');
            overlay.style.display = 'none';
            confirmDiv.remove();
            return;
          }
          // Deduct tokens visually only after Firestore update
          const newTokenAmount = currentTokens - quizPrice;
          updateTokensEverywhere(newTokenAmount, function(success) {
            if (success) {
              if (currencyEl) currencyEl.textContent = newTokenAmount;
              confirmDiv.remove();
              loadQuiz(quizId, undefined, quizData);
            } else {
              alert('Failed to deduct tokens. Please try again or check your login status.');
              overlay.style.display = 'none';
              confirmDiv.remove();
            }
          });
        };
        document.getElementById('quiz-confirm-no').onclick = function() {
          overlay.style.display = 'none';
          confirmDiv.remove();
        };
      });
    });
  });

  // --- Quiz progress helpers (localStorage) ---
  function getSavedQuizProgress(quizId) {
    try {
      const data = localStorage.getItem('quiz-progress-' + quizId);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setSavedQuizProgress(quizId, progress) {
    try {
      localStorage.setItem('quiz-progress-' + quizId, JSON.stringify(progress));
    } catch (e) {}
  }

  function clearSavedQuizProgress(quizId) {
    try {
      localStorage.removeItem('quiz-progress-' + quizId);
    } catch (e) {}
  }

  // --- Minimal loader for quiz modal (dynamically renders quiz content and re-initializes logic) ---
  function loadQuiz(quizId, saved, quizData) {
    const overlay = document.getElementById('quiz-modal-overlay');
    const modal = document.getElementById('quiz-modal');
    const content = document.getElementById('quiz-modal-content');
    overlay.style.display = 'none'; // Hide overlay while loading
    // Render quiz blocks for this quizData
    content.innerHTML = renderQuizBlocks(quizData);
    // Dynamically load and re-initialize quiz_minimal.js logic for modal content
    if (window.quizMinimalInit) {
      window.quizMinimalInit();
      // Ensure first question is visible after dynamic load
      const quizCards = content.querySelectorAll('.quiz-card');
      if (quizCards.length > 0) {
        quizCards[0].style.display = '';
      }
      overlay.style.display = 'flex'; // Show overlay after quiz is ready
    } else {
      // Fallback: reload the script
      const oldScript = document.getElementById('quiz-minimal-script');
      if (oldScript) oldScript.remove();
      const script = document.createElement('script');
      script.src = '/static/js/quiz_minimal.js';
      script.id = 'quiz-minimal-script';
      script.onload = function() {
        if (window.quizMinimalInit) {
          window.quizMinimalInit();
          const quizCards = content.querySelectorAll('.quiz-card');
          if (quizCards.length > 0) {
            quizCards[0].style.display = '';
          }
          overlay.style.display = 'flex'; // Show overlay after quiz is ready
        }
      };
      document.body.appendChild(script);
    }
  }

  // --- Render only quiz blocks as HTML for modal (no section title/instructions/summary) ---
  function renderQuizBlocks(quizData) {
    if (!quizData || !quizData.blocks) return '<div style="color:#ff4e6a;">No quiz data found.</div>';
    let html = `<div class='quiz-questions-list'>`;
    // Helper to render inline code
    function renderInlineCode(text) {
      return text.replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    // Recursive function to process blocks (including nested)
    function processBlocks(blocks, parentIdx = 0) {
      blocks.forEach((block, idx) => {
        if (block.type === 'multiple_choice_quiz' && block.questions && block.questions.length > 0) {
          block.questions.forEach((q, qIdx) => {
            // Replace newlines inside backticks with spaces for inline code readability
            let questionText = q.question.replace(/1 pt/gi, '');
            questionText = questionText.replace(/`([^`]+)`/g, (match, p1) => {
              return '`' + p1.replace(/\s+/g, ' ') + '`';
            });
            // Determine if options are short (all < 30 chars)
            const isShort = q.options.every(opt => (opt.replace(/<[^>]+>/g, '').length < 30));
            const gridStyle = isShort ? "display:grid;grid-template-columns:1fr 1fr;gap:1em;" : "display:flex;flex-direction:column;gap:1em;";
            html += `<div class='block-multiple-choice-minimal' data-step='${parentIdx}-${idx}-${qIdx}' style='display: none; max-width:520px; margin:0 auto;'>`;
            html += `<div class='mcq-question' style='font-size:1.22em; font-weight:700; color:#fff; margin-bottom:1em;'>${window.marked ? window.marked.parseInline(questionText) : questionText}</div><div class='mcq-options-grid' style='${gridStyle}'>`;
            q.options.forEach((opt, i) => {
              let optText = window.marked ? window.marked.parseInline(opt) : opt;
              html += `<button type='button' class='mcq-option-btn-minimal${i === q.correct_index ? ' correct-answer' : ''}' data-option-idx='${i}' data-explanation='${q.explanation || ''}' style='font-size:1.1em; padding:0.8em 1.2em; border-radius:8px; background:var(--card-bg); color:var(--text-light); border:1.5px solid var(--border-subtle); font-weight:600; cursor:pointer;white-space:normal;'>${optText}</button>`;
            });
            html += `</div><div class='quiz-feedback' style='display:none;'></div></div>`;
          });
        } else if (block.type === 'fill_in_the_blanks') {
          let questionText = block.question.replace(/1 pt/gi, '');
          let questionHtml = questionText.replace(/_{3,}/g, `<input type='text' class='fill-blank-input-minimal' style='width:120px; font-size:1.1em; padding:0.5em; border-radius:8px; border:1.5px solid #e6eaf3; background:#181c2a; color:#fff; margin:0 0.3em; text-align:center;' autocomplete='off' data-answers='${block.answers ? block.answers.join(',') : ''}' data-explanation='${block.explanation || block.feedback || ''}' />`);
          questionHtml = window.marked ? window.marked.parseInline(questionHtml) : questionHtml;
          html += `<div class='block-fill-in-blank-minimal' data-step='${parentIdx}-${idx}' style='display: none;'>`;
          html += `<div class='fill-blank-question' style='font-size:1.22em; font-weight:700; color:#fff; margin-bottom:1em;'>${questionHtml}</div>`;
          html += `<div class='quiz-feedback' style='display:none;'></div></div>`;
        } else if (block.blocks && Array.isArray(block.blocks)) {
          // Recursively process nested blocks
          processBlocks(block.blocks, idx);
        } else if (block.type === 'drag_and_drop') {
          // Render as a standalone block, not inside a card
          html += `<div class='block-drag-and-drop-minimal' data-step='${parentIdx}-${idx}' style='display: none; margin: 2em 0;'>`;
          html += `<div class='drag-drop-instructions' style='font-size:1.1em; font-weight:600; margin-bottom:1em;'>${block.instructions || ''}</div>`;
          html += `<div class='drag-drop-container' data-explanation='${block.explanation || block.feedback || ''}' style='display:flex; gap:2em; margin:1em 0; flex-wrap:wrap;'>`;
          if (block.items && block.targets) {
            html += `<div class='drag-items' style='display:flex; flex-direction:column; gap:1em; min-width:180px;'>`;
            block.items.forEach((item, i) => {
              html += `<div class='drag-item' draggable='true' data-item-id='${item.id || i}' style='background:var(--input-bg,#23263A);color:var(--text-light,#fff);padding:0.7em 1em;border-radius:8px;border:1.5px solid var(--border-subtle,#2e3650);cursor:grab;font-weight:600;'>${item.text}</div>`;
            });
            html += `</div>`;
            html += `<div class='drop-zones' style='display:flex; flex-direction:column; gap:1em; min-width:180px;'>`;
            block.targets.forEach((target, i) => {
              html += `<div class='drop-zone' data-target-id='${target.id || i}' style='background:var(--card-bg,#181A20);color:var(--text-light,#fff);padding:0.7em 1em;border-radius:8px;border:1.5px dashed var(--border-subtle,#2e3650);min-height:2.2em;display:flex;align-items:center;'>${target.text}</div>`;
            });
            html += `</div>`;
          }
          html += `</div>`; // close drag-drop-container
          html += `<button class='check-drag-drop-btn' type='button' style='background:var(--accent-blue,#2b7cff); color:#fff; border:none; border-radius:24px; padding:0.7em 2.2em; font-size:1.1em; font-weight:700; cursor:pointer;'>Check</button>`;
          html += `<div class='drag-drop-feedback quiz-feedback' style='display:none;'></div>`;
          html += `</div>`;
        } else if (block.type === 'debug_challenge') {
          html += `<div class='block-debug-challenge-minimal' data-step='${parentIdx}-${idx}' style='display: none;'>`;
          html += `{% include 'partials/block_debug_challenge.html' %}`;
          html += `</div>`;
        } else {
          html += `<p><em>Unknown quiz block type: ${block.type}</em></p>`;
        }
      });
    }
    processBlocks(quizData.blocks);
    html += `</div>`; // close .quiz-questions-list
    // Add the main button container for modal navigation
    html += `\n    <div id="quiz-main-btn-container" style="text-align:center; margin-top:1.5em;">\n      <button id="quiz-main-btn" class="quiz-main-btn" style="width:200px; display:none;">Submit</button>\n    </div>\n    `;
    // Add a hidden summary section for results
    html += `\n    <div class="quiz-summary" style="display:none; max-width:900px; margin:0 auto;">\n      <h2>Quiz Summary</h2>\n      <div class="quiz-final-score"></div>\n      <table class="quiz-summary-table" style="width:100%; min-width:600px;">\n        <thead>\n          <tr>\n            <th>Question</th>\n            <th>Your Answer</th>\n            <th>Correct Answer</th>\n            <th>Result</th>\n          </tr>\n        </thead>\n        <tbody></tbody>\n      </table>\n    </div>\n    `;
    return html;
  }
}); // End of DOMContentLoaded

// ...any additional helper functions...

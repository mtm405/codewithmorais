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
const MCQ_GREEN = "#48BB78"; // Python green
const MCQ_RED = "#ef4444";   // Tailwind red-500
const MCQ_BLUE = "#306998";  // Python primary blue

function setBtnColor(btn, color) {
  btn.style.background = color;
  btn.style.backgroundImage = "none"; // Remove gradient
  btn.style.color = "#fff";
  btn.style.border = "none";
}

// Award 1 byte to the user (Firebase)
async function awardByteToUser() {
  const user = auth.currentUser;
  if (!user) {
    console.warn('[MCQ DEBUG] No user signed in, cannot award Byte.');
    return;
  }
  try {
    const userRef = firestoreDoc(db, "users", user.uid);
    await updateDoc(userRef, { total_points: firestoreIncrement(1) });
    // Optionally update UI Byte count if you have a badge/element
    const byteBadge = document.getElementById("byte-points-badge");
    if (byteBadge) {
      let val = parseInt(byteBadge.textContent, 10) || 0;
      byteBadge.textContent = val + 1;
    }
    console.log('[MCQ DEBUG] Awarded 1 Byte to user:', user.uid);
  } catch (e) {
    console.warn('[MCQ DEBUG] Failed to award Byte to user:', e);
  }
}

// Persistent attempt tracking key (per lesson, per user, per blockId)
function getAttemptKey(blockId) {
  const user = auth.currentUser;
  const userId = user ? user.uid : "guest";
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
  const userRef = firestoreDoc(db, "users", user.uid);
  // You may want to structure this differently depending on your dashboard
  await updateDoc(userRef, { [`progress.${progress.topic}`]: progress });
}

function showMcqSummaryBlock(correctCount, totalQuestions, targetBlock) {
  // Persist completion state and score in localStorage
  try {
    const lessonId = window.lessonId || window.location.pathname;
    localStorage.setItem(
      `mcq_quiz_summary_${lessonId}`,
      JSON.stringify({ completed: true, correctCount, totalQuestions })
    );
  } catch (e) { console.warn("Could not persist MCQ summary state:", e); }
  let percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const lastBlock = targetBlock;
  if (!lastBlock) return;
  lastBlock.innerHTML = `
    <div class="mcq-summary-celebration-card" style="position:relative;min-height:260px;max-width:600px;width:96vw;margin:2.5em auto 2.5em auto;background:#232136;border-radius:1.5em;box-shadow:0 6px 32px rgba(53,114,165,0.18);overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2em 2.5em 1.5em 2.5em;">
      <canvas id="mcq-fireworks-canvas" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;"></canvas>
      <div class="mcq-summary-content" style="position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;">
        <div class="score-badge" style="width:3.5em;height:3.5em;background:#FFD43B;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.7em;font-weight:900;color:#232136;box-shadow:0 2px 12px #FFD43B55,0 0 0 #FFD43B33;margin-bottom:1em;animation:pulse 1.2s infinite alternate;">
          <span id="mcq-summary-score">${percent}%</span>
        </div>
        <div class="mcq-summary-title" style="font-size:2em;font-weight:800;color:#ffb300;margin-bottom:0.2em;letter-spacing:0.01em;">Quiz Results</div>
        <div class="mcq-summary-message" id="mcq-summary-message" style="font-size:1.1em;color:#f8fafd;margin-bottom:1.1em;min-height:2.2em;text-align:center;"></div>
        <div class="mcq-summary-stats-row" style="display:flex;justify-content:center;gap:2em;margin-bottom:0.7em;">
          <div class="stat-block" style="background:rgba(53,114,165,0.13);padding:0.7em 1.5em;border-radius:12px;box-shadow:0 2px 8px rgba(53,114,165,0.07);">
            <span class="stat-label" style="color:#ffb300;font-weight:700;">Correct</span><br>
            <span class="stat-value" style="font-size:1.2em;font-weight:800;">${correctCount} / ${totalQuestions}</span>
          </div>
        </div>
        <button class="mcq-refresh-btn mcq-inline-btn" style="margin-top:1.2em;padding:0.7em 2.2em;font-size:1.1em;font-weight:700;border-radius:10px;background:#3572A5;color:#fff;border:none;box-shadow:0 2px 8px #3572A533;transition:background 0.2s;cursor:pointer;">Refresh Quiz</button>
      </div>
    </div>
    <style>
      @keyframes pulse { 0%{transform:scale(1);} 100%{transform:scale(1.07);} }
    </style>
  `;
  // Confetti-style Fireworks effect (single burst, fade out)
  setTimeout(() => { launchFireworks("mcq-fireworks-canvas", 1, true); }, 100);
  // Remove dynamic loading of mcq_summary_celebration.css since styles are now in theme.css
  if (document.getElementById("mcq-summary-celebration-css")) {
    document.getElementById("mcq-summary-celebration-css").remove();
  }
  // Dynamic feedback message
  let message = "";
  if (percent === 100) {
    message = "Perfect Score! Absolutely brilliant work! 🎉";
  } else if (percent >= 90) {
    message = "Outstanding! You aced it! 🌟";
  } else if (percent >= 80) {
    message = "Excellent job! Keep up the great work! 👍";
  } else if (percent >= 70) {
    message = "Good effort! You're on the right track. 😊";
  } else if (percent >= 60) {
    message = "Solid attempt. Review the material to improve! 🤔";
  } else {
    message = "You can do better! Time to hit the books. 📚";
  }
  setTimeout(() => {
    const msgEl = document.getElementById("mcq-summary-message");
    if (msgEl) msgEl.textContent = message;
  }, 800);
  // Attach event listener to Refresh Quiz button (since it's now in the DOM)
  const refreshQuizBtn = lastBlock.querySelector(".mcq-refresh-btn");
  if (refreshQuizBtn) {
    console.log("[MCQ DEBUG] (Summary) Found Refresh Quiz button:", refreshQuizBtn);
    refreshQuizBtn.addEventListener("click", function() {
      console.log("[MCQ DEBUG] (Summary) Refresh Quiz button clicked!");
      // Clear summary state for this topic before reload
      try {
        const lessonId = window.lessonId || window.location.pathname;
        // Try to get topicId from the lastBlock or fallback
        const topicId = lastBlock.dataset.topicId || "unknown_topic";
        localStorage.removeItem(`mcq_quiz_summary_${lessonId}_${topicId}`);
      } catch (e) { console.warn("Could not clear MCQ summary state:", e); }
      window.location.reload();
    });
  } else {
    console.warn("[MCQ DEBUG] (Summary) Refresh Quiz button not found in summary DOM!");
  }
}

// Fireworks animation (confetti-style: single burst, fade/disappear)
function launchFireworks(canvasId, burstMultiplier=1, confettiMode=false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;
  let particles = [];
  function randomColor() {
    const colors = ["#8F00FF","#ffb300","#22c55e","#ef4444","#6366f1","#fff"];
    return colors[Math.floor(Math.random()*colors.length)];
  }
  function createFirework() {
    for(let b=0;b<burstMultiplier;b++){
      const x = Math.random()*W*0.8+W*0.1, y = Math.random()*H*0.4+H*0.2;
      const count = 32+Math.floor(Math.random()*12);
      for(let i=0;i<count;i++){
        const angle = (Math.PI*2/count)*i + Math.random()*0.1;
        const speed = confettiMode ? (2+Math.random()*2.5) : (2+Math.random()*2.5);
        const size = confettiMode ? (2.5+Math.random()*2.5) : 2.7;
        particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color:randomColor(),life:confettiMode?60+Math.random()*30:50+Math.random()*25,size});
      }
    }
  }
  let frame = 0;
  createFirework(); // Only one burst for confetti mode
  function animate() {
    ctx.clearRect(0,0,W,H);
    for(let i=particles.length-1;i>=0;i--){
      let p=particles[i];
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.04; p.life--;
      ctx.globalAlpha = Math.max(p.life/(confettiMode?80:60),0);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,2*Math.PI);
      ctx.fillStyle=p.color; ctx.fill();
      if(p.life<=0) particles.splice(i,1);
    }
    frame++;
    if(particles.length>0 && frame<180) requestAnimationFrame(animate);
  }
  animate();
}

// --- BEGIN: Persistent attempt tracking and per-topic progress ---
// Utility: get topic/lesson id from page (assumes window.lessonId or data-lesson-id on body)
function getLessonId() {
  if (window.lessonId) return window.lessonId;
  const el = document.body;
  return el ? el.dataset.lessonId : "unknown_lesson";
}

// Utility: localStorage key for attempts
function getMcqStorageKey() {
  return `mcq_attempts_${getLessonId()}`;
}

// --- END: Persistent attempt tracking and per-topic progress ---

document.addEventListener("DOMContentLoaded", function () {
  // --- Always clear MCQ quiz progress on page load (for dev/testing) ---
  try {
    const lessonId = window.lessonId || window.location.pathname;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`mcq_attempts_${lessonId}`)) {
        keysToRemove.push(key);
      }
      if (key && key.startsWith(`mcq_quiz_summary_${lessonId}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
      console.log("[MCQ DEBUG] Cleared MCQ quiz progress on reload:", keysToRemove);
    }
  } catch (e) { console.warn("[MCQ DEBUG] Could not clear MCQ quiz progress on reload:", e); }

  // Remove debug border and zIndex from MCQ blocks
  const mcqBlocks = Array.from(document.querySelectorAll(".block-multiple-choice"));
  mcqBlocks.forEach((block) => {
    block.style.border = "";
    block.style.zIndex = "";
  });

  // DEBUG: Check for MCQ blocks in DOM
  if (mcqBlocks.length === 0) {
    console.warn("[MCQ DEBUG] No .block-multiple-choice elements found in DOM!");
  } else {
    console.log("[MCQ DEBUG] Found .block-multiple-choice elements:", mcqBlocks);
  }

  // Group MCQ blocks by topic
  const topicGroups = {};
  mcqBlocks.forEach(block => {
    const topicId = block.dataset.topicId || "unknown_topic";
    if (!topicGroups[topicId]) topicGroups[topicId] = [];
    topicGroups[topicId].push(block);
  });
  console.log("[MCQ DEBUG] Topic groups:", Object.keys(topicGroups));

  // --- Restore MCQ summary if quiz was completed previously, per topic ---
  Object.entries(topicGroups).forEach(([topicId, blocks]) => {
    const lessonId = window.lessonId || window.location.pathname;
    const summaryKey = `mcq_quiz_summary_${lessonId}_${topicId}`;
    try {
      const summaryState = JSON.parse(localStorage.getItem(summaryKey));
      if (summaryState && summaryState.completed && typeof summaryState.correctCount === "number" && typeof summaryState.totalQuestions === "number") {
        // Only restore if all blocks in this topic are present
        if (blocks.length === summaryState.totalQuestions && blocks.length > 0) {
          const lastBlock = blocks[blocks.length - 1];
          showMcqSummaryBlock(summaryState.correctCount, summaryState.totalQuestions, lastBlock);
          // Hide all previous MCQ blocks in this topic
          blocks.slice(0, -1).forEach(b => b.style.display = "none");
          return; // Do not re-initialize quiz logic for this topic
        }
      }
    } catch (e) { /* ignore */ }
    // --- Initialize MCQ logic for this topic ---
    let totalQuestions = blocks.length;
    let answeredCount = 0;
    let correctCount = 0;
    let userAnswers = [];
    // Track attempts per topic
    blocks.forEach((block, blockIdx) => {
      // Use a unique blockId per topic and index if not provided
      const blockId = block.dataset.blockId || `${topicId}_block_${blockIdx}`;
      const buttons = block.querySelectorAll(".mcq-option-btn");
      const feedback = block.querySelector(".mcq-feedback");
      let answered = false;
      // Get correct answer index from data-correct-idx attribute
      const optionsGrid = block.querySelector(".mcq-options-grid");
      let correctIdx = null;
      if (optionsGrid && optionsGrid.dataset.correctIdx !== undefined) {
        correctIdx = parseInt(optionsGrid.dataset.correctIdx, 10);
      }
      // --- Prevent multiple attempts ---
      const prevAttempt = loadAttempt(blockId);
      console.log("[MCQ DEBUG] [Init] Checking localStorage for blockId:", blockId, "Key:", getAttemptKey(blockId), "Found:", prevAttempt);
      if (prevAttempt) {
        answered = true;
        answeredCount++;
        if (prevAttempt.isCorrect) correctCount++;
        // Mark UI as answered
        buttons.forEach((btn, idx) => {
          // DEBUG: Log button being styled (restore)
          console.log("[MCQ DEBUG] Styling MCQ option button (restore)", { blockIdx, blockId, btn, idx });
          btn.disabled = true;
          btn.classList.remove("mcq-correct", "mcq-incorrect");
          if (idx === prevAttempt.selectedIdx) {
            if (prevAttempt.isCorrect) {
              btn.classList.add("mcq-correct");
              setBtnColor(btn, MCQ_GREEN);
            } else {
              btn.classList.add("mcq-incorrect");
              setBtnColor(btn, MCQ_RED);
            }
          } else if (idx === correctIdx && !prevAttempt.isCorrect) {
            btn.classList.add("mcq-correct");
            setBtnColor(btn, MCQ_GREEN);
          } else {
            setBtnColor(btn, MCQ_BLUE);
          }
        });
        if (feedback) {
          feedback.textContent = prevAttempt.isCorrect ? "Correct!" : "Incorrect.";
          feedback.className = "mcq-feedback " + (prevAttempt.isCorrect ? "correct" : "incorrect");
          feedback.style.display = "block";
        }
        userAnswers[blockIdx] = prevAttempt;
        // DEBUG: Log restored previous attempt
        console.log("[MCQ DEBUG] [Topic:", topicId, "] Restored previous attempt", { blockIdx, blockId, prevAttempt, answeredCount, correctCount });
        return;
      } else {
        // Reset all buttons to default state (not selected, enabled)
        buttons.forEach((btn) => {
          // DEBUG: Log button being reset (init)
          console.log("[MCQ DEBUG] Resetting MCQ option button (init)", { blockIdx, blockId, btn });
          btn.disabled = false;
          btn.classList.remove("mcq-correct", "mcq-incorrect");
          setBtnColor(btn, MCQ_BLUE);
        });
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "mcq-feedback";
          feedback.style.display = "none";
        }
      }
      // --- End prevent multiple attempts ---
      buttons.forEach((btn, idx) => {
        // DEBUG: Log event listener attachment
        console.log("[MCQ DEBUG] Attaching click event to MCQ option button", { blockIdx, blockId, btn, idx });
        btn.addEventListener("click", function (event) {
          console.log("[MCQ DEBUG] Button clicked!", { blockIdx, blockId, idx, btn, disabled: btn.disabled, pointerEvents: getComputedStyle(btn).pointerEvents });
          if (answered) {
            console.log("[MCQ DEBUG] Button click ignored: already answered", { blockIdx, blockId, idx });
            return;
          }
          // Check for overlays or parent pointer-events:none
          let el = btn;
          let overlayFound = false;
          while (el && el !== document.body) {
            const style = getComputedStyle(el);
            if (style.pointerEvents === "none" || style.visibility === "hidden" || style.display === "none") {
              overlayFound = true;
              console.warn("[MCQ DEBUG] Overlay or pointer-events:none detected on ancestor", { el, style });
            }
            el = el.parentElement;
          }
          answered = true;
          answeredCount++;
          // Disable all buttons
          buttons.forEach(b => {
            b.disabled = true;
            b.classList.remove("mcq-correct", "mcq-incorrect");
            setBtnColor(b, MCQ_BLUE);
          });
          // Mark selected and correct/incorrect
          if (idx === correctIdx) {
            btn.classList.add("mcq-correct");
            setBtnColor(btn, MCQ_GREEN);
            if (feedback) {
              feedback.textContent = "Correct!";
              feedback.className = "mcq-feedback correct";
              feedback.style.display = "block";
            }
            correctCount++;
            awardByteToUser();
          } else {
            btn.classList.add("mcq-incorrect");
            setBtnColor(btn, MCQ_RED);
            if (feedback) {
              feedback.textContent = "Incorrect.";
              feedback.className = "mcq-feedback incorrect";
              feedback.style.display = "block";
            }
          }
          // Save attempt to localStorage
          saveAttempt(blockId, idx, idx === correctIdx);
          userAnswers[blockIdx] = { selectedIdx: idx, isCorrect: idx === correctIdx };
          // Hide all blocks after this one in the topic
          blocks.forEach((b, i) => {
            if (i > blockIdx) b.style.display = "none";
          });
          // Show summary if last question in topic
          if (blockIdx === totalQuestions - 1) {
            setTimeout(() => {
              // Save summary state per topic
              try {
                localStorage.setItem(
                  `mcq_quiz_summary_${lessonId}_${topicId}`,
                  JSON.stringify({ completed: true, correctCount, totalQuestions })
                );
              } catch (e) { console.warn("Could not persist MCQ summary state:", e); }
              showMcqSummaryBlock(correctCount, totalQuestions, block);
              // Save per-topic progress to Firebase
              saveProgressToFirebase({
                topic: topicId,
                correct: correctCount,
                total: totalQuestions,
                timestamp: Date.now(),
              });
            }, 1500);
          } else {
            // Otherwise, show next unanswered block in topic
            const nextBlock = blocks.slice(blockIdx + 1).find(b => {
              const btns = b.querySelectorAll(".mcq-option-btn");
              return !btns[0].disabled;
            });
            if (nextBlock) {
              setTimeout(() => {
                nextBlock.scrollIntoView({ behavior: "smooth" });
                nextBlock.style.display = "";
              }, 1500);
            }
          }
        });
      });
    });
  });
});

// Minimal Fill-in-the-Blank Quiz Logic
// Only supports fill-in-the-blank questions for clarity and maintainability

window.quizMinimalInit = function() {
  // Hide modal content while loading
  const modalContent = document.getElementById("quiz-modal-content");
  if (modalContent) modalContent.style.visibility = "hidden";

  const quizBlocks = document.querySelectorAll(".block-fill-in-blank-minimal");
  const progressFill = document.querySelector(".quiz-progress-bar-fill");
  const summarySection = document.querySelector(".quiz-summary");
  const summaryTable = summarySection?.querySelector("tbody");
  let currentStep = 0;
  let userAnswers = [];

  // Show the first question
  quizBlocks.forEach((c, i) => c.style.display = (i === 0 ? "" : "none"));

  // Ensure main button is always in the right place
  let btnContainer = document.getElementById("quiz-main-btn-container");
  if (!btnContainer) {
    btnContainer = document.createElement("div");
    btnContainer.id = "quiz-main-btn-container";
    btnContainer.style.textAlign = "center";
    btnContainer.style.marginTop = "1.5em";
    document.body.appendChild(btnContainer);
  }

  let mainBtn = document.getElementById("quiz-main-btn");
  if (!mainBtn) {
    mainBtn = document.createElement("button");
    mainBtn.id = "quiz-main-btn";
    mainBtn.className = "quiz-main-btn";
    mainBtn.textContent = "Submit";
    mainBtn.disabled = true;
    btnContainer.appendChild(mainBtn);
  } else if (mainBtn.parentNode !== btnContainer) {
    btnContainer.appendChild(mainBtn);
  }
  mainBtn.style.display = "";

  function showStep(idx) {
    quizBlocks.forEach((c, i) => c.style.display = (i === idx ? "" : "none"));
    if (progressFill) progressFill.style.width = ((idx+1) / quizBlocks.length * 100) + "%";
    currentStep = idx;
    const block = quizBlocks[idx];
    const fillInput = block.querySelector(".fill-blank-input-minimal");
    const feedback = block.querySelector(".quiz-feedback");
    if (fillInput) {
      fillInput.value = "";
      fillInput.classList.remove("correct", "incorrect");
      fillInput.removeAttribute("disabled");
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "quiz-feedback";
        feedback.style.display = "none";
      }
      mainBtn.textContent = "Submit";
      mainBtn.disabled = true;
      fillInput.focus();
    }
  }

  function showSummary() {
    quizBlocks.forEach(c => c.style.display = "none");
    mcqBlocks.forEach(c => c.style.display = "none");
    summarySection.style.display = "";
    summaryTable.innerHTML = "";
    let correctCount = 0;
    // Fill-in-the-blank answers
    quizBlocks.forEach((block, idx) => {
      const qText = block.querySelector(".fill-blank-question")?.textContent || "Question";
      const userAns = userAnswers[idx]?.userText || "-";
      const correctAns = userAnswers[idx]?.correctText || "-";
      const isCorrect = userAnswers[idx]?.isCorrect;
      if (isCorrect) correctCount++;
      const row = document.createElement("tr");
      row.innerHTML = `<td>${qText}</td><td>${userAns}</td><td>${correctAns}</td><td>${isCorrect ? "\u2714\ufe0f" : "\u274c"}</td>`;
      summaryTable.appendChild(row);
    });
    // MCQ answers
    mcqBlocks.forEach((block, idx) => {
      const qText = block.querySelector(".mcq-question")?.textContent || "Question";
      const userAns = userAnswers[quizBlocks.length + idx]?.userText || "-";
      const correctAns = userAnswers[quizBlocks.length + idx]?.correctText || "-";
      const isCorrect = userAnswers[quizBlocks.length + idx]?.isCorrect;
      if (isCorrect) correctCount++;
      const row = document.createElement("tr");
      row.innerHTML = `<td>${qText}</td><td>${userAns}</td><td>${correctAns}</td><td>${isCorrect ? "\u2714\ufe0f" : "\u274c"}</td>`;
      summaryTable.appendChild(row);
    });
    const total = quizBlocks.length + mcqBlocks.length;
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    summarySection.insertAdjacentHTML("afterbegin",
      `<div class='quiz-final-score' style='font-size:1.3em;margin-bottom:0.2em;'>Score: <b>${correctCount} / ${total}</b> (${percent}%)</div>`
    );
    mainBtn.style.display = "none";
    // Add a close button to summary
    let closeBtn = document.getElementById("quiz-summary-close-btn");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.id = "quiz-summary-close-btn";
      closeBtn.className = "quiz-main-btn";
      closeBtn.textContent = "Close";
      closeBtn.style.marginTop = "2em";
      summarySection.appendChild(closeBtn);
      closeBtn.onclick = function() {
        summarySection.style.display = "none";
        btnContainer.style.display = "none";
        if (modalContent) modalContent.style.visibility = "hidden";
        // Hide the modal overlay as well
        const overlay = document.getElementById("quiz-modal-overlay");
        if (overlay) overlay.style.display = "none";
      };
    } else {
      closeBtn.style.display = "";
    }
  }

  mainBtn.onclick = function() {
    const idx = currentStep;
    const block = quizBlocks[idx];
    const fillInput = block.querySelector(".fill-blank-input-minimal");
    const feedback = block.querySelector(".quiz-feedback");
    if (mainBtn.textContent === "Submit") {
      const answersAttr = fillInput.getAttribute("data-answers") || "";
      let correctText = "";
      if (answersAttr) {
        correctText = answersAttr.split(",")[0];
      } else if (fillInput.getAttribute("data-answer")) {
        correctText = fillInput.getAttribute("data-answer");
      } else if (fillInput.placeholder) {
        correctText = fillInput.placeholder;
      } else {
        correctText = "";
      }
      const userText = fillInput.value.trim();
      const isCorrect = userText.toLowerCase() === correctText.toLowerCase();
      if (feedback) {
        feedback.textContent = isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${correctText}`;
        feedback.className = "quiz-feedback " + (isCorrect ? "correct" : "incorrect");
        feedback.style.display = "block";
      }
      fillInput.classList.add(isCorrect ? "correct" : "incorrect");
      fillInput.setAttribute("disabled", "disabled");
      userAnswers[idx] = { userText, correctText, isCorrect };
      mainBtn.textContent = (idx < quizBlocks.length-1) ? "Next" : "Finish";
      mainBtn.disabled = false;
    } else if (mainBtn.textContent === "Next") {
      showStep(idx+1);
    } else if (mainBtn.textContent === "Finish") {
      showSummary();
    }
  };

  // Enable/disable button based on input
  quizBlocks.forEach((block, idx) => {
    const fillInput = block.querySelector(".fill-blank-input-minimal");
    if (fillInput) {
      fillInput.addEventListener("input", function() {
        mainBtn.disabled = fillInput.value.trim().length === 0;
      });
      // Enter key logic: Only allow submit, not next/finish
      fillInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          console.log("Button text:", mainBtn.textContent);
          if (!mainBtn.disabled) {
            if (mainBtn.textContent === "Submit") {
              e.preventDefault();
              mainBtn.click(); // Show feedback only
            } else if (mainBtn.textContent === "Next" || mainBtn.textContent === "Finish") {
              e.preventDefault();
              mainBtn.click(); // Advance only after feedback is shown
            }
          }
        }
      });
    }
  });

  // Hide summary at start
  if (summarySection) summarySection.style.display = "none";

  // Show modal content after quiz is ready
  if (modalContent) modalContent.style.visibility = "visible";
  btnContainer.style.display = "";

  // --- Multiple Choice Quiz Logic ---
  const mcqBlocks = document.querySelectorAll(".block-multiple-choice-minimal");
  // Hide main button if only MCQ blocks are present
  if (mcqBlocks.length > 0 && quizBlocks.length === 0 && mainBtn) {
    mainBtn.style.display = "none";
    btnContainer.style.display = "none";
    // Show the first MCQ block
    mcqBlocks.forEach((c, i) => c.style.display = (i === 0 ? "" : "none"));
  }
  mcqBlocks.forEach((block, idx) => {
    const options = block.querySelectorAll(".mcq-option-btn-minimal");
    const feedback = block.querySelector(".quiz-feedback");
    let answered = false;
    options.forEach((btn, i) => {
      btn.addEventListener("click", function() {
        if (answered) return;
        answered = true;
        // Find correct index
        let correctIdx = -1;
        options.forEach((b, j) => {
          if (b.classList.contains("correct-answer")) correctIdx = j;
        });
        // Mark all options
        options.forEach((b, j) => {
          b.disabled = true;
          if (j === correctIdx) {
            b.classList.add("mcq-correct");
          }
        });
        let isCorrect = false;
        if (i === correctIdx) {
          btn.classList.add("mcq-correct");
          isCorrect = true;
          if (feedback) {
            feedback.textContent = "Correct!";
            feedback.className = "quiz-feedback correct";
            feedback.style.display = "block";
          }
          launchConfetti();
        } else {
          btn.classList.add("mcq-incorrect");
          options[correctIdx].classList.add("mcq-correct");
          if (feedback) {
            feedback.textContent = "Incorrect. The correct answer is: " + options[correctIdx].textContent;
            feedback.className = "quiz-feedback incorrect";
            feedback.style.display = "block";
          }
        }
        // Save answer for summary
        userAnswers[quizBlocks.length + idx] = {
          userText: btn.textContent,
          correctText: options[correctIdx].textContent,
          isCorrect: isCorrect
        };
        // Auto-advance after 1.5s
        setTimeout(() => {
          // Hide this block, show next
          block.style.display = "none";
          if (idx < mcqBlocks.length - 1) {
            mcqBlocks[idx + 1].style.display = "";
          } else {
            // If last, show summary if present
            if (summarySection) showSummary();
          }
        }, 1500);
      });
    });
  });

  // Confetti effect helper
  function launchConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.quizMinimalInit);
} else {
  window.quizMinimalInit();
}

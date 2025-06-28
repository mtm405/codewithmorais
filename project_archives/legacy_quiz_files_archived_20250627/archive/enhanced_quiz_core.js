/**
 * Enhanced Quiz Core JavaScript - Comprehensive support for all quiz block types
 * Handles MCQ, Fill-in-the-blank, Drag-and-drop, Quiz sections, and Comprehensive quizzes
 * With full accessibility, keyboard navigation, and Firebase integration
 */

import { submitQuizResult, purchaseHint } from "./api.js";

// === GRADING FUNCTIONS ===
function gradeMCQ(selectedIdx, correctIdx) {
  return selectedIdx === correctIdx;
}

function gradeFillInTheBlank(userAnswer, correctAnswers) {
  if (!Array.isArray(correctAnswers)) {
    correctAnswers = [correctAnswers];
  }
  return correctAnswers.some(ans => 
    String(ans).trim().toLowerCase() === String(userAnswer).trim().toLowerCase()
  );
}

function gradeDragAndDrop(userMapping, correctMapping) {
  if (!userMapping || !correctMapping) return false;
  
  // Check if all items are correctly mapped
  for (const [stem, expectedItem] of Object.entries(correctMapping)) {
    if (userMapping[stem] !== expectedItem) {
      return false;
    }
  }
  return true;
}

function gradeCode(userOutput, expectedOutput) {
  return String(userOutput).trim() === String(expectedOutput).trim();
}

function gradeDebug(userCode, testCases, runCodeFn) {
  try {
    return runCodeFn(userCode, testCases);
  } catch (error) {
    console.error("Debug grading error:", error);
    return false;
  }
}

// === FEEDBACK FUNCTIONS ===
function showFeedback(element, isCorrect, customMessage = "") {
  if (!element) return;
  
  element.classList.remove("display-none");
  element.textContent = customMessage || (isCorrect ? "Correct!" : "Try again.");
  element.classList.toggle("correct", isCorrect);
  element.classList.toggle("incorrect", !isCorrect);
  
  // Announce to screen readers
  announceFeedback(element, isCorrect);
}

function announceFeedback(element, isCorrect) {
  if (element) {
    element.setAttribute("aria-live", "polite");
    
    // Optional speech synthesis for audio feedback
    if (window.speechSynthesis && !window.speechSynthesis.speaking) {
      const msg = new SpeechSynthesisUtterance(
        isCorrect ? "Correct answer!" : "Incorrect answer, try again."
      );
      msg.volume = 0.3;
      window.speechSynthesis.speak(msg);
    }
  }
}

// === CURRENCY AND POINTS FUNCTIONS ===
function updateUserCurrency(newAmount) {
  const currencyElements = document.querySelectorAll(".user-currency-display");
  currencyElements.forEach(el => {
    el.textContent = newAmount;
  });
}

function updateUserPoints(newAmount) {
  const pointsElement = document.getElementById("user-points-display");
  if (pointsElement) {
    pointsElement.textContent = newAmount;
  }
}

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
    })
    .catch(err => console.error("Failed to update progress:", err));
}

// === MAIN QUIZ HANDLER ===
async function handleQuizSubmit({
  questionId,
  type,
  userInput,
  correctAnswer,
  points = 1,
  currency = 1,
  feedbackElement,
  mode = "inline",
  extra = {}
}) {
  let isCorrect = false;
  const answerForBackend = userInput;

  // Grading logic by type
  switch (type) {
    case "multiple_choice":
    case "multiple_choice_quiz":
      isCorrect = gradeMCQ(userInput, correctAnswer);
      break;
    case "fill_in_the_blank":
    case "fill_in_the_blanks":
      isCorrect = gradeFillInTheBlank(userInput, correctAnswer);
      break;
    case "drag_and_drop":
      isCorrect = gradeDragAndDrop(userInput, correctAnswer);
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
      console.warn(`Unknown quiz type: ${type}`);
      isCorrect = false;
  }

  // Show feedback
  if (feedbackElement) {
    const message = isCorrect ? 
      `Correct! +${points} points` : 
      `Incorrect. Try again.`;
    showFeedback(feedbackElement, isCorrect, message);
  }

  // Send result to backend
  try {
    const backendRes = await submitQuizResult({
      questionId,
      isCorrect,
      points: isCorrect ? points : 0,
      currency: isCorrect ? currency : 0,
      answer: answerForBackend
    });

    if (backendRes.success && isCorrect) {
      if (backendRes.new_points) {
        updateUserPoints(backendRes.new_points);
      }
      if (backendRes.new_currency) {
        updateUserCurrency(backendRes.new_currency);
      }
    }

    // Update dashboard progress
    updateDashboardProgress();

    return { isCorrect, backendRes };
  } catch (error) {
    console.error("Failed to submit quiz result:", error);
    return { isCorrect, backendRes: { success: false, error: error.message } };
  }
}

// === MULTIPLE CHOICE HANDLERS ===
function initializeMultipleChoice() {
  document.querySelectorAll(".mcq-container").forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";

    const options = container.querySelectorAll(".mcq-option-btn");
    const feedbackElement = container.querySelector(".mcq-feedback");
    const blockId = container.dataset.blockId;
    const correctIndex = parseInt(container.dataset.correctIndex, 10);
    const points = parseInt(container.dataset.points, 10) || 1;

    options.forEach((option, index) => {
      option.addEventListener("click", async () => {
        // Deselect all options
        options.forEach(opt => {
          opt.setAttribute("aria-pressed", "false");
          opt.classList.remove("selected");
        });

        // Select this option
        option.setAttribute("aria-pressed", "true");
        option.classList.add("selected");

        // Submit answer
        const result = await handleQuizSubmit({
          questionId: blockId,
          type: "multiple_choice",
          userInput: index,
          correctAnswer: correctIndex,
          points: points,
          feedbackElement: feedbackElement
        });

        // Show correct/incorrect styling
        if (result.isCorrect) {
          option.classList.add("correct");
        } else {
          option.classList.add("incorrect");
          // Show correct answer
          const correctOption = options[correctIndex];
          if (correctOption) {
            correctOption.classList.add("correct");
          }
        }

        // Disable all options after answer
        options.forEach(opt => opt.disabled = true);

        // Show explanation if available
        const explanation = container.querySelector(".mcq-explanation");
        if (explanation) {
          explanation.classList.remove("display-none");
        }

        // Emit custom event for quiz sections
        container.dispatchEvent(new CustomEvent("quizAnswered", {
          detail: { isCorrect: result.isCorrect, questionId: blockId }
        }));
      });

      // Keyboard navigation
      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          option.click();
        }
      });
    });
  });
}

// === FILL IN THE BLANK HANDLERS ===
function initializeFillInTheBlank() {
  document.querySelectorAll(".fitb-container").forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";

    const input = container.querySelector(".fitb-input");
    const submitBtn = container.querySelector(".fitb-submit-btn");
    const feedbackElement = container.querySelector(".fitb-feedback");
    const blockId = container.dataset.blockId;
    const correctAnswers = container.dataset.answers ? 
      container.dataset.answers.split(",") : [];
    const points = parseInt(container.dataset.points, 10) || 1;

    async function submitAnswer() {
      const userAnswer = input.value.trim();
      if (!userAnswer) return;

      submitBtn.disabled = true;
      input.disabled = true;

      const result = await handleQuizSubmit({
        questionId: blockId,
        type: "fill_in_the_blank",
        userInput: userAnswer,
        correctAnswer: correctAnswers,
        points: points,
        feedbackElement: feedbackElement
      });

      // Style input based on result
      input.classList.add(result.isCorrect ? "correct" : "incorrect");

      // Show explanation if available
      const explanation = container.querySelector(".fitb-explanation");
      if (explanation) {
        explanation.classList.remove("display-none");
      }

      // Emit custom event for quiz sections
      container.dispatchEvent(new CustomEvent("quizAnswered", {
        detail: { isCorrect: result.isCorrect, questionId: blockId }
      }));
    }

    submitBtn.addEventListener("click", submitAnswer);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    });
  });
}

// === DRAG AND DROP HANDLERS ===
function initializeDragAndDrop() {
  document.querySelectorAll(".dnd-container").forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";

    const dragItems = container.querySelectorAll(".drag-item");
    const dropZones = container.querySelectorAll(".drop-zone");
    const itemBank = container.querySelector(".drag-item-bank");
    const resetBtn = container.querySelector(".dnd-reset-button");
    const checkBtn = container.querySelector(".dnd-check-button");
    const feedbackElement = container.querySelector(".dnd-feedback");
    const blockId = container.dataset.blockId;
    const points = parseInt(container.dataset.points, 10) || 1;

    let selectedItem = null;

    // Initialize drag and drop
    dragItems.forEach(item => {
      // Mouse drag events
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
        item.classList.add("dragging");
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
      });

      // Keyboard events
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (selectedItem === item) {
            // Deselect
            selectedItem = null;
            item.classList.remove("selected");
            item.setAttribute("aria-grabbed", "false");
          } else {
            // Select this item
            if (selectedItem) {
              selectedItem.classList.remove("selected");
              selectedItem.setAttribute("aria-grabbed", "false");
            }
            selectedItem = item;
            item.classList.add("selected");
            item.setAttribute("aria-grabbed", "true");
          }
        } else if (e.key === "Escape") {
          if (selectedItem) {
            selectedItem.classList.remove("selected");
            selectedItem.setAttribute("aria-grabbed", "false");
            selectedItem = null;
          }
        }
      });
    });

    // Drop zone events
    dropZones.forEach(zone => {
      // Mouse drop events
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("drag-over");
      });

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-over");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");

        const draggedId = e.dataTransfer.getData("text/plain");
        const draggedItem = document.getElementById(draggedId);

        if (draggedItem && zone.children.length === 1) { // Only placeholder
          zone.appendChild(draggedItem);
        }
      });

      // Keyboard events
      zone.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && selectedItem) {
          e.preventDefault();
          if (zone.children.length === 1) { // Only placeholder
            zone.appendChild(selectedItem);
            selectedItem.classList.remove("selected");
            selectedItem.setAttribute("aria-grabbed", "false");
            selectedItem = null;
          }
        }
      });
    });

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        dropZones.forEach(zone => {
          const item = zone.querySelector(".drag-item");
          if (item) {
            itemBank.appendChild(item);
          }
          zone.classList.remove("correct", "incorrect");
        });
        
        if (feedbackElement) {
          feedbackElement.classList.add("display-none");
        }
      });
    }

    // Check answers button
    if (checkBtn) {
      checkBtn.addEventListener("click", async () => {
        const userMapping = {};
        
        dropZones.forEach(zone => {
          const zoneLabel = zone.dataset.zoneLabel;
          const droppedItem = zone.querySelector(".drag-item");
          if (droppedItem) {
            userMapping[zoneLabel] = droppedItem.dataset.itemText;
          }
        });

        // Get correct mapping from data
        const correctMapping = {};
        dropZones.forEach(zone => {
          const zoneLabel = zone.dataset.zoneLabel;
          const correctItem = zone.dataset.correctItem;
          if (correctItem) {
            correctMapping[zoneLabel] = correctItem;
          }
        });

        const result = await handleQuizSubmit({
          questionId: blockId,
          type: "drag_and_drop",
          userInput: userMapping,
          correctAnswer: correctMapping,
          points: points,
          feedbackElement: feedbackElement
        });

        // Show visual feedback on drop zones
        dropZones.forEach(zone => {
          const zoneLabel = zone.dataset.zoneLabel;
          const droppedItem = zone.querySelector(".drag-item");
          const correctItem = zone.dataset.correctItem;
          
          if (droppedItem) {
            const isZoneCorrect = droppedItem.dataset.itemText === correctItem;
            zone.classList.add(isZoneCorrect ? "correct" : "incorrect");
          }
        });

        checkBtn.disabled = true;

        // Show explanation if available
        const explanation = container.querySelector(".dnd-explanation");
        if (explanation) {
          explanation.classList.remove("display-none");
        }

        // Emit custom event for quiz sections
        container.dispatchEvent(new CustomEvent("quizAnswered", {
          detail: { isCorrect: result.isCorrect, questionId: blockId }
        }));
      });
    }
  });
}

// === HINT SYSTEM ===
function initializeHints() {
  document.querySelectorAll(".btn-hint").forEach(button => {
    button.addEventListener("click", async (e) => {
      const blockId = e.target.dataset.blockId;
      const hintCost = parseInt(e.target.dataset.hintCost, 10);
      const hintContainer = document.getElementById(`hint-${blockId}`);

      if (!hintContainer) return;

      e.target.disabled = true;
      e.target.textContent = "Unlocking...";

      try {
        const result = await purchaseHint(blockId, hintCost);

        if (result.success) {
          hintContainer.innerHTML = result.hint;
          hintContainer.classList.remove("display-none");
          e.target.classList.add("display-none");
          updateUserCurrency(result.new_currency);
        } else {
          alert(result.error || "Could not purchase hint.");
          e.target.disabled = false;
          e.target.textContent = `Show Hint (${hintCost} Coins)`;
        }
      } catch (error) {
        console.error("Hint purchase error:", error);
        alert("Error purchasing hint. Please try again.");
        e.target.disabled = false;
        e.target.textContent = `Show Hint (${hintCost} Coins)`;
      }
    });
  });
}

// === COMPREHENSIVE QUIZ HANDLERS ===
function initializeComprehensiveQuiz() {
  document.querySelectorAll(".comprehensive-quiz-container").forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";

    const questions = Array.from(container.querySelectorAll(".question-wrapper"));
    const progressFill = container.querySelector(".quiz-progress-fill");
    const currentQuestionSpan = container.querySelector(".current-question");
    const prevBtn = container.querySelector(".prev-question-btn");
    const nextBtn = container.querySelector(".next-question-btn");
    const submitBtn = container.querySelector(".submit-quiz-btn");
    const summaryView = container.querySelector(".quiz-summary-view");
    const finalScore = summaryView?.querySelector(".final-score");
    const retakeBtn = container.querySelector(".retake-quiz-btn");

    let currentQuestionIndex = 0;
    let answers = [];
    let score = 0;

    function updateProgress() {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
      if (progressFill) {
        progressFill.style.width = progress + "%";
      }
      if (currentQuestionSpan) {
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
      }
    }

    function showQuestion(index) {
      questions.forEach((q, i) => {
        q.classList.toggle("d-none", i !== index);
      });

      if (prevBtn) {
        prevBtn.classList.toggle("d-none", index === 0);
      }
      if (nextBtn) {
        nextBtn.classList.toggle("d-none", index === questions.length - 1);
      }
      if (submitBtn) {
        submitBtn.classList.toggle("d-none", index !== questions.length - 1);
      }

      updateProgress();
    }

    function showSummary() {
      container.querySelector(".quiz-header")?.classList.add("d-none");
      container.querySelector(".quiz-body")?.classList.add("d-none");
      container.querySelector(".quiz-footer")?.classList.add("d-none");
      summaryView?.classList.remove("d-none");

      const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      
      if (finalScore) {
        finalScore.innerHTML = `${score} out of ${questions.length} (${percentage}%)`;
      }

      // Update stats
      const correctCount = container.querySelector(".correct-count");
      const incorrectCount = container.querySelector(".incorrect-count");
      const percentageSpan = container.querySelector(".percentage");

      if (correctCount) correctCount.textContent = score;
      if (incorrectCount) incorrectCount.textContent = questions.length - score;
      if (percentageSpan) percentageSpan.textContent = percentage + "%";
    }

    function resetQuiz() {
      currentQuestionIndex = 0;
      score = 0;
      answers = [];

      container.querySelector(".quiz-header")?.classList.remove("d-none");
      container.querySelector(".quiz-body")?.classList.remove("d-none");
      container.querySelector(".quiz-footer")?.classList.remove("d-none");
      summaryView?.classList.add("d-none");

      // Reset all questions
      questions.forEach(q => {
        q.querySelectorAll("button, input").forEach(el => {
          el.disabled = false;
          el.classList.remove("selected", "correct", "incorrect");
        });

        const inputs = q.querySelectorAll("input[type='text']");
        inputs.forEach(input => {
          input.value = "";
          input.classList.remove("correct", "incorrect");
        });

        // Reset drag and drop
        if (q.dataset.questionType === "drag_and_drop") {
          const bank = q.querySelector(".drag-item-bank");
          const items = q.querySelectorAll(".drop-zone .drag-item");
          items.forEach(item => {
            if (bank) bank.appendChild(item);
          });
          
          q.querySelectorAll(".drop-zone").forEach(zone => {
            zone.classList.remove("correct", "incorrect");
          });
        }
      });

      showQuestion(0);
    }

    // Navigation event listeners
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          showQuestion(currentQuestionIndex);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          showQuestion(currentQuestionIndex);
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", showSummary);
    }

    if (retakeBtn) {
      retakeBtn.addEventListener("click", resetQuiz);
    }

    // Listen for question answers
    container.addEventListener("quizAnswered", (event) => {
      const { isCorrect, questionId } = event.detail;
      
      // Update or add answer
      const existingIndex = answers.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        if (answers[existingIndex].isCorrect && !isCorrect) {
          score--;
        } else if (!answers[existingIndex].isCorrect && isCorrect) {
          score++;
        }
        answers[existingIndex].isCorrect = isCorrect;
      } else {
        answers.push({ questionId, isCorrect });
        if (isCorrect) score++;
      }

      // Auto-advance after delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          showQuestion(currentQuestionIndex);
        }
      }, 1500);
    });

    // Initialize
    showQuestion(0);
  });
}

// === INITIALIZATION ===
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all quiz types
  initializeMultipleChoice();
  initializeFillInTheBlank();
  initializeDragAndDrop();
  initializeHints();
  initializeComprehensiveQuiz();

  // Make functions available globally for backwards compatibility
  window.gradeMCQ = gradeMCQ;
  window.gradeFillInTheBlank = gradeFillInTheBlank;
  window.gradeDragAndDrop = gradeDragAndDrop;
  window.gradeCode = gradeCode;
  window.gradeDebug = gradeDebug;
  window.showFeedback = showFeedback;
  window.announceFeedback = announceFeedback;
  window.updateUserCurrency = updateUserCurrency;
  window.updateUserPoints = updateUserPoints;
  window.updateDashboardProgress = updateDashboardProgress;
  window.handleQuizSubmit = handleQuizSubmit;
});

// Export functions for module usage
export {
  gradeMCQ,
  gradeFillInTheBlank,
  gradeDragAndDrop,
  gradeCode,
  gradeDebug,
  showFeedback,
  announceFeedback,
  updateUserCurrency,
  updateUserPoints,
  updateDashboardProgress,
  handleQuizSubmit
};

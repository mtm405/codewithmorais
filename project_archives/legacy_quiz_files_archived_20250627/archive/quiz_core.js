import { submitQuizResult, purchaseHint } from "./api.js";

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

function showFeedback(element, isCorrect, feedback = "") {
  element.classList.remove("display-none");
  element.textContent = isCorrect ? (feedback || "Correct!") : (feedback || "Try again.");
  element.classList.toggle("correct", isCorrect);
  element.classList.toggle("incorrect", !isCorrect);
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

// Modular grading for drag-and-drop (expects arrays of indices or ids)
function gradeDragAndDrop(userOrder, correctOrder) {
  if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) return false;
  if (userOrder.length !== correctOrder.length) return false;
  return userOrder.every((val, idx) => val === correctOrder[idx]);
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
    const pointsElement = document.getElementById("user-points-display");
    if (pointsElement) {
        pointsElement.textContent = newAmount;
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

  // Grading logic by type
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
      isCorrect = false;
  }

  // Show feedback
  if (feedbackElement) {
    showFeedback(feedbackElement, isCorrect, `Correct! +${points} points`);
    announceFeedback(feedbackElement, isCorrect);
  } else if (feedbackElement) {
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

  return { isCorrect, backendRes };
}
window.handleQuizSubmit = handleQuizSubmit;



document.addEventListener("DOMContentLoaded", () => {
    // Event listener for multiple choice questions
    document.querySelectorAll(".mcq-option-btn").forEach(button => {
        button.addEventListener("click", e => {
            const wrapper = e.target.closest(".question-wrapper");
            if (!wrapper) return;

            const selectedIdx = parseInt(e.target.dataset.optionIndex, 10);
            const correctIdx = parseInt(wrapper.dataset.correctIndex, 10);
            const questionId = wrapper.dataset.blockId;
            const feedbackElement = wrapper.querySelector(".quiz-feedback");
            const points = parseInt(wrapper.dataset.points, 10) || 0;

            handleQuizSubmit({
                questionId: questionId,
                type: "multiple_choice",
                userInput: selectedIdx,
                correctAnswer: correctIdx,
                points: points,
                feedbackElement: feedbackElement
            });
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
                e.target.textContent = `Show Hint (${hintCost} Coins)`;
            }
        });
    });
});

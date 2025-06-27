/**
 * CONSOLIDATED QUIZ CORE - Unified JavaScript for all quiz types
 * Replaces: quiz_core.js, enhanced_quiz_core.js (consolidates functionality)
 * Works with: comprehensive_quiz.js (for multi-question quizzes)
 * 
 * Features:
 * - Firebase-ready JSON structure
 * - Accessibility (ARIA, keyboard navigation)
 * - All quiz types: MCQ, Fill-in-blank, Drag-and-drop
 * - Unified grading and feedback system
 * - Points and currency tracking
 * - Hint system integration
 */

// Mock API functions for now - replace with actual API calls later
async function submitQuizResult({ questionId, isCorrect, points, currency, answer }) {
  console.log("Mock quiz submission:", { questionId, isCorrect, points, currency, answer });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    new_points: isCorrect ? points : 0,
    new_currency: isCorrect ? currency : 0
  };
}

async function purchaseHint({ questionId, cost }) {
  console.log("Mock hint purchase:", { questionId, cost });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    hint: "This is a sample hint!",
    new_currency: 100 - cost
  };
}

// === CORE GRADING FUNCTIONS ===
function gradeMCQ(selectedIdx, correctIdx) {
  return selectedIdx === correctIdx;
}

function gradeFillInTheBlank(userAnswer, correctAnswers) {
  if (!Array.isArray(correctAnswers)) {
    correctAnswers = [correctAnswers];
  }
  const userText = String(userAnswer).trim().toLowerCase();
  return correctAnswers.some(answer => 
    String(answer).trim().toLowerCase() === userText
  );
}

function gradeDragAndDrop(userMapping, correctMapping) {
  if (!userMapping || !correctMapping) return false;
  
  // Handle different mapping formats
  if (Array.isArray(userMapping) && Array.isArray(correctMapping)) {
    // Array format: [item1, item2, item3] -> [category1, category2, category3]
    return userMapping.length === correctMapping.length &&
           userMapping.every((item, idx) => item === correctMapping[idx]);
  }
  
  if (typeof userMapping === 'object' && typeof correctMapping === 'object') {
    // Object format: {item1: category1, item2: category2}
    const userKeys = Object.keys(userMapping);
    const correctKeys = Object.keys(correctMapping);
    
    if (userKeys.length !== correctKeys.length) return false;
    
    return userKeys.every(key => 
      correctMapping.hasOwnProperty(key) && 
      userMapping[key] === correctMapping[key]
    );
  }
  
  return false;
}

function gradeCode(userOutput, expectedOutput) {
  // Simple string comparison - can be extended for more complex validation
  return String(userOutput).trim() === String(expectedOutput).trim();
}

function gradeDebug(userCode, testCases, runCodeFn) {
  try {
    return runCodeFn ? runCodeFn(userCode, testCases) : false;
  } catch (error) {
    return false;
  }
}

// === FEEDBACK FUNCTIONS ===
function showFeedback(element, isCorrect, customMessage = "") {
  if (!element) return;
  
  element.classList.remove("display-none", "d-none");
  element.classList.toggle("correct", isCorrect);
  element.classList.toggle("incorrect", !isCorrect);
  
  const message = customMessage || (isCorrect ? "Correct!" : "Try again.");
  element.textContent = message;
  element.setAttribute("aria-live", "polite");
}

function announceFeedback(element, isCorrect) {
  if (!element) return;
  
  // Focus the feedback for screen readers
  element.setAttribute("tabindex", "-1");
  element.focus();
  
  // Optional: Audio feedback (with user preference check)
  if (window.speechSynthesis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const message = isCorrect ? "Correct answer!" : "Incorrect, please try again.";
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.volume = 0.3;
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  }
}

// === CURRENCY AND POINTS FUNCTIONS ===
function updateUserCurrency(newAmount) {
  const currencyElements = document.querySelectorAll(".user-currency-display, .currency-amount");
  currencyElements.forEach(el => {
    el.textContent = newAmount;
  });
}

function updateUserPoints(newAmount) {
  const pointsElements = document.querySelectorAll(".user-points-display, .points-amount");
  pointsElements.forEach(el => {
    el.textContent = newAmount;
  });
}

function updateDashboardProgress() {
  fetch("/api/progress")
    .then(res => res.json())
    .then(progress => {
      const progressBar = document.querySelector(".progress-bar-fill");
      const progressLabel = document.querySelector(".progress-bar-label");
      
      if (progressBar && progress.percent !== undefined) {
        progressBar.style.width = progress.percent + "%";
      }
      if (progressLabel && progress.percent !== undefined) {
        progressLabel.textContent = progress.percent + "% Complete";
      }
    })
    .catch(err => console.log("Progress update failed:", err));
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
  
  // Grade the answer based on question type
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
      isCorrect = gradeDebug(userInput, correctAnswer, extra.runCodeFn);
      break;
    
    default:
      console.warn(`Unknown quiz type: ${type}`);
      isCorrect = false;
  }
  
  // Show immediate feedback
  if (feedbackElement) {
    const customMessage = isCorrect 
      ? `Correct! +${points} points` 
      : "Incorrect. Try again!";
    showFeedback(feedbackElement, isCorrect, customMessage);
    announceFeedback(feedbackElement, isCorrect);
  }
  
  // Submit to backend
  try {
    const result = await submitQuizResult({
      questionId,
      isCorrect,
      points: isCorrect ? points : 0,
      currency: isCorrect ? currency : 0,
      answer: userInput
    });
    
    if (result.success && isCorrect) {
      if (result.new_points !== undefined) {
        updateUserPoints(result.new_points);
      }
      if (result.new_currency !== undefined) {
        updateUserCurrency(result.new_currency);
      }
    }
    
    // Update dashboard progress
    updateDashboardProgress();
    
    return { isCorrect, backendResult: result };
    
  } catch (error) {
    console.error("Failed to submit quiz result:", error);
    return { isCorrect, backendResult: { success: false, error: error.message } };
  }
}

// === MULTIPLE CHOICE HANDLERS ===
function initializeMultipleChoice() {
  console.log("Starting MCQ initialization...");
  
  const containers = document.querySelectorAll(".block-multiple-choice, .mcq-container");
  console.log("Found MCQ containers:", containers.length);
  
  containers.forEach((container, containerIndex) => {
    console.log(`Processing container ${containerIndex}:`, container);
    
    if (container.dataset.initialized) {
      console.log("Container already initialized, skipping");
      return;
    }
    container.dataset.initialized = "true";
    
    const options = container.querySelectorAll(".mcq-option-btn");
    const feedbackElement = container.querySelector(".mcq-feedback");
    const blockId = container.dataset.blockId;
    const correctIndex = parseInt(container.dataset.correctIndex || container.dataset.correctIdx || container.querySelector('.mcq-options-grid')?.dataset?.correctIdx, 10);
    const points = parseInt(container.dataset.points, 10) || 1;
    
    console.log("Initializing MCQ:", { 
      blockId, 
      correctIndex, 
      options: options.length,
      feedbackElement: !!feedbackElement,
      dataAttrs: {
        correctIndex: container.dataset.correctIndex,
        correctIdx: container.dataset.correctIdx,
        gridCorrectIdx: container.querySelector('.mcq-options-grid')?.dataset?.correctIdx
      }
    });
    
    if (options.length === 0) {
      console.warn("No MCQ options found in container:", container);
      return;
    }
    
    if (isNaN(correctIndex)) {
      console.warn("No valid correct index found for MCQ:", container);
      return;
    }
    
    options.forEach((option, index) => {
      console.log(`Adding click listener to option ${index}:`, option);
      
      option.addEventListener("click", async (event) => {
        console.log("Option clicked:", { index, correctIndex, blockId });
        
        // Prevent multiple submissions
        if (options[0].disabled) {
          console.log("Options already disabled, ignoring click");
          return;
        }
        
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
        
        // Show visual feedback
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
        
        // Disable all options
        options.forEach(opt => opt.disabled = true);
        
        // Show explanation if available
        const explanation = container.querySelector(".mcq-explanation");
        if (explanation) {
          explanation.classList.remove("display-none", "d-none");
        }
        
        // Emit event for comprehensive quizzes
        container.dispatchEvent(new CustomEvent("quizAnswered", {
          detail: { 
            isCorrect: result.isCorrect, 
            questionId: blockId,
            userInput: index,
            correctAnswer: correctIndex,
            type: "multiple_choice",
            points: points
          }
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
  document.querySelectorAll(".block-fill-in-blank, .fitb-container").forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";
    
    console.log("Initializing Fill in the Blank:", container);
    
    const input = container.querySelector(".fitb-input");
    const submitBtn = container.querySelector(".fitb-submit-btn");
    const feedbackElement = container.querySelector(".fitb-feedback");
    const blockId = container.dataset.blockId;
    const correctAnswers = container.dataset.answers ? 
      container.dataset.answers.split(",").map(a => a.trim()) : [];
    const points = parseInt(container.dataset.points, 10) || 1;
    
    console.log("FITB Elements found:", { 
      input: !!input, 
      submitBtn: !!submitBtn, 
      correctAnswers 
    });
    
    async function submitAnswer() {
      const userAnswer = input.value.trim();
      if (!userAnswer) return;
      
      console.log("Submitting FITB answer:", userAnswer);
      
      // Disable inputs
      input.disabled = true;
      submitBtn.disabled = true;
      
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
        explanation.classList.remove("display-none", "d-none");
      }
      
      // Emit event for comprehensive quizzes
      container.dispatchEvent(new CustomEvent("quizAnswered", {
        detail: { 
          isCorrect: result.isCorrect, 
          questionId: blockId,
          userInput: userAnswer,
          correctAnswer: correctAnswers,
          type: "fill_in_the_blank",
          points: points
        }
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
  document.querySelectorAll(".block-drag-and-drop, .dnd-container").forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = "true";
    
    console.log("Initializing Drag and Drop:", container);
    
    const dragItems = container.querySelectorAll(".drag-item");
    const dropZones = container.querySelectorAll(".drop-zone");
    const itemBank = container.querySelector(".drag-item-bank");
    const resetBtn = container.querySelector(".dnd-reset-button");
    const checkBtn = container.querySelector(".dnd-check-button, .dnd-submit-button");
    const feedbackElement = container.querySelector(".dnd-feedback");
    const blockId = container.dataset.blockId;
    const points = parseInt(container.dataset.points, 10) || 1;
    
    console.log("D&D Elements found:", { 
      dragItems: dragItems.length, 
      dropZones: dropZones.length, 
      checkBtn: !!checkBtn 
    });
    
    let selectedItem = null;
    
    // Initialize drag items
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
      
      // Keyboard events for accessibility
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
        } else if (e.key === "Escape" && selectedItem) {
          selectedItem.classList.remove("selected");
          selectedItem.setAttribute("aria-grabbed", "false");
          selectedItem = null;
        }
      });
      
      // Set initial ARIA attributes
      item.setAttribute("draggable", "true");
      item.setAttribute("aria-grabbed", "false");
      item.setAttribute("tabindex", "0");
    });
    
    // Initialize drop zones
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
        
        if (draggedItem && zone.children.length <= 1) { // Only placeholder allowed
          // Remove placeholder
          const placeholder = zone.querySelector(".drop-zone-placeholder");
          if (placeholder) {
            placeholder.style.display = "none";
          }
          zone.appendChild(draggedItem);
        }
      });
      
      // Keyboard events for accessibility
      zone.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && selectedItem) {
          e.preventDefault();
          if (zone.children.length <= 1) { // Only placeholder allowed
            const placeholder = zone.querySelector(".drop-zone-placeholder");
            if (placeholder) {
              placeholder.style.display = "none";
            }
            zone.appendChild(selectedItem);
            selectedItem.classList.remove("selected");
            selectedItem.setAttribute("aria-grabbed", "false");
            selectedItem = null;
          }
        }
      });
      
      zone.setAttribute("tabindex", "0");
      zone.setAttribute("role", "listbox");
    });
    
    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        dropZones.forEach(zone => {
          const item = zone.querySelector(".drag-item");
          if (item) {
            itemBank.appendChild(item);
          }
          const placeholder = zone.querySelector(".drop-zone-placeholder");
          if (placeholder) {
            placeholder.style.display = "flex";
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
        const correctMapping = {};
        
        // Collect user answers
        dropZones.forEach(zone => {
          const zoneLabel = zone.dataset.zoneLabel || zone.dataset.correctItem;
          const droppedItem = zone.querySelector(".drag-item");
          const correctItem = zone.dataset.correctItem;
          
          if (droppedItem) {
            const itemText = droppedItem.dataset.itemText || droppedItem.textContent.trim();
            userMapping[zoneLabel] = itemText;
          }
          
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
          const zoneLabel = zone.dataset.zoneLabel || zone.dataset.correctItem;
          const droppedItem = zone.querySelector(".drag-item");
          const correctItem = zone.dataset.correctItem;
          
          if (droppedItem) {
            const itemText = droppedItem.dataset.itemText || droppedItem.textContent.trim();
            const isZoneCorrect = itemText === correctItem;
            zone.classList.add(isZoneCorrect ? "correct" : "incorrect");
          }
        });
        
        checkBtn.disabled = true;
        
        // Show explanation if available
        const explanation = container.querySelector(".dnd-explanation");
        if (explanation) {
          explanation.classList.remove("display-none", "d-none");
        }
        
        // Emit event for comprehensive quizzes
        container.dispatchEvent(new CustomEvent("quizAnswered", {
          detail: { 
            isCorrect: result.isCorrect, 
            questionId: blockId,
            userInput: userMapping,
            correctAnswer: correctMapping,
            type: "drag_and_drop",
            points: points
          }
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
      
      // Disable button and show loading
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "Unlocking...";
      
      try {
        const result = await purchaseHint(blockId, hintCost);
        
        if (result.success) {
          hintContainer.innerHTML = result.hint;
          hintContainer.classList.remove("display-none", "d-none");
          button.classList.add("d-none"); // Hide button after successful purchase
          
          if (result.new_currency !== undefined) {
            updateUserCurrency(result.new_currency);
          }
        } else {
          alert(result.error || "Could not purchase hint.");
          button.disabled = false;
          button.textContent = originalText;
        }
      } catch (error) {
        console.error("Hint purchase failed:", error);
        alert("Failed to purchase hint. Please try again.");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
}

// === INITIALIZATION ===
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all quiz types
  initializeMultipleChoice();
  initializeFillInTheBlank();
  initializeDragAndDrop();
  initializeHints();
});

// Export functions for external use
window.handleQuizSubmit = handleQuizSubmit;
window.gradeMCQ = gradeMCQ;
window.gradeFillInTheBlank = gradeFillInTheBlank;
window.gradeDragAndDrop = gradeDragAndDrop;
window.showFeedback = showFeedback;
window.updateUserCurrency = updateUserCurrency;
window.updateUserPoints = updateUserPoints;

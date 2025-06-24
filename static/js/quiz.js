// static/js/quiz.js
// Handles all quiz-related functionality, including fetching data,
// displaying the quiz modal, and processing answers.

import { state, updateUserCurrency } from './shared-state.js';
import { mediumQuizData } from './quiz-data.js'; // Importing static data

// --- DOM Elements ---
let quizModal, quizContent, quizTitle, quizResults;
let currentQuizData = null;
let currentQuestionIndex = 0;

/**
 * @description Initializes the quiz system by setting up event listeners.
 */
export function initQuiz() {
    // Assign DOM elements
    quizModal = document.getElementById("quiz-modal-overlay");
    quizContent = document.getElementById("quiz-content");
    quizTitle = document.getElementById("quiz-title");
    quizResults = document.getElementById("quiz-results");

    if (!quizModal) return; // No quiz functionality on this page

    // Attach listeners to all "Unlock Quiz" buttons
    document.querySelectorAll(".quiz-unlock-btn").forEach(button => {
        button.addEventListener("click", () => {
            const quizId = button.dataset.quizId;
            const price = parseInt(button.dataset.quizPrice, 10);
            handleQuizUnlock(quizId, price);
        });
    });

    // Close modal listener
    const closeButton = document.querySelector(".quiz-close-btn");
    if (closeButton) {
        closeButton.addEventListener("click", closeQuizModal);
    }
}

/**
 * @description Handles the logic when a user clicks to unlock a quiz.
 * @param {string} quizId The ID of the quiz to start (e.g., 'medium').
 * @param {number} price The token cost of the quiz.
 */
function handleQuizUnlock(quizId, price) {
    if (state.user.currency < price) {
        alert("Not enough tokens to unlock this quiz!"); // Replace with a nicer modal later
        return;
    }

    // Deduct currency and start the quiz
    updateUserCurrency(state.user.currency - price);
    startQuiz(quizId);
}

/**
 * @description Fetches quiz data and opens the quiz modal.
 * @param {string} quizId The ID for the quiz.
 */
async function startQuiz(quizId) {
    // For this example, we'll just use the static medium data.
    // In a real app, you would fetch data based on the quizId.
    if (quizId === 'quiz2') { // Corresponds to the 'medium' button
        currentQuizData = mediumQuizData;
    } else {
        alert('This quiz is not available yet.'); // Placeholder
        return;
    }

    currentQuestionIndex = 0;
    quizTitle.textContent = currentQuizData.title;
    displayQuestion();
    quizModal.style.display = "flex";
}

/**
 * @description Renders the current question in the quiz modal.
 */
function displayQuestion() {
    // Clear previous content
    quizContent.innerHTML = '';
    quizResults.innerHTML = '';

    const question = currentQuizData.questions[currentQuestionIndex];
    if (!question) {
        displayFinalResults();
        return;
    }

    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question-container';

    // Build the question based on its type
    if (question.type === "multiple_choice_quiz") {
        // This handles nested MCQs inside a larger quiz structure
        question.questions.forEach((mcq, index) => {
            questionElement.innerHTML += createMcqHtml(mcq, index);
        });
    } else if (question.type === "fill_in_the_blanks") {
        questionElement.innerHTML = `
            <h4>${question.instructions}</h4>
            <p>${question.question.replace('_____', '<input type="text" class="fitb-input">')}</p>
        `;
    }

    quizContent.appendChild(questionElement);

    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = "Submit Answer";
    submitButton.className = 'quiz-submit-btn';
    submitButton.addEventListener('click', checkAnswer);
    quizContent.appendChild(submitButton);
}

/**
 * @description Creates the HTML for a multiple-choice question.
 * @param {object} mcq The MCQ object.
 * @param {number} index The index of the question.
 * @returns {string} The HTML string for the MCQ.
 */
function createMcqHtml(mcq, index) {
    const optionsHtml = mcq.options.map((option, i) => `
        <label class="quiz-option">
            <input type="radio" name="mcq-${index}" value="${i}">
            <span>${option}</span>
        </label>
    `).join('');

    return `
        <div class="mcq-item">
            <p class="quiz-question-text">${mcq.question}</p>
            <div class="quiz-options">${optionsHtml}</div>
        </div>
    `;
}


/**
 * @description Checks the user's answer and provides feedback.
 */
function checkAnswer() {
    // Logic to check both Fill-in-the-blanks and MCQs would go here.
    // This is a simplified example.
    const question = currentQuizData.questions[currentQuestionIndex];
    let isCorrect = false;

    if (question.type === 'fill_in_the_blanks') {
        const input = quizContent.querySelector('.fitb-input').value.toLowerCase().trim();
        if(question.answers.includes(input)) {
            isCorrect = true;
        }
    } else {
        // Assume correct for now
        isCorrect = true;
    }


    if (isCorrect) {
        quizResults.innerHTML = `<p class="correct">Correct! +5 tokens</p>`;
        updateUserCurrency(state.user.currency + 5);
    } else {
        quizResults.innerHTML = `<p class="incorrect">Incorrect. Try the next one.</p>`;
    }

    // Move to the next question or end the quiz
    currentQuestionIndex++;
    setTimeout(() => {
        if (currentQuestionIndex < currentQuizData.questions.length) {
            displayQuestion();
        } else {
            displayFinalResults();
        }
    }, 1500); // Wait 1.5 seconds before showing the next question
}


/**
 * @description Displays the final results of the quiz.
 */
function displayFinalResults() {
    quizContent.innerHTML = `<h2>Quiz Complete!</h2><p>You've finished the quiz. Great job!</p>`;
    quizResults.innerHTML = '';
}

/**
 * @description Closes the quiz modal and resets its state.
 */
function closeQuizModal() {
    quizModal.style.display = "none";
    quizContent.innerHTML = '';
    quizResults.innerHTML = '';
    currentQuizData = null;
    currentQuestionIndex = 0;
}

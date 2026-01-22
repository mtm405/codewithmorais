// Python IT Specialist Simulation Exam - Logic Controller

class ExamController {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {}; // { questionId: userAnswer }
        this.markedForReview = new Set();
        this.timeRemaining = 50 * 60; // 50 minutes in seconds
        this.timerInterval = null;
        this.examStartTime = Date.now();
        this.examEnded = false;
        this.reviewMode = false;
        this.examResults = null;
    }

    init() {
        this.promptStudentName();
        this.renderReviewPanel();
        this.renderQuestion(0);
        this.startTimer();
        this.attachEventListeners();
        this.updateProgress();
    }

    promptStudentName() {
        const savedName = localStorage.getItem('student_name');
        const name = prompt('Please enter your name for the exam:', savedName || '');
        if (name && name.trim()) {
            this.studentName = name.trim();
            localStorage.setItem('student_name', this.studentName);
        } else {
            this.studentName = 'Anonymous';
        }
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            // Warning at 5 minutes
            if (this.timeRemaining === 5 * 60) {
                this.showTimeWarning();
            }

            // Auto-submit at 0
            if (this.timeRemaining <= 0) {
                this.submitExam(true);
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const timeDisplayEl = document.getElementById('time-display');
        const timerEl = document.querySelector('.timer');
        
        if (timeDisplayEl) {
            timeDisplayEl.textContent = display;
        }

        // Add warning class at 5 minutes
        if (this.timeRemaining <= 5 * 60 && timerEl) {
            timerEl.classList.add('warning');
        }
        
        // Show warning alert at 5 minutes
        if (this.timeRemaining === 5 * 60) {
            alert('⚠️ Warning: Only 5 minutes remaining!');
        }
    }

    showTimeWarning() {
        alert('⚠️ Warning: Only 5 minutes remaining!');
    }

    renderQuestion(index) {
        if (index < 0 || index >= examQuestions.length) return;

        this.currentQuestion = index;
        const question = examQuestions[index];

        // Update question number with review mode indicator
        const questionNumberEl = document.getElementById('question-number');
        if (this.reviewMode) {
            const isCorrect = this.checkAnswer(question, this.answers[question.id]);
            questionNumberEl.innerHTML = `
                Question ${question.id} of 40 
                <span style="margin-left: 15px; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; background: ${isCorrect ? '#27ae60' : '#e74c3c'}; color: white;">
                    ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
            `;
        } else {
            questionNumberEl.textContent = `Question ${question.id} of 40`;
        }
        
        // Update domain tag
        document.getElementById('question-domain').textContent = question.domain;

        // Update question text
        const questionTextEl = document.getElementById('question-text');
        questionTextEl.innerHTML = `
            <strong>${question.text}</strong>
            ${question.code ? `<pre class="code-block">${this.escapeHtml(question.code)}</pre>` : ''}
        `;

        // Render answer options based on type
        this.renderAnswerOptions(question);

        // Update navigation buttons
        document.getElementById('btn-previous').disabled = index === 0;
        
        const nextBtn = document.getElementById('btn-next');
        if (this.reviewMode) {
            nextBtn.textContent = index === examQuestions.length - 1 ? 'Back to Results' : 'Next Question →';
        } else {
            nextBtn.textContent = index === examQuestions.length - 1 ? 'Review Answers' : 'Next →';
        }

        // Hide mark button in review mode
        const markBtn = document.getElementById('btn-mark');
        const submitBtn = document.getElementById('btn-submit');
        if (this.reviewMode) {
            markBtn.style.display = 'none';
            submitBtn.style.display = 'none';
        } else {
            markBtn.style.display = 'inline-block';
            // Update marked status
            this.updateMarkButton();
        }

        // Update review panel
        this.updateReviewPanel();
    }

    renderAnswerOptions(question) {
        const container = document.getElementById('answer-options');
        container.innerHTML = '';

        const userAnswer = this.answers[question.id];
        const isCorrect = this.reviewMode ? this.checkAnswer(question, userAnswer) : null;

        if (question.type === 'MC' || question.type === 'T/F') {
            // Multiple choice or True/False
            question.options.forEach((option, idx) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'answer-option';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `q${question.id}`;
                input.id = `q${question.id}_opt${idx}`;
                input.value = option;
                input.disabled = this.reviewMode; // Disable in review mode
                
                // Check if this option was previously selected
                if (this.answers[question.id] === option) {
                    input.checked = true;
                    optionDiv.classList.add('selected');
                }

                // In review mode, show correct/incorrect answers
                if (this.reviewMode) {
                    if (option === question.answer) {
                        optionDiv.classList.add('correct-answer');
                        optionDiv.innerHTML += ' <span class="answer-indicator">✓ Correct Answer</span>';
                    }
                    if (userAnswer === option && !isCorrect) {
                        optionDiv.classList.add('incorrect-answer');
                        optionDiv.innerHTML = optionDiv.innerHTML.replace(' <span class="answer-indicator">✓ Correct Answer</span>', '');
                        const indicator = document.createElement('span');
                        indicator.className = 'answer-indicator';
                        indicator.textContent = '✗ Your Answer';
                        optionDiv.appendChild(indicator);
                    }
                }

                if (!this.reviewMode) {
                    input.addEventListener('change', (e) => {
                        // Remove selected class from all options
                        container.querySelectorAll('.answer-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        // Add selected class to this option
                        optionDiv.classList.add('selected');
                        
                        this.saveAnswer(question.id, e.target.value);
                    });

                    // Make the entire div clickable
                    optionDiv.addEventListener('click', (e) => {
                        if (e.target !== input) {
                            input.click();
                        }
                    });
                }

                const label = document.createElement('label');
                label.htmlFor = input.id;
                label.textContent = option;

                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                container.appendChild(optionDiv);
            });
        } else if (question.type === 'FITB') {
            // Fill in the blank
            const fitbDiv = document.createElement('div');
            fitbDiv.className = 'answer-fitb';

            const label = document.createElement('label');
            label.textContent = 'Your Answer:';
            label.style.display = 'block';
            label.style.marginBottom = '8px';
            label.style.fontWeight = '600';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'fitb-input';
            input.placeholder = question.placeholder || 'Type your answer here...';
            input.value = this.answers[question.id] || '';
            input.disabled = this.reviewMode; // Disable in review mode
            
            if (!this.reviewMode) {
                input.addEventListener('input', (e) => {
                    this.saveAnswer(question.id, e.target.value.trim());
                });
            }
            
            const hint = document.createElement('small');
            hint.className = 'fitb-hint';
            
            if (this.reviewMode) {
                // Show correct answer in review mode
                if (isCorrect) {
                    hint.innerHTML = '<span style="color: #27ae60; font-weight: 600;">✓ Correct!</span>';
                    input.style.borderColor = '#27ae60';
                    input.style.background = '#e8f8f0';
                } else {
                    hint.innerHTML = `<span style="color: #e74c3c; font-weight: 600;">✗ Incorrect.</span> Correct answer: <strong>${question.answer}</strong>`;
                    input.style.borderColor = '#e74c3c';
                    input.style.background = '#fdeaea';
                }
            } else {
                hint.textContent = question.caseSensitive ? 
                    '⚠️ Answer is case-sensitive' : 
                    'ℹ️ Answer is not case-sensitive';
            }

            fitbDiv.appendChild(label);
            fitbDiv.appendChild(input);
            fitbDiv.appendChild(hint);
            container.appendChild(fitbDiv);
        }

        // Add explanation banner in review mode
        if (this.reviewMode) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'review-feedback';
            feedbackDiv.style.cssText = `
                margin-top: 20px;
                padding: 15px;
                border-radius: 8px;
                font-size: 14px;
                border-left: 4px solid ${isCorrect ? '#27ae60' : '#e74c3c'};
                background: ${isCorrect ? '#e8f8f0' : '#fdeaea'};
            `;
            
            feedbackDiv.innerHTML = `
                <strong style="color: ${isCorrect ? '#27ae60' : '#e74c3c'}; font-size: 16px;">
                    ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </strong>
                <p style="margin: 10px 0 0 0; line-height: 1.6;">
                    ${isCorrect ? 
                        'Great job! You answered this question correctly.' : 
                        `The correct answer is: <strong>${question.answer}</strong>`
                    }
                </p>
            `;
            
            container.appendChild(feedbackDiv);
        }
    }

    saveAnswer(questionId, answer) {
        if (answer) {
            this.answers[questionId] = answer;
        } else {
            delete this.answers[questionId];
        }
        this.updateReviewPanel();
        this.updateProgress();
    }

    updateProgress() {
        const answered = Object.keys(this.answers).length;
        const total = examQuestions.length;
        const percentage = Math.round((answered / total) * 100);

        const progressText = document.getElementById('progress-text');
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');

        if (progressText) {
            progressText.textContent = `Progress: ${answered}/${total}`;
        }
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${percentage}%`;
        }
    }

    toggleMarkForReview() {
        const questionId = examQuestions[this.currentQuestion].id;
        if (this.markedForReview.has(questionId)) {
            this.markedForReview.delete(questionId);
        } else {
            this.markedForReview.add(questionId);
        }
        this.updateMarkButton();
        this.updateReviewPanel();
    }

    updateMarkButton() {
        const questionId = examQuestions[this.currentQuestion].id;
        const btn = document.getElementById('btn-mark');
        if (this.markedForReview.has(questionId)) {
            btn.textContent = '⭐ Unmark';
            btn.classList.add('marked');
        } else {
            btn.textContent = '🔖 Mark for Review';
            btn.classList.remove('marked');
        }
    }

    renderReviewPanel() {
        const grid = document.getElementById('question-grid');
        grid.innerHTML = '';

        examQuestions.forEach((q, idx) => {
            const btn = document.createElement('button');
            btn.className = 'question-btn';
            btn.textContent = q.id;
            // Remove inline styles to let CSS classes take effect
            
            btn.addEventListener('click', () => {
                this.renderQuestion(idx);
            });

            grid.appendChild(btn);
        });

        // Update legend based on mode
        this.updateLegend();
    }

    updateLegend() {
        const legendEl = document.querySelector('.legend');
        if (!legendEl) return;

        if (this.reviewMode) {
            legendEl.innerHTML = `
                <div class="legend-item">
                    <div class="legend-box" style="background: #3498db;"></div>
                    <span>Current</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #27ae60;"></div>
                    <span>Correct</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #e74c3c;"></div>
                    <span>Incorrect</span>
                </div>
            `;
        } else {
            legendEl.innerHTML = `
                <div class="legend-item">
                    <div class="legend-box" style="background: #3498db;"></div>
                    <span>Current</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #27ae60;"></div>
                    <span>Answered</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #f39c12;"></div>
                    <span>Marked</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box" style="background: #ecf0f1;"></div>
                    <span>Unanswered</span>
                </div>
            `;
        }
    }

    updateReviewPanel() {
        const buttons = document.querySelectorAll('.question-btn');
        
        if (buttons.length === 0) {
            console.warn('No question buttons found in review panel');
            return;
        }
        
        examQuestions.forEach((q, idx) => {
            const btn = buttons[idx];
            
            if (!btn) {
                console.warn(`Button not found for question ${idx}`);
                return;
            }
            
            btn.classList.remove('current', 'answered', 'marked', 'unanswered', 'correct', 'incorrect');

            // In review mode, show correct/incorrect
            if (this.reviewMode && this.examResults) {
                const isCorrect = this.checkAnswer(q, this.answers[q.id]);
                if (isCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
                if (idx === this.currentQuestion) {
                    btn.classList.add('current');
                }
            } else {
                // Normal exam mode
                if (idx === this.currentQuestion) {
                    btn.classList.add('current');
                } else if (this.markedForReview.has(q.id)) {
                    btn.classList.add('marked');
                } else if (this.answers[q.id]) {
                    btn.classList.add('answered');
                } else {
                    btn.classList.add('unanswered');
                }
            }
        });
    }

    navigateNext() {
        if (this.currentQuestion < examQuestions.length - 1) {
            this.renderQuestion(this.currentQuestion + 1);
        } else {
            if (this.reviewMode) {
                // In review mode, go back to results
                this.showResults(this.examResults);
            } else {
                // Show confirmation for end of exam
                this.showEndExamDialog();
            }
        }
    }

    navigatePrev() {
        if (this.currentQuestion > 0) {
            this.renderQuestion(this.currentQuestion - 1);
        }
    }

    showEndExamDialog() {
        const answered = Object.keys(this.answers).length;
        const total = examQuestions.length;
        const unanswered = total - answered;

        let message = `You have answered ${answered} out of ${total} questions.`;
        if (unanswered > 0) {
            message += ` ⚠️ ${unanswered} question${unanswered > 1 ? 's' : ''} remain${unanswered > 1 ? '' : 's'} unanswered.`;
        }
        if (this.markedForReview.size > 0) {
            message += ` ⭐ ${this.markedForReview.size} question${this.markedForReview.size > 1 ? 's are' : ' is'} marked for review.`;
        }

        document.getElementById('answered-count').textContent = answered;
        document.getElementById('confirm-message').innerHTML = message;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('confirm-dialog').style.display = 'block';
    }

    hideEndExamDialog() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('confirm-dialog').style.display = 'none';
    }

    submitExam(autoSubmit = false) {
        if (!autoSubmit) {
            this.hideEndExamDialog();
        }

        this.examEnded = true;
        clearInterval(this.timerInterval);

        // Calculate score
        const results = this.gradeExam();
        
        // Store results for review mode
        this.examResults = results;

        // Save results to localStorage for teacher dashboard
        this.saveResultsToLocalStorage(results);

        // Display results
        this.showResults(results);
    }

    saveResultsToLocalStorage(results) {
        const examData = {
            studentName: this.studentName || 'Anonymous',
            examType: 'full', // Full simulation (40 questions)
            timestamp: Date.now(),
            correct: results.correct,
            total: results.total,
            percentage: results.percentage,
            passed: results.passed,
            timeSpent: results.timeSpent,
            domainScores: results.domainScores,
            answers: this.answers
        };

        // Save with unique key
        const key = `exam_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(key, JSON.stringify(examData));
    }

    gradeExam() {
        let correct = 0;
        const incorrect = [];
        const domainScores = {};

        examQuestions.forEach(question => {
            const userAnswer = this.answers[question.id];
            const isCorrect = this.checkAnswer(question, userAnswer);

            if (isCorrect) {
                correct++;
            } else {
                incorrect.push(question.id);
            }

            // Track domain scores
            if (!domainScores[question.domain]) {
                domainScores[question.domain] = { correct: 0, total: 0 };
            }
            domainScores[question.domain].total++;
            if (isCorrect) {
                domainScores[question.domain].correct++;
            }
        });

        const percentage = Math.round((correct / examQuestions.length) * 100);
        const passed = percentage >= 70;

        return {
            correct,
            total: examQuestions.length,
            percentage,
            passed,
            incorrect,
            domainScores,
            timeSpent: this.formatTimeSpent()
        };
    }

    checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;

        const correctAnswer = question.answer;

        // Check if there are acceptable alternative answers
        if (question.acceptableAnswers && Array.isArray(question.acceptableAnswers)) {
            const acceptable = question.acceptableAnswers.map(ans => 
                question.caseSensitive === false ? ans.toLowerCase() : ans
            );
            const userAns = question.caseSensitive === false ? 
                userAnswer.toLowerCase() : userAnswer;
            return acceptable.includes(userAns);
        }

        // Standard comparison
        if (question.caseSensitive === false) {
            return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        } else {
            return userAnswer === correctAnswer;
        }
    }

    formatTimeSpent() {
        const totalSeconds = 50 * 60 - this.timeRemaining;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    }

    showResults(results) {
        const modal = document.getElementById('results-modal');
        
        document.getElementById('score-display').textContent = `${results.percentage}%`;
        document.getElementById('total-questions').textContent = results.total;
        document.getElementById('correct-answers').textContent = results.correct;
        document.getElementById('incorrect-answers').textContent = results.total - results.correct;
        document.getElementById('percentage').textContent = `${results.percentage}%`;
        document.getElementById('pass-fail').textContent = results.passed ? '✅ PASS' : '❌ FAIL';
        document.getElementById('pass-fail').style.color = results.passed ? '#27ae60' : '#e74c3c';

        // Add domain breakdown if there's a container for it
        const resultDetails = modal.querySelector('.result-details');
        if (resultDetails) {
            let breakdownHTML = '<h4 style="margin-top: 20px;">Domain Breakdown:</h4>';
            for (const [domain, scores] of Object.entries(results.domainScores)) {
                const domainPercent = Math.round((scores.correct / scores.total) * 100);
                breakdownHTML += `<p><strong>${domain}:</strong> ${scores.correct}/${scores.total} (${domainPercent}%)</p>`;
            }
            breakdownHTML += `<p style="margin-top: 15px;"><strong>Time spent:</strong> ${results.timeSpent}</p>`;
            resultDetails.innerHTML += breakdownHTML;
        }

        modal.style.display = 'flex';
    }

    reviewAnswers() {
        document.getElementById('results-modal').style.display = 'none';
        this.reviewMode = true;
        
        // Update review panel title
        const titleEl = document.getElementById('review-panel-title');
        if (titleEl && this.examResults) {
            titleEl.innerHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 5px;">Answer Review</div>
                <div style="font-size: 0.85rem; font-weight: normal; color: #7f8c8d;">
                    Score: ${this.examResults.correct}/${this.examResults.total} (${this.examResults.percentage}%)
                </div>
            `;
        }
        
        this.updateReviewPanel();
        this.renderQuestion(0);
    }

    retakeExam() {
        if (confirm('This will reset your exam and restart the timer. Continue?')) {
            location.reload();
        }
    }

    attachEventListeners() {
        console.log('Attaching event listeners...');
        
        // Attach direct event listeners to buttons
        const prevBtn = document.getElementById('btn-previous');
        const nextBtn = document.getElementById('btn-next');
        const markBtn = document.getElementById('btn-mark');
        const submitBtn = document.getElementById('btn-submit');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Previous clicked');
                this.navigatePrev();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Next clicked');
                this.navigateNext();
            });
        }
        
        if (markBtn) {
            markBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mark clicked');
                this.toggleMarkForReview();
            });
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit clicked');
                this.showEndExamDialog();
            });
        }
        
        // Confirmation dialog buttons
        const cancelBtn = document.getElementById('btn-cancel');
        const confirmBtn = document.getElementById('btn-confirm');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideEndExamDialog();
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitExam();
            });
        }
        
        // Results modal buttons
        const reviewBtn = document.getElementById('btn-review');
        const retakeBtn = document.getElementById('btn-retake');
        
        if (reviewBtn) {
            reviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.reviewAnswers();
            });
        }
        
        if (retakeBtn) {
            retakeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.retakeExam();
            });
        }
        
        // Also make methods available globally for inline onclick handlers (backup)
        window.previousQuestion = () => this.navigatePrev();
        window.nextQuestion = () => {
            console.log('Global nextQuestion called');
            this.navigateNext();
        };
        window.markForReview = () => this.toggleMarkForReview();
        window.showConfirmDialog = () => this.showEndExamDialog();
        window.hideConfirmDialog = () => this.hideEndExamDialog();
        window.submitExam = () => this.submitExam();
        window.reviewAnswers = () => this.reviewAnswers();
        window.retakeExam = () => this.retakeExam();

        console.log('Event listeners attached successfully');

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Don't intercept if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Don't intercept if a modal is open
            const resultsModal = document.getElementById('results-modal');
            const confirmDialog = document.getElementById('confirm-dialog');
            if ((resultsModal && resultsModal.style.display === 'flex') ||
                (confirmDialog && confirmDialog.style.display === 'block')) {
                return;
            }
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigatePrev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateNext();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.toggleMarkForReview();
                    break;
            }
        });

        // Prevent accidental navigation away
        window.addEventListener('beforeunload', (e) => {
            if (!this.examEnded) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize exam when page loads
let exam;
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing exam...');
    console.log('Questions available:', examQuestions ? examQuestions.length : 'NOT LOADED');
    
    if (typeof examQuestions === 'undefined' || !examQuestions || examQuestions.length === 0) {
        console.error('ERROR: examQuestions not loaded!');
        alert('Error: Exam questions failed to load. Please refresh the page.');
        return;
    }
    
    exam = new ExamController();
    exam.init();
    console.log('Exam initialized successfully');
});

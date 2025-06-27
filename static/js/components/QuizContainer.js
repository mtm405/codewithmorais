/**
 * QuizContainer - Vanilla JavaScript Component
 * Converts the React component to vanilla JS for managing quiz flow
 */

class QuizContainer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.questions = options.questions || [];
        this.currentIndex = options.currentIndex || 0;
        this.onNext = options.onNext || null;
        this.onComplete = options.onComplete || null;
        
        this.render();
    }
    
    render() {
        if (!this.container || !this.questions.length) return;
        
        const question = this.questions[this.currentIndex];
        if (!question) return;
        
        // Clear container safely
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'quiz-container';
        
        // Progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.className = 'quiz-progress';
        
        const progressSpan = document.createElement('span');
        progressSpan.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${((this.currentIndex + 1) / this.questions.length) * 100}%`;
        
        progressBar.appendChild(progressFill);
        progressDiv.appendChild(progressSpan);
        progressDiv.appendChild(progressBar);
        wrapper.appendChild(progressDiv);
        
        // Question content
        const questionContent = document.createElement('div');
        questionContent.className = 'question-content';
        
        const questionTitle = document.createElement('h3');
        questionTitle.textContent = question.question || question.title || '';
        questionContent.appendChild(questionTitle);
        
        if (question.type === "multiple_choice_quiz") {
            const mcqDiv = document.createElement('div');
            mcqDiv.id = `multiple-choice-${this.currentIndex}`;
            questionContent.appendChild(mcqDiv);
        } else {
            // Handle other question types
            const notImplemented = document.createElement('p');
            notImplemented.textContent = `Question type "${question.type}" not yet implemented in vanilla JS.`;
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn-primary';
            nextBtn.textContent = 'Next';
            nextBtn.addEventListener('click', () => this.nextQuestion());
            
            questionContent.appendChild(notImplemented);
            questionContent.appendChild(nextBtn);
        }
        
        wrapper.appendChild(questionContent);
        this.container.appendChild(wrapper);
        
        // Initialize question-specific components
        if (question.type === "multiple_choice_quiz") {
            new MultipleChoice(`multiple-choice-${this.currentIndex}`, {
                options: question.options,
                correctIndex: question.correctIndex,
                onNext: () => this.nextQuestion(),
                isLastQuestion: this.currentIndex === this.questions.length - 1
            });
        }
    }
    
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.render();
            if (this.onNext) {
                this.onNext(this.currentIndex);
            }
        } else {
            // Quiz completed
            if (this.onComplete) {
                this.onComplete();
            } else {
                this.showCompletion();
            }
        }
    }
    
    previousQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
        }
    }
    
    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            this.currentIndex = index;
            this.render();
        }
    }
    
    showCompletion() {
        this.container.innerHTML = `
            <div class="quiz-completion">
                <h2>🎉 Quiz Complete!</h2>
                <p>You have completed all ${this.questions.length} questions.</p>
                <button class="btn-primary" onclick="this.restart()">Restart Quiz</button>
            </div>
        `;
    }
    
    restart() {
        this.currentIndex = 0;
        this.render();
    }
    
    getCurrentQuestion() {
        return this.questions[this.currentIndex];
    }
    
    getProgress() {
        return {
            current: this.currentIndex + 1,
            total: this.questions.length,
            percentage: ((this.currentIndex + 1) / this.questions.length) * 100
        };
    }
}

// Make it globally available
window.QuizContainer = QuizContainer;

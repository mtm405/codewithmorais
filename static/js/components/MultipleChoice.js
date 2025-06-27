/**
 * MultipleChoice - Vanilla JavaScript Component
 * Converts the React component to vanilla JS for quiz functionality
 */

class MultipleChoice {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options.options || [];
        this.correctIndex = options.correctIndex || 0;
        this.onNext = options.onNext || null;
        this.isLastQuestion = options.isLastQuestion || false;
        
        this.selected = null;
        this.showAnswer = false;
        this.showConfetti = false;
        
        this.render();
        this.bindEvents();
    }
    
    render() {
        if (!this.container) return;
        
        // Clear container safely
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'multiple-choice-container';
        
        if (this.showConfetti) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = '🎉';
            wrapper.appendChild(confetti);
        }
        
        this.options.forEach((option, idx) => {
            const button = document.createElement('button');
            button.className = 'mcq-option-btn';
            button.dataset.optionIndex = idx;
            button.textContent = option;
            button.disabled = this.showAnswer;
            
            if (this.showAnswer) {
                if (idx === this.correctIndex) {
                    button.style.backgroundColor = 'green';
                    button.style.color = 'white';
                }
                if (idx === this.selected && idx !== this.correctIndex) {
                    button.style.backgroundColor = 'red';
                    button.style.color = 'white';
                }
            }
            
            wrapper.appendChild(button);
        });
        
        this.container.appendChild(wrapper);
    }
    
    bindEvents() {
        if (!this.container) return;
        
        const buttons = this.container.querySelectorAll(".mcq-option-btn");
        buttons.forEach(button => {
            button.addEventListener("click", (e) => {
                this.handleSelect(parseInt(e.target.dataset.optionIndex));
            });
        });
    }
    
    handleSelect(idx) {
        if (this.showAnswer) return;
        
        this.selected = idx;
        this.showAnswer = true;
        
        if (idx === this.correctIndex) {
            this.showConfetti = true;
        }
        
        this.render();
        
        // Auto-advance after 2 seconds
        setTimeout(() => {
            this.showConfetti = false;
            this.showAnswer = false;
            this.selected = null;
            if (this.onNext) {
                this.onNext();
            }
        }, 2000);
    }
    
    reset() {
        this.selected = null;
        this.showAnswer = false;
        this.showConfetti = false;
        this.render();
    }
}

// Make it globally available
window.MultipleChoice = MultipleChoice;

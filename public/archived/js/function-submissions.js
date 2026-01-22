// Firebase Function Submissions System
class FunctionSubmissionSystem {
    constructor() {
        this.db = firebase.firestore();
        this.currentStudent = null;
        this.initializeAuth();
    }

    initializeAuth() {
        // Simple student identification system
        let studentName = localStorage.getItem('student_name');
        if (!studentName) {
            studentName = prompt('Please enter your name:');
            if (studentName) {
                localStorage.setItem('student_name', studentName);
            }
        }
        this.currentStudent = studentName;
        this.updateStudentDisplay();
    }

    updateStudentDisplay() {
        const displays = document.querySelectorAll('.student-name-display');
        displays.forEach(display => {
            display.textContent = this.currentStudent || 'Unknown Student';
        });
    }

    async submitCode(activityNumber, activityTitle, code) {
        if (!this.currentStudent) {
            alert('Please enter your name first.');
            this.initializeAuth();
            return;
        }

        if (!code.trim()) {
            alert('Please enter your code before submitting.');
            return;
        }

        try {
            const submission = {
                studentName: this.currentStudent,
                activityNumber: activityNumber,
                activityTitle: activityTitle,
                code: code,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                submissionDate: new Date().toISOString().split('T')[0],
                submissionTime: new Date().toLocaleTimeString()
            };

            const docRef = await this.db.collection('function-submissions').add(submission);
            
            this.showSuccessMessage(`Code submitted successfully! Submission ID: ${docRef.id.slice(-6)}`);
            this.updateSubmissionCounter(activityNumber);
            
        } catch (error) {
            console.error('Error submitting code:', error);
            alert('Error submitting code. Please try again.');
        }
    }

    showSuccessMessage(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
        successDiv.textContent = message;
        
        // Add animation CSS if not exists
        if (!document.getElementById('submission-animations')) {
            const style = document.createElement('style');
            style.id = 'submission-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    updateSubmissionCounter(activityNumber) {
        const counter = document.querySelector(`#submission-count-${activityNumber}`);
        if (counter) {
            const current = parseInt(counter.textContent) || 0;
            counter.textContent = current + 1;
        }
    }

    changeStudent() {
        localStorage.removeItem('student_name');
        this.initializeAuth();
    }

    clearCode(activityNumber) {
        const textarea = document.querySelector(`#code-input-${activityNumber}`);
        if (textarea) {
            textarea.value = '';
        }
    }
}

// Initialize the submission system when page loads
let submissionSystem;
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to initialize
    setTimeout(() => {
        submissionSystem = new FunctionSubmissionSystem();
    }, 1000);
});

// Global functions for HTML onclick events
function submitActivityCode(activityNumber, activityTitle) {
    const code = document.querySelector(`#code-input-${activityNumber}`).value;
    submissionSystem.submitCode(activityNumber, activityTitle, code);
}

function clearActivityCode(activityNumber) {
    submissionSystem.clearCode(activityNumber);
}

function changeStudentName() {
    submissionSystem.changeStudent();
}
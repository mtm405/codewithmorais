document.addEventListener('DOMContentLoaded', function () {
  // Wait for other scripts to finish
  setTimeout(() => {
    document.querySelectorAll('.comprehensive-quiz-container').forEach(quizContainer => {
      // Remove any old comprehensive_quiz_new.js logic (if present)
      // Only use this script for comprehensive quizzes

      // Remove any previously attached event listeners by cloning blocks
      quizContainer.querySelectorAll('.block-multiple-choice, .block-fill-in-blank, .block-drag-and-drop').forEach(block => {
        block.setAttribute('data-comprehensive-quiz', 'true');
        block.addEventListener('click', (e) => {
          e.stopImmediatePropagation();
        }, true);
        const clonedBlock = block.cloneNode(true);
        block.parentNode.replaceChild(clonedBlock, block);
      });

      // Use only the refreshed array for all logic
      const questions = Array.from(quizContainer.querySelectorAll('.question-wrapper'));
      const feedbackContainer = quizContainer.querySelector('.feedback-container');
      const summaryView = quizContainer.querySelector('.quiz-summary-view');
      const finalScoreEl = summaryView.querySelector('.final-score');
      const retakeButton = summaryView.querySelector('.retake-quiz-btn');
      const progressIndicator = quizContainer.querySelector('.progress-indicator .current-question');
      const totalQuestionsIndicator = quizContainer.querySelector('.progress-indicator .total-questions');

      let currentQuestionIndex = 0;
      let score = 0;
      let userAnswers = [];

      function showQuestion(index) {
        questions.forEach((q, i) => {
          if (i !== index) {
            q.style.display = 'none';
            q.classList.add('d-none');
          } else {
            q.style.display = 'block';
            q.classList.remove('d-none');
            // Reset question state
            const buttons = q.querySelectorAll('button, input');
            buttons.forEach(el => {
              el.disabled = false;
              el.classList.remove('selected', 'correct', 'incorrect');
            });
            const inputs = q.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
              input.value = '';
              input.classList.remove('correct', 'incorrect');
            });
            if (q.dataset.questionType === 'drag_and_drop') {
              const bank = q.querySelector('.drag-item-bank');
              const dropZones = q.querySelectorAll('.drop-zone');
              dropZones.forEach(zone => {
                zone.classList.remove('correct', 'incorrect');
                if (zone.firstChild && bank) {
                  bank.appendChild(zone.firstChild);
                }
              });
            }
            // Hide feedback in block
            const feedbackDivs = q.querySelectorAll('.mcq-feedback, .fill-blank-feedback, .drag-drop-feedback');
            feedbackDivs.forEach(div => {
              div.style.display = 'none';
              div.classList.add('d-none');
            });
          }
        });
        if (progressIndicator) progressIndicator.textContent = index + 1;
      }

      function showFeedback(isCorrect) {
        feedbackContainer.style.display = 'block';
        if (isCorrect) {
          feedbackContainer.textContent = 'Correct!';
          feedbackContainer.style.color = 'var(--accent-green)';
        } else {
          feedbackContainer.textContent = 'Incorrect.';
          feedbackContainer.style.color = 'var(--accent-red)';
        }
      }

      function nextQuestion() {
        feedbackContainer.style.display = 'none';
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          showQuestion(currentQuestionIndex);
        } else {
          showSummary();
        }
      }

      async function handleAnswer(questionWrapper, event) {
        questionWrapper.querySelectorAll('button, input').forEach(el => el.disabled = true);
        const questionType = questionWrapper.dataset.questionType;
        const questionId = questionWrapper.dataset.questionId;
        let isCorrect = false;
        let userAnswer = null;
        if (questionType === 'multiple_choice') {
          const selectedOption = event.target.closest('.mcq-option-btn');
          if (!selectedOption) return;
          const optionsGrid = questionWrapper.querySelector('.mcq-options-grid');
          const correctIndex = parseInt(optionsGrid.dataset.correctIdx);
          const selectedIndex = parseInt(selectedOption.dataset.optionIdx);
          isCorrect = selectedIndex === correctIndex;
          userAnswer = selectedIndex;
          selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (!isCorrect) {
            const correctButton = questionWrapper.querySelector(`.mcq-option-btn[data-option-idx="${correctIndex}"]`);
            if (correctButton) correctButton.classList.add('correct');
          }
        } else if (questionType === 'fill_in_the_blank') {
          const input = questionWrapper.querySelector('.fill-blank-input');
          const correctAnswers = (input.dataset.answer || '').split(',').map(a => a.trim().toLowerCase());
          userAnswer = input.value.trim();
          isCorrect = correctAnswers.includes(userAnswer.toLowerCase());
          input.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (questionType === 'drag_and_drop') {
          const matches = questionWrapper.querySelectorAll('.drag-drop-match');
          let allCorrect = true;
          const userAnswersDnd = [];
          matches.forEach(match => {
            const dropZone = match.querySelector('.drop-zone');
            const droppedItem = dropZone.querySelector('.drag-item');
            const correctId = dropZone.dataset.correctId;
            const droppedId = droppedItem ? droppedItem.dataset.id : null;
            if (droppedId === correctId) {
              dropZone.classList.add('correct');
              userAnswersDnd.push({ dropZone: correctId, droppedItem: droppedId, isCorrect: true });
            } else {
              dropZone.classList.add('incorrect');
              allCorrect = false;
              userAnswersDnd.push({ dropZone: correctId, droppedItem: droppedId, isCorrect: false });
            }
          });
          isCorrect = allCorrect;
          userAnswer = userAnswersDnd;
        }
        if (isCorrect) score++;
        userAnswers.push({ questionId, isCorrect, userAnswer });
        showFeedback(isCorrect);
        if (window.submitQuizResult) {
          window.submitQuizResult({
            questionId,
            isCorrect,
            points: isCorrect ? 1 : 0,
            currency: isCorrect ? 1 : 0,
            answer: userAnswer
          }).catch(err => console.error("Failed to submit quiz result:", err));
        }
        setTimeout(nextQuestion, 1500);
      }

      function showSummary() {
        quizContainer.querySelector('.quiz-body').classList.add('d-none');
        quizContainer.querySelector('.quiz-footer').classList.add('d-none');
        quizContainer.querySelector('.quiz-header').classList.add('d-none');
        summaryView.classList.remove('d-none');
        const total = questions.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        const wrong = total - score;
        finalScoreEl.innerHTML = `You scored <strong>${score} out of ${total} (${percentage}%)</strong>.<div class="mt-2"><span class="text-success">${score} Correct</span> | <span class="text-danger">${wrong} Incorrect</span></div>`;
      }

      function resetQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        summaryView.classList.add('d-none');
        quizContainer.querySelector('.quiz-body').classList.remove('d-none');
        quizContainer.querySelector('.quiz-footer').classList.remove('d-none');
        quizContainer.querySelector('.quiz-header').classList.remove('d-none');
        feedbackContainer.style.display = 'none';
        questions.forEach(q => {
          q.querySelectorAll('button, input').forEach(el => {
            el.disabled = false;
            el.classList.remove('selected', 'correct', 'incorrect');
          });
          const fitbInput = q.querySelector('.fill-blank-input');
          if(fitbInput) {
            fitbInput.value = '';
            fitbInput.classList.remove('correct', 'incorrect');
          }
          if (q.dataset.questionType === 'drag_and_drop') {
            const bank = q.querySelector('.drag-item-bank');
            q.querySelectorAll('.drop-zone .drag-item').forEach(item => {
              bank.appendChild(item);
            });
            q.querySelectorAll('.drop-zone').forEach(zone => {
              zone.classList.remove('correct', 'incorrect');
            });
          }
        });
        showQuestion(0);
      }

      function setupDragAndDrop(questionWrapper) {
        const dragItems = questionWrapper.querySelectorAll('.drag-item');
        const dropZones = questionWrapper.querySelectorAll('.drop-zone');
        const bank = questionWrapper.querySelector('.drag-item-bank');
        const resetButton = questionWrapper.querySelector('.dnd-reset-button');

        dragItems.forEach(item => {
          item.setAttribute('draggable', 'true');
          item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => item.classList.add('dragging'), 0);
          });
          item.addEventListener('dragend', () => item.classList.remove('dragging'));
        });

        dropZones.forEach(zone => {
          zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
          });
          zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
          zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            const draggedItem = document.getElementById(id);
            if (draggedItem && zone.children.length === 0) {
              zone.appendChild(draggedItem);
            }
          });
        });

        if (resetButton) {
          resetButton.addEventListener('click', () => {
            dropZones.forEach(zone => {
              if (zone.firstChild) {
                bank.appendChild(zone.firstChild);
              }
              zone.classList.remove('correct', 'incorrect');
            });
          });
        }
      }

      // Attach main event handler to quiz container
      quizContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        const questionWrapper = questions[currentQuestionIndex];
        if (!questionWrapper) return;
        const isAnswered = Array.from(questionWrapper.querySelectorAll('button, input')).some(el => el.disabled);
        if(isAnswered) return;
        const questionType = questionWrapper.dataset.questionType;
        if (questionType === 'multiple_choice' && event.target.closest('.mcq-option-btn')) {
          handleAnswer(questionWrapper, event);
        } else if (questionType === 'fill_in_the_blank' && event.target.closest('.fill-blank-submit-btn')) {
          handleAnswer(questionWrapper, event);
        } else if (questionType === 'drag_and_drop' && event.target.closest('.check-drag-drop-btn')) {
          handleAnswer(questionWrapper, event);
        }
      });

      retakeButton.addEventListener('click', resetQuiz);
      if (totalQuestionsIndicator) totalQuestionsIndicator.textContent = questions.length;
      questions.forEach(q => {
        if (q.dataset.questionType === 'drag_and_drop') {
          // Re-initialize drag-and-drop logic if needed
          setupDragAndDrop(q);
        }
      });
      showQuestion(0);
    });
  }, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  // Fill in the Blank (QUIZ MODE: no feedback until end, just save answers and go next)
  document.querySelectorAll('.check-fill-blank-btn').forEach(button => {
    button.addEventListener('click', () => {
      const container = button.closest('.block-fill-in-blank');
      const inputs = container.querySelectorAll('.fill-blank-input');
      const feedback = container.querySelector('.feedback');
      let allFilled = true;
      let userAnswers = [];
      inputs.forEach(input => {
        const userAnswer = input.value.trim();
        if (!userAnswer) allFilled = false;
        userAnswers.push(userAnswer);
      });
      feedback.className = 'feedback'; // Reset
      if (!allFilled) {
        feedback.textContent = 'Please answer all blanks.';
        feedback.classList.add('visible', 'notice');
        return;
      }
      // Save answers for scoring at the end
      container.dataset.userAnswers = JSON.stringify(userAnswers);
      // Go to next quiz step (handled by quiz step logic)
      const quizStepBlock = container.closest('.quiz-step-block');
      if (quizStepBlock) {
        const step = parseInt(quizStepBlock.getAttribute('data-step'));
        const quizBlocks = document.querySelectorAll('.quiz-step-block');
        if (step < quizBlocks.length) {
          quizStepBlock.style.display = 'none';
          quizBlocks[step].style.display = '';
        } else {
          // Last step: show score and review
          showQuizScoreAndReview();
        }
      }
    });
  });

  // Multiple Choice
  document.querySelectorAll('.check-mcq-btn').forEach(button => {
    button.addEventListener('click', () => {
      const container = button.closest('.block-multiple-choice');
      const selected = container.querySelector('input[type="radio"]:checked');
      const correct = button.dataset.correct.trim().toLowerCase();
      const feedback = container.querySelector('.feedback');

      feedback.className = 'feedback'; // Reset
      if (!selected) {
        feedback.textContent = 'Please select an option.';
        feedback.classList.add('visible', 'notice');
      } else if (selected.value === correct) {
        feedback.textContent = 'Correct! 🎉';
        feedback.classList.add('visible', 'correct');
      } else {
        feedback.textContent = 'Incorrect. Try again.';
        feedback.classList.add('visible', 'incorrect');
      }
    });
  });

  // --- Modern MCQ Image Style Logic ---
  document.querySelectorAll('.block-multiple-choice.mcq-image-style').forEach(function(block) {
    const questions = block.querySelectorAll('.mcq-question-row');
    const nextBtn = block.querySelector('.mcq-next-btn');
    const feedback = block.querySelector('.feedback');
    let answers = Array(questions.length).fill(null);

    // Option selection logic
    questions.forEach((qRow, qIdx) => {
      const opts = qRow.querySelectorAll('.mcq-option-btn');
      opts.forEach((btn, optIdx) => {
        btn.addEventListener('click', function() {
          // Deselect all in this question
          opts.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          answers[qIdx] = btn.textContent.trim();
          // Enable Next if all answered
          if (answers.every(a => a !== null)) {
            nextBtn.disabled = false;
            nextBtn.style.display = '';
          }
        });
      });
    });

    // Next button logic
    nextBtn.disabled = true;
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', function() {
      // Save answers for scoring
      block.dataset.userAnswers = JSON.stringify(answers);
      // Go to next quiz step (handled by quiz step logic)
      const quizStepBlock = block.closest('.quiz-step-block');
      if (quizStepBlock) {
        const step = parseInt(quizStepBlock.getAttribute('data-step'));
        const quizBlocks = document.querySelectorAll('.quiz-step-block');
        if (step < quizBlocks.length) {
          quizStepBlock.style.display = 'none';
          quizBlocks[step].style.display = '';
        } else {
          // Last step: show score and review
          showQuizScoreAndReview();
        }
      }
    });
  });

  // Drag and Drop
  let dragSrcEl = null;

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.pair);
    this.classList.add('dragging');
  }

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDragEnter(e) {
    this.classList.add('over');
  }

  function handleDragLeave(e) {
    this.classList.remove('over');
  }

  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();

    const dragData = e.dataTransfer.getData('text/plain');
    const dropZone = this;

    // Append the dragged element inside the drop zone if empty
    if (!dropZone.querySelector('.drag-item')) {
      dropZone.appendChild(dragSrcEl);
      dropZone.classList.remove('over');
    }

    return false;
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('over'));
  }

  // Setup drag and drop event listeners
  document.querySelectorAll('.drag-item').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
  });

  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragenter', handleDragEnter);
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
  });

  // Check Drag and Drop answers
  document.querySelectorAll('.check-drag-drop-btn').forEach(button => {
    button.addEventListener('click', () => {
      const container = button.closest('.block-drag-and-drop');
      const dropZones = container.querySelectorAll('.drop-zone');
      const feedback = container.querySelector('.feedback');

      feedback.className = 'feedback'; // Reset
      let allCorrect = true;
      dropZones.forEach(zone => {
        // Defensive: handle undefined dataset or pair
        const expected = (zone.dataset && zone.dataset.pair ? zone.dataset.pair : '').trim().toLowerCase();
        const draggedItem = zone.querySelector('.drag-item');
        if (!draggedItem) {
          allCorrect = false;
        } else {
          const draggedPair = (draggedItem.dataset && draggedItem.dataset.pair ? draggedItem.dataset.pair : '').trim().toLowerCase();
          if (draggedPair !== expected) {
            allCorrect = false;
          }
        }
      });
      if (allCorrect) {
        feedback.textContent = 'All matches are correct! 🎉';
        feedback.classList.add('visible', 'correct');
      } else {
        feedback.textContent = 'Some matches are incorrect. Try again.';
        feedback.classList.add('visible', 'incorrect');
      }
    });
  });

  // --- Quiz Step Navigation and Progress Bar ---
  function updateQuizProgressBar(currentStep) {
    const steps = document.querySelectorAll('#quiz-progress-bar .quiz-step');
    steps.forEach((step, idx) => {
      step.classList.remove('quiz-step-active', 'quiz-step-completed');
      if (idx === currentStep - 1) {
        step.classList.add('quiz-step-active');
      } else if (idx < currentStep - 1) {
        step.classList.add('quiz-step-completed');
      }
    });
  }

  // --- Unified Quiz Step Logic ---
  const quizBlocks = document.querySelectorAll('.quiz-step-block');
  let currentQuizStep = 1;
  updateQuizProgressBar(currentQuizStep);
  quizBlocks.forEach((block, idx) => {
    if (idx !== 0) block.style.display = 'none';
  });

  function goToQuizStep(step) {
    quizBlocks.forEach((block, idx) => {
      block.style.display = (idx === step - 1) ? '' : 'none';
    });
    updateQuizProgressBar(step);
    currentQuizStep = step;
  }

  // Attach Next button logic to all quiz blocks
  quizBlocks.forEach((block, idx) => {
    let nextBtn = block.querySelector('.quiz-next-btn');
    if (!nextBtn) {
      // If not present, create one
      nextBtn = document.createElement('button');
      nextBtn.className = 'quiz-next-btn themed-btn';
      nextBtn.textContent = (idx === quizBlocks.length - 1) ? 'Finish' : 'Next';
      block.appendChild(nextBtn);
    }
    nextBtn.addEventListener('click', function() {
      // Save user answers for this block type
      // (Assume each block partial saves answers in block.dataset.userAnswers)
      if (idx < quizBlocks.length - 1) {
        goToQuizStep(idx + 2);
      } else {
        // Last step: show score and review
        showQuizScoreAndReview();
      }
    });
  });

  // --- Unified Quiz Scoring ---
  function showQuizScoreAndReview() {
    let correct = 0, total = 0, reviewHtml = '';
    // Fill in the blanks
    document.querySelectorAll('.quiz-step-block .block-fill-in-blank').forEach(fillBlock => {
      const userAnswers = JSON.parse(fillBlock.dataset.userAnswers || '[]');
      fillBlock.querySelectorAll('.fill-blank-input').forEach((input, i) => {
        total++;
        const correctAnswers = (input.dataset.answer || '').split(',').map(s => s.trim().toLowerCase());
        const userAns = (userAnswers[i] || '').trim().toLowerCase();
        if (correctAnswers.includes(userAns)) {
          correct++;
        } else {
          reviewHtml += `<div class='quiz-review-item'>❌ <b>${input.dataset.question || input.placeholder || 'Blank ' + (i+1)}</b><br> Your answer: <code>${userAnswers[i] || ''}</code><br>Correct: <code>${correctAnswers[0]}</code></div>`;
        }
      });
    });
    // Multiple choice
    document.querySelectorAll('.quiz-step-block .block-multiple-choice').forEach(mcqBlock => {
      const userAnswers = JSON.parse(mcqBlock.dataset.userAnswers || '[]');
      mcqBlock.querySelectorAll('.mcq-question-row').forEach((qRow, i) => {
        total++;
        // Get correct index and correct text from data attributes or fallback to block data
        let correctIdx = qRow.dataset.correctIdx !== undefined ? parseInt(qRow.dataset.correctIdx) : null;
        if (correctIdx === null || isNaN(correctIdx)) {
          // Try to get from the block's questions array if available
          if (mcqBlock.dataset.questions) {
            try {
              const questions = JSON.parse(mcqBlock.dataset.questions);
              if (questions[i] && typeof questions[i].correct_index !== 'undefined') {
                correctIdx = parseInt(questions[i].correct_index);
              }
            } catch (e) {}
          }
        }
        // Fallback: use 0 if still not found
        if (correctIdx === null || isNaN(correctIdx)) correctIdx = 0;
        const opts = qRow.querySelectorAll('.mcq-option-btn');
        const correctText = opts[correctIdx] ? opts[correctIdx].textContent.trim() : '';
        const userAns = userAnswers[i] || '';
        if (userAns === correctText) {
          correct++;
        } else {
          // Show the question as plain text (strip HTML if present)
          let questionText = qRow.querySelector('.mcq-question') ? qRow.querySelector('.mcq-question').innerText : '';
          reviewHtml += `<div class='quiz-review-item'>❌ <b>${questionText}</b><br> Your answer: <code>${userAns || '<em>(no answer)</em>'}</code><br>Correct: <code>${correctText || '<em>(no correct answer set)</em>'}</code></div>`;
        }
      });
    });
    // Drag and drop
    document.querySelectorAll('.quiz-step-block .block-drag-and-drop').forEach(dragBlock => {
      const userPairs = JSON.parse(dragBlock.dataset.userAnswers || '[]');
      const stems = Array.from(dragBlock.querySelectorAll('.drag-stem')).map(e => e.textContent.trim());
      const correctMapping = JSON.parse(dragBlock.dataset.correctMapping || '{}');
      stems.forEach((stem, i) => {
        total++;
        const correctAns = correctMapping[stem];
        const userAns = userPairs[i] || '';
        if (userAns === correctAns) {
          correct++;
        } else {
          reviewHtml += `<div class='quiz-review-item'>❌ <b>${stem}</b><br> Your answer: <code>${userAns}</code><br>Correct: <code>${correctAns}</code></div>`;
        }
      });
    });
    // Show score summary
    const percent = total ? Math.round((correct / total) * 100) : 0;
    const summary = document.getElementById('quiz-score-summary');
    if (summary) {
      summary.style.display = '';
      summary.className = 'quiz-score-summary ' + (percent >= 70 ? 'pass' : 'fail');
      summary.innerHTML = `<span>${percent >= 70 ? '🎉' : '😢'}</span> <strong>${percent >= 70 ? 'Congratulations!' : 'Keep practicing!'}</strong><br>Your score: <span>${percent}</span>/100<br><span>${percent >= 70 ? 'You passed!' : 'You did not pass. Try again!'}</span>`;
      if (reviewHtml) {
        summary.innerHTML += `<div class='quiz-review-list'><h4>Review your mistakes:</h4>${reviewHtml}</div>`;
      }
    }
    // Hide all quiz step blocks
    quizBlocks.forEach(b => b.style.display = 'none');
    updateQuizProgressBar(quizBlocks.length + 1); // Move progress bar past last step
  }

  // Expose MCQ questions for scoring
  window.quizQuestions = [];
  document.querySelectorAll('.block-multiple-choice.mcq-image-style').forEach(function(block) {
    var questions = [];
    block.querySelectorAll('.mcq-question-row').forEach(function(qRow, idx) {
      var q = {};
      q.question = qRow.querySelector('.mcq-question').textContent;
      q.options = Array.from(qRow.querySelectorAll('.mcq-option-btn')).map(btn => btn.textContent.trim());
      q.correct_index = qRow.dataset.correctIdx ? parseInt(qRow.dataset.correctIdx) : null;
      questions.push(q);
    });
    window.quizQuestions = questions;
  });

  // Make setupAceEditor globally available for code_editor.html partial
  window.setupAceEditor = function(editorId, defaultCode) {
    if (!window.aceEditors) window.aceEditors = {};
    if (window.aceEditors[editorId]) return;
    var editor = ace.edit(editorId);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/python");
    editor.setValue(defaultCode, -1);
    window.aceEditors[editorId] = editor;
  };

  function showQuizScoreAndReview() {
    // Calculate score and show summary
    let total = 0;
    let correct = 0;
    let reviewHtml = '';
    // Fill in the blanks
    const fillBlock = document.querySelector('.quiz-step-block .block-fill-in-blank');
    if (fillBlock) {
      const inputs = fillBlock.querySelectorAll('.fill-blank-input');
      const userAnswers = JSON.parse(fillBlock.dataset.userAnswers || '[]');
      inputs.forEach((input, i) => {
        total++;
        const correctAnswers = (input.dataset.answer || '').split(',').map(s => s.trim().toLowerCase());
        const userAns = (userAnswers[i] || '').trim().toLowerCase();
        if (correctAnswers.includes(userAns)) {
          correct++;
        } else {
          reviewHtml += `<div class='quiz-review-item'>❌ <b>${input.dataset.question || input.placeholder || 'Blank ' + (i+1)}</b><br> Your answer: <code>${userAnswers[i] || ''}</code><br>Correct: <code>${correctAnswers[0]}</code></div>`;
        }
      });
    }
    // Multiple choice
    const mcqBlock = document.querySelector('.quiz-step-block .block-multiple-choice');
    if (mcqBlock) {
      const userAnswers = JSON.parse(mcqBlock.dataset.userAnswers || '[]');
      mcqBlock.querySelectorAll('.mcq-question-row').forEach((qRow, i) => {
        total++;
        const correctIdx = parseInt(qRow.dataset.correctIdx || (window.quizQuestions && window.quizQuestions[i] && window.quizQuestions[i].correct_index) || 0);
        const correctText = qRow.querySelectorAll('.mcq-option-btn')[correctIdx].textContent.trim();
        const userAns = userAnswers[i] || '';
        if (userAns === correctText) {
          correct++;
        } else {
          reviewHtml += `<div class='quiz-review-item'>❌ <b>${qRow.querySelector('.mcq-question').textContent}</b><br> Your answer: <code>${userAns}</code><br>Correct: <code>${correctText}</code></div>`;
        }
      });
    }
    // Drag and drop
    const dragBlock = document.querySelector('.quiz-step-block .block-drag-and-drop');
    if (dragBlock) {
      const userPairs = JSON.parse(dragBlock.dataset.userAnswers || '[]');
      const stems = Array.from(dragBlock.querySelectorAll('.drag-stem')).map(e => e.textContent.trim());
      const correctMapping = JSON.parse(dragBlock.dataset.correctMapping || '{}');
      stems.forEach((stem, i) => {
        total++;
        const correctAns = correctMapping[stem];
        const userAns = userPairs[i] || '';
        if (userAns === correctAns) {
          correct++;
        } else {
          reviewHtml += `<div class='quiz-review-item'>❌ <b>${stem}</b><br> Your answer: <code>${userAns}</code><br>Correct: <code>${correctAns}</code></div>`;
        }
      });
    }
    // Show score summary
    const percent = Math.round((correct / total) * 100);
    const summary = document.getElementById('quiz-score-summary');
    if (summary) {
      summary.style.display = '';
      summary.className = 'quiz-score-summary ' + (percent >= 70 ? 'pass' : 'fail');
      summary.innerHTML = `<span>${percent >= 70 ? '🎉' : '😢'}</span> <strong>${percent >= 70 ? 'Congratulations!' : 'Keep practicing!'}</strong><br>Your score: <span>${percent}</span>/100<br><span>${percent >= 70 ? 'You passed!' : 'You did not pass. Try again!'}</span>`;
      if (reviewHtml) {
        summary.innerHTML += `<div class='quiz-review-list'><h4>Review your mistakes:</h4>${reviewHtml}</div>`;
      }
    }
    // Hide all quiz step blocks
    document.querySelectorAll('.quiz-step-block').forEach(b => b.style.display = 'none');
  }
});

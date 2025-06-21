// MCQ Inline Logic
// Handles single selection, feedback, disables options, highlights correct answer, and tracks progress/score

document.addEventListener('DOMContentLoaded', function () {
  const mcqBlocks = document.querySelectorAll('.block-multiple-choice');
  let totalQuestions = mcqBlocks.length;
  let answeredCount = 0;
  let correctCount = 0;
  let userAnswers = [];

  mcqBlocks.forEach((block, blockIdx) => {
    const buttons = block.querySelectorAll('.mcq-option-btn');
    const feedback = block.querySelector('.mcq-feedback');
    let answered = false;
    // Find correct answer index from data-correct-idx or mark in template
    let correctIdx = null;
    buttons.forEach((btn, idx) => {
      if (btn.classList.contains('correct-answer')) correctIdx = idx;
    });
    // If not marked, fallback to data-correct-idx
    if (correctIdx === null && block.dataset.correctIdx) {
      correctIdx = parseInt(block.dataset.correctIdx, 10);
    }
    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        answeredCount++;
        // Disable all buttons
        buttons.forEach(b => b.disabled = true);
        // Mark selected and correct/incorrect
        if (idx === correctIdx) {
          btn.classList.add('mcq-correct');
          if (feedback) {
            feedback.textContent = 'Correct!';
            feedback.className = 'mcq-feedback correct';
            feedback.style.display = 'block';
          }
          correctCount++;
        } else {
          btn.classList.add('mcq-incorrect');
          if (feedback) {
            feedback.textContent = 'Incorrect.';
            feedback.className = 'mcq-feedback incorrect';
            feedback.style.display = 'block';
          }
          if (typeof correctIdx === 'number' && buttons[correctIdx]) {
            buttons[correctIdx].classList.add('mcq-correct');
          }
        }
        // Save answer
        userAnswers[blockIdx] = {
          selected: idx,
          correct: correctIdx,
          isCorrect: idx === correctIdx
        };
        // Optionally, show summary if all answered
        if (answeredCount === totalQuestions) {
          showMcqSummary();
        }
      });
    });
  });

  function showMcqSummary() {
    // Simple summary modal/alert (customize as needed)
    let percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    alert(`Quiz complete!\nScore: ${correctCount} / ${totalQuestions} (${percent}%)`);
    // You can replace this with a custom modal or summary block
  }
});

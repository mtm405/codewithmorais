// Quiz summary block logic: shows summary after each question section
window.renderQuizSummaryBlock = function({
  container, topic, correct, total, feedback }) {
  let summary = container.querySelector('.quiz-summary-block');
  if (!summary) {
    summary = document.createElement('div');
    summary.className = 'quiz-summary-block';
    container.appendChild(summary);
  }
  summary.innerHTML = `
    <div class="quiz-summary-header">
      <h3>Quiz Summary</h3>
      <p class="quiz-summary-topic">${topic || ''}</p>
    </div>
    <div class="quiz-summary-stats">
      <span class="quiz-summary-correct">${correct}</span> / <span class="quiz-summary-total">${total}</span> correct
      (<span class="quiz-summary-percent">${total ? Math.round(100 * correct / total) : 0}</span>%)
    </div>
    <div class="quiz-summary-feedback">${feedback || ''}</div>
  `;
  summary.style.display = '';
};

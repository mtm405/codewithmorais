// lesson.js
// Attach quiz handlers for MCQ and other quiz blocks in lesson pages

document.addEventListener('DOMContentLoaded', function() {
  if (window.attachQuizHandlers) {
    attachQuizHandlers();
  }
});

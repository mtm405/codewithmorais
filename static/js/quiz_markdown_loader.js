// Load marked.js for markdown rendering in quizzes
(function() {
  if (!window.marked) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = function() {
      window.marked.setOptions({
        breaks: true,
        gfm: true
      });
    };
    document.head.appendChild(script);
  }
})();

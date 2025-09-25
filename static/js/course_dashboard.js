// course_dashboard.js
// JS for Course Dashboard: leaderboard confetti, fake data, and UI interactivity

// Remove ES6 import, use global import for quiz_core.js
// import { handleQuizSubmit } from './quiz_core.js';
// Instead, ensure quiz_core.js is loaded via <script> in dashboard_course.html before course_dashboard.js
// All quiz_core.js functions are now available globally

document.addEventListener('DOMContentLoaded', function() {
  // --- Announcements (Demo, replace with real API) ---
  const announcementText = document.getElementById('dashboard-announcement-text');
  if (announcementText) {
    // Example: fetch from /api/announcements
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          announcementText.textContent = data[0].content;
        }
      })
      .catch(() => {});
  }

  // --- Leaderboard (Firebase: use points, top 5, always show current user, first name, medals inline after rank) ---
  fetch('/api/leaderboard')
    .then(res => res.json())
    .then(data => {
      const leaderboard = data.leaderboard || [];
      const leaderboardList = document.getElementById('leaderboard-list');
      if (leaderboardList) {
        leaderboardList.innerHTML = '';
        // Top 5
        const top5 = leaderboard.slice(0, 5);
        let userInTop5 = false;
        top5.forEach((entry, idx) => {
          if (entry.is_current_user) userInTop5 = true;
          const tr = document.createElement('tr');
          if (idx === 0) tr.classList.add('top');
          if (entry.is_current_user) tr.classList.add('you');
          // Medal emoji for top 3
          let medal = '';
          if (idx === 0) medal = '🥇';
          else if (idx === 1) medal = '🥈';
          else if (idx === 2) medal = '🥉';
          // Only first name
          const firstName = entry.username ? entry.username.split(' ')[0] : '';
          tr.innerHTML = `
            <td>${entry.rank}${medal ? ' <span class="medal">' + medal + '</span>' : ''}</td>
            <td><span>${firstName}</span></td>
            <td>${entry.points}</td>
          `;
          leaderboardList.appendChild(tr);
        });
        // If current user not in top 5, show them at the bottom
        if (!userInTop5) {
          const you = leaderboard.find(e => e.is_current_user);
          if (you) {
            const tr = document.createElement('tr');
            tr.classList.add('you');
            const firstName = you.username ? you.username.split(' ')[0] : '';
            tr.innerHTML = `
              <td>${you.rank}</td>
              <td><span>${firstName}</span></td>
              <td>${you.points}</td>
            `;
            // Add a separator row for clarity
            const sep = document.createElement('tr');
            sep.innerHTML = `<td colspan="3" style="text-align:center;color:#888;">...</td>`;
            leaderboardList.appendChild(sep);
            leaderboardList.appendChild(tr);
          }
        }
      }
    })
    .catch(() => {});

  // --- Daily Challenge Activities (Unified, new logic only) ---
  let dailyChallengeActivities = [];
  let currentDailyChallengeIdx = 0;

  function renderDailyChallengeActivity(idx) {
    const activity = dailyChallengeActivities[idx];
    const container = document.getElementById('daily-challenge-content');
    if (!activity || !container) return;
    let html = `<div class="challenge-title">${activity.title || ''}</div>`;
    html += `<div class="challenge-prompt">${activity.prompt || activity.question || activity.instructions || ''}</div>`;
    html += `<div class="activity-nav"><button id="activity-prev" aria-label="Previous Activity">&#8592;</button> <span>${idx+1} / ${dailyChallengeActivities.length}</span> <button id="activity-next" aria-label="Next Activity">&#8594;</button> <button id="test-challenge-btn">Test Next Challenge</button></div>`;
    // Render by type
    if (activity.type === 'code' || activity.type === 'timed' || activity.type === 'debug') {
      html += `<div id="activity-ace-editor" style="height:180px;width:100%;margin-bottom:1em;"></div>`;
      html += `<button class="btn-primary" id="run-btn">Run</button>`;
      html += `<div id="activity-feedback" style="margin-top:1em;" aria-live="polite"></div>`;
    } else if (activity.type === 'fill_in_the_blank') {
      html += `<div class="fill-blank-question">${activity.question}</div>`;
      html += `<input type="text" id="fill-blank-input" style="width:100%" aria-label="Fill in the blank" />`;
      html += `<button class="btn-primary" id="check-fill-blank">Check</button>`;
      html += `<div class="quiz-feedback display-none" id="quiz-feedback" aria-live="polite"></div>`;
    } else if (activity.type === 'drag_and_drop') {
      html += `<div class="drag-drop-instructions">${activity.instructions}</div>`;
      html += '<ul>' + activity.pairs.map(pair => `<li>${pair.left} &rarr; ${pair.right}</li>`).join('') + '</ul>';
      html += `<button class="btn-primary" id="check-drag-drop">Check</button>`;
      html += `<div class="quiz-feedback display-none" id="quiz-feedback" aria-live="polite"></div>`;
    }
    container.innerHTML = html;
    // Navigation events
    const prevBtn = document.getElementById('activity-prev');
    const nextBtn = document.getElementById('activity-next');
    const testBtn = document.getElementById('test-challenge-btn');
    if (prevBtn) prevBtn.onclick = () => {
      if (dailyChallengeActivities.length > 0) {
        currentDailyChallengeIdx = (currentDailyChallengeIdx - 1 + dailyChallengeActivities.length) % dailyChallengeActivities.length;
        renderDailyChallengeActivity(currentDailyChallengeIdx);
      }
    };
    if (nextBtn) nextBtn.onclick = () => {
      if (dailyChallengeActivities.length > 0) {
        currentDailyChallengeIdx = (currentDailyChallengeIdx + 1) % dailyChallengeActivities.length;
        renderDailyChallengeActivity(currentDailyChallengeIdx);
      }
    };
    if (testBtn) testBtn.onclick = () => {
      currentDailyChallengeIdx = (currentDailyChallengeIdx + 1) % dailyChallengeActivities.length;
      renderDailyChallengeActivity(currentDailyChallengeIdx);
    };
    // MCQ logic
    if (activity.type === 'quiz' || activity.type === 'mcq' || activity.type === 'multiple_choice_quiz') {
      const feedbackDiv = document.getElementById('quiz-feedback');
      const quizBtns = document.querySelectorAll('.quiz-opt');
      quizBtns.forEach(btn => {
        btn.onclick = async function() {
          // Deselect all, select this
          quizBtns.forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
          btn.classList.add('selected');
          btn.setAttribute('aria-pressed', 'true');
          if (feedbackDiv) feedbackDiv.classList.add('display-none');
          const selectedIdx = parseInt(btn.getAttribute('data-idx'));
          await handleQuizSubmit({
            questionId: activity.id,
            type: 'multiple_choice_quiz',
            userInput: selectedIdx,
            correctAnswer: activity.correct_index,
            points: activity.points || 1,
            currency: activity.tokens || 1,
            feedbackElement: feedbackDiv,
            mode: 'inline'
          });
        };
      });
    }
    // Only handle unified fill_in_the_blanks and drag_and_drop types
    if (activity.type === 'fill_in_the_blank') {
      const feedbackDiv = document.getElementById('quiz-feedback');
      const checkBtn = document.getElementById('check-fill-blank');
      if (checkBtn) checkBtn.onclick = async function() {
        if (feedbackDiv) feedbackDiv.classList.add('display-none');
        const userInput = document.getElementById('fill-blank-input')?.value;
        await handleQuizSubmit({
          questionId: activity.id,
          type: 'fill_in_the_blank',
          userInput,
          correctAnswer: activity.answers,
          points: activity.points || 1,
          currency: activity.tokens || 1,
          feedbackElement: feedbackDiv,
          mode: 'inline'
        });
      };
    }
    // Drag and drop logic (placeholder, real UI needed)
    if (activity.type === 'drag_and_drop') {
      const feedbackDiv = document.getElementById('quiz-feedback');
      const checkBtn = document.getElementById('check-drag-drop');
      if (checkBtn) checkBtn.onclick = async function() {
        if (feedbackDiv) feedbackDiv.classList.add('display-none');
        // For demo, assume userOrder is correctOrder
        const userOrder = activity.pairs.map((_, i) => i); // Replace with real user order
        await handleQuizSubmit({
          questionId: activity.id,
          type: 'drag_and_drop',
          userInput: userOrder,
          correctAnswer: activity.pairs.map((_, i) => i),
          points: activity.points || 1,
          currency: activity.tokens || 1,
          feedbackElement: feedbackDiv,
          mode: 'inline'
        });
      };
    }
    // Ace Editor for code/debug/timed
    if ((activity.type === 'code' || activity.type === 'timed' || activity.type === 'debug') && window.ace) {
      const aceDiv = document.getElementById('activity-ace-editor');
      if (aceDiv) {
        const editor = ace.edit(aceDiv);
        editor.setTheme('ace/theme/monokai');
        editor.session.setMode('ace/mode/python');
        editor.setValue(activity.starter_code || activity.buggy_code || '# Write your code here\n', -1);
        aceDiv.style.height = '180px';
        editor.setOptions({
          showLineNumbers: true,
          showGutter: true,
          displayIndentGuides: false
        });
        editor.setFontSize(18); // Make font bigger for daily challenge
        window.activityAceEditor = editor;
        // Run button logic
        const runBtn = document.getElementById('run-btn');
        const feedbackDiv = document.getElementById('activity-feedback');
        if (runBtn && feedbackDiv) {
          runBtn.onclick = function() {
            runBtn.disabled = true;
            feedbackDiv.textContent = 'Running...';
            fetch('/api/daily_challenge/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: editor.getValue(),
                challenge_id: activity.id,
                dev: window.location.search.includes('dev=1') ? 1 : 0
              })
            })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                feedbackDiv.innerHTML = `<span class="accent-green">${result.output || 'Correct!'}<br>+${result.points || 0} points, +${result.tokens || 0} tokens</span>`;
              } else {
                feedbackDiv.innerHTML = `<span class="accent-red">${result.output || 'Incorrect.'}</span>`;
              }
              runBtn.disabled = false;
            })
            .catch(() => {
              feedbackDiv.innerHTML = '<span class="accent-red">Error running code.</span>';
              runBtn.disabled = false;
            });
          };
        }
      }
    }
  }

  // Fetch daily challenge activities once and render
  fetch('/api/daily_challenge/activities')
    .then(res => res.json())
    .then(data => {
      if (data.success && Array.isArray(data.activities)) {
        dailyChallengeActivities = data.activities;
        currentDailyChallengeIdx = 0;
        renderDailyChallengeActivity(currentDailyChallengeIdx);
      }
    })
    .catch(() => {});

  // --- Daily Challenge Notification ---
  function fetchNotifications() {
    fetch('/api/notifications')
      .then(res => res.json())
      .then data => {
        const notifications = data.notifications || [];
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');
        if (badge) badge.textContent = notifications.length;
        if (list) {
          list.innerHTML = '';
          if (notifications.length === 0) {
            list.innerHTML = '<li>No new notifications.</li>';
          } else {
            notifications.forEach(n => {
              const li = document.createElement('li');
              li.textContent = n.message;
              list.appendChild(li);
            });
          }
        }
      })
      .catch(() => {});
  }
  fetchNotifications();

  // Call fetchNotifications when challenge changes (test button)
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'test-challenge-btn') {
      setTimeout(fetchNotifications, 300); // slight delay to simulate update
    }
  });

  // --- Debug Info (Dev only) ---
  if (window.location.search.includes('debug')) {
    const debugDiv = document.getElementById('debug-info');
    if (debugDiv) {
      debugDiv.style.display = 'block';
      // Log raw responses for debugging
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
          console.log('Leaderboard data:', data);
          debugDiv.innerHTML += '<h4>Leaderboard</h4>' + JSON.stringify(data, null, 2);
        })
        .catch(err => console.error('Error fetching leaderboard:', err));
      fetch('/api/daily_challenge/activities')
        .then(res => res.json())
        .then(data => {
          console.log('Daily challenge data:', data);
          debugDiv.innerHTML += '<h4>Daily Challenge</h4>' + JSON.stringify(data, null, 2);
        })
        .catch(err => console.error('Error fetching daily challenge:', err));
      fetch('/api/progress')
        .then(res => res.json())
        .then(data => {
          console.log('Progress data:', data);
          debugDiv.innerHTML += '<h4>Progress</h4>' + JSON.stringify(data, null, 2);
        })
        .catch(err => console.error('Error fetching progress:', err));
      fetch('/api/schedule')
        .then(res => res.json())
        .then(data => {
          console.log('Schedule data:', data);
          debugDiv.innerHTML += '<h4>Schedule</h4>' + JSON.stringify(data, null, 2);
        })
        .catch(err => console.error('Error fetching schedule:', err));
    }
  }
});

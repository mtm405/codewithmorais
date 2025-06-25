// course_dashboard.js
// JS for Course Dashboard: leaderboard confetti, fake data, and UI interactivity

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

  // --- Daily Challenge (Demo, replace with real API) ---
  fetch('/api/daily_challenge/activities')
    .then(res => res.json())
    .then(challenge => {
      const ideDiv = document.getElementById('daily-challenge-ide');
      if (ideDiv && window.ace) {
        const editor = ace.edit(ideDiv, {
          mode: 'ace/mode/python',
          theme: 'ace/theme/monokai',
          value: challenge.starter || '# Write your solution here\n',
          fontSize: '1.08em',
          minLines: 6,
          maxLines: 18
        });
        ideDiv.style.height = '180px';
        editor.setOptions({
          showLineNumbers: true,
          showGutter: true,
          displayIndentGuides: false
        });
        window.dailyChallengeEditor = editor;
      }
    })
    .catch(() => {});

  // --- Progress (Demo, replace with real API) ---
  fetch('/api/progress')
    .then(res => res.json())
    .then(progress => {
      const progressBar = document.getElementById('progress-bar-fill');
      const progressLabel = document.getElementById('progress-bar-label');
      if (progressBar && progressLabel) {
        progressBar.style.width = progress.percent + '%';
        progressLabel.textContent = progress.percent + '% Complete';
      }
      // Optionally update progress-list here
    })
    .catch(() => {});

  // --- Schedule (Demo, replace with real API) ---
  fetch('/api/schedule')
    .then(res => res.json())
    .then(schedule => {
      const scheduleList = document.querySelector('.schedule-list');
      if (scheduleList) {
        scheduleList.innerHTML = '';
        schedule.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="schedule-date">${item.day}</span> <span class="schedule-topic">${item.topic}</span>`;
          scheduleList.appendChild(li);
        });
      }
    })
    .catch(() => {});

  // --- Daily Challenge IDE Placeholder ---
  const ideDiv = document.getElementById('daily-challenge-ide');
  if (ideDiv && window.ace) {
    const editor = ace.edit(ideDiv, {
      mode: 'ace/mode/python',
      theme: 'ace/theme/monokai',
      value: '# Write your solution here\n',
      fontSize: '1.08em',
      minLines: 6,
      maxLines: 18
    });
    ideDiv.style.height = '180px';
    editor.setOptions({
      showLineNumbers: true,
      showGutter: true,
      displayIndentGuides: false
    });
    window.dailyChallengeEditor = editor;
  }

  // --- Submit Challenge Button ---
  const submitBtn = document.getElementById('submit-challenge-btn');
  const feedbackDiv = document.getElementById('challenge-feedback');
  if (submitBtn && feedbackDiv) {
    submitBtn.addEventListener('click', function() {
      feedbackDiv.textContent = '✅ Solution submitted! (Demo)';
      if (window.confetti) {
        window.confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    });
  }

  // --- Daily Challenge Activities (New) ---
  let dailyChallengeActivities = [];
  let currentDailyChallengeIdx = 0;

  function renderDailyChallengeActivity(idx) {
    const activity = dailyChallengeActivities[idx];
    const container = document.getElementById('daily-challenge-content');
    if (!activity || !container) return;
    let html = `<div class="challenge-title">${activity.title || ''}</div>`;
    html += `<div class="challenge-prompt">${activity.prompt || activity.question || activity.instructions || ''}</div>`;
    // Navigation arrows + temp test button
    html += `<div class="activity-nav"><button id="activity-prev">&#8592;</button> <span>${idx+1} / ${dailyChallengeActivities.length}</span> <button id="activity-next">&#8594;</button> <button id="test-challenge-btn">Test Next Challenge</button></div>`;
    // Render by type
    if (activity.type === 'code' || activity.type === 'timed' || activity.type === 'debug') {
      html += `<div id="activity-ace-editor" style="height:180px;width:100%;margin-bottom:1em;"></div>`;
      html += `<button class="btn-primary" id="run-btn">Run</button>`;
      html += `<div id="activity-feedback" style="margin-top:1em;"></div>`;
    } else if (activity.type === 'quiz') {
      html += `<div class="quiz-question">${activity.question}</div>`;
      html += activity.options.map((opt, i) => `<button class="btn-primary quiz-opt" data-idx="${i}">${opt}</button>`).join('');
    } else if (activity.type === 'fill_in_blank') {
      html += `<div class="fill-blank-question">${activity.question}</div>`;
      html += `<input type="text" id="fill-blank-input" style="width:100%" />`;
      html += `<button class="btn-primary" id="check-fill-blank">Check</button>`;
    } else if (activity.type === 'drag_and_drop') {
      html += `<div class="drag-drop-instructions">${activity.instructions}</div>`;
      html += '<ul>' + activity.pairs.map(pair => `<li>${pair.left} &rarr; ${pair.right}</li>`).join('') + '</ul>';
    }
    container.innerHTML = html;
    // Navigation events
    document.getElementById('activity-prev').onclick = () => {
      if (dailyChallengeActivities.length > 0) {
        currentDailyChallengeIdx = (currentDailyChallengeIdx - 1 + dailyChallengeActivities.length) % dailyChallengeActivities.length;
        renderDailyChallengeActivity(currentDailyChallengeIdx);
      }
    };
    document.getElementById('activity-next').onclick = () => {
      if (dailyChallengeActivities.length > 0) {
        currentDailyChallengeIdx = (currentDailyChallengeIdx + 1) % dailyChallengeActivities.length;
        renderDailyChallengeActivity(currentDailyChallengeIdx);
      }
    };
    document.getElementById('test-challenge-btn').onclick = () => {
      currentDailyChallengeIdx = (currentDailyChallengeIdx + 1) % dailyChallengeActivities.length;
      renderDailyChallengeActivity(currentDailyChallengeIdx);
    };
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
      .then(data => {
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

  // --- Daily Challenge Block ---
  fetch('/api/daily_challenge/activities')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('daily-challenge-content');
      if (!container) return;
      container.innerHTML = '';
      if (!data.success || !data.activities || data.activities.length === 0) {
        container.innerHTML = '<div class="accent-red">No daily challenge available.</div>';
        return;
      }
      // For demo, just use the first code challenge
      const challenge = data.activities.find(a => a.type === 'code') || data.activities[0];
      if (!challenge) {
        container.innerHTML = '<div class="accent-red">No code challenge found.</div>';
        return;
      }
      // Render challenge
      let html = `<div class="daily-challenge-title">${challenge.title}</div>`;
      html += `<div class="daily-challenge-prompt">${challenge.prompt || challenge.question || ''}</div>`;
      if (challenge.type === 'code') {
        html += `
          <div id="daily-ace-editor" style="height:200px;width:100%;margin-bottom:1em;"></div>
          <button id="run-daily-challenge" class="btn-primary">Run</button>
          <div id="daily-challenge-feedback" style="margin-top:1em;"></div>
        `;
      }
      container.innerHTML = html;
      if (challenge.type === 'code') {
        // Wait for Ace to be loaded and the DOM to be ready
        function initAceEditor() {
          if (window.ace && document.getElementById('daily-ace-editor')) {
            const editor = ace.edit('daily-ace-editor');
            editor.setTheme('ace/theme/monokai');
            editor.session.setMode('ace/mode/python');
            editor.setValue(challenge.starter_code || '# Write your code here\n', -1);
            // Lock logic
            let locked = false;
            let devOverride = window.location.search.includes('dev=1');
            const lockKey = `daily_challenge_locked_${challenge.id}`;
            if (!devOverride && localStorage.getItem(lockKey) === 'locked') {
              locked = true;
            }
            const runBtn = document.getElementById('run-daily-challenge');
            const feedbackDiv = document.getElementById('daily-challenge-feedback');
            if (locked) {
              runBtn.disabled = true;
              feedbackDiv.innerHTML = '<span class="accent-red">You have already attempted today. Try again after 8 AM tomorrow.</span>';
            }
            runBtn.addEventListener('click', function() {
              if (locked) return;
              runBtn.disabled = true;
              feedbackDiv.innerHTML = 'Running...';
              fetch('/api/daily_challenge/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: editor.getValue(),
                  challenge_id: challenge.id,
                  dev: devOverride ? 1 : 0
                })
              })
              .then(res => res.json())
              .then(result => {
                if (result.success) {
                  feedbackDiv.innerHTML = `<span class="accent-green">${result.output || 'Correct!'}<br>+${result.points || 0} points, +${result.tokens || 0} tokens</span>`;
                  if (!devOverride) localStorage.setItem(lockKey, 'locked');
                  locked = true;
                } else {
                  feedbackDiv.innerHTML = `<span class="accent-red">${result.output || 'Incorrect.'}</span>`;
                  if (!devOverride) localStorage.setItem(lockKey, 'locked');
                  locked = true;
                }
                runBtn.disabled = true;
              })
              .catch(() => {
                feedbackDiv.innerHTML = '<span class="accent-red">Error running code.</span>';
                runBtn.disabled = false;
              });
            });
          } else {
            setTimeout(initAceEditor, 100); // Wait and try again
          }
        }
        initAceEditor();
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

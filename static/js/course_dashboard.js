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
  fetch('/api/daily-challenge')
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
});

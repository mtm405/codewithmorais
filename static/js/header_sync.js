// static/js/header_sync.js
// This script fetches the latest user_name and currency from the backend and updates the header on every page.

document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/get_user_info')
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        // Update user_name in greeting
        const userNameEl = document.getElementById('user-name-display');
        if (userNameEl && data.user_name) {
          userNameEl.textContent = data.user_name;
        }
        // Update currency
        const currencyEl = document.getElementById('currency-value');
        if (currencyEl && typeof data.currency !== 'undefined') {
          currencyEl.textContent = data.currency;
        }
        // Update greeting based on time and name
        const greetingEl = document.getElementById('time-based-greeting');
        if (greetingEl) {
          const now = new Date();
          const hour = now.getHours();
          let greeting = 'Good evening,';
          if (hour >= 5 && hour < 12) greeting = 'Good morning,';
          else if (hour >= 12 && hour < 18) greeting = 'Good afternoon,';
          greetingEl.textContent = `${greeting}`;
        }
        // Update or insert live clock in header
        let clockEl = document.getElementById('live-clock');
        if (!clockEl) {
          clockEl = document.createElement('span');
          clockEl.id = 'live-clock';
          clockEl.style.marginLeft = '10px';
          clockEl.style.fontWeight = 'bold';
          const header = document.querySelector('.header-bar, .header, .main-header, header');
          if (header) {
            header.appendChild(clockEl);
          } else if (greetingEl && greetingEl.parentNode) {
            greetingEl.parentNode.appendChild(clockEl);
          }
        }
        function updateLiveClock() {
          const now = new Date();
          let h = now.getHours();
          const m = now.getMinutes().toString().padStart(2, '0');
          const s = now.getSeconds().toString().padStart(2, '0');
          let ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          h = h ? h : 12; // 0 should be 12
          clockEl.textContent = ` ${h}:${m}:${s} ${ampm}`;
        }
        updateLiveClock();
        setInterval(updateLiveClock, 1000);
        // Update points under user_title
        const pointsEl = document.getElementById('user-points-value');
        if (pointsEl && typeof data.total_points !== 'undefined') {
          pointsEl.textContent = data.total_points;
        }
        // Update points in sidebar
        const sidebarPointsEl = document.getElementById('sidebar-user-points');
        if (sidebarPointsEl && typeof data.total_points !== 'undefined') {
          sidebarPointsEl.textContent = data.total_points;
        }
      }
    });
});

// static/js/header_sync.js
// This script fetches the latest user_name and currency from the backend and updates the header on every page.

document.addEventListener("DOMContentLoaded", function() {
  fetch("/api/get_user_info")
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        // Update user_name in greeting
        const userNameEl = document.getElementById("user-name-display");
        if (userNameEl && data.user_name) {
          userNameEl.textContent = data.user_name;
        }
        // Update currency
        const currencyEl = document.getElementById("currency-value");
        if (currencyEl && typeof data.currency !== "undefined") {
          currencyEl.textContent = data.currency;
        }
        // Update greeting based on time and name
        const greetingEl = document.getElementById("time-based-greeting");
        if (greetingEl) {
          const now = new Date();
          const hour = now.getHours();
          let greeting = "Good evening,";
          if (hour >= 5 && hour < 12) greeting = "Good morning,";
          else if (hour >= 12 && hour < 18) greeting = "Good afternoon,";
          greetingEl.textContent = `${greeting}`;
        }
        // Update or insert live clock in header
        let clockEl = document.getElementById("live-clock");
        if (!clockEl) {
          clockEl = document.createElement("span");
          clockEl.id = "live-clock";
          clockEl.style.marginLeft = "10px";
          clockEl.style.fontWeight = "bold";
          const header = document.querySelector(".header-bar, .header, .main-header, header");
          if (header) {
            header.appendChild(clockEl);
          } else if (greetingEl && greetingEl.parentNode) {
            greetingEl.parentNode.appendChild(clockEl);
          }
        }
        function updateLiveClock() {
          const now = new Date();
          let h = now.getHours();
          const m = now.getMinutes().toString().padStart(2, "0");
          const s = now.getSeconds().toString().padStart(2, "0");
          let ampm = h >= 12 ? "PM" : "AM";
          h = h % 12;
          h = h ? h : 12; // 0 should be 12
          clockEl.textContent = ` ${h}:${m}:${s} ${ampm}`;
        }
        updateLiveClock();
        setInterval(updateLiveClock, 1000);
        // Update points under user_title
        const pointsEl = document.getElementById("user-points-value");
        if (pointsEl && typeof data.total_points !== "undefined") {
          pointsEl.textContent = data.total_points;
        }
        // Update points in sidebar
        const sidebarPointsEl = document.getElementById("sidebar-user-points");
        if (sidebarPointsEl && typeof data.total_points !== "undefined") {
          sidebarPointsEl.textContent = data.total_points;
        }
      }
    });
});

// Search bar open/close logic
(function() {
  const searchWrapper = document.getElementById('searchInputWrapper');
  const searchInput = document.getElementById('searchInput');
  const searchIcon = document.getElementById('search-toggle-icon');
  if (!searchWrapper || !searchInput || !searchIcon) return;

  // Open search bar on icon click
  searchIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!searchWrapper.classList.contains('active')) {
      searchWrapper.classList.add('active');
      searchInput.tabIndex = 0;
      searchInput.focus();
    }
  });

  // Also open on wrapper click (if not already open)
  searchWrapper.addEventListener('click', function(e) {
    if (!searchWrapper.classList.contains('active')) {
      searchWrapper.classList.add('active');
      searchInput.tabIndex = 0;
      searchInput.focus();
    }
  });

  // Close search bar on outside click
  document.addEventListener('click', function(e) {
    if (!searchWrapper.contains(e.target)) {
      searchWrapper.classList.remove('active');
      searchInput.tabIndex = -1;
      searchInput.value = '';
    }
  });

  // Close on Escape
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchWrapper.classList.remove('active');
      searchInput.tabIndex = -1;
      searchInput.value = '';
      searchWrapper.blur && searchWrapper.blur();
    }
  });
})();

// --- Enhanced Notifications Logic ---
async function fetchNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const data = await res.json();
    updateNotificationUI(data.notifications || []);
  } catch (e) {
    console.error('Failed to fetch notifications', e);
  }
}

function updateNotificationUI(notifications) {
  const badge = document.querySelector('.notification-icon .badge');
  const dropdown = document.getElementById('notificationDropdown');
  if (badge) badge.textContent = notifications.length > 0 ? notifications.length : '';
  if (dropdown) {
    dropdown.innerHTML = notifications.length
      ? notifications.map((n, i) => `<div class="notification-item" tabindex="0" data-index="${i}">${n.text}</div>`).join('')
      : '<div class="notification-item empty">No notifications</div>';
  }
}

// Mark notifications as read
async function markNotificationsRead() {
  await fetch('/api/notifications/read', { method: 'POST' });
  fetchNotifications();
}

(function() {
  const notifIcon = document.querySelector('.notification-icon');
  const notifDropdown = document.getElementById('notificationDropdown');
  if (!notifIcon || !notifDropdown) return;

  notifIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = notifDropdown.style.display === 'block';
    notifDropdown.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      notifDropdown.focus && notifDropdown.focus();
      markNotificationsRead();
    }
  });

  // Keyboard navigation for notifications
  notifDropdown.addEventListener('keydown', function(e) {
    const items = notifDropdown.querySelectorAll('.notification-item:not(.empty)');
    if (!items.length) return;
    let idx = Array.from(items).findIndex(item => item === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length].focus();
    } else if (e.key === 'Enter' && idx >= 0) {
      items[idx].click();
    }
  });

  // Click handler for notification items (customize as needed)
  notifDropdown.addEventListener('click', function(e) {
    if (e.target.classList.contains('notification-item') && !e.target.classList.contains('empty')) {
      // Example: show alert or navigate
      alert(e.target.textContent);
      notifDropdown.style.display = 'none';
    }
  });

  document.addEventListener('click', function(e) {
    if (!notifDropdown.contains(e.target) && !notifIcon.contains(e.target)) {
      notifDropdown.style.display = 'none';
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      notifDropdown.style.display = 'none';
    }
  });
})();

fetchNotifications();
setInterval(fetchNotifications, 60000); // Poll every minute

// modules/app.js
// Main entry point for all modules

import { initHeaderClock } from './header/clock.js';
import initHeaderInteractions from './header/interactions.js';

// List of all module initializers
const initializers = [
  initHeaderClock,
  initHeaderInteractions
];

// Initialize all modules on DOMContentLoaded
// (You can add logic here to only initialize modules on relevant pages)
document.addEventListener("DOMContentLoaded", () => {
  initializers.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.warn(`${fn.name} failed`, e);
    }
  });
});

// Flickering zero effect for counter (e.g., points or timer)
document.addEventListener('DOMContentLoaded', () => {
  const counter = document.getElementById('counter'); // Change to your element's ID if needed
  if (counter) {
    const actualValue = counter.getAttribute('data-value') || counter.textContent;
    counter.textContent = '0';
    counter.classList.add('flicker-zero');
    setTimeout(() => {
      counter.textContent = actualValue;
      counter.classList.remove('flicker-zero');
    }, 600); // Duration matches the animation
  }
});

// Logout logic for both sidebar and header
function handleLogout() {
  // Firebase sign out (if firebase is loaded)
  if (window.firebase && window.firebase.auth) {
    window.firebase.auth().signOut().catch(() => {});
  }
  // Call backend to clear session
  fetch('/logout', { method: 'POST', credentials: 'same-origin' })
    .finally(() => {
      window.location.href = '/'; // Redirect to home or login
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutSidebar = document.getElementById('logout-btn-sidebar');
  const logoutHeader = document.getElementById('logout-btn-header');
  if (logoutSidebar) logoutSidebar.addEventListener('click', handleLogout);
  if (logoutHeader) logoutHeader.addEventListener('click', handleLogout);
});

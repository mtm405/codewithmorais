// modules/header/clock.js
// Fills the #live-clock element with a live updating clock

export function initHeaderClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    
    // Safer DOM manipulation
    clockEl.textContent = `${h}:${m}:${s} `;
    
    // Create or update AM/PM span
    let ampmSpan = clockEl.querySelector('.ampm');
    if (!ampmSpan) {
      ampmSpan = document.createElement('span');
      ampmSpan.className = 'ampm';
      clockEl.appendChild(ampmSpan);
    }
    ampmSpan.textContent = ampm;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

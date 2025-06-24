// modules/header/clock.js
// Fills the #live-clock element with a live updating clock

export function initHeaderClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    // Format: HH:MM:SS (24h)
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${h}:${m}:${s}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

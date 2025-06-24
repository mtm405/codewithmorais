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
    // Use a span for AM/PM for CSS styling
    clockEl.innerHTML = `${h}:${m}:${s} <span class="ampm">${ampm}</span>`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

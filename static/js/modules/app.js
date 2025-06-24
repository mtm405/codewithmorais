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

// modules/dashboard/logic.js
// Dashboard-specific logic: greeting, search, etc.

export function initDashboardLogic() {
  document.addEventListener("DOMContentLoaded", () => {
    // Set the dynamic greeting based on time of day
    setDynamicGreeting();

    // --- Search Bar Functionality ---
    const searchInputWrapper = document.getElementById("searchInputWrapper");
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.getElementById("search-toggle-icon");

    if (searchIcon && searchInputWrapper && searchInput) {
      searchIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        if (searchInputWrapper.classList.contains("expanded")) {
          searchInputWrapper.classList.remove("expanded");
          searchInput.blur();
          searchInput.setAttribute("tabindex", "-1");
          searchInput.value = "";
          const searchResultsDisplay = document.getElementById("search-results-display");
          if (searchResultsDisplay) {
            searchResultsDisplay.classList.add("hidden");
            searchResultsDisplay.innerHTML = "";
          }
        } else {
          searchInputWrapper.classList.add("expanded");
          searchInput.focus();
          searchInput.setAttribute("tabindex", "0");
        }
      });
      document.body.addEventListener("click", (event) => {
        const isClickOutsideWrapper = !searchInputWrapper.contains(event.target);
        const isClickOutsideIcon = !searchIcon.contains(event.target);
        if (searchInputWrapper.classList.contains("expanded") && isClickOutsideWrapper && isClickOutsideIcon) {
          searchInputWrapper.classList.remove("expanded");
          searchInput.blur();
          searchInput.setAttribute("tabindex", "-1");
          searchInput.value = "";
          const searchResultsDisplay = document.getElementById("search-results-display");
          if (searchResultsDisplay) {
            searchResultsDisplay.classList.add("hidden");
            searchResultsDisplay.innerHTML = "";
          }
        }
      });
    }
  });
}

function setDynamicGreeting() {
  const greetingEl = document.getElementById("time-based-greeting");
  if (!greetingEl) return;
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Good evening,";
  if (hour >= 5 && hour < 12) greeting = "Good morning,";
  else if (hour >= 12 && hour < 18) greeting = "Good afternoon,";
  greetingEl.textContent = `${greeting}`;
}

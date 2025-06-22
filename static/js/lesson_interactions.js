document.addEventListener("DOMContentLoaded", () => {
  // --- Token UI Sync: Always fetch latest token value from backend on page load ---
  fetch("/api/get_currency")
    .then(res => res.json())
    .then(data => {
      if (data && typeof data.currency !== "undefined") {
        const currencyEl = document.getElementById("currency-value");
        if (currencyEl) currencyEl.textContent = data.currency;
      }
    });

  // Award tokens for daily login on dashboard load
  if (window.location.pathname === "/dashboard" || window.location.pathname === "/") {
    fetch("/api/daily_login", {method: "POST"})
      .then(res => res.json())
      .then(data => {
        if (data.awarded) {
          // Optionally show a toast/notification
          alert("You received 10 tokens for today's login!");
        }
        // Always update token display with latest value
        const currencyEl = document.getElementById("currency-value");
        if (currencyEl) currencyEl.textContent = data.currency;
      });
  }

  // --- Unified Header Bar Logic (copied from dashboard_logic.js) ---
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
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
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
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                performWebsiteSearch(searchInput.value);
            }
        });
        if (searchInput.value !== "") {
            searchInputWrapper.classList.add("expanded");
            searchInput.setAttribute("tabindex", "0");
        }
    }

    // --- Notification Dropdown Logic ---
    const notificationIcon = document.querySelector(".notification-icon");
    if (notificationIcon) {
        notificationIcon.addEventListener("click", function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById("notificationDropdown");
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
            // Mark as read if new challenge notification present
            const list = document.getElementById("notificationList");
            const firstLi = list.querySelector("li");
            if (firstLi && firstLi.textContent.startsWith("New Challenge")) {
                document.querySelector(".notification-icon .badge").textContent = "0";
                firstLi.style.fontWeight = "normal";
            }
        });
        document.addEventListener("click", function() {
            const dropdown = document.getElementById("notificationDropdown");
            if (dropdown) dropdown.style.display = "none";
        });
    }
  });

  function setDynamicGreeting() {
    const timeBasedGreetingElement = document.getElementById("time-based-greeting");
    if (!timeBasedGreetingElement) return;
    const currentHour = new Date().getHours();
    let greeting = "Good day";
    if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    timeBasedGreetingElement.textContent = greeting + ",";
  }

  function performWebsiteSearch(query) {
    const searchResultsDisplay = document.getElementById("search-results-display");
    if (!searchResultsDisplay) return;
    if (query.trim() === "") {
        searchResultsDisplay.classList.add("hidden");
        searchResultsDisplay.innerHTML = "";
        return;
    }
    searchResultsDisplay.classList.remove("hidden");
    searchResultsDisplay.innerHTML = `<h3>Search Results for "${query}" <span class="material-symbols-outlined">search</span></h3>`;
    searchResultsDisplay.innerHTML += `<p>Searching for: "${query}"...</p>`;
    searchResultsDisplay.innerHTML += "<p>Actual search logic would be implemented here, potentially fetching results from an API or filtering existing content.</p>";
    searchResultsDisplay.innerHTML += "<p>For now, this is a placeholder. You would replace this with real search results.</p>";
  }
});

// header/interactions.js
// Handles search bar and notification icon interactivity in the header

function initHeaderInteractions() {
  // --- Search Bar Logic ---
  const searchIcon = document.getElementById("search-toggle-icon");
  const searchContainer = document.getElementById("searchInputWrapper");
  const searchInput = document.getElementById("searchInput");

  if (searchIcon && searchContainer && searchInput) {
    searchIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      searchContainer.classList.toggle("expanded");
      if (searchContainer.classList.contains("expanded")) {
        searchInput.style.display = "block";
        searchInput.focus();
      } else {
        searchInput.style.display = "none";
        searchInput.value = "";
      }
    });

    // Hide search input when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchContainer.contains(e.target) && searchContainer.classList.contains("expanded")) {
        searchContainer.classList.remove("expanded");
        searchInput.style.display = "none";
        searchInput.value = "";
      }
    });

    // Hide on Escape
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchContainer.classList.remove("expanded");
        searchInput.style.display = "none";
        searchInput.value = "";
      }
    });

    // Hide input by default
    searchInput.style.display = "none";
  }

  // --- Notification Icon Logic ---
  const notificationIcon = document.getElementById("notificationIcon");
  const notificationDropdown = document.getElementById("notificationDropdown");

  if (notificationIcon && notificationDropdown) {
    notificationIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle("active");
      notificationIcon.classList.toggle("active");
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!notificationDropdown.contains(e.target) && !notificationIcon.contains(e.target) && notificationDropdown.classList.contains("active")) {
        notificationDropdown.classList.remove("active");
        notificationIcon.classList.remove("active");
      }
    });
  }
}

export default initHeaderInteractions;

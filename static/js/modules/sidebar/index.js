// Collapsible sidebar logic
// Handles toggle, class switching, and localStorage persistence

export function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle"); // Match base.html ID
  
  if (!sidebar || !toggleBtn) {
    return;
  }

  // Clean up preload classes to enable transitions
  document.documentElement.classList.remove('sidebar-collapsed-preload');
  document.body.classList.remove('preload');
  
  // Restore state from localStorage using consistent key
  const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
  
  if (isCollapsed) {
    sidebar.classList.add("collapsed");
    toggleBtn.title = "Expand sidebar";
    if (toggleBtn.querySelector("span")) {
      toggleBtn.querySelector("span").textContent = "chevron_right";
    }
  } else {
    sidebar.classList.remove("collapsed");
    toggleBtn.title = "Collapse sidebar";
    if (toggleBtn.querySelector("span")) {
      toggleBtn.querySelector("span").textContent = "chevron_left";
    }
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("sidebar-collapsed", isCollapsed);
    
    // Change icon and tooltip
    if (isCollapsed) {
      toggleBtn.title = "Expand sidebar";
      if (toggleBtn.querySelector("span")) {
        toggleBtn.querySelector("span").textContent = "chevron_right";
      }
    } else {
      toggleBtn.title = "Collapse sidebar";
      if (toggleBtn.querySelector("span")) {
        toggleBtn.querySelector("span").textContent = "chevron_left";
      }
    }

    // Debug check after toggle
    setTimeout(() => {
      const isCollapsed = sidebar.classList.contains("collapsed");
    }, 100);
  });

  // Add tooltips to menu items when collapsed
  const menuLinks = sidebar.querySelectorAll(".menu-item-link");
  menuLinks.forEach(link => {
    const textSpan = link.querySelector("span:not(.material-symbols-outlined)");
    if (textSpan) {
      link.setAttribute("title", textSpan.textContent.trim());
    }
  });
}

// modules/sidebar/index.js
// Sidebar open/close and submenu logic

export function initSidebar() {
  console.log("[Sidebar Debug] initSidebar called");
  document.addEventListener("DOMContentLoaded", function() {
    console.log("[Sidebar Debug] DOMContentLoaded");
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) {
      console.warn("Sidebar element not found. Sidebar functionality will be limited.");
      return;
    }
    // --- Keep submenu open and highlighted if on a submenu page ---
    const currentPath = window.location.pathname;
    document.querySelectorAll(".sidebar .submenu li a").forEach(link => {
      if (link.href && link.href.endsWith(currentPath)) {
        link.classList.add("active");
        const submenu = link.closest(".submenu");
        if (submenu) {
          submenu.classList.add("open");
          submenu.style.maxHeight = submenu.scrollHeight + "px";
        }
      }
    });
    // Submenu toggle logic (new structure: .menu-item-link.submenu-toggle + .submenu)
    const submenuToggles = sidebar.querySelectorAll(".menu-item-link.submenu-toggle");
    console.debug("[Sidebar Debug] Found", submenuToggles.length, "submenu toggles:", submenuToggles);
    submenuToggles.forEach(toggle => {
      // The submenu is the next sibling ul.submenu
      const submenu = toggle.nextElementSibling && toggle.nextElementSibling.classList.contains("submenu")
        ? toggle.nextElementSibling : null;
      if (!submenu) {
        console.warn("[Sidebar Debug] No submenu found for toggle:", toggle);
        return;
      }
      console.debug("[Sidebar Debug] Toggle:", toggle, "Submenu:", submenu, "Classes:", submenu.className, "Computed style:", window.getComputedStyle(submenu));
      toggle.addEventListener("click", function(e) {
        e.preventDefault();
        const isOpen = submenu.classList.contains("open");
        if (isOpen) {
          submenu.classList.remove("open");
          submenu.style.maxHeight = "0";
          toggle.setAttribute("aria-expanded", "false");
        } else {
          // Close all other submenus
          sidebar.querySelectorAll(".submenu.open").forEach(openSub => {
            openSub.classList.remove("open");
            openSub.style.maxHeight = "0";
            const openToggle = openSub.previousElementSibling;
            if (openToggle && openToggle.classList.contains("submenu-toggle")) {
              openToggle.setAttribute("aria-expanded", "false");
            }
          });
          submenu.classList.add("open");
          submenu.style.maxHeight = submenu.scrollHeight + "px";
          toggle.setAttribute("aria-expanded", "true");
        }
        // Debug: log submenu state after toggle
        console.debug("[Sidebar Debug] After toggle:", submenu, "Classes:", submenu.className, "Computed style:", window.getComputedStyle(submenu));
      });
      // Keyboard accessibility
      toggle.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle.click();
        }
      });
    });
    // --- Collapsible sidebar logic ---
    const toggleBtn = sidebar.querySelector(".sidebar-toggle-btn");
    if (toggleBtn) {
      // Restore collapsed state from localStorage
      const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
      if (isCollapsed) {
        sidebar.classList.add("collapsed");
      }
      function setCollapsed(collapsed) {
        sidebar.classList.toggle("collapsed", collapsed);
        localStorage.setItem("sidebar-collapsed", collapsed);
        window.dispatchEvent(new Event("sidebar:toggle"));
      }
      toggleBtn.addEventListener("click", () => {
        setCollapsed(!sidebar.classList.contains("collapsed"));
      });
      toggleBtn.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setCollapsed(!sidebar.classList.contains("collapsed"));
        }
      });
    }
    // Responsive: open/close on mobile
    function handleResize() {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove("collapsed");
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
  });
}

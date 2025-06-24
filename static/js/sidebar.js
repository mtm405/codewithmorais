// static/js/sidebar.js
// Handles all functionality for the main sidebar, including
// collapsible state, submenus, and the avatar modal.

/**
 * @description Initializes all sidebar functionality.
 * This is the main entry point for this module.
 */
export function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) {
        // If there's no sidebar on the page, do nothing.
        return;
    }

    // Initialize all features
    initCollapsibleState(sidebar);
    initSubmenuToggle(sidebar);
    initAvatarModal();
    highlightActiveSubmenu();
}

/**
 * @description Manages the collapsed/expanded state of the sidebar,
 * saving the user's preference in localStorage.
 * @param {HTMLElement} sidebar The main sidebar element.
 */
function initCollapsibleState(sidebar) {
    const toggleBtn = sidebar.querySelector(".sidebar-toggle-btn");
    if (!toggleBtn) return;

    // Restore the sidebar's state from localStorage
    const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
    sidebar.classList.toggle("collapsed", isCollapsed);

    const setCollapsed = (collapsed) => {
        sidebar.classList.toggle("collapsed", collapsed);
        localStorage.setItem("sidebar-collapsed", collapsed);
        // Dispatch a custom event that other components can listen to if they need to resize.
        window.dispatchEvent(new Event("sidebar:toggle"));
    };

    toggleBtn.addEventListener("click", () => {
        setCollapsed(!sidebar.classList.contains("collapsed"));
    });

    // Accessibility for keyboard users
    toggleBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleBtn.click();
        }
    });
}

/**
 * @description Handles the logic for expanding and collapsing submenus.
 * @param {HTMLElement} sidebar The main sidebar element.
 */
function initSubmenuToggle(sidebar) {
    sidebar.querySelectorAll(".submenu-toggle").forEach(toggle => {
        const submenu = toggle.nextElementSibling;
        if (!submenu || !submenu.classList.contains("submenu")) return;

        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            const parentItem = toggle.closest('.has-submenu');
            parentItem.classList.toggle("open");

            if (parentItem.classList.contains("open")) {
                // Expand the submenu
                submenu.style.maxHeight = submenu.scrollHeight + "px";
                toggle.setAttribute("aria-expanded", "true");
            } else {
                // Collapse the submenu
                submenu.style.maxHeight = "0";
                toggle.setAttribute("aria-expanded", "false");
            }
        });
         // Accessibility for keyboard users
        toggle.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle.click();
            }
        });
    });
}

/**
 * @description Makes sure that if the user is on a page linked within a
 * submenu, that submenu is open and the link is highlighted on page load.
 */
function highlightActiveSubmenu() {
    const currentPath = window.location.pathname;
    document.querySelectorAll(".sidebar .submenu li a").forEach(link => {
        // Check if the link's href matches the current page path
        if (link.href.endsWith(currentPath)) {
            link.classList.add("active");
            const submenu = link.closest(".submenu");
            const parentItem = link.closest(".has-submenu");

            if (submenu && parentItem) {
                parentItem.classList.add("open");
                submenu.style.maxHeight = submenu.scrollHeight + "px";
                const toggle = parentItem.querySelector('.submenu-toggle');
                if(toggle) toggle.setAttribute("aria-expanded", "true");
            }
        }
    });
}

/**
 * @description Manages the modal for changing the user's avatar.
 */
function initAvatarModal() {
    const avatarImg = document.getElementById("sidebar-avatar");
    const modal = document.getElementById("avatar-library-modal");
    const closeBtn = document.querySelector(".close-avatar-modal");

    if (!avatarImg || !modal || !closeBtn) return;

    avatarImg.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close modal if clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.querySelectorAll(".avatar-choice").forEach(img => {
        img.addEventListener("click", function() {
            const newAvatarSrc = this.dataset.avatar;
            avatarImg.src = newAvatarSrc;
            modal.style.display = "none";
            // TODO: Here you would also send the new avatar choice to your backend to save it.
            // For example: `fetch('/api/user/avatar', { method: 'POST', body: JSON.stringify({ avatar: newAvatarSrc }) });`
        });
    });
}

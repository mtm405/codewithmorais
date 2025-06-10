// static/js/sidebar.js

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    // Only require sidebar for submenu logic
    if (!sidebar) {
        console.warn("Sidebar element not found. Sidebar functionality will be limited.");
        return;
    }

    // --- Keep submenu open and highlighted if on a submenu page ---
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar .submenu li a').forEach(link => {
        if (link.href && link.href.endsWith(currentPath)) {
            link.classList.add('active');
            const submenu = link.closest('.submenu');
            if (submenu) {
                submenu.classList.add('open');
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                const parentLi = submenu.closest('.has-submenu');
                if (parentLi) {
                    parentLi.classList.add('open');
                }
            }
        }
    });

    // Submenu toggle logic
    const submenuToggles = document.querySelectorAll('.submenu-toggle');

    function toggleSubmenu(parent, submenu, toggle, forceOpen, instant) {
        const isOpen = parent.classList.contains('open');
        const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
        if (willOpen) {
            parent.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            if (instant) {
                submenu.style.transition = 'none';
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                submenu.offsetHeight; // force reflow
                submenu.style.transition = '';
            } else {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            }
        } else {
            parent.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            submenu.style.maxHeight = '0';
        }
    }

    submenuToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = toggle.closest('.has-submenu');
            const submenu = parent.querySelector('.submenu');
            toggleSubmenu(parent, submenu, toggle);
        });
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    });

    // On load, expand submenu if active child exists
    document.querySelectorAll('.has-submenu').forEach(function (parent) {
        const submenu = parent.querySelector('.submenu');
        const toggle = parent.querySelector('.submenu-toggle');
        if (submenu && submenu.querySelector('.menu-item-link.active')) {
            toggleSubmenu(parent, submenu, toggle, true, true);
        }
    });

    // Avatar modal logic
    const avatarImg = document.getElementById('sidebar-avatar');
    const modal = document.getElementById('avatar-library-modal');
    const closeBtn = document.querySelector('.close-avatar-modal');
    if (avatarImg && modal && closeBtn) {
        avatarImg.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        document.querySelectorAll('.avatar-choice').forEach(img => {
            img.addEventListener('click', function() {
                avatarImg.src = this.dataset.avatar;
                modal.style.display = 'none';
                // TODO: Send avatar change to backend
            });
        });
    }
});
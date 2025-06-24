// Collapsible sidebar logic
// Handles toggle, class switching, and localStorage persistence

// Set toggle button state immediately on script load (before DOMContentLoaded)
(function setSidebarToggleState() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (!sidebar || !toggleBtn) return;
  const collapsed = sidebar.classList.contains('collapsed');
  if (collapsed) {
    toggleBtn.title = 'Expand sidebar';
    toggleBtn.querySelector('span').textContent = 'menu';
  } else {
    toggleBtn.title = 'Collapse sidebar';
    toggleBtn.querySelector('span').textContent = 'menu_open';
  }
})();

// Restore sidebar state on DOMContentLoaded (for safety, but class is set earlier)
(function restoreSidebarState() {
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggleBtn) return;
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (collapsed) {
      sidebar.classList.add('collapsed');
      toggleBtn.title = 'Expand sidebar';
      toggleBtn.querySelector('span').textContent = 'menu';
      toggleBtn.style.display = 'block';
    } else {
      sidebar.classList.remove('collapsed');
      toggleBtn.title = 'Collapse sidebar';
      toggleBtn.querySelector('span').textContent = 'menu_open';
      toggleBtn.style.display = 'block';
    }
  });
})();

export default function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);
    // Change icon and tooltip
    if (isCollapsed) {
      toggleBtn.title = 'Expand sidebar';
      toggleBtn.querySelector('span').textContent = 'menu';
      toggleBtn.style.display = 'block';
    } else {
      toggleBtn.title = 'Collapse sidebar';
      toggleBtn.querySelector('span').textContent = 'menu_open';
      toggleBtn.style.display = 'block';
    }
  });

  // Always show the toggle button, even when collapsed
  toggleBtn.style.display = 'block';

  // Add tooltips to menu items when collapsed
  const menuLinks = sidebar.querySelectorAll('.menu-item-link');
  menuLinks.forEach(link => {
    const label = link.querySelector('.menu-label');
    if (label) {
      link.setAttribute('title', label.textContent.trim());
    }
  });
}

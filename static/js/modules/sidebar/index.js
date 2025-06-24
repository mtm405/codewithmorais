// Collapsible sidebar logic
// Handles toggle, class switching, and localStorage persistence

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  console.debug('[Sidebar Debug] sidebar:', sidebar);
  console.debug('[Sidebar Debug] toggleBtn:', toggleBtn);
  if (!sidebar || !toggleBtn) {
    console.error('[Sidebar Debug] Sidebar or toggle button not found!');
    return;
  }

  // Restore state from localStorage
  const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
  console.debug('[Sidebar Debug] collapsed from localStorage:', collapsed);
  if (collapsed) {
    sidebar.classList.add('collapsed');
    toggleBtn.title = 'Expand sidebar';
    if (toggleBtn.querySelector('span')) {
      toggleBtn.querySelector('span').textContent = 'menu';
    }
  } else {
    sidebar.classList.remove('collapsed');
    toggleBtn.title = 'Collapse sidebar';
    if (toggleBtn.querySelector('span')) {
      toggleBtn.querySelector('span').textContent = 'menu_open';
    }
  }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);
    console.debug('[Sidebar Debug] Toggle clicked. isCollapsed:', isCollapsed);
    // Change icon and tooltip
    if (isCollapsed) {
      toggleBtn.title = 'Expand sidebar';
      if (toggleBtn.querySelector('span')) {
        toggleBtn.querySelector('span').textContent = 'menu';
      }
    } else {
      toggleBtn.title = 'Collapse sidebar';
      if (toggleBtn.querySelector('span')) {
        toggleBtn.querySelector('span').textContent = 'menu_open';
      }
    }

    // Add debug check for collapsed state
    setTimeout(() => {
      const isCollapsed = sidebar.classList.contains('collapsed');
      const menuTextVisible = Array.from(sidebar.querySelectorAll('.menu-label')).some(el => el.offsetParent !== null);
      const avatarVisible = !!sidebar.querySelector('.sidebar-avatar') && sidebar.querySelector('.sidebar-avatar').offsetParent !== null;
      const pointsVisible = !!sidebar.querySelector('.user-points-bytes') && sidebar.querySelector('.user-points-bytes').offsetParent !== null;
      console.debug('[Sidebar Debug] After toggle: isCollapsed:', isCollapsed, 'menuTextVisible:', menuTextVisible, 'avatarVisible:', avatarVisible, 'pointsVisible:', pointsVisible);
    }, 200);
  });

  // Always show the toggle button, even when collapsed
  toggleBtn.style.display = 'block';

  // Add tooltips to menu items when collapsed
  const menuLinks = sidebar.querySelectorAll('.menu-item-link');
  menuLinks.forEach(link => {
    // If you want to set a title, you can use the link text
    if (!link.hasAttribute('title')) {
      link.setAttribute('title', link.textContent.trim());
    }
    const label = link.querySelector('.menu-label');
    if (label) {
      link.setAttribute('title', label.textContent.trim());
    }
  });
  toggleBtn.style.display = 'block';
}

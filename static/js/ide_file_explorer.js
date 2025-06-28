/**
 * 🗂️ IDE COMMAND CENTER - PHASE 2: FILE EXPLORER
 * JavaScript functionality for VS Code-style file explorer
 * ========================================================
 */

console.log('📦 Loading IDE File Explorer module...');

window.IDEFileExplorer = window.IDEFileExplorer || {
    initialized: false,
    folders: {},
    searchResults: [],
    
    init() {
        if (this.initialized) return;
        
        console.log('🗂️ Initializing IDE File Explorer...');
        
        this.transformSidebar();
        this.initFolderTree();
        this.initSearchFunctionality();
        this.initFileActions();
        this.initKeyboardNavigation();
        this.addViewToggle();
        this.syncWithCurrentPage();
        
        this.initialized = true;
        console.log('✅ IDE File Explorer initialized successfully');
    },
    
    // ===== SIDEBAR TRANSFORMATION =====
    transformSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        // Add IDE classes
        sidebar.classList.add('ide-file-explorer');
        
        // Transform header
        const sidebarHeader = sidebar.querySelector('.sidebar-header');
        if (sidebarHeader) {
            sidebarHeader.classList.add('ide-explorer-header');
            this.enhanceSidebarHeader(sidebarHeader);
        }
        
        // Transform navigation
        const navigation = sidebar.querySelector('.components');
        if (navigation) {
            navigation.classList.add('ide-file-tree');
            this.buildFileTree(navigation);
        }
        
        // Transform toggle button
        const toggleBtn = sidebar.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.classList.add('ide-toggle');
        }
        
        console.log('🎨 Sidebar transformed to IDE File Explorer');
    },
    
    enhanceSidebarHeader(header) {
        // Add explorer title
        const explorerTitle = document.createElement('div');
        explorerTitle.className = 'ide-explorer-title';
        explorerTitle.textContent = 'Explorer';
        header.insertBefore(explorerTitle, header.firstChild);
        
        // Transform profile section
        const profileSection = header.querySelector('.profile-section');
        if (profileSection) {
            profileSection.classList.add('ide-project-root');
            
            const avatar = profileSection.querySelector('.sidebar-avatar');
            if (avatar) avatar.classList.add('ide-project-icon');
            
            const titleBlock = profileSection.querySelector('.user-title-block');
            if (titleBlock) {
                titleBlock.classList.add('ide-project-info');
                
                const userName = titleBlock.querySelector('.user-name');
                if (userName) {
                    userName.classList.add('ide-project-name');
                    userName.textContent = `${userName.textContent}'s Python Project`;
                }
                
                const userTitle = titleBlock.querySelector('.user-title');
                if (userTitle) {
                    userTitle.classList.add('ide-project-type');
                    userTitle.textContent = 'Python Learning Environment';
                }
            }
            
            // Add click handler for project root
            profileSection.addEventListener('click', () => {
                this.toggleAllFolders();
            });
        }
        
        // Transform user points
        const userPoints = header.querySelector('.user-points');
        if (userPoints) {
            userPoints.classList.add('ide-project-stats');
            
            const bytesSection = userPoints.querySelector('.user-points-bytes');
            if (bytesSection) {
                bytesSection.classList.add('ide-stat-line');
            }
            
            const tokensSection = userPoints.querySelector('.user-points-tokens');
            if (tokensSection) {
                tokensSection.classList.add('ide-stat-line');
            }
        }
        
        // Add search functionality
        this.addSearchBox(header);
        
        // Add action buttons
        this.addActionButtons(header);
        
        // Add view toggle
        this.addViewToggle(header);
    },
    
    addSearchBox(header) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'ide-search-container';
        searchContainer.innerHTML = `
            <span class="material-symbols-outlined ide-search-icon">search</span>
            <input type="text" class="ide-search-input" placeholder="Search files..." id="ide-file-search">
        `;
        
        header.appendChild(searchContainer);
    },
    
    addActionButtons(header) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'ide-actions';
        actionsContainer.innerHTML = `
            <button class="ide-action-btn" id="refresh-explorer" title="Refresh Explorer">
                <span class="material-symbols-outlined" style="font-size: 14px;">refresh</span>
            </button>
            <button class="ide-action-btn" id="collapse-all" title="Collapse All">
                <span class="material-symbols-outlined" style="font-size: 14px;">unfold_less</span>
            </button>
        `;
        
        header.appendChild(actionsContainer);
        
        // Add event listeners
        document.getElementById('refresh-explorer')?.addEventListener('click', () => {
            this.refreshExplorer();
        });
        
        document.getElementById('collapse-all')?.addEventListener('click', () => {
            this.collapseAllFolders();
        });
    },
    
    // ===== VIEW TOGGLE =====
    addViewToggle(header) {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'ide-view-toggle';
        toggleContainer.style.cssText = `
            margin-top: 10px;
            display: flex;
            gap: 4px;
            justify-content: center;
        `;
        
        const explorerBtn = document.createElement('button');
        explorerBtn.className = 'ide-toggle-btn active';
        explorerBtn.textContent = 'Explorer';
        explorerBtn.onclick = () => this.switchToExplorerView(explorerBtn);
        
        const navigationBtn = document.createElement('button');
        navigationBtn.className = 'ide-toggle-btn';
        navigationBtn.textContent = 'Navigation';
        navigationBtn.onclick = () => this.switchToNavigationView(navigationBtn);
        
        toggleContainer.appendChild(explorerBtn);
        toggleContainer.appendChild(navigationBtn);
        header.appendChild(toggleContainer);
        
        console.log('🔄 View toggle added');
    },
    
    switchToExplorerView(activeBtn) {
        const navigation = document.getElementById('sidebar-menu-tabs');
        if (!navigation) return;
        
        // Update button states
        document.querySelectorAll('.ide-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
        
        // Show file explorer
        const fileTreeContainer = navigation.querySelector('.ide-file-tree-container');
        if (fileTreeContainer) {
            fileTreeContainer.style.display = 'block';
        }
        
        // Hide original navigation if it exists
        const originalNav = navigation.querySelector('.original-navigation');
        if (originalNav) {
            originalNav.style.display = 'none';
        }
        
        console.log('🗂️ Switched to explorer view');
    },
    
    switchToNavigationView(activeBtn) {
        const navigation = document.getElementById('sidebar-menu-tabs');
        if (!navigation) return;
        
        // Update button states
        document.querySelectorAll('.ide-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
        
        // Hide file explorer
        const fileTreeContainer = navigation.querySelector('.ide-file-tree-container');
        if (fileTreeContainer) {
            fileTreeContainer.style.display = 'none';
        }
        
        // Show/create original navigation
        let originalNav = navigation.querySelector('.original-navigation');
        if (!originalNav && this.originalNavigation) {
            originalNav = document.createElement('div');
            originalNav.className = 'original-navigation';
            originalNav.innerHTML = this.originalNavigation;
            navigation.appendChild(originalNav);
        }
        
        if (originalNav) {
            originalNav.style.display = 'block';
        }
        
        console.log('🧭 Switched to navigation view');
    },
    
    // ===== FILE TREE CONSTRUCTION =====
    buildFileTree(navigation) {
        const menuItems = navigation.querySelectorAll('.menu-item-link');
        
        // Store original navigation for restore
        this.originalNavigation = navigation.innerHTML;
        
        // Create file tree structure
        const fileTreeContainer = document.createElement('div');
        fileTreeContainer.className = 'ide-file-tree-container';
        
        // Add search functionality
        this.createSearchBar(fileTreeContainer);
        
        // Build the file structure
        const fileStructure = this.organizeMenuItems(menuItems);
        const fileTree = this.buildFolderStructure(fileStructure);
        
        fileTreeContainer.appendChild(fileTree);
        
        // Replace navigation content
        navigation.innerHTML = '';
        navigation.appendChild(fileTreeContainer);
        
        // Add context menu support
        this.initContextMenu(fileTreeContainer);
        
        console.log('🌲 File tree built successfully');
    },
    
    createSearchBar(container) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'ide-search-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search files...';
        searchInput.className = 'ide-search-input';
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        searchContainer.appendChild(searchInput);
        container.appendChild(searchContainer);
    },
    
    handleSearch(query) {
        const fileItems = document.querySelectorAll('.ide-file-item');
        
        if (!query.trim()) {
            // Show all items
            fileItems.forEach(item => {
                item.style.display = '';
                this.removeHighlight(item);
            });
            return;
        }
        
        fileItems.forEach(item => {
            const fileName = item.textContent.toLowerCase();
            const matchIndex = fileName.indexOf(query.toLowerCase());
            
            if (matchIndex !== -1) {
                item.style.display = '';
                this.highlightMatch(item, query, matchIndex);
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    highlightMatch(item, query, matchIndex) {
        const text = item.textContent;
        const beforeMatch = text.substring(0, matchIndex);
        const match = text.substring(matchIndex, matchIndex + query.length);
        const afterMatch = text.substring(matchIndex + query.length);
        
        const nameSpan = item.querySelector('.ide-file-name');
        if (nameSpan) {
            nameSpan.innerHTML = `${beforeMatch}<span class="match">${match}</span>${afterMatch}`;
        }
    },
    
    removeHighlight(item) {
        const nameSpan = item.querySelector('.ide-file-name');
        if (nameSpan) {
            nameSpan.textContent = nameSpan.textContent; // Remove HTML formatting
        }
    },
    
    buildFolderStructure(fileStructure) {
        const container = document.createElement('div');
        container.className = 'ide-folder-structure';
        
        // Check if fileStructure is valid
        if (!fileStructure || typeof fileStructure !== 'object') {
            console.warn('⚠️ No file structure provided, creating default structure');
            fileStructure = {
                'dashboard': {
                    name: '📊 Dashboard',
                    icon: 'folder',
                    expanded: true,
                    items: [{ name: 'dashboard.py', href: '/dashboard', icon: 'dashboard', active: true }]
                }
            };
        }
        
        // Create workspace root
        const workspaceFolder = this.createFolderElement('📁 Python Learning Workspace', 'workspace', true);
        container.appendChild(workspaceFolder);
        
        // Create course folders
        Object.entries(fileStructure).forEach(([folderKey, folderData]) => {
            if (folderKey === 'workspace') return;
            
            const folder = this.createFolderElement(folderData.name, folderKey, folderData.expanded);
            
            // Add files to folder - ensure items exist
            if (folderData.items && Array.isArray(folderData.items)) {
                folderData.items.forEach(item => {
                    const fileElement = this.createFileElement(item);
                    folder.appendChild(fileElement);
                });
            }
            
            container.appendChild(folder);
        });
        
        return container;
    },
    
    createFolderElement(name, key, expanded = false) {
        const folder = document.createElement('div');
        folder.className = 'ide-folder';
        folder.dataset.folder = key;
        
        const header = document.createElement('div');
        header.className = 'ide-folder-header';
        header.innerHTML = `
            <span class="ide-folder-arrow material-symbols-outlined">${expanded ? 'expand_more' : 'chevron_right'}</span>
            <span class="ide-folder-icon">${name.includes('📁') ? '' : '📁'}</span>
            <span class="ide-folder-name">${name}</span>
        `;
        
        const content = document.createElement('div');
        content.className = 'ide-folder-content';
        content.style.display = expanded ? 'block' : 'none';
        
        folder.appendChild(header);
        folder.appendChild(content);
        
        // Add click handler
        header.addEventListener('click', () => {
            this.toggleFolder(folder);
        });
        
        return folder;
    },
    
    createFileElement(item) {
        const file = document.createElement('div');
        file.className = 'ide-file-item';
        file.dataset.path = item.href;
        if (item.active) file.classList.add('active');
        
        file.innerHTML = `
            <span class="ide-file-icon">${item.icon}</span>
            <span class="ide-file-name">${item.name}</span>
            <div class="ide-file-operations">
                <button class="ide-file-op-btn" data-action="open" title="Open">📂</button>
                <button class="ide-file-op-btn" data-action="edit" title="Edit">✏️</button>
            </div>
        `;
        
        // Add click handler
        file.addEventListener('click', (e) => {
            if (!e.target.classList.contains('ide-file-op-btn')) {
                this.openFile(item.href);
            }
        });
        
        // Add operation handlers
        file.querySelectorAll('.ide-file-op-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                this.handleFileOperation(action, item);
            });
        });
        
        return file;
    },
    
    toggleFolder(folder) {
        const arrow = folder.querySelector('.ide-folder-arrow');
        const content = folder.querySelector('.ide-folder-content');
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            arrow.textContent = 'chevron_right';
            content.style.display = 'none';
        } else {
            arrow.textContent = 'expand_more';
            content.style.display = 'block';
        }
        
        // Store state
        const folderKey = folder.dataset.folder;
        this.folders[folderKey] = !isExpanded;
    },
    
    organizeMenuItems(menuItems) {
        const structure = {
            'workspace': {
                name: '📁 Python Learning Workspace',
                icon: 'folder',
                expanded: true,
                items: []
            }
        };
        
        menuItems.forEach(item => {
            const menuData = item.dataset.menu;
            const href = item.getAttribute('href');
            const iconElement = item.querySelector('.material-symbols-outlined');
            const labelElement = item.querySelector('.menu-label') || item.querySelector('span:last-child');
            
            if (menuData && labelElement) {
                const folderName = this.getFolderName(menuData);
                const fileName = this.getFileName(menuData, labelElement.textContent);
                
                if (!structure[folderName]) {
                    structure[folderName] = {
                        name: folderName,
                        icon: 'folder',
                        expanded: false,
                        items: []
                    };
                }
                
                structure[folderName].items.push({
                    name: fileName,
                    href: href,
                    icon: this.getFileIcon(menuData),
                    active: item.classList.contains('active'),
                    menuData: menuData,
                    originalElement: item
                });
            }
        });
        
        return structure;
    },
    
    getFolderName(menuData) {
        const folderMap = {
            'dashboard': '📊 Dashboard',
            'python-basics': '🐍 Python Basics',
            'flow-control': '🔀 Flow Control',
            'io-operations': '📥 I/O Operations',
            'code-structure': '🏗️ Code Structure',
            'error-handling': '🐛 Error Handling',
            'module-operations': '📦 Modules'
        };
        
        return folderMap[menuData] || '📁 ' + menuData.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    
    getFileName(menuData, labelText) {
        if (menuData === 'dashboard') {
            return 'dashboard.py';
        }
        
        return labelText.toLowerCase().replace(/\s+/g, '_') + '.py';
    },
    
    getFileIcon(menuData) {
        const iconMap = {
            'dashboard': 'dashboard',
            'python-basics': 'data_object',
            'flow-control': 'sync_alt',
            'io-operations': 'input',
            'code-structure': 'account_tree',
            'error-handling': 'bug_report',
            'module-operations': 'extension'
        };
        
        return iconMap[menuData] || 'description';
    },
    
    buildFolderStructure(container, structure) {
        Object.entries(structure).forEach(([key, folder]) => {
            const folderElement = this.createFolderElement(key, folder);
            container.appendChild(folderElement);
            this.folders[key] = folderElement;
        });
    },
    
    createFolderElement(key, folder) {
        const folderDiv = document.createElement('div');
        folderDiv.className = `ide-folder ${folder.expanded ? 'expanded' : ''}`;
        folderDiv.dataset.folder = key;
        
        // Folder header
        const header = document.createElement('div');
        header.className = 'ide-folder-header';
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', folder.expanded);
        header.innerHTML = `
            <span class="material-symbols-outlined ide-folder-icon">chevron_right</span>
            <span class="ide-folder-name">${folder.name}</span>
        `;
        
        // Folder contents
        const fileList = document.createElement('div');
        fileList.className = 'ide-file-list';
        
        folder.items.forEach(item => {
            const fileElement = this.createFileElement(item);
            fileList.appendChild(fileElement);
        });
        
        folderDiv.appendChild(header);
        folderDiv.appendChild(fileList);
        
        // Add click handler
        header.addEventListener('click', () => {
            this.toggleFolder(key);
        });
        
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleFolder(key);
            }
        });
        
        return folderDiv;
    },
    
    createFileElement(item) {
        const fileLink = item.originalElement.cloneNode(true);
        fileLink.className = `menu-item-link ide-file ${item.active ? 'active' : ''}`;
        
        // Update icon
        const iconElement = fileLink.querySelector('.material-symbols-outlined');
        if (iconElement) {
            iconElement.className = `material-symbols-outlined ide-file-icon ${item.menuData}`;
            iconElement.textContent = item.icon;
        }
        
        // Update label
        const labelElement = fileLink.querySelector('.menu-label') || fileLink.querySelector('span:last-child');
        if (labelElement) {
            labelElement.className = 'menu-label ide-filename';
            labelElement.textContent = item.name;
        }
        
        return fileLink;
    },
    
    // ===== FOLDER MANAGEMENT =====
    initFolderTree() {
        // Expand default folders
        this.expandFolder('workspace');
        
        // Set up folder state persistence
        this.loadFolderStates();
        
        console.log('🗂️ Folder tree initialized');
    },
    
    toggleFolder(folderKey) {
        const folder = this.folders[folderKey];
        if (!folder) return;
        
        const isExpanded = folder.classList.contains('expanded');
        
        if (isExpanded) {
            this.collapseFolder(folderKey);
        } else {
            this.expandFolder(folderKey);
        }
        
        this.saveFolderState(folderKey, !isExpanded);
    },
    
    expandFolder(folderKey) {
        const folder = this.folders[folderKey];
        if (!folder) return;
        
        folder.classList.add('expanded');
        const header = folder.querySelector('.ide-folder-header');
        if (header) {
            header.setAttribute('aria-expanded', 'true');
        }
        
        console.log(`📂 Expanded folder: ${folderKey}`);
    },
    
    collapseFolder(folderKey) {
        const folder = this.folders[folderKey];
        if (!folder) return;
        
        folder.classList.remove('expanded');
        const header = folder.querySelector('.ide-folder-header');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
        }
        
        console.log(`📁 Collapsed folder: ${folderKey}`);
    },
    
    toggleAllFolders() {
        const allExpanded = Object.keys(this.folders).every(key => 
            this.folders[key].classList.contains('expanded')
        );
        
        if (allExpanded) {
            this.collapseAllFolders();
        } else {
            this.expandAllFolders();
        }
    },
    
    expandAllFolders() {
        Object.keys(this.folders).forEach(key => {
            this.expandFolder(key);
        });
    },
    
    collapseAllFolders() {
        Object.keys(this.folders).forEach(key => {
            if (key !== 'workspace') { // Keep workspace open
                this.collapseFolder(key);
            }
        });
    },
    
    // ===== SEARCH FUNCTIONALITY =====
    initSearchFunctionality() {
        const searchInput = document.getElementById('ide-file-search');
        if (!searchInput) return;
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
            
            if (e.key === 'Escape') {
                e.target.value = '';
                this.clearSearch();
            }
        });
        
        console.log('🔍 Search functionality initialized');
    },
    
    performSearch(query) {
        if (!query.trim()) {
            this.clearSearch();
            return;
        }
        
        const allFiles = document.querySelectorAll('.menu-item-link.ide-file');
        this.searchResults = [];
        
        allFiles.forEach(file => {
            const fileName = file.querySelector('.ide-filename')?.textContent || '';
            const folderName = file.closest('.ide-folder')?.dataset.folder || '';
            
            const matches = fileName.toLowerCase().includes(query.toLowerCase()) ||
                           folderName.toLowerCase().includes(query.toLowerCase());
            
            if (matches) {
                this.searchResults.push(file);
                file.style.backgroundColor = 'var(--ide-accent-orange)';
                file.style.color = '#000';
                
                // Expand parent folder
                const parentFolder = file.closest('.ide-folder');
                if (parentFolder) {
                    const folderKey = parentFolder.dataset.folder;
                    this.expandFolder(folderKey);
                }
            } else {
                file.style.backgroundColor = '';
                file.style.color = '';
            }
        });
        
        console.log(`🔍 Search "${query}" found ${this.searchResults.length} results`);
    },
    
    clearSearch() {
        const allFiles = document.querySelectorAll('.menu-item-link.ide-file');
        allFiles.forEach(file => {
            file.style.backgroundColor = '';
            file.style.color = '';
        });
        
        this.searchResults = [];
        console.log('🔍 Search cleared');
    },
    
    // ===== FILE ACTIONS =====
    initFileActions() {
        // Add context menu to files
        document.querySelectorAll('.menu-item-link.ide-file').forEach(file => {
            file.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showFileContextMenu(e, file);
            });
        });
        
        console.log('⚡ File actions initialized');
    },
    
    showFileContextMenu(event, file) {
        // Simple context menu implementation
        const existingMenu = document.querySelector('.ide-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const menu = document.createElement('div');
        menu.className = 'ide-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: var(--ide-bg-secondary);
            border: 1px solid var(--terminal-border);
            border-radius: 4px;
            padding: 4px 0;
            z-index: 9999;
            min-width: 150px;
            box-shadow: var(--ide-shadow-md);
        `;
        
        const fileName = file.querySelector('.ide-filename')?.textContent || 'File';
        
        menu.innerHTML = `
            <div class="context-menu-item" style="padding: 6px 12px; cursor: pointer; font-size: 12px; color: var(--ide-text-primary);">
                Open ${fileName}
            </div>
            <div class="context-menu-separator" style="height: 1px; background: var(--terminal-border); margin: 2px 0;"></div>
            <div class="context-menu-item" style="padding: 6px 12px; cursor: pointer; font-size: 12px; color: var(--ide-text-secondary);">
                Copy Path
            </div>
            <div class="context-menu-item" style="padding: 6px 12px; cursor: pointer; font-size: 12px; color: var(--ide-text-secondary);">
                Reveal in Explorer
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Close menu on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
        
        console.log(`📄 Context menu for ${fileName}`);
    },
    
    // ===== CONTEXT MENU =====
    initContextMenu(container) {
        // Create context menu element
        const contextMenu = document.createElement('div');
        contextMenu.className = 'ide-context-menu';
        contextMenu.style.display = 'none';
        contextMenu.innerHTML = `
            <div class="ide-context-item" data-action="open">
                <span class="material-symbols-outlined">description</span>
                Open File
            </div>
            <div class="ide-context-item" data-action="rename">
                <span class="material-symbols-outlined">edit</span>
                Rename
            </div>
            <div class="ide-context-item" data-action="delete">
                <span class="material-symbols-outlined">delete</span>
                Delete
            </div>
            <div class="ide-context-divider"></div>
            <div class="ide-context-item" data-action="new-file">
                <span class="material-symbols-outlined">note_add</span>
                New File
            </div>
            <div class="ide-context-item" data-action="new-folder">
                <span class="material-symbols-outlined">create_new_folder</span>
                New Folder
            </div>
        `;
        
        document.body.appendChild(contextMenu);
        
        // Add right-click event listeners
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, contextMenu);
        });
        
        // Add click outside to close
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });
        
        // Add context menu actions
        contextMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.closest('.ide-context-item')?.dataset.action;
            if (action) {
                this.handleContextAction(action, e);
                contextMenu.style.display = 'none';
            }
        });
        
        console.log('🎯 Context menu initialized');
    },
    
    showContextMenu(e, menu) {
        const x = Math.min(e.clientX, window.innerWidth - 200);
        const y = Math.min(e.clientY, window.innerHeight - 150);
        
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';
        
        // Store the target element for context actions
        menu.dataset.target = e.target.closest('.ide-file-item')?.dataset.path || '';
    },
    
    handleContextAction(action, e) {
        const targetPath = e.currentTarget.dataset.target;
        
        switch (action) {
            case 'open':
                this.openFile(targetPath);
                break;
            case 'rename':
                this.renameFile(targetPath);
                break;
            case 'delete':
                this.deleteFile(targetPath);
                break;
            case 'new-file':
                this.createNewFile();
                break;
            case 'new-folder':
                this.createNewFolder();
                break;
            default:
                console.log(`Context action: ${action} on ${targetPath}`);
        }
    },
    
    // ===== FILE OPERATIONS =====
    openFile(path) {
        if (!path) return;
        
        console.log(`📂 Opening file: ${path}`);
        
        // If it's a lesson or quiz file, navigate to it
        if (path.includes('lesson') || path.includes('quiz')) {
            window.location.href = path;
        } else {
            // Open in ACE editor if available
            if (window.IDEAceEditor && window.IDEAceEditor.openFileInEditor) {
                window.IDEAceEditor.openFileInEditor(path);
            }
        }
    },
    
    renameFile(path) {
        const newName = prompt('Enter new name:', path.split('/').pop());
        if (newName && newName !== path.split('/').pop()) {
            console.log(`✏️ Renaming ${path} to ${newName}`);
            // In a real implementation, this would make an API call
        }
    },
    
    deleteFile(path) {
        if (confirm(`Are you sure you want to delete ${path}?`)) {
            console.log(`🗑️ Deleting ${path}`);
            // In a real implementation, this would make an API call
        }
    },
    
    createNewFile() {
        const fileName = prompt('Enter file name (with extension):');
        if (fileName) {
            console.log(`📄 Creating new file: ${fileName}`);
            // In a real implementation, this would create the file
        }
    },
    
    createNewFolder() {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            console.log(`📁 Creating new folder: ${folderName}`);
            // In a real implementation, this would create the folder
        }
    },
    
    // ===== KEYBOARD NAVIGATION =====
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+E to focus file explorer
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.focusFileExplorer();
            }
            
            // Arrow key navigation within file explorer
            if (document.activeElement?.closest('.ide-file-tree')) {
                this.handleArrowNavigation(e);
            }
        });
        
        console.log('⌨️ Keyboard navigation initialized');
    },
    
    focusFileExplorer() {
        const firstFolder = document.querySelector('.ide-folder-header');
        if (firstFolder) {
            firstFolder.focus();
            console.log('🎯 File explorer focused');
        }
    },
    
    handleArrowNavigation(e) {
        const current = document.activeElement;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.focusNext(current);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.focusPrevious(current);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (current.classList.contains('ide-folder-header')) {
                const folder = current.closest('.ide-folder');
                if (folder && !folder.classList.contains('expanded')) {
                    this.toggleFolder(folder.dataset.folder);
                }
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (current.classList.contains('ide-folder-header')) {
                const folder = current.closest('.ide-folder');
                if (folder && folder.classList.contains('expanded')) {
                    this.toggleFolder(folder.dataset.folder);
                }
            }
        }
    },
    
    focusNext(current) {
        const focusables = this.getFocusableElements();
        const currentIndex = focusables.indexOf(current);
        const nextIndex = (currentIndex + 1) % focusables.length;
        focusables[nextIndex]?.focus();
    },
    
    focusPrevious(current) {
        const focusables = this.getFocusableElements();
        const currentIndex = focusables.indexOf(current);
        const prevIndex = currentIndex === 0 ? focusables.length - 1 : currentIndex - 1;
        focusables[prevIndex]?.focus();
    },
    
    getFocusableElements() {
        return Array.from(document.querySelectorAll('.ide-folder-header, .menu-item-link.ide-file'));
    },
    
    // ===== STATE MANAGEMENT =====
    syncWithCurrentPage() {
        // Remove active state from all files
        document.querySelectorAll('.menu-item-link.ide-file').forEach(file => {
            file.classList.remove('active');
        });
        
        // Set active state based on current URL
        const currentPath = window.location.pathname;
        const activeFile = document.querySelector(`.menu-item-link.ide-file[href="${currentPath}"]`);
        
        if (activeFile) {
            activeFile.classList.add('active');
            
            // Expand parent folder
            const parentFolder = activeFile.closest('.ide-folder');
            if (parentFolder) {
                const folderKey = parentFolder.dataset.folder;
                this.expandFolder(folderKey);
            }
        }
        
        console.log(`🎯 Synced with current page: ${currentPath}`);
    },
    
    saveFolderState(folderKey, expanded) {
        try {
            const states = JSON.parse(localStorage.getItem('ide-folder-states') || '{}');
            states[folderKey] = expanded;
            localStorage.setItem('ide-folder-states', JSON.stringify(states));
        } catch (e) {
            console.warn('Failed to save folder state:', e);
        }
    },
    
    loadFolderStates() {
        try {
            const states = JSON.parse(localStorage.getItem('ide-folder-states') || '{}');
            Object.entries(states).forEach(([folderKey, expanded]) => {
                if (expanded && this.folders[folderKey]) {
                    this.expandFolder(folderKey);
                }
            });
        } catch (e) {
            console.warn('Failed to load folder states:', e);
        }
    }
};

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main IDE Command Center to load first
    setTimeout(() => {
        if (window.IDECommandCenter && window.IDECommandCenter.initialized) {
            window.IDEFileExplorer.init();
        } else {
            // Retry after main IDE loads
            setTimeout(() => {
                window.IDEFileExplorer.init();
            }, 1000);
        }
    }, 700);
});

// Add spin animation for refresh button
const explorerStyles = document.createElement('style');
explorerStyles.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(explorerStyles);

console.log('🗂️ IDE File Explorer module loaded');

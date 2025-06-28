/**
 * 🔧 IDE COMMAND CENTER - PHASE 2: ACE EDITOR INTEGRATION
 * Real code editor with Python syntax highlighting and IDE features
 * ================================================================
 */

window.IDEAceEditor = window.IDEAceEditor || {
    initialized: false,
    editors: {},
    currentEditor: null,
    themes: ['monokai', 'github', 'tomorrow_night', 'solarized_dark'],
    currentTheme: 'monokai',
    
    init() {
        if (this.initialized) return;
        
        console.log('🔧 Initializing ACE Editor integration...');
        
        this.loadThemePreference();
        
        this.loadAceEditor()
            .then(() => {
                this.setupDefaultEditor();
                this.enhanceCodeAreas();
                this.initEditorToolbar();
                this.initKeyboardShortcuts();
                this.initEditorSettings();
                
                this.initialized = true;
                console.log('✅ ACE Editor integration initialized successfully');
            })
            .catch(error => {
                console.warn('⚠️ ACE Editor failed to load, falling back to basic editor:', error);
                this.initFallbackEditor();
            });
    },
    
    // ===== ACE EDITOR LOADING =====
    async loadAceEditor() {
        // Check if ACE is already loaded
        if (window.ace) {
            console.log('✅ ACE Editor already available');
            return Promise.resolve();
        }
        
        console.log('📦 Loading ACE Editor from CDN...');
        
        // Load ACE Editor from CDN
        const aceScript = document.createElement('script');
        aceScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/ace.min.js';
        aceScript.crossOrigin = 'anonymous';
        
        const loadPromise = new Promise((resolve, reject) => {
            aceScript.onload = () => {
                console.log('✅ ACE Editor core loaded');
                this.loadAceExtensions().then(resolve).catch(reject);
            };
            aceScript.onerror = () => reject(new Error('Failed to load ACE Editor'));
        });
        
        document.head.appendChild(aceScript);
        return loadPromise;
    },
    
    async loadAceExtensions() {
        const extensions = [
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/mode-python.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/theme-monokai.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/theme-github.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/ext-language_tools.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/ext-searchbox.min.js'
        ];
        
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.crossOrigin = 'anonymous';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };
        
        try {
            await Promise.all(extensions.map(loadScript));
            console.log('✅ ACE Editor extensions loaded');
        } catch (error) {
            console.warn('⚠️ Some ACE extensions failed to load:', error);
        }
    },
    
    // ===== EDITOR SETUP =====
    setupDefaultEditor() {
        // Configure ACE globally
        ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/');
        ace.config.set('modePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/');
        ace.config.set('themePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/');
        
        // Enable extensions
        ace.require('ace/ext/language_tools');
        ace.require('ace/ext/searchbox');
        
        console.log('🔧 ACE Editor configured');
    },
    
    enhanceCodeAreas() {
        // Find code areas to enhance
        const codeAreas = [
            { id: 'bellringer-ide', name: 'Daily Challenge Editor' },
            ...this.findAdditionalCodeAreas()
        ];
        
        codeAreas.forEach(area => {
            this.createEditor(area.id, area.name);
        });
        
        console.log(`🔧 Enhanced ${codeAreas.length} code areas with ACE Editor`);
    },
    
    findAdditionalCodeAreas() {
        const areas = [];
        
        // Look for code snippets that could be enhanced
        document.querySelectorAll('.ide-code-snippet, pre[data-language="python"], .code-block').forEach((element, index) => {
            if (!element.id) {
                element.id = `ace-editor-${index}`;
            }
            
            areas.push({
                id: element.id,
                name: `Code Editor ${index + 1}`
            });
        });
        
        return areas;
    },
    
    createEditor(elementId, name = 'Code Editor') {
        const container = document.getElementById(elementId);
        if (!container || this.editors[elementId]) return null;
        
        try {
            // Store original content
            const originalContent = container.textContent || container.innerHTML || '';
            
            // Clear container and set minimum height
            container.innerHTML = '';
            container.style.minHeight = '180px';
            container.style.height = container.style.height || '180px';
            container.style.border = '1px solid var(--terminal-border)';
            container.style.borderRadius = '4px';
            
            // Create ACE editor
            const editor = ace.edit(elementId);
            
            // Configure editor
            this.configureEditor(editor, originalContent);
            
            // Store editor reference
            this.editors[elementId] = {
                editor: editor,
                name: name,
                container: container,
                originalContent: originalContent
            };
            
            // Set as current editor if it's the first or main editor
            if (!this.currentEditor || elementId === 'bellringer-ide') {
                this.currentEditor = elementId;
            }
            
            console.log(`🔧 Created ACE editor: ${name} (${elementId})`);
            return editor;
            
        } catch (error) {
            console.error(`❌ Failed to create ACE editor for ${elementId}:`, error);
            return null;
        }
    },
    
    configureEditor(editor, initialContent = '') {
        // Set theme and mode
        editor.setTheme(`ace/theme/${this.currentTheme}`);
        editor.session.setMode('ace/mode/python');
        
        // Set initial content
        if (initialContent.trim()) {
            // Clean up HTML content
            const cleanContent = this.cleanHtmlContent(initialContent);
            editor.setValue(cleanContent, -1);
        } else {
            editor.setValue('# Write your Python code here\n', -1);
        }
        
        // Configure editor options
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            showPrintMargin: false,
            fontSize: 14,
            fontFamily: 'var(--ide-font-mono)',
            wrap: true,
            autoScrollEditorIntoView: true,
            copyWithEmptySelection: true,
            highlightActiveLine: true,
            showGutter: true,
            displayIndentGuides: true
        });
        
        // Configure session
        editor.session.setOptions({
            tabSize: 4,
            useSoftTabs: true,
            useWorker: true
        });
        
        // Add event listeners
        this.addEditorEventListeners(editor);
        
        return editor;
    },
    
    cleanHtmlContent(htmlContent) {
        // Remove HTML tags and decode entities
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        
        // Replace syntax highlighting spans with plain text
        temp.querySelectorAll('span[class*="python-"], span[class*="highlight"]').forEach(span => {
            span.replaceWith(span.textContent);
        });
        
        return temp.textContent || temp.innerText || '';
    },
    
    // ===== EDITOR EVENT LISTENERS =====
    addEditorEventListeners(editor, editorId) {
        // Ctrl+Enter to run code
        editor.commands.addCommand({
            name: 'runCode',
            bindKey: {win: 'Ctrl-Enter', mac: 'Cmd-Enter'},
            exec: () => {
                this.runCurrentCode(editorId);
            }
        });
        
        // Ctrl+S to save (prevent browser save dialog)
        editor.commands.addCommand({
            name: 'saveCode',
            bindKey: {win: 'Ctrl-S', mac: 'Cmd-S'},
            exec: () => {
                this.saveCode(editorId);
                return false; // Prevent browser save dialog
            }
        });
        
        // Format code shortcut
        editor.commands.addCommand({
            name: 'formatCode',
            bindKey: {win: 'Shift-Alt-F', mac: 'Shift-Option-F'},
            exec: () => {
                this.formatCode(editorId);
            }
        });
        
        // Add change event for auto-save
        editor.session.on('change', this.debounce(() => {
            this.autoSave(editorId);
        }, 2000));
        
        // Add focus/blur events
        editor.on('focus', () => {
            this.currentEditor = editor;
            this.updateEditorStatus(editorId, 'focused');
        });
        
        editor.on('blur', () => {
            this.updateEditorStatus(editorId, 'blurred');
        });
        
        console.log(`⌨️ Added event listeners for editor: ${editorId}`);
    },
    
    // ===== CODE EXECUTION =====
    runCurrentCode(editorId) {
        const editorData = this.editors[editorId];
        if (!editorData || !editorData.editor) return;
        
        const code = editorData.editor.getValue();
        
        console.log(`🚀 Running code from ${editorId}:`, code);
        
        // If this is the bellringer IDE, use the existing run functionality
        if (editorId === 'bellringer-ide') {
            const runButton = document.getElementById('bellringer-run');
            if (runButton) {
                runButton.click();
                return;
            }
        }
        
        // For other editors, show the code in console
        this.displayCodeOutput(editorId, code);
    },
    
    displayCodeOutput(editorId, code) {
        // Create or find output area
        let outputArea = document.querySelector(`[data-output-for="${editorId}"]`);
        
        if (!outputArea) {
            // Create output area
            outputArea = document.createElement('div');
            outputArea.className = 'ide-code-output';
            outputArea.setAttribute('data-output-for', editorId);
            outputArea.style.cssText = `
                background: var(--terminal-bg);
                border: 1px solid var(--terminal-border);
                border-radius: 4px;
                margin-top: 10px;
                font-family: var(--ide-font-mono);
                font-size: 13px;
            `;
            
            const header = document.createElement('div');
            header.style.cssText = `
                background: var(--ide-bg-tertiary);
                padding: 6px 12px;
                border-bottom: 1px solid var(--terminal-border);
                color: var(--ide-text-secondary);
                font-size: 12px;
            `;
            header.textContent = '📋 Python Output';
            
            const content = document.createElement('pre');
            content.className = 'ide-output-content';
            content.style.cssText = `
                background: var(--terminal-bg);
                color: var(--terminal-text);
                padding: 12px;
                margin: 0;
                overflow-x: auto;
                white-space: pre-wrap;
            `;
            
            outputArea.appendChild(header);
            outputArea.appendChild(content);
            
            // Insert after the editor
            const editorContainer = document.getElementById(editorId);
            editorContainer.parentNode.insertBefore(outputArea, editorContainer.nextSibling);
        }
        
        const outputContent = outputArea.querySelector('.ide-output-content');
        outputContent.textContent = `>>> Executing Python code...\n${code}\n\n[Note: This is a demo. In a real IDE, this would execute the Python code.]`;
    },
    
    // ===== CODE MANAGEMENT =====
    saveCode(editorId) {
        const editorData = this.editors[editorId];
        if (!editorData) return;
        
        const code = editorData.editor.getValue();
        
        // Save to localStorage for persistence
        localStorage.setItem(`ide_code_${editorId}`, code);
        
        // Show save notification
        this.showNotification(`💾 Code saved for ${editorData.name}`, 'success');
        
        console.log(`💾 Saved code for ${editorId}`);
    },
    
    autoSave(editorId) {
        // Auto-save to localStorage
        const editorData = this.editors[editorId];
        if (!editorData) return;
        
        const code = editorData.editor.getValue();
        localStorage.setItem(`ide_auto_${editorId}`, code);
        
        console.log(`💾 Auto-saved ${editorId}`);
    },
    
    loadSavedCode(editorId) {
        // Try to load saved code
        const savedCode = localStorage.getItem(`ide_code_${editorId}`) || 
                         localStorage.getItem(`ide_auto_${editorId}`);
        
        if (savedCode && this.editors[editorId]) {
            this.editors[editorId].editor.setValue(savedCode, -1);
            console.log(`📂 Loaded saved code for ${editorId}`);
        }
    },
    
    formatCode(editorId) {
        const editorData = this.editors[editorId];
        if (!editorData) return;
        
        // Basic Python code formatting
        const editor = editorData.editor;
        const code = editor.getValue();
        
        // Simple formatting rules
        const formattedCode = code
            .split('\n')
            .map(line => {
                // Remove trailing whitespace
                line = line.trimEnd();
                
                // Add proper indentation for common Python patterns
                if (line.trim().startsWith('def ') || 
                    line.trim().startsWith('class ') ||
                    line.trim().startsWith('if ') ||
                    line.trim().startsWith('for ') ||
                    line.trim().startsWith('while ') ||
                    line.trim().startsWith('try:') ||
                    line.trim().startsWith('except ') ||
                    line.trim().startsWith('with ')) {
                    // These should typically not be indented at the base level
                }
                
                return line;
            })
            .join('\n');
        
        editor.setValue(formattedCode, -1);
        this.showNotification('🎨 Code formatted', 'success');
    },
    
    // ===== THEME MANAGEMENT =====
    changeTheme(themeName) {
        if (!this.themes.includes(themeName)) {
            console.warn(`❌ Theme '${themeName}' not available`);
            return;
        }
        
        this.currentTheme = themeName;
        
        // Apply theme to all editors
        Object.values(this.editors).forEach(editorData => {
            if (editorData.editor) {
                editorData.editor.setTheme(`ace/theme/${themeName}`);
            }
        });
        
        // Save theme preference
        localStorage.setItem('ide_theme', themeName);
        
        this.showNotification(`🎨 Theme changed to ${themeName}`, 'success');
        console.log(`🎨 Theme changed to: ${themeName}`);
    },
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('ide_theme');
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
            
            // Update theme selector if it exists
            const themeSelector = document.querySelector('.ide-toolbar-select');
            if (themeSelector) {
                themeSelector.value = savedTheme;
            }
        }
    },
    
    // ===== FILE INTEGRATION =====
    openFileInEditor(filePath) {
        console.log(`📂 Opening file in editor: ${filePath}`);
        
        // Create a new editor tab or use existing one
        const editorId = 'file-editor-' + filePath.replace(/[^a-zA-Z0-9]/g, '-');
        
        if (!this.editors[editorId]) {
            // Create a new editor container
            this.createFileEditor(editorId, filePath);
        }
        
        // Switch to this editor
        this.switchToEditor(editorId);
    },
    
    createFileEditor(editorId, filePath) {
        // Create editor container
        const container = document.createElement('div');
        container.id = editorId;
        container.className = 'ide-file-editor';
        container.style.cssText = `
            height: 400px;
            border: 1px solid var(--terminal-border);
            border-radius: 4px;
            margin: 10px;
            background: var(--ide-bg-input);
        `;
        
        // Add to main content area
        const mainArea = document.querySelector('.dashboard-grid') || document.querySelector('main');
        if (mainArea) {
            mainArea.appendChild(container);
        }
        
        // Create editor
        const editor = this.createEditor(editorId, `File: ${filePath}`);
        
        if (editor) {
            // Load file content (simulated)
            this.loadFileContent(editor, filePath);
        }
    },
    
    loadFileContent(editor, filePath) {
        // Simulate loading file content
        let content = `# File: ${filePath}\n# This is a simulated file view\n\n`;
        
        if (filePath.includes('lesson')) {
            content += `# Lesson file\nprint("Welcome to this lesson!")\n\ndef main():\n    # Add your lesson code here\n    pass\n\nif __name__ == "__main__":\n    main()`;
        } else if (filePath.includes('quiz')) {
            content += `# Quiz file\nquestions = [\n    {\n        "question": "What is Python?",\n        "options": ["A snake", "A programming language", "A movie"],\n        "answer": 1\n    }\n]\n\nprint("Quiz loaded successfully!")`;
        } else {
            content += `# Python file\nprint("Hello from ${filePath}!")\n\n# Write your code here`;
        }
        
        editor.setValue(content, -1);
    },
    
    switchToEditor(editorId) {
        // Hide all editors except the target one
        Object.keys(this.editors).forEach(id => {
            const container = document.getElementById(id);
            if (container && container.classList.contains('ide-file-editor')) {
                container.style.display = id === editorId ? 'block' : 'none';
            }
        });
        
        // Set as current editor
        if (this.editors[editorId]) {
            this.currentEditor = this.editors[editorId].editor;
        }
    },
    
    // ===== UTILITY FUNCTIONS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    updateEditorStatus(editorId, status) {
        const statusBar = document.querySelector('.ide-status-bar');
        if (statusBar) {
            const editorInfo = statusBar.querySelector('.ide-editor-info') || 
                             this.createEditorStatusInfo(statusBar);
            
            editorInfo.textContent = `Editor: ${editorId} (${status})`;
        }
    },
    
    createEditorStatusInfo(statusBar) {
        const info = document.createElement('div');
        info.className = 'ide-editor-info';
        info.style.cssText = `
            color: var(--ide-text-secondary);
            font-size: 12px;
            font-family: var(--ide-font-mono);
        `;
        statusBar.appendChild(info);
        return info;
    },
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `ide-notification ide-notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--terminal-success);
            color: #000;
            padding: 12px 20px;
            border-radius: 4px;
            font-family: var(--ide-font-mono);
            font-size: 13px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        if (type === 'error') {
            notification.style.background = 'var(--terminal-error)';
            notification.style.color = '#fff';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },
    
    // ===== FALLBACK EDITOR =====
    initFallbackEditor() {
        console.log('🔧 Initializing fallback editor...');
        
        // Enhance textarea/code areas with basic features
        const codeAreas = document.querySelectorAll('#bellringer-ide, .ide-code-snippet');
        
        codeAreas.forEach(area => {
            this.enhanceBasicEditor(area);
        });
        
        this.initialized = true;
        console.log('✅ Fallback editor initialized');
    },
    
    enhanceBasicEditor(element) {
        // Convert to textarea if it's not already
        if (element.tagName !== 'TEXTAREA') {
            const textarea = document.createElement('textarea');
            textarea.id = element.id;
            textarea.className = element.className + ' ide-basic-editor';
            textarea.value = element.textContent || '';
            textarea.style.cssText = `
                width: 100%;
                height: 180px;
                background: var(--ide-bg-input);
                border: 1px solid var(--terminal-border);
                border-radius: 4px;
                padding: 8px;
                color: var(--ide-text-primary);
                font-family: var(--ide-font-mono);
                font-size: 14px;
                resize: vertical;
            `;
            
            element.parentNode.replaceChild(textarea, element);
            element = textarea;
        }
        
        // Add basic enhancements
        element.addEventListener('keydown', (e) => {
            // Tab key support
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = element.selectionStart;
                const end = element.selectionEnd;
                element.value = element.value.substring(0, start) + '    ' + element.value.substring(end);
                element.selectionStart = element.selectionEnd = start + 4;
            }
            
            // Ctrl+Enter to run
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const runButton = document.getElementById('bellringer-run');
                if (runButton) runButton.click();
            }
        });
        
        console.log('🔧 Enhanced basic editor:', element.id);
    },
    
    // ===== KEYBOARD SHORTCUTS =====
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts when editor is focused
            if (e.target.closest('.ace_editor') || e.target.classList.contains('ide-basic-editor')) {
                // Already handled by ACE or basic editor
                return;
            }
            
            // Ctrl+Shift+P for command palette (future)
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                console.log('🎮 Command palette (future feature)');
            }
        });
    },
    
    // ===== SETTINGS =====
    initEditorSettings() {
        // Load saved theme
        const savedTheme = localStorage.getItem('ide-editor-theme');
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        
        // Load auto-saved code
        this.loadAutoSavedCode();
        
        console.log('⚙️ Editor settings initialized');
    },
    
    loadAutoSavedCode() {
        try {
            const autoSaved = JSON.parse(localStorage.getItem('ide-auto-saved') || '{}');
            
            Object.entries(autoSaved).forEach(([editorId, data]) => {
                if (this.editors[editorId] && data.code) {
                    const timeSinceAutoSave = Date.now() - data.timestamp;
                    
                    // Only restore if less than 24 hours old
                    if (timeSinceAutoSave < 24 * 60 * 60 * 1000) {
                        this.editors[editorId].editor.setValue(data.code, -1);
                        console.log(`🔄 Restored auto-saved code for ${editorId}`);
                    }
                }
            });
            
        } catch (error) {
            console.warn('Failed to load auto-saved code:', error);
        }
    }
};

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other IDE components to load first
    setTimeout(() => {
        if (window.IDECommandCenter && window.IDECommandCenter.initialized) {
            window.IDEAceEditor.init();
        } else {
            // Retry after main IDE loads
            setTimeout(() => {
                window.IDEAceEditor.init();
            }, 1500);
        }
    }, 1000);
});

console.log('🔧 IDE ACE Editor module loaded');

/**
 * 🖥️ IDE COMMAND CENTER - PHASE 1 ENHANCEMENTS
 * Terminal interactions, syntax highlighting, and IDE behaviors
 * ===========================================================
 */

window.IDECommandCenter = window.IDECommandCenter || {
    initialized: false,
    terminalWindows: [],
    syntaxHighlighter: null,
    
    init() {
        if (this.initialized) return;
        
        console.log('🖥️ Initializing IDE Command Center...');
        
        this.initTerminalWindows();
        this.initSyntaxHighlighting();
        this.initTerminalAnimations();
        this.initIDEInteractions();
        this.enhanceGameification();
        
        this.initialized = true;
        console.log('✅ IDE Command Center initialized successfully');
    },
    
    // ===== TERMINAL WINDOW MANAGEMENT =====
    initTerminalWindows() {
        const terminalWindows = document.querySelectorAll('.ide-terminal-window');
        
        terminalWindows.forEach((terminal, index) => {
            this.setupTerminalWindow(terminal, index);
        });
        
        console.log(`🖥️ Initialized ${terminalWindows.length} terminal windows`);
    },
    
    setupTerminalWindow(terminal, index) {
        const windowId = `terminal-${index}`;
        terminal.setAttribute('data-terminal-id', windowId);
        
        // Setup window controls
        this.setupWindowControls(terminal);
        
        // Setup focus management
        this.setupTerminalFocus(terminal);
        
        // Setup drag and resize (basic)
        this.setupTerminalInteraction(terminal);
        
        this.terminalWindows.push({
            id: windowId,
            element: terminal,
            focused: false,
            minimized: false
        });
    },
    
    setupWindowControls(terminal) {
        const controls = terminal.querySelectorAll('.ide-terminal-control');
        
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = control.classList.contains('close') ? 'close' :
                              control.classList.contains('minimize') ? 'minimize' :
                              control.classList.contains('maximize') ? 'maximize' : null;
                              
                if (action) {
                    this.handleWindowAction(terminal, action);
                }
            });
        });
    },
    
    handleWindowAction(terminal, action) {
        const terminalId = terminal.getAttribute('data-terminal-id');
        
        switch (action) {
            case 'close':
                this.hideTerminal(terminal);
                break;
            case 'minimize':
                this.minimizeTerminal(terminal);
                break;
            case 'maximize':
                this.maximizeTerminal(terminal);
                break;
        }
        
        console.log(`🖥️ Terminal ${terminalId} - ${action}`);
    },
    
    hideTerminal(terminal) {
        terminal.style.opacity = '0.5';
        terminal.style.pointerEvents = 'none';
        setTimeout(() => {
            terminal.style.display = 'none';
        }, 300);
    },
    
    minimizeTerminal(terminal) {
        const content = terminal.querySelector('.ide-terminal-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            terminal.style.height = 'auto';
        } else {
            content.style.display = 'none';
            terminal.style.height = '40px';
        }
    },
    
    maximizeTerminal(terminal) {
        if (terminal.classList.contains('maximized')) {
            terminal.classList.remove('maximized');
            terminal.style.position = 'relative';
            terminal.style.top = 'auto';
            terminal.style.left = 'auto';
            terminal.style.width = 'auto';
            terminal.style.height = 'auto';
            terminal.style.zIndex = 'auto';
        } else {
            terminal.classList.add('maximized');
            terminal.style.position = 'fixed';
            terminal.style.top = '60px';
            terminal.style.left = '20px';
            terminal.style.right = '20px';
            terminal.style.bottom = '20px';
            terminal.style.width = 'auto';
            terminal.style.height = 'auto';
            terminal.style.zIndex = '1000';
        }
    },
    
    setupTerminalFocus(terminal) {
        terminal.addEventListener('click', () => {
            this.focusTerminal(terminal);
        });
    },
    
    focusTerminal(terminal) {
        // Remove focus from all terminals
        this.terminalWindows.forEach(t => {
            t.element.classList.remove('focused');
            t.focused = false;
        });
        
        // Focus the clicked terminal
        terminal.classList.add('focused');
        const terminalData = this.terminalWindows.find(t => t.element === terminal);
        if (terminalData) {
            terminalData.focused = true;
        }
    },
    
    setupTerminalInteraction(terminal) {
        // Add hover effects
        terminal.addEventListener('mouseenter', () => {
            if (!terminal.classList.contains('focused')) {
                terminal.style.transform = 'translateY(-2px)';
                terminal.style.boxShadow = 'var(--ide-shadow-lg)';
            }
        });
        
        terminal.addEventListener('mouseleave', () => {
            if (!terminal.classList.contains('focused')) {
                terminal.style.transform = 'translateY(0)';
                terminal.style.boxShadow = 'var(--ide-shadow-md)';
            }
        });
    },
    
    // ===== SYNTAX HIGHLIGHTING =====
    initSyntaxHighlighting() {
        this.syntaxHighlighter = {
            keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'import', 'from', 'return', 'print'],
            strings: /["']([^"'\\]|\\.)*["']/g,
            comments: /#.*$/gm,
            numbers: /\b\d+(\.\d+)?\b/g,
            functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g
        };
        
        this.applySyntaxHighlighting();
        console.log('🎨 Syntax highlighting initialized');
    },
    
    applySyntaxHighlighting() {
        const codeElements = document.querySelectorAll('.ide-code-snippet, #bellringer-ide');
        
        codeElements.forEach(element => {
            if (element.textContent && element.textContent.trim()) {
                this.highlightCode(element);
            }
        });
    },
    
    highlightCode(element) {
        let code = element.textContent;
        
        // Highlight strings first
        code = code.replace(this.syntaxHighlighter.strings, '<span class="python-string">$&</span>');
        
        // Highlight comments
        code = code.replace(this.syntaxHighlighter.comments, '<span class="python-comment">$&</span>');
        
        // Highlight numbers
        code = code.replace(this.syntaxHighlighter.numbers, '<span class="python-number">$&</span>');
        
        // Highlight keywords
        this.syntaxHighlighter.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            code = code.replace(regex, `<span class="python-keyword">${keyword}</span>`);
        });
        
        // Highlight functions
        code = code.replace(this.syntaxHighlighter.functions, '<span class="python-function">$1</span>(');
        
        element.innerHTML = code;
    },
    
    // ===== TERMINAL ANIMATIONS =====
    initTerminalAnimations() {
        this.setupTypewriterEffects();
        this.setupPromptAnimations();
        this.setupProgressAnimations();
        
        console.log('🎬 Terminal animations initialized');
    },
    
    setupTypewriterEffects() {
        const typewriterElements = document.querySelectorAll('.ide-typing');
        
        typewriterElements.forEach(element => {
            this.typeWriter(element, element.textContent, 50);
        });
    },
    
    typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.add('ide-cursor');
            }
        }, speed);
    },
    
    setupPromptAnimations() {
        const prompts = document.querySelectorAll('.ide-prompt');
        
        prompts.forEach((prompt, index) => {
            setTimeout(() => {
                prompt.style.opacity = '0';
                prompt.style.transform = 'translateX(-10px)';
                prompt.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    prompt.style.opacity = '1';
                    prompt.style.transform = 'translateX(0)';
                }, 100);
            }, index * 200);
        });
    },
    
    setupProgressAnimations() {
        const progressBars = document.querySelectorAll('.ide-progress-fill');
        
        progressBars.forEach(bar => {
            const width = bar.style.width || '0%';
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-out';
                bar.style.width = width;
            }, 500);
        });
    },
    
    // ===== IDE INTERACTIONS =====
    initIDEInteractions() {
        this.setupKeyboardShortcuts();
        this.setupCommandPalette();
        this.setupContextMenus();
        
        console.log('⌨️ IDE interactions initialized');
    },
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to run code
            if (e.ctrlKey && e.key === 'Enter') {
                const runButton = document.getElementById('bellringer-run');
                if (runButton) {
                    runButton.click();
                    e.preventDefault();
                }
            }
            
            // Ctrl+` to focus terminal
            if (e.ctrlKey && e.key === '`') {
                const firstTerminal = document.querySelector('.ide-terminal-window');
                if (firstTerminal) {
                    this.focusTerminal(firstTerminal);
                    e.preventDefault();
                }
            }
            
            // F11 to maximize current terminal
            if (e.key === 'F11') {
                const focusedTerminal = document.querySelector('.ide-terminal-window.focused');
                if (focusedTerminal) {
                    this.maximizeTerminal(focusedTerminal);
                    e.preventDefault();
                }
            }
        });
    },
    
    setupCommandPalette() {
        // Simple command palette (future enhancement)
        this.commandPalette = {
            commands: [
                { name: 'Run Code', shortcut: 'Ctrl+Enter', action: () => this.runCode() },
                { name: 'Focus Terminal', shortcut: 'Ctrl+`', action: () => this.focusFirstTerminal() },
                { name: 'Toggle Fullscreen', shortcut: 'F11', action: () => this.toggleFullscreen() }
            ]
        };
    },
    
    setupContextMenus() {
        document.querySelectorAll('.ide-terminal-window').forEach(terminal => {
            terminal.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, terminal);
            });
        });
    },
    
    showContextMenu(event, terminal) {
        // Simple context menu (future enhancement)
        console.log('🖱️ Context menu for terminal:', terminal.getAttribute('data-terminal-id'));
    },
    
    // ===== ENHANCED GAMIFICATION =====
    enhanceGameification() {
        this.setupLeaderboardAnimations();
        this.setupAchievementNotifications();
        this.setupProgressVisualization();
        
        console.log('🎮 Enhanced gamification initialized');
    },
    
    setupLeaderboardAnimations() {
        const leaderboard = document.getElementById('leaderboard-body');
        if (!leaderboard) return;
        
        // Add terminal-style animations to leaderboard updates
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this.animateLeaderboardUpdate();
                }
            });
        });
        
        observer.observe(leaderboard, { childList: true, subtree: true });
    },
    
    animateLeaderboardUpdate() {
        const rows = document.querySelectorAll('#leaderboard-body tr');
        
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 100);
        });
    },
    
    setupAchievementNotifications() {
        // Terminal-style achievement notifications
        this.achievementQueue = [];
    },
    
    showAchievement(title, description, icon = '🏆') {
        const notification = document.createElement('div');
        notification.className = 'ide-achievement-notification';
        notification.innerHTML = `
            <div class="ide-terminal-window" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <div class="ide-terminal-header">
                    <div class="ide-terminal-controls">
                        <div class="ide-terminal-control close"></div>
                        <div class="ide-terminal-control minimize"></div>
                        <div class="ide-terminal-control maximize"></div>
                    </div>
                    <div class="ide-terminal-title">${icon} achievement_unlocked.py</div>
                </div>
                <div class="ide-terminal-content">
                    <div class="ide-prompt">print("Achievement Unlocked!")</div>
                    <div style="margin: 10px 0; color: var(--terminal-success);">
                        <strong>${title}</strong><br>
                        <small style="color: var(--terminal-text);">${description}</small>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },
    
    setupProgressVisualization() {
        // Enhanced progress bars with terminal styling
        const progressElements = document.querySelectorAll('[id*="progress"], [class*="progress"]');
        
        progressElements.forEach(element => {
            if (!element.classList.contains('ide-enhanced')) {
                this.enhanceProgressElement(element);
            }
        });
    },
    
    enhanceProgressElement(element) {
        element.classList.add('ide-enhanced');
        
        // Add terminal-style progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'ide-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'ide-progress-fill';
        
        progressBar.appendChild(progressFill);
        element.appendChild(progressBar);
    },
    
    // ===== UTILITY METHODS =====
    runCode() {
        const runButton = document.getElementById('bellringer-run');
        if (runButton) runButton.click();
    },
    
    focusFirstTerminal() {
        const firstTerminal = document.querySelector('.ide-terminal-window');
        if (firstTerminal) this.focusTerminal(firstTerminal);
    },
    
    toggleFullscreen() {
        const focusedTerminal = document.querySelector('.ide-terminal-window.focused');
        if (focusedTerminal) this.maximizeTerminal(focusedTerminal);
    },
    
    updateTerminalTitle(terminalId, newTitle) {
        const terminal = document.querySelector(`[data-terminal-id="${terminalId}"]`);
        if (terminal) {
            const titleElement = terminal.querySelector('.ide-terminal-title');
            if (titleElement) {
                titleElement.textContent = newTitle;
            }
        }
    },
    
    addTerminalOutput(terminalId, output, type = 'info') {
        const terminal = document.querySelector(`[data-terminal-id="${terminalId}"]`);
        if (!terminal) return;
        
        const content = terminal.querySelector('.ide-terminal-content');
        const outputElement = document.createElement('div');
        outputElement.style.color = this.getOutputColor(type);
        outputElement.textContent = output;
        
        content.appendChild(outputElement);
        
        // Auto-scroll to bottom
        content.scrollTop = content.scrollHeight;
    },
    
    getOutputColor(type) {
        switch (type) {
            case 'success': return 'var(--terminal-success)';
            case 'error': return 'var(--terminal-error)';
            case 'warning': return 'var(--terminal-warning)';
            default: return 'var(--terminal-text)';
        }
    }
};

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main dashboard to load first
    setTimeout(() => {
        if (window.DashboardNuclear && window.DashboardNuclear.initialized) {
            window.IDECommandCenter.init();
        } else {
            // Retry after main dashboard loads
            setTimeout(() => {
                window.IDECommandCenter.init();
            }, 1000);
        }
    }, 500);
});

// ===== CSS INJECTION FOR FOCUSED STATES =====
const ideStyles = document.createElement('style');
ideStyles.textContent = `
    .ide-terminal-window.focused {
        box-shadow: var(--ide-glow-blue);
        transform: translateY(-2px);
    }
    
    .ide-terminal-window.focused .ide-terminal-header {
        background: var(--ide-bg-accent);
    }
    
    .ide-achievement-notification {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .ide-terminal-window.maximized {
        animation: expandToFullscreen 0.3s ease-out;
    }
    
    @keyframes expandToFullscreen {
        from {
            transform: scale(1);
        }
        to {
            transform: scale(1.02);
        }
    }
`;

document.head.appendChild(ideStyles);

console.log('🖥️ IDE Command Center module loaded');

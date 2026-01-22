// IDE JavaScript - Full-featured Python IDE for students
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Firebase configuration (import from existing config)
let firebaseConfig;
try {
  const cfg = await import('./firebase-config.js');
  firebaseConfig = cfg.firebaseConfig;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  // Update user info when authenticated
  onAuthStateChanged(auth, (user) => {
    const userNameEl = document.getElementById('user-name');
    if (user && userNameEl) {
      userNameEl.textContent = user.displayName || user.email || 'Student';
    }
  });
} catch (error) {
  console.log('Firebase not configured, running in standalone mode');
}

// IDE State Management
class IDEManager {
  constructor() {
    this.editor = null;
    this.pyodide = null;
    this.isRunning = false;
    this.currentFile = 'main.py';
    this.files = new Map();
    this.examples = this.getCodeExamples();
    this.panelSizes = { sidebar: 250, output: 300 };
    this.isResizing = false;
    this.editorType = 'none'; // Track which editor is active
    
    // Initialize default file
    this.files.set('main.py', this.getDefaultCode());
    
    console.log('IDEManager constructor called');
    this.init();
  }
  
  async init() {
    console.log('Starting IDE initialization...');
    
    // Always initialize event listeners first to ensure buttons work
    this.initEventListeners();
    this.initPanelResizing();
    this.initUI();
    
    try {
      console.log('Attempting to load Monaco Editor...');
      await this.initMonacoEditor();
      console.log('Monaco Editor loaded successfully');
    } catch (error) {
      console.warn('Monaco Editor failed to load, using fallback:', error);
      this.initFallbackEditor();
    }
    
    try {
      console.log('Attempting to load Pyodide...');
      await this.initPyodide();
      console.log('Pyodide loaded successfully');
    } catch (error) {
      console.warn('Pyodide failed to load, using simulation mode:', error);
    }
    
    console.log('IDE initialization complete');
    this.updateStatus('Ready');
  }
  
  async initMonacoEditor() {
    return new Promise((resolve, reject) => {
      console.log('Initializing Monaco Editor...');
      
      // Check if Monaco loader is available
      if (typeof require === 'undefined') {
        console.error('Monaco loader not available');
        reject(new Error('Monaco loader not available'));
        return;
      }
      
      // Configure Monaco loader
      require.config({ 
        paths: { 
          'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' 
        }
      });
      
      require(['vs/editor/editor.main'], () => {
        try {
          console.log('Monaco Editor modules loaded');
          
          // Check if monaco is available
          if (typeof monaco === 'undefined') {
            throw new Error('Monaco editor not available');
          }
          
          // Configure Monaco for Python
          monaco.languages.register({ id: 'python' });
          
          // Create the editor
          this.editor = monaco.editor.create(document.getElementById('code-editor'), {
            value: this.files.get(this.currentFile),
            language: 'python',
            theme: 'vs-dark',
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            folding: true,
            renderWhitespace: 'selection',
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            glyphMargin: true,
            lineNumbersMinChars: 3,
            showFoldingControls: 'always'
          });
          
          console.log('Monaco Editor created successfully');
          
          // Add editor event listeners
          this.editor.onDidChangeModelContent(() => {
            this.files.set(this.currentFile, this.editor.getValue());
            this.markFileAsModified();
          });
          
          this.editor.onDidChangeCursorPosition((e) => {
            this.updateCursorPosition(e.position.lineNumber, e.position.column);
          });
          
          // Add keyboard shortcuts
          this.editor.addAction({
            id: 'run-code',
            label: 'Run Code',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => this.runCode()
          });
          
          this.editor.addAction({
            id: 'save-file',
            label: 'Save File',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            run: () => this.saveFile()
          });
          
          console.log('Monaco Editor initialized successfully');
          this.editorType = 'monaco';
          resolve();
        } catch (error) {
          console.error('Monaco Editor creation error:', error);
          reject(error);
        }
      }, (error) => {
        console.error('Monaco modules loading error:', error);
        reject(error);
      });
    });
  }
  
  initFallbackEditor() {
    console.log('Initializing fallback textarea editor');
    const codeEditor = document.getElementById('code-editor');
    const fallbackEditor = document.getElementById('code-fallback');
    
    if (codeEditor && fallbackEditor) {
      // Hide Monaco editor container and show fallback
      codeEditor.style.display = 'none';
      fallbackEditor.style.display = 'block';
      fallbackEditor.style.width = '100%';
      fallbackEditor.style.height = '100%';
      
      // Set initial content
      fallbackEditor.value = this.files.get(this.currentFile) || this.getDefaultCode();
      
      // Add event listeners for fallback
      fallbackEditor.addEventListener('input', () => {
        this.files.set(this.currentFile, fallbackEditor.value);
        this.markFileAsModified();
      });
      
      fallbackEditor.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.runCode();
        }
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          this.saveFile();
        }
        
        // Handle Tab key for indentation
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = fallbackEditor.selectionStart;
          const end = fallbackEditor.selectionEnd;
          
          // Insert tab or 4 spaces
          const tabChar = '    ';
          fallbackEditor.value = fallbackEditor.value.substring(0, start) + 
                                tabChar + 
                                fallbackEditor.value.substring(end);
          
          // Move cursor
          fallbackEditor.selectionStart = fallbackEditor.selectionEnd = start + tabChar.length;
          
          // Update file content
          this.files.set(this.currentFile, fallbackEditor.value);
        }
      });
      
      // Update cursor position display
      fallbackEditor.addEventListener('click', () => {
        this.updateCursorPositionFromTextarea(fallbackEditor);
      });
      
      fallbackEditor.addEventListener('keyup', () => {
        this.updateCursorPositionFromTextarea(fallbackEditor);
      });
      
      // Focus the editor
      fallbackEditor.focus();
      
      console.log('Fallback editor initialized and ready');
      this.editorType = 'fallback';
    } else {
      console.error('Could not find editor elements');
    }
  }
  
  updateCursorPositionFromTextarea(textarea) {
    const text = textarea.value;
    const cursor = textarea.selectionStart;
    const lines = text.substring(0, cursor).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    this.updateCursorPosition(line, column);
  }
  
  async initPyodide() {
    try {
      this.updateStatus('Loading Python environment...');
      
      // Load Pyodide
      const pyodideScript = document.createElement('script');
      pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      pyodideScript.onload = async () => {
        this.pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });
        
        // Install common packages
        await this.pyodide.loadPackage(['numpy', 'matplotlib']);
        
        console.log('Pyodide initialized');
        this.updateStatus('Python ready');
      };
      
      pyodideScript.onerror = () => {
        console.warn('Pyodide failed to load, using mock execution');
        this.pyodide = null;
        this.updateStatus('Ready (Python simulation)');
      };
      
      document.head.appendChild(pyodideScript);
    } catch (error) {
      console.error('Pyodide initialization error:', error);
      this.pyodide = null;
      this.updateStatus('Ready (Python simulation)');
    }
  }
  
  initEventListeners() {
    // Toolbar buttons
    document.getElementById('run-btn')?.addEventListener('click', () => this.runCode());
    document.getElementById('stop-btn')?.addEventListener('click', () => this.stopExecution());
    document.getElementById('save-btn')?.addEventListener('click', () => this.saveFile());
    document.getElementById('new-file-btn')?.addEventListener('click', () => this.createNewFile());
    document.getElementById('clear-output-btn')?.addEventListener('click', () => this.clearOutput());
    document.getElementById('share-btn')?.addEventListener('click', () => this.shareCode());
    document.getElementById('format-btn')?.addEventListener('click', () => this.formatCode());
    
    // File explorer
    document.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const fileName = e.currentTarget.dataset.file;
        if (fileName) this.openFile(fileName);
      });
    });
    
    // Code examples
    document.querySelectorAll('.example-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const exampleName = e.currentTarget.dataset.example;
        if (exampleName) this.loadExample(exampleName);
      });
    });
    
    // Output tabs
    document.querySelectorAll('.output-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchOutputTab(e.target.dataset.tab);
      });
    });
    
    // Panel toggles
    document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
      this.togglePanel('sidebar');
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            this.runCode();
            break;
          case 's':
            e.preventDefault();
            this.saveFile();
            break;
          case 'n':
            e.preventDefault();
            this.createNewFile();
            break;
          case 'b':
            e.preventDefault();
            this.togglePanel('sidebar');
            break;
        }
      }
      
      // F1 for formatting
      if (e.key === 'F1') {
        e.preventDefault();
        this.formatCode();
      }
    });
  }
  
  initPanelResizing() {
    const leftHandle = document.getElementById('left-resize');
    const rightHandle = document.getElementById('right-resize');
    const ideMain = document.querySelector('.ide-main');
    
    if (leftHandle) {
      leftHandle.addEventListener('mousedown', (e) => {
        this.startResize(e, 'left');
      });
    }
    
    if (rightHandle) {
      rightHandle.addEventListener('mousedown', (e) => {
        this.startResize(e, 'right');
      });
    }
    
    document.addEventListener('mousemove', (e) => {
      this.handleResize(e);
    });
    
    document.addEventListener('mouseup', () => {
      this.stopResize();
    });
  }
  
  startResize(e, panel) {
    this.isResizing = panel;
    this.startX = e.clientX;
    this.startSizes = { ...this.panelSizes };
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  }
  
  handleResize(e) {
    if (!this.isResizing) return;
    
    const deltaX = e.clientX - this.startX;
    const ideMain = document.querySelector('.ide-main');
    
    if (this.isResizing === 'left') {
      const newSize = Math.max(200, Math.min(400, this.startSizes.sidebar + deltaX));
      this.panelSizes.sidebar = newSize;
      ideMain.style.gridTemplateColumns = `${newSize}px 1fr ${this.panelSizes.output}px`;
      
      // Update resize handle position
      const leftHandle = document.getElementById('left-resize');
      if (leftHandle) leftHandle.style.left = `${newSize}px`;
      
    } else if (this.isResizing === 'right') {
      const newSize = Math.max(200, Math.min(500, this.startSizes.output - deltaX));
      this.panelSizes.output = newSize;
      ideMain.style.gridTemplateColumns = `${this.panelSizes.sidebar}px 1fr ${newSize}px`;
      
      // Update resize handle position
      const rightHandle = document.getElementById('right-resize');
      if (rightHandle) rightHandle.style.right = `${newSize}px`;
    }
    
    // Trigger editor resize
    if (this.editor) {
      setTimeout(() => this.editor.layout(), 0);
    }
  }
  
  stopResize() {
    this.isResizing = false;
    document.body.style.cursor = '';
  }
  
  togglePanel(panel) {
    const ideMain = document.querySelector('.ide-main');
    const sidebar = document.querySelector('.sidebar');
    const outputPanel = document.querySelector('.output-panel');
    
    if (panel === 'sidebar') {
      const isCollapsed = sidebar.classList.contains('panel-collapsed');
      
      if (isCollapsed) {
        sidebar.classList.remove('panel-collapsed');
        ideMain.style.gridTemplateColumns = `${this.panelSizes.sidebar}px 1fr ${this.panelSizes.output}px`;
      } else {
        sidebar.classList.add('panel-collapsed');
        ideMain.style.gridTemplateColumns = `0px 1fr ${this.panelSizes.output}px`;
      }
      
      // Update toggle button icon
      const toggleBtn = document.getElementById('toggle-sidebar');
      const icon = toggleBtn?.querySelector('i');
      if (icon) {
        icon.className = isCollapsed ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
      }
      
      // Trigger editor resize
      if (this.editor) {
        setTimeout(() => this.editor.layout(), 100);
      }
    }
  }
  
  initUI() {
    // Update file explorer
    this.updateFileExplorer();
    
    // Set initial cursor position
    this.updateCursorPosition(1, 1);
    
    // Show welcome message
    this.addOutput('info', 'Welcome to Python IDE! Start coding and click Run to execute.');
    this.addOutput('', 'Try the examples on the left sidebar to get started.');
  }
  
  async runCode() {
    console.log('runCode() method called');
    
    if (this.isRunning) {
      console.log('Code is already running, skipping...');
      return;
    }
    
    this.isRunning = true;
    this.updateRunButton(true);
    this.updateStatus('Running...');
    
    const code = this.getCurrentCode();
    console.log('Code to execute:', code.substring(0, 100) + (code.length > 100 ? '...' : ''));
    
    try {
      if (this.pyodide) {
        console.log('Using Pyodide for execution');
        await this.runWithPyodide(code);
      } else {
        console.log('Using simulation mode for execution');
        this.simulateExecution(code);
      }
    } catch (error) {
      this.addOutput('error', `Error: ${error.message}`);
    } finally {
      this.isRunning = false;
      this.updateRunButton(false);
      this.updateStatus('Ready');
    }
  }
  
  async runWithPyodide(code) {
    try {
      // Redirect stdout to capture print statements
      this.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);
      
      // Execute the user code
      this.pyodide.runPython(code);
      
      // Get the output
      const stdout = this.pyodide.runPython('sys.stdout.getvalue()');
      const stderr = this.pyodide.runPython('sys.stderr.getvalue()');
      
      // Display results
      if (stdout) {
        this.addOutput('success', stdout);
      }
      if (stderr) {
        this.addOutput('error', stderr);
      }
      
      if (!stdout && !stderr) {
        this.addOutput('info', 'Code executed successfully (no output)');
      }
      
    } catch (error) {
      this.addOutput('error', `Python Error: ${error.message}`);
    }
  }
  
  simulateExecution(code) {
    // Simple simulation for when Pyodide isn't available
    this.addOutput('info', 'Code execution simulated (Pyodide not available)');
    this.addOutput('', `Executing ${code.split('\\n').length} lines of Python code...`);
    
    // Simple print statement detection
    const printMatches = code.match(/print\\s*\\([^)]*\\)/g);
    if (printMatches) {
      printMatches.forEach(match => {
        const content = match.match(/print\\s*\\(\\s*['"](.*?)['"]\\s*\\)/);
        if (content && content[1]) {
          this.addOutput('success', content[1]);
        }
      });
    }
    
    this.addOutput('info', 'Simulation complete');
  }
  
  stopExecution() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.updateRunButton(false);
    this.updateStatus('Stopped');
    this.addOutput('info', 'Execution stopped by user');
  }
  
  saveFile() {
    const content = this.getCurrentCode();
    this.files.set(this.currentFile, content);
    
    // Save to localStorage
    const savedFiles = Object.fromEntries(this.files);
    localStorage.setItem('ide-files', JSON.stringify(savedFiles));
    
    this.addOutput('info', `File '${this.currentFile}' saved`);
    this.updateFileTab(this.currentFile, false);
  }
  
  createNewFile() {
    const fileName = prompt('Enter file name:', 'untitled.py');
    if (!fileName) return;
    
    if (!fileName.endsWith('.py')) {
      alert('Please use .py extension for Python files');
      return;
    }
    
    if (this.files.has(fileName)) {
      alert('File already exists');
      return;
    }
    
    this.files.set(fileName, this.getDefaultCode());
    this.openFile(fileName);
    this.updateFileExplorer();
    this.addOutput('info', `Created new file: ${fileName}`);
  }
  
  openFile(fileName) {
    if (!this.files.has(fileName)) return;
    
    // Save current file
    this.files.set(this.currentFile, this.getCurrentCode());
    
    // Switch to new file
    this.currentFile = fileName;
    
    // Update editor content
    if (this.editor) {
      this.editor.setValue(this.files.get(fileName));
    } else {
      const fallback = document.getElementById('code-fallback');
      if (fallback) fallback.value = this.files.get(fileName);
    }
    
    // Update UI
    this.updateFileExplorer();
    this.updateFileTab(fileName, true);
  }
  
  loadExample(exampleName) {
    const example = this.examples[exampleName];
    if (!example) return;
    
    // Create new file with example
    const fileName = `example_${exampleName}.py`;
    this.files.set(fileName, example.code);
    this.openFile(fileName);
    this.updateFileExplorer();
    
    this.addOutput('info', `Loaded example: ${example.title}`);
    this.addOutput('', example.description);
  }
  
  clearOutput() {
    const output = document.getElementById('console-output');
    if (output) {
      output.innerHTML = '<div class="output-line info">Console cleared</div>';
    }
  }
  
  shareCode() {
    const code = this.getCurrentCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = this.currentFile;
    a.click();
    
    URL.revokeObjectURL(url);
    this.addOutput('info', `Code downloaded as ${this.currentFile}`);
  }
  
  formatCode() {
    const code = this.getCurrentCode();
    
    try {
      // Basic Python code formatting
      const formatted = this.basicPythonFormat(code);
      
      if (this.editor) {
        this.editor.setValue(formatted);
      } else {
        const fallback = document.getElementById('code-fallback');
        if (fallback) fallback.value = formatted;
      }
      
      this.addOutput('info', 'Code formatted successfully');
    } catch (error) {
      this.addOutput('error', `Formatting error: ${error.message}`);
    }
  }
  
  basicPythonFormat(code) {
    // Basic Python code formatting
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = [];
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) {
        formattedLines.push('');
        continue;
      }
      
      // Decrease indent for dedent keywords
      if (trimmed.match(/^(elif|else|except|finally):/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add proper indentation
      const indent = '    '.repeat(indentLevel);
      formattedLines.push(indent + trimmed);
      
      // Increase indent for indent keywords
      if (trimmed.endsWith(':') && trimmed.match(/^(def|class|if|elif|else|for|while|try|except|finally|with)/)) {
        indentLevel++;
      }
      
      // Decrease indent after certain statements
      if (trimmed.match(/^(return|break|continue|pass|raise)/)) {
        // These don't change indentation but might be followed by dedent
      }
    }
    
    return formattedLines.join('\n');
  }
  
  switchOutputTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.output-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update content
    const consoleOutput = document.getElementById('console-output');
    const helpContent = document.getElementById('help-content');
    
    if (tabName === 'console') {
      consoleOutput.style.display = 'block';
      helpContent.style.display = 'none';
    } else {
      consoleOutput.style.display = 'none';
      helpContent.style.display = 'block';
    }
  }
  
  // Utility methods
  getCurrentCode() {
    if (this.editor) {
      return this.editor.getValue();
    } else {
      const fallback = document.getElementById('code-fallback');
      return fallback ? fallback.value : '';
    }
  }
  
  addOutput(type, message) {
    const output = document.getElementById('console-output');
    if (!output) return;
    
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = message;
    
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
  
  updateStatus(status) {
    const statusEl = document.getElementById('execution-status');
    if (statusEl) statusEl.textContent = status;
  }
  
  updateCursorPosition(line, column) {
    const positionEl = document.getElementById('cursor-position');
    if (positionEl) positionEl.textContent = `Ln ${line}, Col ${column}`;
  }
  
  updateRunButton(running) {
    const runBtn = document.getElementById('run-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    if (runBtn) {
      runBtn.disabled = running;
      runBtn.innerHTML = running ? 
        '<i class="fas fa-spinner fa-spin"></i> Running...' : 
        '<i class="fas fa-play"></i> Run';
    }
    
    if (stopBtn) {
      stopBtn.disabled = !running;
    }
  }
  
  updateFileExplorer() {
    const explorer = document.querySelector('.file-explorer');
    if (!explorer) return;
    
    explorer.innerHTML = '';
    
    for (const [fileName, content] of this.files) {
      const fileItem = document.createElement('div');
      fileItem.className = `file-item ${fileName === this.currentFile ? 'active' : ''}`;
      fileItem.dataset.file = fileName;
      
      fileItem.innerHTML = `
        <i class="fab fa-python file-icon"></i>
        <span>${fileName}</span>
        <div class="file-actions">
          <button class="file-action" title="Rename">
            <i class="fas fa-edit"></i>
          </button>
          <button class="file-action" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      fileItem.addEventListener('click', () => this.openFile(fileName));
      explorer.appendChild(fileItem);
    }
  }
  
  updateFileTab(fileName, isActive) {
    const tabsContainer = document.querySelector('.editor-tabs');
    if (!tabsContainer) return;
    
    // Simple tab update for now
    const existingTab = tabsContainer.querySelector('.editor-tab');
    if (existingTab) {
      existingTab.querySelector('span').textContent = fileName;
      existingTab.dataset.file = fileName;
    }
  }
  
  markFileAsModified() {
    // Add visual indicator for modified files
    const currentTab = document.querySelector('.editor-tab.active');
    if (currentTab && !currentTab.classList.contains('modified')) {
      currentTab.classList.add('modified');
      // Could add a dot or asterisk to show unsaved changes
    }
  }
  
  getDefaultCode() {
    return `# Welcome to Python IDE!
# Start coding below

print("Hello, World!")

# Try some variables
name = "Python Student"
age = 20

print(f"Hi, {name}! You are {age} years old.")

# Practice with loops
print("\\nCounting to 5:")
for i in range(1, 6):
    print(f"Count: {i}")

# Define a function
def calculate_area(length, width):
    """Calculate the area of a rectangle"""
    return length * width

# Test the function
rectangle_area = calculate_area(5, 3)
print(f"\\nRectangle area: {rectangle_area}")

# Your code here...
`;
  }
  
  getCodeExamples() {
    return {
      'hello-world': {
        title: 'Hello World',
        description: 'Your first Python program',
        code: `# Hello World - Your first Python program
print("Hello, World!")
print("Welcome to Python programming!")

# You can print multiple things
print("Python", "is", "awesome!")

# Try changing the message above and run the code
`
      },
      'variables': {
        title: 'Variables and Data Types',
        description: 'Working with different types of data',
        code: `# Variables and Data Types

# String variables
name = "Alice"
favorite_color = "blue"

# Number variables
age = 25
height = 5.6
temperature = -10

# Boolean variables
is_student = True
has_homework = False

# Print variables
print("Name:", name)
print("Age:", age)
print("Height:", height, "feet")
print("Is student:", is_student)

# String formatting
print(f"{name} is {age} years old and likes {favorite_color}")

# Type checking
print("Type of name:", type(name))
print("Type of age:", type(age))
print("Type of height:", type(height))
print("Type of is_student:", type(is_student))
`
      },
      'loops': {
        title: 'For Loops',
        description: 'Repeating code with loops',
        code: `# For Loops - Repeating code

# Basic for loop
print("Counting from 1 to 5:")
for i in range(1, 6):
    print(i)

print("\\n" + "="*20)

# Loop through a list
fruits = ["apple", "banana", "orange", "grape"]
print("My favorite fruits:")
for fruit in fruits:
    print(f"- {fruit}")

print("\\n" + "="*20)

# Loop with enumeration (index and value)
colors = ["red", "green", "blue"]
print("Colors with their position:")
for index, color in enumerate(colors):
    print(f"{index + 1}. {color}")

print("\\n" + "="*20)

# Nested loops (loop inside a loop)
print("Multiplication table:")
for i in range(1, 4):
    for j in range(1, 4):
        result = i * j
        print(f"{i} x {j} = {result}")
    print()  # Empty line after each row
`
      },
      'functions': {
        title: 'Functions',
        description: 'Creating reusable code with functions',
        code: `# Functions - Reusable code blocks

# Simple function
def greet():
    print("Hello there!")

# Function with parameters
def greet_person(name):
    print(f"Hello, {name}!")

# Function with return value
def add_numbers(a, b):
    result = a + b
    return result

# Function with multiple parameters and return
def calculate_rectangle_area(length, width):
    """Calculate the area of a rectangle"""
    area = length * width
    return area

# Function with default parameter
def introduce(name, age=18):
    print(f"Hi, I'm {name} and I'm {age} years old.")

# Using the functions
print("=== Function Examples ===")
greet()
greet_person("Alice")

sum_result = add_numbers(5, 3)
print(f"5 + 3 = {sum_result}")

rectangle_area = calculate_rectangle_area(4, 6)
print(f"Rectangle area: {rectangle_area}")

introduce("Bob")
introduce("Charlie", 25)

# Function that returns multiple values
def get_name_and_age():
    return "Diana", 22

name, age = get_name_and_age()
print(f"Name: {name}, Age: {age}")
`
      }
    };
  }
}

// Initialize IDE when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.ide = new IDEManager();
});

// Export for global access
window.IDEManager = IDEManager;
// Test System JavaScript with Firebase Integration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBLGGdcKEdGhNAJw-SLUIrT2cp-wI8RKX8",
    authDomain: "code-with-morais-405.firebaseapp.com",
    projectId: "code-with-morais-405",
    storageBucket: "code-with-morais-405.appspot.com",
    messagingSenderId: "1055297062975",
    appId: "1:1055297062975:web:e6ed28a6ae3c7e52ef8b16"
};

// Initialize Firebase with error handling
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization failed:', error);
    console.log('Test will run without Firebase features');
}

let testData = null;
let currentQuestionIndex = 0;
let totalTimeRemaining = 0;
let questionTimeRemaining = 0;
let testTimer = null;
let questionTimer = null;
let userAnswers = [];
let testStartTime = null;
let isTestActive = false;
let currentUser = null;
let testProgressId = null;
let autoSaveTimeout = null;

// Additional variables for Firebase progress tracking
let score = 0;
let responses = [];
let startTime = null;
let isTestCompleted = false;
let totalTimeSpent = 0;

// Initialize test when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize Firebase in background (non-blocking)
        initializeFirebaseAuth();
        
        // Load test data and start test immediately
        await loadTestData();
        await initializeTest();
        setupEventListeners();
        
        console.log('Test initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize test:', error);
        const errorMessage = error.message.includes('fetch') ? 
            'Failed to load test questions. Please check your internet connection and refresh the page.' :
            `Test initialization failed: ${error.message}. Please refresh the page.`;
        showError(errorMessage);
    }
});

// Initialize Firebase authentication in background
function initializeFirebaseAuth() {
    try {
        if (auth) {
            onAuthStateChanged(auth, (user) => {
                currentUser = user;
                console.log('Auth state:', user ? 'Logged in' : 'Not logged in');
                
                if (user) {
                    // If user becomes authenticated during test, try to load progress
                    loadTestProgress();
                } else {
                    // Show warning that progress won't be saved
                    if (document.getElementById('test-container')) {
                        showAuthWarning();
                    }
                }
            });
        }
    } catch (error) {
        console.log('Firebase auth initialization failed:', error);
    }
}

// Show authentication warning (but allow test to continue)
function showAuthWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fed7d7;
        border: 2px solid #fc8181;
        color: #742a2a;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 350px;
        font-size: 0.9rem;
    `;
    warningDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Not Authenticated</strong>
        </div>
        <div>You can take the test, but progress won't be saved. <a href="/" style="color: #742a2a; text-decoration: underline;">Sign in</a> to save progress.</div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 5px; right: 8px; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #742a2a;">×</button>
    `;
    document.body.appendChild(warningDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (warningDiv.parentElement) {
            warningDiv.remove();
        }
    }, 10000);
}

// Load test activities from JSON
async function loadTestData() {
    try {
        console.log('Attempting to fetch test data from: ./test-activities-extended.json');
        const response = await fetch('test-activities-simple.json');
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch test data: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Response received, length:', text.length);
        
        testData = JSON.parse(text);
        console.log('Test data parsed successfully, activities count:', testData.activities?.length);
        
        // Validate test data structure
        if (!testData || !testData.testInfo || !testData.activities || !Array.isArray(testData.activities)) {
            throw new Error('Invalid test data structure');
        }
        
        if (testData.activities.length === 0) {
            throw new Error('No test activities found');
        }
        
        console.log('Test data validation passed');
        
        // Load saved progress if exists
        await loadTestProgress();
        
    } catch (error) {
        console.error('Error in loadTestData:', error);
        // Try fallback to original test file
        try {
            console.log('Trying fallback to ./test-activities.json');
            const fallbackResponse = await fetch('./test-activities.json');
            if (fallbackResponse.ok) {
                testData = await fallbackResponse.json();
                console.log('Fallback data loaded successfully');
                await loadTestProgress();
                return;
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
        throw error;
    }
}

// Load test progress from Firebase
async function loadTestProgress() {
    if (!currentUser || !db) {
        console.log('No authenticated user or Firebase not available - skipping progress load');
        return;
    }
    
    try {
        const docRef = doc(db, 'testProgress', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const savedProgress = docSnap.data();
            
            // Restore test state
            if (savedProgress.currentQuestionIndex !== undefined) {
                currentQuestionIndex = savedProgress.currentQuestionIndex;
            }
            if (savedProgress.score !== undefined) {
                score = savedProgress.score;
            }
            if (savedProgress.responses) {
                responses = savedProgress.responses;
            }
            if (savedProgress.startTime) {
                startTime = savedProgress.startTime;
            }
            if (savedProgress.isTestCompleted !== undefined) {
                isTestCompleted = savedProgress.isTestCompleted;
            }
            if (savedProgress.totalTimeSpent !== undefined) {
                totalTimeSpent = savedProgress.totalTimeSpent;
            }
            
            console.log('Test progress loaded from Firebase');
        }
    } catch (error) {
        console.error('Error loading test progress:', error);
    }
}

// Save test progress to Firebase
async function saveTestProgress() {
    if (!currentUser || !db) {
        console.log('No authenticated user or Firebase not available - skipping progress save');
        return;
    }
    
    try {
        const progressData = {
            currentQuestionIndex,
            score,
            responses,
            startTime,
            isTestCompleted,
            totalTimeSpent,
            lastUpdated: new Date().toISOString()
        };
        
        const docRef = doc(db, 'testProgress', currentUser.uid);
        await setDoc(docRef, progressData, { merge: true });
        
        console.log('Test progress saved to Firebase');
    } catch (error) {
        console.error('Error saving test progress:', error);
    }
}

// Initialize the test
function initializeTest() {
    if (!testData) return;
    
    // Set up test info
    document.getElementById('test-title').textContent = testData.testInfo.title;
    document.getElementById('test-description').textContent = testData.testInfo.description;
    document.getElementById('total-questions').textContent = testData.activities.length;
    
    // Show authentication status to user (but don't block the test)
    // Note: Warning will be shown later by the background auth process if needed
    
    // Initialize timers
    totalTimeRemaining = testData.testInfo.totalTimeMinutes * 60; // Convert to seconds
    
    // Initialize user answers array if not loaded from progress
    if (!responses || responses.length === 0) {
        userAnswers = testData.activities.map(() => ({
            code: '',
            score: 0,
            timeSpent: 0,
            completed: false
        }));
        responses = [];
    }
    
    // Set start time if not loaded from progress
    if (!startTime) {
        startTime = Date.now();
    }
    
    // Load current question
    loadQuestion(currentQuestionIndex);
    
    // Update UI with loaded progress
    updateProgressDisplay();
    updateScoreDisplay();
    
    // Start timers
    startTestTimers();
    
    // Activate the test
    isTestActive = true;
    testStartTime = Date.now();
    
    // Save initial progress
    saveTestProgress();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('run-code-btn').addEventListener('click', runCode);
    document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    document.getElementById('hints-toggle').addEventListener('click', toggleHints);
    document.getElementById('toggle-nav').addEventListener('click', toggleNavigation);
    
    // Generate question navigation
    generateQuestionNavigation();
    
    // Auto-save code as user types with better UX
    document.getElementById('code-input').addEventListener('input', function() {
        if (isTestActive && currentQuestionIndex < testData.activities.length) {
            userAnswers[currentQuestionIndex].code = this.value;
            
            // Mark as having unsaved changes
            markUnsavedChanges();
            
            // Update navigation status to show progress
            updateNavigationStatus();
            
            // Auto-save progress after a short delay to avoid too many saves
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                saveTestProgress();
                markChangesSaved();
            }, 2000); // Save after 2 seconds of inactivity
        }
    });
    
    // Auto-save every 30 seconds
    setInterval(() => {
        if (isTestActive) {
            saveTestProgress();
            markChangesSaved();
        }
    }, 30000);
    
    // Prevent leaving the page accidentally - only if unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (isTestActive && window.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

// Start the test
function startTest() {
    testStartTime = Date.now();
    isTestActive = true;
    
    // Start main timer
    testTimer = setInterval(updateMainTimer, 1000);
    
    // Start question timer
    startQuestionTimer();
}

// Load a specific question
function loadQuestion(index) {
    if (!testData || index >= testData.activities.length) return;
    
    currentQuestionIndex = index;
    const question = testData.activities[index];
    
    // Update question display
    document.getElementById('question-number').textContent = `Question ${index + 1}`;
    document.getElementById('question-title').textContent = question.title;
    document.getElementById('question-instructions').textContent = question.instructions;
    document.getElementById('question-points').textContent = `${question.points} points`;
    document.getElementById('question-time').textContent = `${question.timeLimit} min`;
    
    // Load user's previous code if any
    document.getElementById('code-input').value = userAnswers[index].code || '';
    
    // Clear output
    document.getElementById('output-display').textContent = 'Click "Run Code" to see the output...';
    
    // Load hints
    loadHints(question.hints);
    
    // Reset question timer
    questionTimeRemaining = question.timeLimit * 60;
    startQuestionTimer();
    
    // Update button states
    updateButtonStates();
    
    // Update progress
    updateProgressDisplay();
    
    // Update navigation status
    updateNavigationStatus();
}

// Load hints for current question
function loadHints(hints) {
    const hintsContent = document.getElementById('hints-content');
    hintsContent.innerHTML = '';
    
    hints.forEach((hint, index) => {
        const hintElement = document.createElement('div');
        hintElement.className = 'hint-item';
        hintElement.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${hint}</span>
        `;
        hintsContent.appendChild(hintElement);
    });
}

// Toggle hints visibility
function toggleHints() {
    const hintsContent = document.getElementById('hints-content');
    const hintsToggle = document.getElementById('hints-toggle');
    
    if (hintsContent.classList.contains('show')) {
        hintsContent.classList.remove('show');
        hintsToggle.innerHTML = '<i class="fas fa-lightbulb"></i> Show Hints';
    } else {
        hintsContent.classList.add('show');
        hintsToggle.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Hints';
    }
}

// Run the user's code
function runCode() {
    const code = document.getElementById('code-input').value.trim();
    const outputDisplay = document.getElementById('output-display');
    
    if (!code) {
        outputDisplay.textContent = 'Please write some code first...';
        return;
    }
    
    // Show loading state
    outputDisplay.textContent = 'Running code...';
    
    try {
        // Simulate Python code execution
        const output = simulatePythonExecution(code);
        outputDisplay.textContent = output || 'Code executed successfully (no output)';
        
        // Store output for grading
        if (currentQuestionIndex < userAnswers.length) {
            userAnswers[currentQuestionIndex].output = output;
        }
    } catch (error) {
        outputDisplay.textContent = `Error: ${error.message}`;
    }
}

// Simulate Python code execution (simplified)
function simulatePythonExecution(code) {
    let output = '';
    const environment = new Map();
    
    try {
        // Split code into lines and process each
        const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
        
        for (const line of lines) {
            // Handle variable assignments
            if (line.includes(' = ') && !line.startsWith('print')) {
                const [varName, expression] = line.split(' = ').map(s => s.trim());
                const value = evaluateExpression(expression, environment);
                environment.set(varName, value);
            }
            // Handle print statements (support multiple arguments)
            else if (line.startsWith('print(') && line.endsWith(')')) {
                const content = line.slice(6, -1).trim();
                
                if (!content) {
                    // Empty print statement
                    output += '\n';
                } else if (content.includes(',')) {
                    // Multiple arguments - split by comma and evaluate each
                    const args = [];
                    let currentArg = '';
                    let parenCount = 0;
                    let inQuotes = false;
                    let quoteChar = '';
                    
                    for (let i = 0; i < content.length; i++) {
                        const char = content[i];
                        
                        if ((char === '"' || char === "'") && !inQuotes) {
                            inQuotes = true;
                            quoteChar = char;
                            currentArg += char;
                        } else if (char === quoteChar && inQuotes) {
                            inQuotes = false;
                            quoteChar = '';
                            currentArg += char;
                        } else if (char === '(' && !inQuotes) {
                            parenCount++;
                            currentArg += char;
                        } else if (char === ')' && !inQuotes) {
                            parenCount--;
                            currentArg += char;
                        } else if (char === ',' && !inQuotes && parenCount === 0) {
                            args.push(currentArg.trim());
                            currentArg = '';
                        } else {
                            currentArg += char;
                        }
                    }
                    
                    if (currentArg.trim()) {
                        args.push(currentArg.trim());
                    }
                    
                    // Evaluate each argument and join with spaces
                    const results = args.map(arg => {
                        const value = evaluateExpression(arg, environment);
                        return formatOutput(value);
                    });
                    output += results.join(' ') + '\n';
                } else {
                    // Single argument
                    const result = evaluateExpression(content, environment);
                    output += formatOutput(result) + '\n';
                }
            }
            // Handle list method calls (append, insert, remove, reverse)
            else if (line.includes('.append(') || line.includes('.insert(') || 
                     line.includes('.remove(') || line.includes('.reverse(')) {
                const varName = line.split('.')[0].trim();
                if (environment.has(varName)) {
                    let list = environment.get(varName);
                    if (Array.isArray(list)) {
                        if (line.includes('.append(')) {
                            const value = line.match(/\.append\((.+)\)/)[1];
                            list.push(evaluateExpression(value, environment));
                        } else if (line.includes('.insert(')) {
                            const match = line.match(/\.insert\((\d+),\s*(.+)\)/);
                            if (match) {
                                const index = parseInt(match[1]);
                                const value = evaluateExpression(match[2], environment);
                                list.splice(index, 0, value);
                            }
                        } else if (line.includes('.remove(')) {
                            const value = line.match(/\.remove\((.+)\)/)[1];
                            const removeValue = evaluateExpression(value, environment);
                            const index = list.indexOf(removeValue);
                            if (index > -1) list.splice(index, 1);
                        } else if (line.includes('.reverse()')) {
                            list.reverse();
                        }
                        environment.set(varName, list);
                    }
                }
            }
            // Handle list element assignment (e.g., list[0] = 'new_value')
            else if (line.includes('[') && line.includes(']') && line.includes(' = ')) {
                const match = line.match(/(\w+)\[(\d+)\]\s*=\s*(.+)/);
                if (match) {
                    const varName = match[1];
                    const index = parseInt(match[2]);
                    const value = evaluateExpression(match[3], environment);
                    if (environment.has(varName)) {
                        const list = environment.get(varName);
                        if (Array.isArray(list)) {
                            list[index] = value;
                            environment.set(varName, list);
                        }
                    }
                }
            }
        }
        
        return output.trim();
    } catch (error) {
        throw new Error(`Execution error: ${error.message}`);
    }
}

// Evaluate expressions (simplified)
function evaluateExpression(expression, environment) {
    expression = expression.trim();
    
    // Handle string literals
    if ((expression.startsWith('"') && expression.endsWith('"')) || 
        (expression.startsWith("'") && expression.endsWith("'"))) {
        return expression.slice(1, -1);
    }
    
    // Handle numbers (preserve int vs float distinction)
    if (/^-?\d+$/.test(expression)) {
        return parseInt(expression); // Keep integers as integers
    }
    if (/^-?\d+\.\d+$/.test(expression)) {
        return parseFloat(expression); // Keep floats as floats
    }
    
    // Handle boolean literals
    if (expression === 'True') return true;
    if (expression === 'False') return false;
    if (expression === 'None') return null;
    
    // Handle list literals
    if (expression.startsWith('[') && expression.endsWith(']')) {
        const content = expression.slice(1, -1).trim();
        if (!content) return [];
        return content.split(',').map(item => evaluateExpression(item.trim(), environment));
    }
    
    // Handle type() function calls
    if (expression.startsWith('type(') && expression.endsWith(')')) {
        const innerExpr = expression.slice(5, -1).trim();
        const value = evaluateExpression(innerExpr, environment);
        return getType(value);
    }
    
    // Handle conversion functions (Python-like behavior)
    if (expression.startsWith('str(') && expression.endsWith(')')) {
        const innerExpr = expression.slice(4, -1).trim();
        const value = evaluateExpression(innerExpr, environment);
        if (value === true) return 'True';
        if (value === false) return 'False';
        if (value === null) return 'None';
        return String(value);
    }
    if (expression.startsWith('int(') && expression.endsWith(')')) {
        const innerExpr = expression.slice(4, -1).trim();
        const value = evaluateExpression(innerExpr, environment);
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error(`invalid literal for int() with base 10: '${value}'`);
            return Math.trunc(num); // Use trunc instead of floor for proper int conversion
        }
        if (typeof value === 'boolean') return value ? 1 : 0;
        return Math.trunc(Number(value));
    }
    if (expression.startsWith('float(') && expression.endsWith(')')) {
        const innerExpr = expression.slice(6, -1).trim();
        const value = evaluateExpression(innerExpr, environment);
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error(`could not convert string to float: '${value}'`);
            return num;
        }
        if (typeof value === 'boolean') return value ? 1.0 : 0.0;
        return Number(value);
    }
    if (expression.startsWith('bool(') && expression.endsWith(')')) {
        const innerExpr = expression.slice(5, -1).trim();
        const value = evaluateExpression(innerExpr, environment);
        if (value === null || value === 0 || value === '' || (Array.isArray(value) && value.length === 0)) {
            return false;
        }
        return true;
    }
    
    // Handle len() function
    if (expression.startsWith('len(') && expression.endsWith(')')) {
        const innerExpr = expression.slice(4, -1).trim();
        const value = evaluateExpression(innerExpr, environment);
        if (typeof value === 'string' || Array.isArray(value)) {
            return value.length;
        }
        return 0;
    }
    
    // Handle list indexing
    if (expression.includes('[') && expression.includes(']') && !expression.startsWith('[')) {
        const match = expression.match(/(\w+)\[(.+)\]/);
        if (match) {
            const varName = match[1];
            const indexExpr = match[2];
            if (environment.has(varName)) {
                const list = environment.get(varName);
                if (Array.isArray(list)) {
                    // Handle slicing
                    if (indexExpr.includes(':')) {
                        const [start, end] = indexExpr.split(':');
                        const startIdx = start ? parseInt(start) : 0;
                        const endIdx = end ? parseInt(end) : list.length;
                        return list.slice(startIdx, endIdx);
                    } else {
                        // Handle single index
                        let index = evaluateExpression(indexExpr, environment);
                        if (index < 0) index = list.length + index; // Handle negative indexing
                        return list[index];
                    }
                }
            }
        }
    }
    
    // Handle variables
    if (environment.has(expression)) {
        return environment.get(expression);
    }
    
    // Handle string operations (Python-like concatenation and repetition)
    if (expression.includes(' + ')) {
        const parts = expression.split(' + ');
        if (parts.length === 2) {
            const left = evaluateExpression(parts[0].trim(), environment);
            const right = evaluateExpression(parts[1].trim(), environment);
            
            // String concatenation
            if (typeof left === 'string' || typeof right === 'string') {
                return String(left) + String(right);
            }
            // Numeric addition
            return left + right;
        }
        // Handle multiple additions
        return parts.reduce((acc, part) => {
            const val = evaluateExpression(part.trim(), environment);
            if (typeof acc === 'string' || typeof val === 'string') {
                return String(acc) + String(val);
            }
            return acc + val;
        });
    }
    
    // Handle arithmetic operations (preserve int/float types)
    if (expression.includes(' * ')) {
        const [left, right] = expression.split(' * ').map(part => evaluateExpression(part.trim(), environment));
        
        // String repetition
        if (typeof left === 'string' && Number.isInteger(right)) {
            return left.repeat(right);
        }
        if (typeof right === 'string' && Number.isInteger(left)) {
            return right.repeat(left);
        }
        
        // Numeric multiplication - preserve type
        const result = left * right;
        if (Number.isInteger(left) && Number.isInteger(right)) {
            return Math.trunc(result);
        }
        return result;
    }
    
    if (expression.includes(' / ') && !expression.includes(' // ')) {
        const [left, right] = expression.split(' / ').map(part => evaluateExpression(part.trim(), environment));
        if (right === 0) throw new Error('division by zero');
        return left / right; // Always returns float in Python 3
    }
    
    if (expression.includes(' // ')) {
        const [left, right] = expression.split(' // ').map(part => evaluateExpression(part.trim(), environment));
        if (right === 0) throw new Error('integer division or modulo by zero');
        return Math.floor(left / right);
    }
    
    if (expression.includes(' % ')) {
        const [left, right] = expression.split(' % ').map(part => evaluateExpression(part.trim(), environment));
        if (right === 0) throw new Error('integer division or modulo by zero');
        const result = left % right;
        // Python modulo behavior for negative numbers
        if (result < 0 && right > 0) return result + right;
        if (result > 0 && right < 0) return result + right;
        return result;
    }
    
    if (expression.includes(' ** ')) {
        const [left, right] = expression.split(' ** ').map(part => evaluateExpression(part.trim(), environment));
        const result = Math.pow(left, right);
        // Preserve integer type when possible
        if (Number.isInteger(left) && Number.isInteger(right) && right >= 0) {
            return Math.trunc(result);
        }
        return result;
    }
    
    if (expression.includes(' - ')) {
        const [left, right] = expression.split(' - ').map(part => evaluateExpression(part.trim(), environment));
        const result = left - right;
        // Preserve integer type when possible
        if (Number.isInteger(left) && Number.isInteger(right)) {
            return Math.trunc(result);
        }
        return result;
    }
    
    // Handle membership operators
    if (expression.includes(' in ')) {
        const [left, right] = expression.split(' in ').map(part => part.trim());
        const leftVal = evaluateExpression(left, environment);
        const rightVal = evaluateExpression(right, environment);
        if (typeof rightVal === 'string') {
            return rightVal.includes(leftVal);
        }
        if (Array.isArray(rightVal)) {
            return rightVal.includes(leftVal);
        }
        return false;
    }
    
    // Handle string method calls (comprehensive)
    if (expression.includes('.upper()')) {
        const base = expression.replace('.upper()', '');
        const value = evaluateExpression(base, environment);
        return String(value).toUpperCase();
    }
    if (expression.includes('.lower()')) {
        const base = expression.replace('.lower()', '');
        const value = evaluateExpression(base, environment);
        return String(value).toLowerCase();
    }
    if (expression.includes('.title()')) {
        const base = expression.replace('.title()', '');
        const value = evaluateExpression(base, environment);
        return String(value).split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    if (expression.includes('.strip()')) {
        const base = expression.replace('.strip()', '');
        const value = evaluateExpression(base, environment);
        return String(value).trim();
    }
    if (expression.includes('.split()')) {
        const base = expression.replace('.split()', '');
        const value = evaluateExpression(base, environment);
        return String(value).split(/\s+/).filter(word => word.length > 0);
    }
    
    // Handle string method calls with parameters
    if (expression.includes('.split(')) {
        const match = expression.match(/(.+)\.split\((.+)\)/);
        if (match) {
            const base = match[1];
            const separator = evaluateExpression(match[2], environment);
            const value = evaluateExpression(base, environment);
            return String(value).split(separator);
        }
    }
    if (expression.includes('.replace(')) {
        const match = expression.match(/(.+)\.replace\((.+),\s*(.+)\)/);
        if (match) {
            const base = match[1];
            const oldStr = evaluateExpression(match[2], environment);
            const newStr = evaluateExpression(match[3], environment);
            const value = evaluateExpression(base, environment);
            return String(value).replace(new RegExp(oldStr, 'g'), newStr);
        }
    }
    
    // Handle list method calls (for variables already in environment)
    if (expression.includes('.count(')) {
        const match = expression.match(/(.+)\.count\((.+)\)/);
        if (match) {
            const base = match[1];
            const item = evaluateExpression(match[2], environment);
            const value = evaluateExpression(base, environment);
            if (Array.isArray(value)) {
                return value.filter(x => x === item).length;
            }
            if (typeof value === 'string') {
                return (value.match(new RegExp(item, 'g')) || []).length;
            }
        }
    }
    if (expression.includes('.index(')) {
        const match = expression.match(/(.+)\.index\((.+)\)/);
        if (match) {
            const base = match[1];
            const item = evaluateExpression(match[2], environment);
            const value = evaluateExpression(base, environment);
            if (Array.isArray(value)) {
                const index = value.indexOf(item);
                if (index === -1) throw new Error(`${item} is not in list`);
                return index;
            }
            if (typeof value === 'string') {
                const index = value.indexOf(item);
                if (index === -1) throw new Error(`substring not found`);
                return index;
            }
        }
    }
    
    // Handle variables
    if (environment.has(expression)) {
        return environment.get(expression);
    }
    
    // Final fallback - return as string if nothing else matches
    return expression;
}

// Get Python type name
function getType(value) {
    if (typeof value === 'string') return "<class 'str'>";
    if (typeof value === 'number') {
        return Number.isInteger(value) ? "<class 'int'>" : "<class 'float'>";
    }
    if (typeof value === 'boolean') return "<class 'bool'>";
    if (Array.isArray(value)) return "<class 'list'>";
    if (value === null) return "<class 'NoneType'>";
    return "<class 'object'>";
}

// Format output for display
function formatOutput(value) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') {
        // Display integers without decimal point
        if (Number.isInteger(value)) return value.toString();
        return value.toString();
    }
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (Array.isArray(value)) {
        const formattedItems = value.map(item => {
            if (typeof item === 'string') return `'${item}'`;
            if (typeof item === 'boolean') return item ? 'True' : 'False';
            if (typeof item === 'number' && Number.isInteger(item)) return item.toString();
            return formatOutput(item);
        });
        return `[${formattedItems.join(', ')}]`;
    }
    if (value === null) return 'None';
    return String(value);
}

// Submit current answer
function submitAnswer() {
    if (!isTestActive || currentQuestionIndex >= testData.activities.length) return;
    
    const question = testData.activities[currentQuestionIndex];
    const userCode = document.getElementById('code-input').value.trim();
    const userOutput = userAnswers[currentQuestionIndex].output || '';
    
    // Calculate score based on test cases
    const score = gradeAnswer(question, userCode, userOutput);
    
    // Update user answer
    userAnswers[currentQuestionIndex] = {
        ...userAnswers[currentQuestionIndex],
        code: userCode,
        score: score,
        timeSpent: question.timeLimit * 60 - questionTimeRemaining,
        submitted: true
    };
    
    // Show feedback
    showAnswerFeedback(score, question.points);
    
    // Update displays
    updateScoreDisplay();
    updateButtonStates();
    
    // Stop question timer
    clearInterval(questionTimer);
    
    // Save progress after submitting answer
    saveTestProgress();
}

// Grade the user's answer with improved Python-friendly checking
function gradeAnswer(question, code, output) {
    let score = 0;
    const maxScore = question.points;
    let passedTests = 0;
    
    // Normalize code for better checking (remove extra spaces, normalize quotes)
    const normalizedCode = normalizeCode(code);
    const normalizedOutput = output.toLowerCase().trim();
    
    // Check each test case
    for (const testCase of question.testCases) {
        let testPassed = false;
        
        switch (testCase.check) {
            case 'contains':
                // Check if pattern exists in code (case-insensitive for keywords)
                if (normalizedCode.includes(testCase.pattern.toLowerCase()) || 
                    code.includes(testCase.pattern)) {
                    testPassed = true;
                }
                break;
                
            case 'output_contains':
                // Check if expected output is present
                if (normalizedOutput.includes(testCase.pattern.toLowerCase())) {
                    testPassed = true;
                }
                break;
                
            case 'output_sequence':
                // Check if all items in sequence appear in output
                const hasSequence = testCase.pattern.every(item => 
                    normalizedOutput.includes(item.toLowerCase()));
                if (hasSequence) {
                    testPassed = true;
                }
                break;
                
            case 'regex':
                // Use regex pattern matching for more complex checks
                const regex = new RegExp(testCase.pattern, 'i');
                if (regex.test(code) || regex.test(output)) {
                    testPassed = true;
                }
                break;
                
            case 'python_syntax':
                // Check for Python-specific syntax patterns
                if (checkPythonSyntax(code, testCase.pattern)) {
                    testPassed = true;
                }
                break;
                
            case 'variable_exists':
                // Check if variable is properly declared and used
                if (checkVariableExists(code, testCase.pattern)) {
                    testPassed = true;
                }
                break;
                
            case 'function_called':
                // Check if specific function is called correctly
                if (checkFunctionCalled(code, testCase.pattern)) {
                    testPassed = true;
                }
                break;
        }
        
        if (testPassed) {
            passedTests++;
            score += maxScore / question.testCases.length;
        }
    }
    
    // Bonus points for clean, well-commented code
    if (hasGoodPythonPractices(code)) {
        score += Math.min(5, maxScore * 0.1); // Up to 10% bonus or 5 points max
    }
    
    return Math.round(Math.min(score, maxScore));
}

// Normalize code for better pattern matching
function normalizeCode(code) {
    return code
        .toLowerCase()
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/'/g, '"')    // Normalize quotes
        .trim();
}

// Check Python-specific syntax patterns
function checkPythonSyntax(code, pattern) {
    const patterns = {
        'proper_indentation': /^[ ]{4}|^\t/m,
        'snake_case': /[a-z]+(_[a-z]+)*/,
        'string_methods': /\.(upper|lower|strip|replace|split|join)\(/,
        'list_methods': /\.(append|insert|remove|pop|reverse|sort)\(/,
        'comparison_operators': /(==|!=|<|>|<=|>=)/,
        'logical_operators': /(and|or|not)\s+/,
        'assignment_operator': /[a-zA-Z_][a-zA-Z0-9_]*\s*=/
    };
    
    return patterns[pattern] ? patterns[pattern].test(code) : false;
}

// Check if variable exists and is used properly
function checkVariableExists(code, variableName) {
    const declarationPattern = new RegExp(`${variableName}\\s*=`, 'i');
    const usagePattern = new RegExp(`\\b${variableName}\\b`, 'i');
    
    return declarationPattern.test(code) && usagePattern.test(code);
}

// Check if function is called correctly
function checkFunctionCalled(code, functionName) {
    const pattern = new RegExp(`${functionName}\\s*\\(`, 'i');
    return pattern.test(code);
}

// Check for good Python practices
function hasGoodPythonPractices(code) {
    let score = 0;
    
    // Check for meaningful variable names (snake_case)
    if (/[a-z]+(_[a-z]+)+/.test(code)) score++;
    
    // Check for comments
    if (code.includes('#')) score++;
    
    // Check for proper spacing around operators
    if (/\s[+\-*/=]\s/.test(code)) score++;
    
    // Check for consistent indentation
    const lines = code.split('\n');
    const hasConsistentIndentation = lines.every(line => 
        line.trim() === '' || /^(\s{4}|\t)*[^\s]/.test(line)
    );
    if (hasConsistentIndentation) score++;
    
    return score >= 2; // Return true if at least 2 good practices found
}

// Show feedback for submitted answer
function showAnswerFeedback(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    let statusClass = 'status-incorrect';
    let statusText = 'Incorrect';
    
    if (percentage >= 80) {
        statusClass = 'status-correct';
        statusText = 'Correct';
    } else if (percentage >= 50) {
        statusClass = 'status-partial';
        statusText = 'Partial';
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `status-indicator ${statusClass}`;
    feedback.innerHTML = `
        <i class="fas fa-${percentage >= 80 ? 'check' : percentage >= 50 ? 'exclamation' : 'times'}"></i>
        ${statusText} - ${score}/${maxScore} points (${Math.round(percentage)}%)
    `;
    
    // Insert feedback after the action buttons
    const actionButtons = document.querySelector('.action-buttons');
    actionButtons.parentNode.insertBefore(feedback, actionButtons.nextSibling);
    
    // Remove feedback after 5 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 5000);
}

// Go to next question
function nextQuestion() {
    if (currentQuestionIndex < testData.activities.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
        
        // Save progress after moving to next question
        saveTestProgress();
    } else {
        finishTest();
    }
}

// Update button states
function updateButtonStates() {
    const submitBtn = document.getElementById('submit-answer-btn');
    const nextBtn = document.getElementById('next-question-btn');
    
    const isSubmitted = userAnswers[currentQuestionIndex]?.submitted || false;
    const isLastQuestion = currentQuestionIndex === testData.activities.length - 1;
    
    if (isSubmitted) {
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        nextBtn.innerHTML = isLastQuestion ? 
            '<i class="fas fa-flag-checkered"></i> Finish Test' : 
            '<i class="fas fa-arrow-right"></i> Next Question';
    } else {
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
    }
}

// Update progress display
function updateProgressDisplay() {
    const currentQuestion = currentQuestionIndex + 1;
    const totalQuestions = testData.activities.length;
    const percentage = Math.round((currentQuestion / totalQuestions) * 100);
    
    document.getElementById('current-question').textContent = currentQuestion;
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Update score display
function updateScoreDisplay() {
    const totalScore = userAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    const maxScore = testData.testInfo.totalPoints;
    
    document.getElementById('score-text').textContent = `${totalScore} / ${maxScore} pts`;
}

// Update main timer
function updateMainTimer() {
    if (totalTimeRemaining <= 0) {
        finishTest();
        return;
    }
    
    totalTimeRemaining--;
    const timeDisplay = document.getElementById('time-display');
    const timeContainer = document.getElementById('time-remaining');
    
    const minutes = Math.floor(totalTimeRemaining / 60);
    const seconds = totalTimeRemaining % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Add warning styles
    if (totalTimeRemaining <= 300) { // 5 minutes
        timeContainer.classList.add('critical');
    } else if (totalTimeRemaining <= 600) { // 10 minutes
        timeContainer.classList.add('warning');
    }
}

// Start both main and question timers
function startTestTimers() {
    // Start main timer
    testTimer = setInterval(updateMainTimer, 1000);
    
    // Start question timer
    startQuestionTimer();
}

// Start question timer
function startQuestionTimer() {
    clearInterval(questionTimer);
    
    questionTimer = setInterval(() => {
        if (questionTimeRemaining <= 0) {
            // Auto-submit when time runs out
            if (!userAnswers[currentQuestionIndex]?.submitted) {
                submitAnswer();
            }
            return;
        }
        
        questionTimeRemaining--;
        updateQuestionTimeDisplay();
    }, 1000);
}

// Update question time display
function updateQuestionTimeDisplay() {
    const questionTimeElement = document.getElementById('question-time');
    const minutes = Math.floor(questionTimeRemaining / 60);
    const seconds = questionTimeRemaining % 60;
    
    questionTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (questionTimeRemaining <= 60) {
        questionTimeElement.classList.add('running');
    }
}

// Finish the test
function finishTest() {
    isTestActive = false;
    isTestCompleted = true;
    clearInterval(testTimer);
    clearInterval(questionTimer);
    
    // Calculate final results
    const totalScore = userAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    const maxScore = testData.testInfo.totalPoints;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
    const questionsCorrect = userAnswers.filter(answer => 
        (answer.score || 0) >= testData.activities[userAnswers.indexOf(answer)].points * 0.8
    ).length;
    
    // Update global score
    score = totalScore;
    totalTimeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Save final progress
    saveTestProgress();
    
    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    
    // Show results
    document.getElementById('question-card').classList.add('hidden');
    document.getElementById('test-results').classList.remove('hidden');
    
    // Update results display
    document.getElementById('final-score').textContent = `${percentage}%`;
    document.getElementById('final-score').className = `results-score ${percentage >= testData.testInfo.passingScore ? 'pass' : 'fail'}`;
    document.getElementById('total-score').textContent = `${totalScore}/${maxScore}`;
    document.getElementById('questions-correct').textContent = `${questionsCorrect}/${testData.activities.length}`;
    document.getElementById('time-taken').textContent = `${timeTaken} min`;
    document.getElementById('final-grade').textContent = grade;
    
    // Save results (you could implement this to save to a database)
    saveTestResults({
        totalScore,
        maxScore,
        percentage,
        grade,
        timeTaken,
        questionsCorrect,
        answers: userAnswers
    });
}

// Save test results (placeholder for database integration)
function saveTestResults(results) {
    // This could save to Firebase, localStorage, or send to a server
    localStorage.setItem('lastTestResults', JSON.stringify(results));
    console.log('Test results saved:', results);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Save status indicator functions
function markUnsavedChanges() {
    window.hasUnsavedChanges = true;
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.textContent = '● Unsaved changes';
        indicator.style.color = '#f56565';
    }
}

function markChangesSaved() {
    window.hasUnsavedChanges = false;
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.textContent = '✓ All changes saved';
        indicator.style.color = '#48bb78';
        setTimeout(() => {
            if (indicator) {
                indicator.textContent = '';
            }
        }, 3000);
    }
}

// Question Navigation Functions
function generateQuestionNavigation() {
    const navContainer = document.getElementById('nav-questions');
    if (!navContainer || !testData) return;
    
    navContainer.innerHTML = '';
    
    testData.activities.forEach((activity, index) => {
        const button = document.createElement('button');
        button.className = 'nav-question-btn';
        button.innerHTML = `
            <div style="font-size: 0.8rem;">#${index + 1}</div>
            <div style="font-size: 0.7rem;">${activity.points}pts</div>
        `;
        button.addEventListener('click', () => navigateToQuestion(index));
        navContainer.appendChild(button);
    });
    
    updateNavigationStatus();
}

function updateNavigationStatus() {
    const buttons = document.querySelectorAll('.nav-question-btn');
    buttons.forEach((button, index) => {
        button.className = 'nav-question-btn';
        
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        } else if (userAnswers[index] && userAnswers[index].code && userAnswers[index].code.trim()) {
            button.classList.add('answered');
        } else {
            button.classList.add('unanswered');
        }
    });
}

function navigateToQuestion(questionIndex) {
    if (questionIndex < 0 || questionIndex >= testData.activities.length) return;
    
    // Save current question's code
    if (currentQuestionIndex < testData.activities.length) {
        const currentCode = document.getElementById('code-input').value;
        userAnswers[currentQuestionIndex].code = currentCode;
    }
    
    // Navigate to new question
    loadQuestion(questionIndex);
    updateProgressDisplay();
    
    // Auto-save progress
    saveTestProgress();
    markChangesSaved();
}

function toggleNavigation() {
    const navContent = document.getElementById('nav-content');
    const toggleBtn = document.getElementById('toggle-nav');
    const icon = toggleBtn.querySelector('i');
    
    navContent.classList.toggle('collapsed');
    
    if (navContent.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-down';
    } else {
        icon.className = 'fas fa-chevron-up';
    }
}

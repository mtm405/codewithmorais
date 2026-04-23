// Teacher Dashboard JavaScript with Firebase Integration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { 
    getFirestore, 
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    where
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

// Initialize Firebase
// Initialize Firebase with error handling
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully for teacher dashboard');
} catch (error) {
    console.error('Firebase initialization failed:', error);
    console.log('Dashboard will run with limited features');
}

let currentUser = null;
let studentData = [];
let answerKeys = [];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize Firebase auth in background (non-blocking)
        initializeFirebaseAuth();
        
        // Load dashboard data immediately
        await loadAnswerKeys();
        await loadStudentData();
        initializeDashboard();
        
        console.log('Teacher dashboard initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showError('Failed to load dashboard data.');
    }
});

// Initialize Firebase authentication in background
function initializeFirebaseAuth() {
    try {
        if (auth) {
            onAuthStateChanged(auth, (user) => {
                currentUser = user;
                console.log('Auth state:', user ? 'Teacher logged in' : 'Not logged in');
                
                if (user) {
                    // If user becomes authenticated during dashboard use, reload student data
                    loadStudentData();
                } else {
                    // Show warning that real data won't be available
                    showAuthWarning();
                }
            });
        }
    } catch (error) {
        console.log('Firebase auth initialization failed:', error);
    }
}

// Show authentication warning for teacher dashboard
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
            <strong>Demo Mode</strong>
        </div>
        <div>You're viewing sample data. <a href="/" style="color: #742a2a; text-decoration: underline;">Sign in</a> to view real student data.</div>
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

// Load answer keys from JSON
async function loadAnswerKeys() {
    try {
        const response = await fetch('./test-activities-simple.json');
        if (!response.ok) throw new Error('Failed to fetch answer keys');
        const testData = await response.json();
        answerKeys = testData.activities;
        
        console.log('Answer keys loaded:', answerKeys.length);
    } catch (error) {
        console.error('Error loading answer keys:', error);
    }
}

// Load student test data from Firebase
async function loadStudentData() {
    try {
        // If no authentication or Firebase, use sample data
        if (!currentUser || !db) {
            console.log('No authentication or Firebase - loading sample data');
            createSampleData();
            return;
        }
        
        const progressCollection = collection(db, 'testProgress');
        const progressSnapshot = await getDocs(progressCollection);
        
        studentData = [];
        
        for (const doc of progressSnapshot.docs) {
            const data = doc.data();
            const userId = doc.id;
            
            // Get user profile data if available
            let userProfile = null;
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    userProfile = userDoc.data();
                }
            } catch (error) {
                console.log('No user profile found for:', userId);
            }
            
            studentData.push({
                userId,
                ...data,
                profile: userProfile,
                email: userProfile?.email || `user_${userId.slice(0, 8)}@example.com`,
                name: userProfile?.displayName || `Student ${userId.slice(0, 8)}`
            });
        }
        
        console.log('Student data loaded:', studentData.length);
    } catch (error) {
        console.error('Error loading student data:', error);
        // Create sample data for demonstration
        createSampleData();
    }
}

// Create sample data for demonstration
function createSampleData() {
    studentData = [
        {
            userId: 'sample1',
            name: 'Alice Johnson',
            email: 'alice.johnson@email.com',
            score: 340,
            currentQuestionIndex: 19,
            isTestCompleted: true,
            totalTimeSpent: 6840, // 114 minutes
            startTime: Date.now() - 7200000, // 2 hours ago
            responses: generateSampleResponses(18, 85),
            lastUpdated: new Date().toISOString()
        },
        {
            userId: 'sample2',
            name: 'Bob Smith',
            email: 'bob.smith@email.com',
            score: 280,
            currentQuestionIndex: 15,
            isTestCompleted: false,
            totalTimeSpent: 5400, // 90 minutes
            startTime: Date.now() - 5400000, // 1.5 hours ago
            responses: generateSampleResponses(15, 70),
            lastUpdated: new Date().toISOString()
        },
        {
            userId: 'sample3',
            name: 'Charlie Brown',
            email: 'charlie.brown@email.com',
            score: 360,
            currentQuestionIndex: 19,
            isTestCompleted: true,
            totalTimeSpent: 5760, // 96 minutes
            startTime: Date.now() - 6000000, // 100 minutes ago
            responses: generateSampleResponses(15, 90),
            lastUpdated: new Date().toISOString()
        },
        {
            userId: 'sample4',
            name: 'Diana Prince',
            email: 'diana.prince@email.com',
            score: 240,
            currentQuestionIndex: 12,
            isTestCompleted: false,
            totalTimeSpent: 3600, // 60 minutes
            startTime: Date.now() - 3600000, // 1 hour ago
            responses: generateSampleResponses(12, 60),
            lastUpdated: new Date().toISOString()
        }
    ];
}

// Generate sample responses for demonstration
function generateSampleResponses(questionCount, averageScore) {
    const responses = [];
    for (let i = 0; i < questionCount; i++) {
        const baseScore = answerKeys[i]?.points || 20;
        const variance = Math.random() * 0.4 - 0.2; // ±20% variance
        const score = Math.max(0, Math.min(baseScore, Math.round(baseScore * (averageScore/100 + variance))));
        
        responses.push({
            questionId: i + 1,
            code: generateSampleCode(i),
            score: score,
            maxScore: baseScore,
            timeSpent: Math.floor(Math.random() * 100) + 60, // 1-6 minutes
            submitted: true
        });
    }
    return responses;
}

// Generate sample code for demonstration
function generateSampleCode(questionIndex) {
    const sampleCodes = [
        `# Personal Information Card
first_name = "Alice"
last_name = "Johnson"
age = 20
height_cm = 165.5
is_student = True
favorite_color = "blue"

print("Name:", first_name, last_name)
print("Age:", age, type(age))
print("Height:", height_cm, "cm", type(height_cm))
print("Student:", is_student, type(is_student))
print("Favorite Color:", favorite_color, type(favorite_color))`,

        `# String Text Processor
text = "Python Programming is Amazing!"

print("Original:", text)
print("Uppercase:", text.upper())
print("Lowercase:", text.lower())
print("Title Case:", text.title())
print("Length:", len(text), "characters")
print("Word Count:", len(text.split()), "words")
print("Contains 'Programming':", 'Programming' in text)`,

        `# Calculator Operations
a = 45
b = 12

print("Addition:", a, "+", b, "=", a + b)
print("Subtraction:", a, "-", b, "=", a - b)
print("Multiplication:", a, "*", b, "=", a * b)
print("Division:", a, "/", b, "=", a / b)
print("Modulus:", a, "%", b, "=", a % b)`,

        `# Number Operations
num1 = 15
num2 = 4

print("First number:", num1)
print("Second number:", num2)
print("Sum:", num1 + num2)
print("Difference:", num1 - num2)
print("Product:", num1 * num2)`,

        `# List Operations
my_list = [10, 20, 30, 40, 50]

print("Original list:", my_list)
print("First item:", my_list[0])
print("Last item:", my_list[-1])
print("List length:", len(my_list))
my_list.append(60)
print("After adding 60:", my_list)`
    ];
    
    return sampleCodes[questionIndex % sampleCodes.length] || `# Sample code for question ${questionIndex + 1}
print("This is a sample solution")`;
}

// Initialize dashboard displays
function initializeDashboard() {
    updateOverviewStats();
    displayStudents();
    displayAnswerKeys();
    displayAnalytics();
    setupEventListeners();
    
    // Show authentication warning if using sample data
    if (!currentUser) {
        showAuthWarning();
    }
    
    // Hide loading indicators
    document.getElementById('overview-loading').style.display = 'none';
    document.getElementById('students-loading').style.display = 'none';
    document.getElementById('overview-content').style.display = 'block';
}

// Update overview statistics
function updateOverviewStats() {
    const totalStudents = studentData.length;
    const completedTests = studentData.filter(s => s.isTestCompleted).length;
    const averageScore = studentData.length > 0 ? 
        Math.round(studentData.reduce((sum, s) => sum + (s.score || 0), 0) / studentData.length) : 0;
    const passingRate = totalStudents > 0 ? 
        Math.round((studentData.filter(s => (s.score || 0) >= 280).length / totalStudents) * 100) : 0; // 70% of 400 points
    const avgTime = studentData.length > 0 ?
        Math.round(studentData.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0) / studentData.length / 60) : 0;

    document.getElementById('total-students').textContent = totalStudents;
    document.getElementById('average-score').textContent = `${averageScore}/400`;
    document.getElementById('passing-rate').textContent = `${passingRate}%`;
    document.getElementById('avg-time').textContent = `${avgTime} min`;
}

// Display student results
function displayStudents() {
    const grid = document.getElementById('students-grid');
    grid.innerHTML = '';

    studentData.forEach(student => {
        const percentage = Math.round(((student.score || 0) / 100) * 100);
        const scoreClass = getScoreClass(percentage);
        const progressWidth = Math.round(((student.currentQuestionIndex || 0) / 15) * 100);
        
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        studentCard.innerHTML = `
            <div class="student-header">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <div class="student-email">${student.email}</div>
                </div>
                <div class="score-badge ${scoreClass}">
                    ${student.score || 0}/400 (${percentage}%)
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressWidth}%"></div>
            </div>
            <div style="font-size: 0.9rem; color: #4a5568; margin-bottom: 1rem;">
                Progress: ${student.currentQuestionIndex || 0}/15 questions
                ${student.isTestCompleted ? ' • <span style="color: #48bb78; font-weight: 600;">Completed</span>' : ' • <span style="color: #ed8936; font-weight: 600;">In Progress</span>'}
            </div>
            
            <div class="question-details">
                ${generateQuestionDetails(student)}
            </div>
        `;
        
        grid.appendChild(studentCard);
    });
}

// Generate question details for student
function generateQuestionDetails(student) {
    if (!student.responses || student.responses.length === 0) {
        return '<div style="color: #4a5568; font-style: italic;">No responses recorded yet.</div>';
    }
    
    return student.responses.slice(0, 5).map((response, index) => {
        const question = answerKeys[index];
        if (!question) return '';
        
        const percentage = Math.round((response.score / response.maxScore) * 100);
        const scoreClass = getScoreClass(percentage);
        
        return `
            <div class="question-item">
                <div class="question-header">
                    <div class="question-title">${question.title}</div>
                    <div class="question-score">${response.score}/${response.maxScore}</div>
                </div>
                <div style="font-size: 0.8rem; color: #4a5568; margin-bottom: 0.5rem;">
                    Time spent: ${Math.round(response.timeSpent / 60)} minutes
                </div>
                <div class="code-display">${response.code.slice(0, 200)}${response.code.length > 200 ? '...' : ''}</div>
            </div>
        `;
    }).join('') + (student.responses.length > 5 ? `<div style="text-align: center; padding: 1rem; color: #4a5568;">... and ${student.responses.length - 5} more questions</div>` : '');
}

// Display answer keys
function displayAnswerKeys() {
    const container = document.getElementById('answer-keys-content');
    container.innerHTML = '';

    answerKeys.forEach((question, index) => {
        const answerKey = document.createElement('div');
        answerKey.className = 'answer-key';
        answerKey.innerHTML = `
            <h4><i class="fas fa-key"></i> Question ${index + 1}: ${question.title}</h4>
            <div style="margin-bottom: 1rem;">
                <strong>Instructions:</strong> ${question.instructions}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Points:</strong> ${question.points} | <strong>Time Limit:</strong> ${question.timeLimit} minutes
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Expected Output:</strong> ${question.expectedOutput}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Hints:</strong>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    ${question.hints.map(hint => `<li style="margin-bottom: 0.25rem;">${hint}</li>`).join('')}
                </ul>
            </div>
            <div>
                <strong>Sample Solution:</strong>
                <div class="code-display">${generateSampleSolution(index)}</div>
            </div>
        `;
        container.appendChild(answerKey);
    });
}

// Generate sample solutions for answer keys
function generateSampleSolution(questionIndex) {
    const solutions = [
        `# Personal Information Card - Sample Solution
first_name = "John"
last_name = "Doe"
age = 21
height_cm = 175.5
is_student = True
favorite_color = "green"

print(f"Name: {first_name} {last_name}")
print(f"Age: {age} (Type: {type(age)})")
print(f"Height: {height_cm}cm (Type: {type(height_cm)})")
print(f"Student Status: {is_student} (Type: {type(is_student)})")
print(f"Favorite Color: {favorite_color} (Type: {type(favorite_color)})")`,

        `# String Text Processor - Sample Solution
text = "Python Programming is Amazing!"

print(f"Original text: {text}")
print(f"Uppercase: {text.upper()}")
print(f"Lowercase: {text.lower()}")
print(f"Title case: {text.title()}")
print(f"Character count: {len(text)}")
print(f"Word count: {len(text.split())}")
print(f"Contains 'Programming': {'Programming' in text}")`,

        `# Calculator Operations - Sample Solution
a = 45
b = 12

print(f"Numbers: a = {a}, b = {b}")
print(f"Addition: {a} + {b} = {a + b}")
print(f"Subtraction: {a} - {b} = {a - b}")
print(f"Multiplication: {a} * {b} = {a * b}")
print(f"Division: {a} / {b} = {a / b:.2f}")
print(f"Floor Division: {a} // {b} = {a // b}")
print(f"Modulus: {a} % {b} = {a % b}")
print(f"Exponentiation: {a} ** {b} = {a ** b}")`,

        `# Data Type Converter - Sample Solution
original_value = "123.45"
print(f"Original: {original_value} (Type: {type(original_value)})")

# Convert to float
float_value = float(original_value)
print(f"Float: {float_value} (Type: {type(float_value)})")

# Convert to int
int_value = int(float_value)
print(f"Integer: {int_value} (Type: {type(int_value)})")

# Convert back to string
string_value = str(int_value)
print(f"String: {string_value} (Type: {type(string_value)})")

# Convert to boolean
bool_value = bool(int_value)
print(f"Boolean: {bool_value} (Type: {type(bool_value)})")`,

        `# Shopping List Manager - Sample Solution
shopping_list = ['bread', 'milk', 'eggs']
print(f"Initial list: {shopping_list}")

# Add items
shopping_list.append('butter')
shopping_list.append('cheese')
print(f"After adding butter and cheese: {shopping_list}")

# Insert at specific position
shopping_list.insert(1, 'fruits')
print(f"After inserting fruits at index 1: {shopping_list}")

# Remove item
shopping_list.remove('milk')
print(f"After removing milk: {shopping_list}")

print(f"Final list length: {len(shopping_list)}")`
    ];

    if (questionIndex < solutions.length) {
        return solutions[questionIndex];
    }

    // Generate a generic solution for questions beyond the predefined ones
    const question = answerKeys[questionIndex];
    return `# ${question.title} - Sample Solution
# This is a sample solution for: ${question.instructions}
# 
# Key concepts to demonstrate:
${question.hints.map(hint => `# - ${hint}`).join('\n')}
#
# Expected output: ${question.expectedOutput}

print("Sample solution for ${question.title}")
print("Please implement according to the instructions above")`;
}

// Display analytics
function displayAnalytics() {
    if (studentData.length === 0) return;

    // Calculate question-level analytics
    const questionStats = {};
    answerKeys.forEach((question, index) => {
        const responses = studentData
            .filter(s => s.responses && s.responses[index])
            .map(s => s.responses[index]);
        
        if (responses.length > 0) {
            const avgScore = responses.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / responses.length;
            const avgTime = responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length;
            
            questionStats[index] = {
                title: question.title,
                avgScore: avgScore * 100,
                avgTime: avgTime / 60,
                responseCount: responses.length
            };
        }
    });

    // Find hardest and easiest questions
    const sortedByDifficulty = Object.entries(questionStats)
        .sort(([,a], [,b]) => a.avgScore - b.avgScore);
    
    const hardest = sortedByDifficulty[0];
    const easiest = sortedByDifficulty[sortedByDifficulty.length - 1];
    
    document.getElementById('hardest-question').textContent = hardest ? `Q${parseInt(hardest[0]) + 1}` : '-';
    document.getElementById('easiest-question').textContent = easiest ? `Q${parseInt(easiest[0]) + 1}` : '-';
    
    const completionRate = Math.round((studentData.filter(s => s.isTestCompleted).length / studentData.length) * 100);
    document.getElementById('completion-rate').textContent = `${completionRate}%`;

    // Display question analytics
    const analyticsContainer = document.getElementById('question-analytics');
    analyticsContainer.innerHTML = '<h4 style="margin-bottom: 1rem;">Question Performance Breakdown</h4>';
    
    Object.entries(questionStats).forEach(([index, stats]) => {
        const scoreClass = getScoreClass(stats.avgScore);
        const questionCard = document.createElement('div');
        questionCard.className = 'question-item';
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-title">Q${parseInt(index) + 1}: ${stats.title}</div>
                <div class="question-score">${Math.round(stats.avgScore)}%</div>
            </div>
            <div style="font-size: 0.9rem; color: #4a5568;">
                Average time: ${Math.round(stats.avgTime)} minutes | 
                ${stats.responseCount} response(s)
            </div>
        `;
        analyticsContainer.appendChild(questionCard);
    });
}

// Get score classification
function getScoreClass(percentage) {
    if (percentage >= 90) return 'score-excellent';
    if (percentage >= 80) return 'score-good';
    if (percentage >= 70) return 'score-average';
    return 'score-poor';
}

// Setup event listeners
function setupEventListeners() {
    // Filter functionality
    document.getElementById('score-filter').addEventListener('change', filterStudents);
    document.getElementById('student-search').addEventListener('input', filterStudents);
}

// Filter students based on criteria
function filterStudents() {
    const scoreFilter = document.getElementById('score-filter').value;
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    
    const filteredData = studentData.filter(student => {
        // Score filter
        const percentage = Math.round(((student.score || 0) / 400) * 100);
        let scoreMatch = true;
        
        switch (scoreFilter) {
            case 'excellent':
                scoreMatch = percentage >= 90;
                break;
            case 'good':
                scoreMatch = percentage >= 80 && percentage < 90;
                break;
            case 'average':
                scoreMatch = percentage >= 70 && percentage < 80;
                break;
            case 'poor':
                scoreMatch = percentage < 70;
                break;
        }
        
        // Search filter
        const searchMatch = student.name.toLowerCase().includes(searchTerm) ||
                           student.email.toLowerCase().includes(searchTerm);
        
        return scoreMatch && searchMatch;
    });
    
    // Update display with filtered data
    const grid = document.getElementById('students-grid');
    grid.innerHTML = '';
    
    filteredData.forEach(student => {
        const percentage = Math.round(((student.score || 0) / 100) * 100);
        const scoreClass = getScoreClass(percentage);
        const progressWidth = Math.round(((student.currentQuestionIndex || 0) / 15) * 100);
        
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        studentCard.innerHTML = `
            <div class="student-header">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <div class="student-email">${student.email}</div>
                </div>
                <div class="score-badge ${scoreClass}">
                    ${student.score || 0}/100 (${percentage}%)
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressWidth}%"></div>
            </div>
            <div style="font-size: 0.9rem; color: #4a5568; margin-bottom: 1rem;">
                Progress: ${student.currentQuestionIndex || 0}/15 questions
                ${student.isTestCompleted ? ' • <span style="color: #48bb78; font-weight: 600;">Completed</span>' : ' • <span style="color: #ed8936; font-weight: 600;">In Progress</span>'}
            </div>
            
            <div class="question-details">
                ${generateQuestionDetails(student)}
            </div>
        `;
        
        grid.appendChild(studentCard);
    });
}

// Tab switching functionality
window.switchTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
};

// Export functionality
window.exportResults = function(format) {
    if (format === 'csv') {
        exportToCSV();
    } else if (format === 'pdf') {
        exportToPDF();
    }
};

// Export to CSV
function exportToCSV() {
    const headers = ['Name', 'Email', 'Score', 'Percentage', 'Questions Completed', 'Status', 'Time Spent (min)', 'Last Updated'];
    const csvData = [headers.join(',')];
    
    studentData.forEach(student => {
        const percentage = Math.round(((student.score || 0) / 400) * 100);
        const timeSpent = Math.round((student.totalTimeSpent || 0) / 60);
        const status = student.isTestCompleted ? 'Completed' : 'In Progress';
        
        const row = [
            `"${student.name}"`,
            `"${student.email}"`,
            student.score || 0,
            `${percentage}%`,
            `${student.currentQuestionIndex || 0}/15`,
            status,
            timeSpent,
            new Date(student.lastUpdated).toLocaleDateString()
        ];
        csvData.push(row.join(','));
    });
    
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_test_results.csv';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Export to PDF (simplified version)
function exportToPDF() {
    alert('PDF export functionality would require a PDF library like jsPDF. For now, please use the CSV export.');
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
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}


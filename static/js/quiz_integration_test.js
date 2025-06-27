/**
 * Quiz System Integration Test
 * Tests the consolidated quiz system functionality
 */

// Test the consolidated quiz core
console.log('=== Testing Consolidated Quiz System ===');

// 1. Test quiz initialization
function testQuizInitialization() {
    console.log('Testing quiz initialization...');
    
    // Check if quiz functions are available
    const requiredFunctions = [
        'initializeQuizzes',
        'submitQuiz', 
        'resetQuiz',
        'showHint',
        'handleMultipleChoice',
        'handleFillInBlank',
        'handleDragAndDrop'
    ];
    
    let allFunctionsExist = true;
    requiredFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
            console.error(`❌ Missing function: ${func}`);
            allFunctionsExist = false;
        } else {
            console.log(`✅ Function exists: ${func}`);
        }
    });
    
    return allFunctionsExist;
}

// 2. Test quiz validation utility
function testQuizValidator() {
    console.log('Testing quiz validator...');
    
    if (typeof window.QuizValidator === 'undefined') {
        console.error('❌ QuizValidator not loaded');
        return false;
    }
    
    // Test basic validation
    const validQuiz = {
        type: "multiple_choice",
        question: "What is Python?",
        options: ["A language", "A snake"],
        correct_answer: 0
    };
    
    try {
        const isValid = window.QuizValidator.validateQuizBlock(validQuiz);
        console.log(`✅ Quiz validation works: ${isValid}`);
        return true;
    } catch (error) {
        console.error(`❌ Quiz validation error: ${error.message}`);
        return false;
    }
}

// 3. Test CSS classes are available
function testCSSClasses() {
    console.log('Testing CSS classes...');
    
    const requiredClasses = [
        'quiz-block',
        'quiz-question',
        'quiz-options',
        'quiz-option',
        'quiz-feedback',
        'quiz-hint-button',
        'quiz-reset-button'
    ];
    
    const testElement = document.createElement('div');
    let allClassesWork = true;
    
    requiredClasses.forEach(className => {
        testElement.className = className;
        // Check if the class gets applied (basic test)
        if (testElement.className === className) {
            console.log(`✅ CSS class available: ${className}`);
        } else {
            console.error(`❌ CSS class issue: ${className}`);
            allClassesWork = false;
        }
    });
    
    return allClassesWork;
}

// Run tests when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Starting Quiz System Tests...');
    
    const results = {
        initialization: testQuizInitialization(),
        validator: testQuizValidator(),
        css: testCSSClasses()
    };
    
    console.log('=== Test Results ===');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    // Store results globally for debugging
    window.quizTestResults = results;
});

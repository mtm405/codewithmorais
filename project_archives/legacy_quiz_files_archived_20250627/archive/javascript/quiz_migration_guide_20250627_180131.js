/**
 * Quiz Integration Example
 * Shows how to implement the enhanced quiz system in your existing templates
 */

// Integration guide for existing quiz templates
class QuizMigrationHelper {
  
  // Step 1: Update HTML structure to use new classes
  static migrateHTMLStructure() {
    const examples = {
      
      // OLD: Basic multiple choice
      old_mcq: `
        <div class="mcq-container">
          <div class="mcq-question">What is Python?</div>
          <button class="mcq-option-btn" data-option-index="0">A programming language</button>
          <button class="mcq-option-btn" data-option-index="1">A snake</button>
        </div>
      `,
      
      // NEW: Enhanced multiple choice
      new_mcq: `
        <div class="quiz-container" data-quiz-engine data-quiz-id="python_basics_1">
          <div class="quiz-header">
            <h2 class="quiz-title">Python Basics Quiz</h2>
            <div class="quiz-progress-container">
              <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" style="width: 33%"></div>
              </div>
              <span class="quiz-progress-text">Question 1 of 3</span>
            </div>
          </div>
          
          <div class="quiz-question-container">
            <div class="quiz-question">
              <span class="quiz-question-number">1</span>
              What is Python?
            </div>
            
            <div class="quiz-options" role="radiogroup" aria-labelledby="question-1">
              <div class="quiz-option" role="radio" tabindex="0" data-answer="0" aria-describedby="option-1-desc">
                <div class="quiz-option-letter">A</div>
                <div class="quiz-option-text">A programming language</div>
              </div>
              <div class="quiz-option" role="radio" tabindex="-1" data-answer="1" aria-describedby="option-2-desc">
                <div class="quiz-option-letter">B</div>
                <div class="quiz-option-text">A snake</div>
              </div>
            </div>
          </div>
          
          <div class="quiz-actions">
            <button class="quiz-btn quiz-btn-secondary" id="prev-btn" disabled>Previous</button>
            <button class="quiz-btn quiz-btn-primary" id="next-btn">Next Question</button>
          </div>
          
          <!-- Feedback area -->
          <div class="quiz-feedback" id="feedback-area" aria-live="polite"></div>
          
          <!-- Accessibility announcements -->
          <div class="sr-only" aria-live="assertive" id="quiz-announcements"></div>
        </div>
      `
    };
    
    return examples;
  }
  
  // Step 2: Migrate JavaScript event handlers
  static migrateJavaScript() {
    return `
      // OLD: Manual event handling
      document.querySelectorAll('.mcq-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Manual grading logic
          const isCorrect = e.target.dataset.optionIndex === '0';
          // Basic feedback
          alert(isCorrect ? 'Correct!' : 'Wrong!');
        });
      });
      
      // NEW: Automatic with enhanced features
      // Just add data-quiz-engine attribute to container
      // The QuizEngine class handles everything automatically:
      // - Answer validation
      // - Scoring with time bonuses
      // - Achievement detection
      // - Accessibility
      // - Mobile optimization
      // - Analytics tracking
    `;
  }
  
  // Step 3: Update CSS imports
  static updateCSS() {
    return `
      <!-- OLD: Multiple CSS files -->
      <link rel="stylesheet" href="/static/css/quiz_core.css">
      <link rel="stylesheet" href="/static/css/enhanced_quiz_blocks.css">
      <link rel="stylesheet" href="/static/css/unified_quiz_styles.css">
      
      <!-- NEW: Single optimized file -->
      <link rel="stylesheet" href="/static/css/enhanced_quiz_styles.css">
    `;
  }
  
  // Step 4: Backend API integration
  static backendIntegration() {
    return `
      # Flask route updates needed
      
      @app.route('/api/quiz/submit', methods=['POST'])
      def submit_quiz_result():
          data = request.get_json()
          
          # Enhanced data structure
          result = {
              'question_id': data.get('question_id'),
              'user_answer': data.get('answer'),
              'is_correct': data.get('correct'),
              'base_points': data.get('points', 0),
              'time_bonus': data.get('time_bonus', 0),
              'total_score': data.get('total_score', 0),
              'streak_count': data.get('streak', 0),
              'achievements': data.get('achievements', [])
          }
          
          # Save to database
          save_quiz_result(current_user.id, result)
          
          # Update user stats
          update_user_statistics(current_user.id, result)
          
          # Check for new achievements
          new_achievements = check_achievements(current_user.id)
          
          return jsonify({
              'success': True,
              'new_points': get_user_points(current_user.id),
              'new_currency': get_user_currency(current_user.id),
              'achievements': new_achievements,
              'leaderboard_position': get_leaderboard_position(current_user.id)
          })
    `;
  }
}

// Sample quiz data structure for the enhanced system
const sampleQuizData = {
  id: "python_basics_quiz",
  title: "Python Basics Assessment",
  description: "Test your knowledge of Python fundamentals",
  timeLimit: 300000, // 5 minutes in milliseconds
  passingScore: 70,
  difficulty: 2, // 1-5 scale
  
  questions: [
    {
      id: "q1_python_definition",
      type: "multiple_choice",
      difficulty: 1,
      timeTarget: 30000, // 30 seconds
      points: 10,
      question: "What is Python?",
      options: [
        "A programming language",
        "A snake",
        "A type of database",
        "A web browser"
      ],
      correct_index: 0,
      explanation: "Python is a high-level, interpreted programming language known for its simplicity and readability.",
      hints: [
        {
          text: "Think about what you're learning in this course!",
          cost: 2
        }
      ]
    },
    
    {
      id: "q2_variable_assignment",
      type: "fill_in_the_blank",
      difficulty: 2,
      timeTarget: 45000, // 45 seconds
      points: 15,
      question: "Complete the code to assign the value 42 to a variable named 'answer': answer = ___",
      answers: ["42", "42.0", "int(42)"],
      explanation: "In Python, you assign values to variables using the = operator.",
      hints: [
        {
          text: "What number represents the answer to life, the universe, and everything?",
          cost: 3
        }
      ]
    },
    
    {
      id: "q3_data_types",
      type: "drag_and_drop",
      difficulty: 3,
      timeTarget: 60000, // 1 minute
      points: 20,
      question: "Match each value with its correct data type:",
      items: ["42", "3.14", "True", "'Hello'"],
      categories: ["Integer", "Float", "Boolean", "String"],
      correct_mapping: {
        "42": "Integer",
        "3.14": "Float", 
        "True": "Boolean",
        "'Hello'": "String"
      },
      explanation: "Python has several built-in data types including integers, floats, booleans, and strings."
    }
  ],
  
  // Achievement criteria for this quiz
  achievements: {
    "python_novice": {
      condition: "complete_quiz",
      name: "Python Novice",
      description: "Complete your first Python quiz"
    },
    "speed_coder": {
      condition: "complete_under_time",
      threshold: 180000, // 3 minutes
      name: "Speed Coder",
      description: "Complete the quiz in under 3 minutes"
    }
  }
};

// Integration with existing templates
function integrateWithExistingTemplates() {
  
  // For Jinja2 templates, update like this:
  const jinjaTemplate = `
    {% extends "base.html" %}
    
    {% block head %}
      <link rel="stylesheet" href="{{ url_for('static', filename='css/enhanced_quiz_styles.css') }}">
    {% endblock %}
    
    {% block content %}
      <div class="quiz-container" 
           data-quiz-engine 
           data-quiz-id="{{ quiz.id }}"
           data-passing-score="{{ quiz.passing_score }}"
           data-time-limit="{{ quiz.time_limit }}">
           
        <!-- Quiz content will be automatically generated by QuizEngine -->
        <div class="quiz-loading">
          <div class="quiz-loader"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    {% endblock %}
    
    {% block scripts %}
      <script type="module" src="{{ url_for('static', filename='js/enhanced_quiz_engine.js') }}"></script>
    {% endblock %}
  `;
  
  return jinjaTemplate;
}

// Usage examples for different quiz types
const usageExamples = {
  
  // Basic multiple choice
  basicMCQ: () => {
    const container = document.querySelector('#quiz-container');
    new QuizEngine(container, {
      enableAchievements: true,
      enableTimer: true,
      animationsEnabled: true
    });
  },
  
  // Timed challenge quiz
  timedChallenge: () => {
    const container = document.querySelector('#timed-quiz');
    new QuizEngine(container, {
      enableTimer: true,
      timeLimit: 120000, // 2 minutes
      showTimeWarnings: true,
      autoSubmit: true
    });
  },
  
  // Practice mode (no scoring)
  practiceMode: () => {
    const container = document.querySelector('#practice-quiz');
    new QuizEngine(container, {
      enableAchievements: false,
      enableScoring: false,
      allowRetries: true,
      showExplanations: true
    });
  }
};

// Performance monitoring
class QuizPerformanceMonitor {
  static trackLoadTime() {
    const startTime = performance.now();
    
    document.addEventListener('DOMContentLoaded', () => {
      const loadTime = performance.now() - startTime;
      console.log(`Quiz system loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics
      if (window.gtag) {
        gtag('event', 'quiz_load_time', {
          value: Math.round(loadTime),
          event_category: 'performance'
        });
      }
    });
  }
  
  static trackUserInteractions() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.quiz-option')) {
        const timeToClick = Date.now() - window.questionStartTime;
        console.log(`Time to answer: ${timeToClick}ms`);
      }
    });
  }
}

// Initialize performance monitoring
QuizPerformanceMonitor.trackLoadTime();
QuizPerformanceMonitor.trackUserInteractions();

export { 
  QuizMigrationHelper, 
  sampleQuizData, 
  usageExamples,
  QuizPerformanceMonitor 
};

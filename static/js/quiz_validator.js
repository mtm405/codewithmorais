/**
 * Quiz JSON Validation Utility
 * Validates quiz JSON against the standardized schema before Firebase upload
 */

// JSON Schema validation function
function validateQuizJSON(quizData) {
  const errors = [];
  const warnings = [];
  
  // Required fields check
  if (!quizData.id) {
    errors.push("Missing required field: id");
  } else if (!/^[a-zA-Z0-9_-]+$/.test(quizData.id)) {
    errors.push("Invalid id format. Use only letters, numbers, underscores, and hyphens.");
  }
  
  if (!quizData.type) {
    errors.push("Missing required field: type");
  } else {
    const validTypes = ["multiple_choice", "fill_in_the_blank", "drag_and_drop", "comprehensive_quiz", "quiz_section", "code", "debug"];
    if (!validTypes.includes(quizData.type)) {
      errors.push(`Invalid type: ${quizData.type}. Must be one of: ${validTypes.join(", ")}`);
    }
  }
  
  // Type-specific validation
  switch (quizData.type) {
    case "multiple_choice":
      if (!quizData.question) errors.push("Multiple choice questions require a 'question' field");
      if (!Array.isArray(quizData.options)) {
        errors.push("Multiple choice questions require an 'options' array");
      } else {
        if (quizData.options.length < 2) errors.push("Multiple choice questions need at least 2 options");
        if (quizData.options.length > 6) warnings.push("More than 6 options may be difficult for students");
      }
      if (typeof quizData.correct_index !== "number") {
        errors.push("Multiple choice questions require a 'correct_index' number");
      } else if (quizData.options && (quizData.correct_index < 0 || quizData.correct_index >= quizData.options.length)) {
        errors.push("correct_index is out of range for the provided options");
      }
      break;
      
    case "fill_in_the_blank":
      if (!quizData.question) errors.push("Fill-in-the-blank questions require a 'question' field");
      if (!Array.isArray(quizData.answers)) {
        errors.push("Fill-in-the-blank questions require an 'answers' array");
      } else if (quizData.answers.length === 0) {
        errors.push("Fill-in-the-blank questions need at least one acceptable answer");
      }
      if (!quizData.question.includes("___") && !quizData.question.includes("<em>_</em>")) {
        warnings.push("Question should include blank indicators like '___' or '<em>_</em>'");
      }
      break;
      
    case "drag_and_drop":
      if (!Array.isArray(quizData.stems)) {
        errors.push("Drag-and-drop questions require a 'stems' array");
      }
      if (!Array.isArray(quizData.options)) {
        errors.push("Drag-and-drop questions require an 'options' array");
      }
      if (!quizData.correct_mapping || typeof quizData.correct_mapping !== "object") {
        errors.push("Drag-and-drop questions require a 'correct_mapping' object");
      } else {
        // Validate mapping integrity
        const mappingKeys = Object.keys(quizData.correct_mapping);
        if (quizData.stems) {
          quizData.stems.forEach(stem => {
            if (!mappingKeys.includes(stem)) {
              errors.push(`Missing mapping for stem: "${stem}"`);
            }
          });
        }
        if (quizData.options) {
          Object.values(quizData.correct_mapping).forEach(option => {
            if (!quizData.options.includes(option)) {
              errors.push(`Mapping references unknown option: "${option}"`);
            }
          });
        }
      }
      break;
      
    case "comprehensive_quiz":
    case "quiz_section":
      if (!Array.isArray(quizData.questions)) {
        errors.push(`${quizData.type} requires a 'questions' array`);
      } else if (quizData.questions.length === 0) {
        errors.push(`${quizData.type} needs at least one question`);
      } else {
        // Recursively validate each question
        quizData.questions.forEach((question, index) => {
          const questionErrors = validateQuizJSON(question);
          questionErrors.errors.forEach(err => 
            errors.push(`Question ${index + 1}: ${err}`)
          );
          questionErrors.warnings.forEach(warn => 
            warnings.push(`Question ${index + 1}: ${warn}`)
          );
        });
      }
      
      if (quizData.type === "comprehensive_quiz") {
        if (quizData.time_limit && quizData.time_limit < 60) {
          warnings.push("Time limit less than 60 seconds may be too short");
        }
        if (quizData.passing_score && (quizData.passing_score < 0 || quizData.passing_score > 100)) {
          errors.push("Passing score must be between 0 and 100");
        }
      }
      break;
      
    case "code":
      if (!quizData.question) errors.push("Code questions require a 'question' field");
      if (!quizData.starter_code) warnings.push("Consider providing starter_code for students");
      if (!quizData.expected_output) errors.push("Code questions require 'expected_output' for validation");
      break;
      
    case "debug":
      if (!quizData.question) errors.push("Debug questions require a 'question' field");
      if (!quizData.buggy_code) errors.push("Debug questions require 'buggy_code' field");
      if (!quizData.expected_output) errors.push("Debug questions require 'expected_output' for validation");
      break;
  }
  
  // General validation
  if (quizData.points && (typeof quizData.points !== "number" || quizData.points < 0)) {
    errors.push("Points must be a non-negative number");
  }
  
  if (quizData.hint_cost && (typeof quizData.hint_cost !== "number" || quizData.hint_cost < 1)) {
    errors.push("Hint cost must be a positive number");
  }
  
  if (quizData.hint && !quizData.hint_cost) {
    warnings.push("Hint provided but no hint_cost specified");
  }
  
  return { 
    isValid: errors.length === 0, 
    errors, 
    warnings 
  };
}

// Firebase upload preparation
function prepareQuizForFirebase(quizData) {
  const validation = validateQuizJSON(quizData);
  
  if (!validation.isValid) {
    throw new Error(`Quiz validation failed: ${validation.errors.join(", ")}`);
  }
  
  // Add metadata
  const timestamp = new Date().toISOString();
  const preparedQuiz = {
    ...quizData,
    created_at: timestamp,
    updated_at: timestamp,
    version: 1,
    status: "active"
  };
  
  // Ensure required defaults
  if (!preparedQuiz.points) preparedQuiz.points = 1;
  if (!preparedQuiz.title) preparedQuiz.title = `Quiz ${preparedQuiz.id}`;
  
  return {
    quiz: preparedQuiz,
    validation: validation
  };
}

// Batch validation for lesson uploads
function validateLessonQuizzes(lessonData) {
  const results = {
    valid: [],
    invalid: [],
    warnings: []
  };
  
  if (!lessonData.blocks || !Array.isArray(lessonData.blocks)) {
    results.invalid.push({ error: "Lesson must have a 'blocks' array" });
    return results;
  }
  
  lessonData.blocks.forEach((block, index) => {
    // Only validate quiz blocks
    const quizTypes = ["multiple_choice", "fill_in_the_blank", "drag_and_drop", "comprehensive_quiz", "quiz_section"];
    if (quizTypes.includes(block.type)) {
      const validation = validateQuizJSON(block);
      
      if (validation.isValid) {
        results.valid.push({
          index,
          id: block.id,
          type: block.type,
          warnings: validation.warnings
        });
      } else {
        results.invalid.push({
          index,
          id: block.id || `block_${index}`,
          type: block.type,
          errors: validation.errors
        });
      }
      
      if (validation.warnings.length > 0) {
        results.warnings.push(...validation.warnings.map(w => 
          `Block ${index} (${block.id}): ${w}`
        ));
      }
    }
  });
  
  return results;
}

// Export for use in upload scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateQuizJSON,
    prepareQuizForFirebase,
    validateLessonQuizzes
  };
}

// Browser global export
if (typeof window !== "undefined") {
  window.QuizValidator = {
    validateQuizJSON,
    prepareQuizForFirebase,
    validateLessonQuizzes
  };
}

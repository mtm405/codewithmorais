/**
 * Components Index
 * Centralized entry point for all JavaScript components
 */

// Import all components
import "./MultipleChoice.js";
import "./QuizContainer.js";

// Component factory for easy instantiation
window.Components = {
    MultipleChoice: window.MultipleChoice,
    QuizContainer: window.QuizContainer,
    
    // Helper function to create components
    create: {
        multipleChoice: (containerId, options) => new window.MultipleChoice(containerId, options),
        quizContainer: (containerId, options) => new window.QuizContainer(containerId, options)
    }
};

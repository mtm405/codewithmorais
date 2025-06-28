# JavaScript Components Documentation

## Overview
This document describes the vanilla JavaScript components that replaced the original React components in the codebase.

## Component Architecture

### 1. MultipleChoice Component (`static/js/components/MultipleChoice.js`)

**Purpose**: Handles multiple choice quiz interactions with visual feedback and confetti effects.

**Usage**:
```javascript
const quiz = new MultipleChoice("container-id", {
    options: ["Option 1", "Option 2", "Option 3"],
    correctIndex: 1,
    onNext: () => console.log("Moving to next question"),
    isLastQuestion: false
});
```

**Features**:
- Visual feedback (green for correct, red for incorrect)
- Confetti animation for correct answers
- Auto-advance after 2 seconds
- Disabled state during feedback
- Accessibility support

### 2. QuizContainer Component (`static/js/components/QuizContainer.js`)

**Purpose**: Manages quiz flow, progress tracking, and question navigation.

**Usage**:
```javascript
const container = new QuizContainer("quiz-container", {
    questions: [
        {
            type: "multiple_choice_quiz",
            question: "What is 2+2?",
            options: ["3", "4", "5"],
            correctIndex: 1
        }
    ],
    onNext: (index) => console.log(`Moved to question ${index + 1}`),
    onComplete: () => console.log("Quiz completed!")
});
```

**Features**:
- Progress indicator with percentage
- Question type routing
- Navigation controls
- Completion handling
- Question counter

## Global Components Access

Components are globally accessible via the `window.Components` object:

```javascript
// Direct instantiation
const quiz = new window.MultipleChoice("container", options);

// Via helper factory
const quiz = window.Components.create.multipleChoice("container", options);
```

## Integration with Existing Codebase

### quiz_core.js Integration
The components work seamlessly with the existing `quiz_core.js` functions:
- `handleQuizSubmit()` - Processes quiz answers
- `showFeedback()` - Displays feedback messages
- Grade functions (`gradeMCQ`, `gradeFillInTheBlank`, etc.)

### API Integration
Components automatically integrate with backend APIs:
- `/api/quiz/submit` - Submit quiz results
- `/api/quiz/purchase_hint` - Purchase hints
- Progress tracking and point updates

## Styling

Components use existing CSS classes:
- `.mcq-option-btn` - Multiple choice buttons
- `.quiz-container` - Quiz wrapper
- `.progress-bar` - Progress indicators
- `.confetti` - Animation effects

## Browser Compatibility

- ES6+ features (classes, arrow functions, template literals)
- Modern browser APIs (fetch, localStorage)
- Graceful degradation for older browsers

## Migration Notes

### From React to Vanilla JS:
1. **State Management**: React state → class properties
2. **Event Handling**: onClick props → addEventListener
3. **Rendering**: JSX → template literals + innerHTML
4. **Lifecycle**: useEffect → constructor + method calls
5. **Props**: React props → constructor options

### Benefits of Migration:
- ✅ No build step required
- ✅ Smaller bundle size
- ✅ Better integration with existing codebase
- ✅ Simpler deployment
- ✅ No framework dependencies

## Future Enhancements

1. **Drag & Drop Support**: Add drag-and-drop quiz type
2. **Animation Library**: Consider adding lightweight animations
3. **Accessibility**: Enhanced ARIA support
4. **Mobile Optimization**: Touch-friendly interactions
5. **Theming**: CSS custom properties for easy theming

## Troubleshooting

### Common Issues:

1. **Component not rendering**:
   - Check if container element exists
   - Verify options object structure
   - Check console for errors

2. **Events not working**:
   - Ensure DOM is loaded before instantiation
   - Check if event listeners are properly bound
   - Verify CSS classes exist

3. **Integration issues**:
   - Ensure quiz_core.js is loaded first
   - Check global function availability
   - Verify API endpoints are accessible

### Debug Mode:
Enable debug logging by setting:
```javascript
window.DEBUG_COMPONENTS = true;
```

This will log component lifecycle events and state changes to the console.

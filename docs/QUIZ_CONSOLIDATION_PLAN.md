# Quiz System Consolidation Plan

## ✅ COMPLETED: Phase 1: JavaScript Consolidation

### ✅ Remove Legacy Files
- ✅ Moved `quiz_core.js` to `legacy_quiz_files/` (archived)
- ✅ Moved `enhanced_quiz_core.js` to `legacy_quiz_files/` (archived)
- ✅ Created `consolidated_quiz_core.js` as unified quiz handler
- ✅ Keep `comprehensive_quiz.js` for multi-question quizzes (independent)

### ✅ Update File Loading
Updated `base.html` to load consolidated files:
```html
<script src="{{ url_for('static', filename='js/consolidated_quiz_core.js') }}" defer></script>
<script src="{{ url_for('static', filename='js/comprehensive_quiz.js') }}" defer></script>
```

## ✅ COMPLETED: Phase 2: CSS Consolidation

### ✅ Merge CSS Files
Combined all quiz styles into single file:
- ✅ Merged `quiz_core.css` + `enhanced_quiz_blocks.css` → `unified_quiz_styles.css`
- ✅ Removed duplicate styles
- ✅ Added comprehensive quiz styles
- ✅ Moved legacy CSS files to `legacy_quiz_files/`

## ✅ COMPLETED: Phase 3: JSON Schema Standardization

### Standardized Quiz JSON Format
```json
{
  "id": "quiz_unique_id",
  "type": "multiple_choice|fill_in_blank|drag_and_drop|comprehensive_quiz|quiz_section",
  "title": "Quiz Title",
  "instructions": "Instructions for students",
  "points": 1,
  "hint": "Optional hint text",
  "hint_cost": 5,
  "question": "The main question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 1,
  "answers": ["correct answer 1", "alternative correct answer"],
  "explanation": "Why this is the correct answer",
  "stems": ["Item 1", "Item 2"], // for drag-and-drop
  "correct_mapping": {"Item 1": "Category A"}, // for drag-and-drop
  "questions": [...] // for comprehensive/section quizzes
}
```

## Phase 4: Firebase Integration

### Backend API Endpoints Needed
- `POST /api/quiz/upload` - Upload JSON quiz to Firebase
- `GET /api/quiz/{id}` - Retrieve quiz from Firebase
- `POST /api/quiz/submit` - Submit student answer
- `GET /api/quiz/results/{student_id}` - Get student results

### Firebase Collections Structure
```
quizzes/
  {quiz_id}/
    - metadata (title, type, points, etc.)
    - questions[]
    - created_at
    - updated_at

student_progress/
  {student_id}/
    quiz_results/
      {quiz_id}/
        - score
        - answers[]
        - completed_at
        - time_taken
```

## Phase 5: Testing & Validation

### Test Cases Needed
- [ ] JSON upload validation
- [ ] All quiz types render correctly
- [ ] Accessibility testing
- [ ] Mobile responsiveness
- [ ] Firebase sync reliability

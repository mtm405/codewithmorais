# Quiz Master 3.0 - Phase 3: Legacy Migration & Cleanup Plan

## 📋 Migration Overview

**Goal**: Convert all existing quiz blocks to the unified Quiz Master 3.0 format and clean up legacy code.

## 🔍 Current State Analysis

### Legacy Quiz Block Types Found:
1. `"type": "multiple_choice"` - Standalone MCQ blocks
2. `"type": "multiple_choice_quiz"` - Multi-question MCQ containers  
3. `"type": "fill_in_the_blanks"` - Fill-in-the-blank questions
4. `"type": "drag_and_drop"` - Drag and drop matching

### Files to Migrate:
- `lessons/lesson_1_1.json` - 5+ quiz blocks (mixed types)
- `lessons/lesson_1_2.json` - Multiple quiz blocks
- `lessons/lesson_1_3.json` - Quiz blocks
- `lessons/lesson_1_4.json` - Quiz blocks  
- `lessons/lesson_2_1.json` - Complex quiz structures
- `lessons/lesson_2_2.json` - Quiz blocks
- `lessons/lesson_3_1.json` - Quiz blocks
- `lessons/lesson_3_2.json` - Quiz blocks
- `lessons/lesson_4_1.json` - Quiz blocks

## 🔄 Migration Strategy

### Phase 3A: Automated Migration Script
Create `migrate_quizzes.py` to:
1. **Scan all lesson files** for legacy quiz blocks
2. **Convert legacy formats** to unified Quiz Master 3.0 structure
3. **Consolidate multiple quiz blocks** into single unified blocks where appropriate
4. **Preserve all existing data** (questions, answers, points, etc.)
5. **Create backup files** before modification
6. **Validate converted data** against unified schema

### Phase 3B: Template & JS Cleanup  
1. **Deprecate old templates**:
   - `templates/partials/block_multiple_choice.html`
   - Any other legacy quiz templates
2. **Archive legacy JavaScript**:
   - Move `static/js/quiz_core.js` to `legacy_quiz_files/archive/`
   - Move other fragmented quiz JS files
3. **Update documentation** to reflect new unified approach

### Phase 3C: Testing & Validation
1. **Test migrated lessons** in browser
2. **Verify all quiz functionality** works with new system
3. **Performance testing** with unified blocks
4. **User experience validation**

## 🛠️ Migration Script Design

```python
class QuizMigrator:
    def migrate_lesson(self, lesson_file):
        # Load existing lesson
        # Identify legacy quiz blocks  
        # Convert to unified format
        # Consolidate where appropriate
        # Validate result
        # Save with backup
        
    def convert_multiple_choice(self, block):
        # Convert to unified MCQ format
        
    def convert_multiple_choice_quiz(self, block):  
        # Convert multi-question MCQ to unified format
        
    def convert_fill_in_blanks(self, block):
        # Convert to unified FITB format
        
    def convert_drag_and_drop(self, block):
        # Convert to unified D&D format
        
    def consolidate_quiz_blocks(self, blocks):
        # Group adjacent quiz blocks into unified containers
```

## 📊 Expected Outcomes

### Benefits:
- **Reduced complexity**: Single quiz system instead of 4+ different types
- **Better maintenance**: One template and controller to maintain
- **Consistent UX**: Unified progress tracking and feedback across all quizzes
- **Improved performance**: Consolidated loading and rendering
- **Future-ready**: Easy to add new question types

### Risks & Mitigation:
- **Data loss**: Create comprehensive backups before migration
- **Breaking changes**: Maintain legacy files until migration is validated  
- **User disruption**: Test thoroughly before deploying migrated lessons
- **Performance issues**: Monitor quiz loading and interaction performance

## 🎯 Success Criteria

1. ✅ All lesson files successfully migrated to unified format
2. ✅ No data loss during conversion process
3. ✅ All quiz functionality works with Quiz Master 3.0
4. ✅ Performance equals or improves over legacy system
5. ✅ User experience is seamless transition
6. ✅ Legacy code safely archived for reference
7. ✅ Documentation updated for new system

---

**Phase 3 Status: 🚧 READY TO BEGIN**

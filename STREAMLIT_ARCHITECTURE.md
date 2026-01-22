# Streamlit IDE Architecture & Features

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Student View)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Sidebar              │  Main Content Area             │ │
│  │  - Assignment Picker  │  - Code Editor                 │ │
│  │  - Load Starter Code  │  - Run/Grade/Save Buttons      │ │
│  │  - Clear Editor       │  - Output Display              │ │
│  │  - Score Display      │  - Test Results                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP (Port 8501)
┌─────────────────────────────────────────────────────────────┐
│                   Streamlit Server                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  streamlit_ide.py                                    │  │
│  │  - UI Components (Streamlit widgets)                 │  │
│  │  - Code Execution Engine                             │  │
│  │  - Auto-Grading System                              │  │
│  │  - File Management                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    File System                               │
│  - assignments.json (Assignment configs)                     │
│  - student_submissions/ (Saved code)                        │
│  - temp files (Execution environment)                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Student Writes Code
```
Student types in editor
       ↓
Streamlit captures input
       ↓
Stored in session_state
```

### 2. Run Code Flow
```
Click "Run Code"
       ↓
Code → Temporary File
       ↓
Execute in isolated namespace
       ↓
Capture stdout/stderr
       ↓
Display output to student
       ↓
Clean up temp files
```

### 3. Grade Assignment Flow
```
Click "Grade Assignment"
       ↓
Load test cases from assignments.json
       ↓
For each test:
  ├─ Create temp file with student code
  ├─ Import as Python module
  ├─ Run test case
  ├─ Capture result (pass/fail)
  └─ Award points
       ↓
Calculate total score
       ↓
Display results with feedback
       ↓
Clean up all temp files
```

### 4. Save Code Flow
```
Click "Save Code"
       ↓
Generate filename with timestamp
       ↓
Save to student_submissions/
       ↓
Confirm to student
```

## Key Components

### 1. Assignment Configuration (assignments.json)
```json
{
  "Assignment Name": {
    "description": "What students learn",
    "difficulty": "Beginner|Intermediate|Advanced",
    "starter_code": "# Template code",
    "tests": [...]
  }
}
```

### 2. Test Types

| Test Type | Purpose | Example |
|-----------|---------|---------|
| `function_exists` | Check if function defined | Does `save_message()` exist? |
| `file_write` | Verify file writing | Does it create the file correctly? |
| `file_read` | Verify file reading | Does it read the content? |
| `function_call` | Test return values | Does `get_high_score()` return 0? |
| `custom` | Manual review needed | Complex integration tests |

### 3. Session State Variables

```python
st.session_state = {
    'code': "",                    # Current code in editor
    'output': "",                  # Program output
    'error': "",                   # Error messages
    'grade_results': {...},        # Test results
    'assignment_data': {...}       # Current assignment config
}
```

## Features Matrix

### Student Features

| Feature | Description | Status |
|---------|-------------|--------|
| Code Editor | Syntax-aware text area | ✅ Working |
| Run Code | Execute Python instantly | ✅ Working |
| Auto-Grade | Automated test suite | ✅ Working |
| Save Code | Download submissions | ✅ Working |
| Load Template | Get starter code | ✅ Working |
| Clear Editor | Reset workspace | ✅ Working |
| View Score | See grade breakdown | ✅ Working |
| Error Display | Show errors clearly | ✅ Working |

### Teacher Features

| Feature | Description | Status |
|---------|-------------|--------|
| View Submissions | Check saved code | ✅ Working |
| Custom Assignments | Edit JSON config | ✅ Working |
| Test Configuration | Add/modify tests | ✅ Working |
| Score Tracking | Monitor progress | ✅ Working |
| Bulk Review | Check multiple files | 📁 Manual |

## Security Model

```
┌─────────────────────────────────────────────┐
│  Student Code Submission                    │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  Isolation Layer                            │
│  - Temporary files only                     │
│  - No system access                         │
│  - Limited to current directory             │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  Execution Environment                      │
│  - Separate namespace                       │
│  - Captured I/O                             │
│  - Exception handling                       │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  Cleanup                                    │
│  - Remove temp files                        │
│  - Clear test data                          │
│  - Reset state                              │
└─────────────────────────────────────────────┘
```

## Grading Logic

### Score Calculation
```
Total Score = Σ(points for passed tests)
Max Score = Σ(all test points)
Percentage = (Total Score / Max Score) × 100
```

### Grade Display
- 🏆 90-100%: "Excellent!"
- 👍 70-89%: "Good job!"
- 📈 50-69%: "Keep trying!"
- 💪 0-49%: "Don't give up!"

## Assignment Progression

```
Level 1: File I/O Basics (Beginner)
├─ Learn: with statement, read(), write()
├─ Practice: Basic file operations
└─ Tests: 4 tests, 100 points total

Level 2: High Score Manager (Intermediate)
├─ Learn: Exception handling, type conversion
├─ Practice: Reading/writing numbers
└─ Tests: 6 tests, 100 points total

Level 3: Message Logger (Intermediate)
├─ Learn: Append mode, timestamps
├─ Practice: Log file management
└─ Tests: 5 tests, 100 points total

Level 4: Student Grade Book (Advanced)
├─ Learn: CSV parsing, data structures
├─ Practice: Structured data management
└─ Tests: 7 tests, 100 points total

Level 5: Configuration Manager (Advanced)
├─ Learn: Key-value storage, updates
├─ Practice: Settings persistence
└─ Tests: 7 tests, 100 points total
```

## Performance Considerations

### Optimization Strategies
1. **Session State**: Minimizes re-computation
2. **Lazy Loading**: Assignments loaded on-demand
3. **Temp Files**: Quick cleanup prevents buildup
4. **Isolated Tests**: Each test independent

### Resource Usage
- Memory: ~50-100 MB per user
- CPU: Minimal (only during code execution)
- Disk: ~1-5 KB per submission
- Network: ~10-50 KB per page load

## Extension Points

### Easy to Add:
1. **New Assignments**: Edit `assignments.json`
2. **New Test Types**: Add to `run_single_test()`
3. **UI Themes**: Modify CSS in `st.markdown()`
4. **Export Formats**: Add download buttons

### Moderate Effort:
1. **User Authentication**: Add Firebase/Auth0
2. **Database Storage**: Replace file system
3. **Plagiarism Detection**: Compare submissions
4. **Code Hints**: AI-powered suggestions

### Advanced Features:
1. **Real-time Collaboration**: Multi-user editing
2. **Video Tutorials**: Embedded lessons
3. **Leaderboards**: Competitive element
4. **Analytics Dashboard**: Teacher insights

## Comparison with Alternatives

| Feature | Streamlit IDE | Jupyter | CodeHS | Repl.it |
|---------|--------------|---------|---------|---------|
| Setup Time | < 5 min | ~10 min | Sign up | Sign up |
| Auto-Grading | ✅ Built-in | ❌ Manual | ✅ Yes | ⚠️ Limited |
| Customizable | ✅ JSON | ⚠️ Limited | ❌ No | ⚠️ Limited |
| Self-Hosted | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Cost | 🆓 Free | 🆓 Free | 💰 Paid | 💰 Freemium |
| Python Only | ✅ Pure Python | ⚠️ + JS | ✅ Yes | ❌ Multiple |

## Best Practices

### For Students:
1. 📖 Read the assignment description
2. 💡 Use the hints when stuck
3. ▶️ Test frequently with "Run Code"
4. 🎯 Grade only when confident
5. 💾 Save your work regularly

### For Teachers:
1. 📝 Start with beginner assignments
2. 📊 Review saved submissions weekly
3. ✏️ Customize tests for your needs
4. 💬 Provide feedback on custom tests
5. 🔄 Update assignments based on results

### For Admins:
1. 🔒 Run on local network for security
2. 📦 Backup student_submissions/ regularly
3. 🔧 Monitor system resources
4. 📈 Track usage patterns
5. 🆙 Keep Streamlit updated

## Maintenance

### Weekly:
- Check `student_submissions/` size
- Review error logs
- Update assignments if needed

### Monthly:
- Update Streamlit: `pip install --upgrade streamlit`
- Backup all student submissions
- Review test effectiveness

### Semester:
- Archive old submissions
- Create new assignments
- Gather student feedback
- Update documentation

---

**This architecture is designed to be:**
- 🚀 Fast to deploy
- 🎓 Easy to learn
- 🔧 Simple to customize
- 🛡️ Safe to use
- 📊 Effective for teaching

Built with ❤️ for Python Education

# 🐍 Streamlit IDE - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

```powershell
# Navigate to project
cd C:\Users\ISNPS\codewithmorais

# Install (one time only)
python -m pip install streamlit watchdog

# Run the IDE
python -m streamlit run streamlit_ide.py
```

**Or just double-click:** `run-ide.bat`

---

## 📖 Student Workflow

1. **Select Assignment** → Dropdown in sidebar
2. **Load Starter Code** → Button in sidebar  
3. **Write Code** → Type in left panel
4. **Run Code** → ▶️ button to test
5. **Grade** → 🎯 button for score
6. **Save** → 💾 button to keep work

---

## 🎯 Assignment List

| Assignment | Difficulty | Time | Focus |
|------------|-----------|------|-------|
| File I/O Basics | 🟢 Beginner | 15 min | Read/Write basics |
| High Score Manager | 🟡 Intermediate | 20 min | Number storage |
| Message Logger | 🟡 Intermediate | 25 min | Append & timestamps |
| Student Grade Book | 🔴 Advanced | 30 min | CSV parsing |
| Config Manager | 🔴 Advanced | 35 min | Key-value storage |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + Enter` | Run current cell/code |
| `R` | Reload/rerun application |
| `Ctrl + S` | Save (browser default) |
| `Ctrl + C` | Copy selected code |
| `Ctrl + V` | Paste code |

**In Terminal:**
| Key | Action |
|-----|--------|
| `Ctrl + C` | Stop the server |

---

## 🎨 UI Elements Guide

### Sidebar (Left)
```
📚 Assignments
   └─ Dropdown selector
   └─ Description shown below

🔘 Buttons
   ├─ 📖 Load Starter Code
   ├─ 🗑️ Clear Editor
   
📊 Quick Stats
   └─ Latest score display
   └─ Performance indicator
```

### Main Area (Right)
```
📝 Code Editor (Top)
   └─ Write your Python code here

🔘 Action Buttons
   ├─ ▶️ Run Code (test it)
   ├─ 🎯 Grade Assignment (get score)
   └─ 💾 Save Code (download)

📊 Results (Bottom)
   ├─ Test results (pass/fail)
   ├─ Program output
   └─ Error messages
```

---

## ✅ Test Result Icons

| Icon | Meaning |
|------|---------|
| ✅ | Test passed - you got points! |
| ❌ | Test failed - needs fixing |
| 🎉 | Perfect score! All tests passed! |
| ⚠️ | Warning - check the error message |

---

## 🏆 Scoring System

| Score | Grade | Display |
|-------|-------|---------|
| 90-100% | Excellent | 🏆 Green banner |
| 70-89% | Good | 👍 Blue banner |
| 50-69% | Okay | 📈 Yellow banner |
| 0-49% | Keep trying | 💪 Orange banner |

---

## 💡 Common Patterns

### Save to File
```python
with open("filename.txt", "w") as f:
    f.write("Your text here")
```

### Read from File
```python
with open("filename.txt", "r") as f:
    content = f.read()
```

### Append to File
```python
with open("filename.txt", "a") as f:
    f.write("More text\n")
```

### Handle Missing File
```python
try:
    with open("file.txt", "r") as f:
        data = f.read()
except FileNotFoundError:
    data = "default value"
```

### Save Numbers
```python
score = 1500
with open("score.txt", "w") as f:
    f.write(str(score))  # Convert to string!
```

### Read Numbers
```python
with open("score.txt", "r") as f:
    score = int(f.read())  # Convert to int!
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Streamlit not found" | Run: `python -m pip install streamlit` |
| "Port already in use" | Close other instances or use `--server.port 8502` |
| Code won't run | Check for syntax errors (red text) |
| Tests fail | Read error message - it tells you what's wrong |
| Can't save file | Check `student_submissions/` folder exists |
| Browser won't open | Go to `http://localhost:8501` manually |

---

## 📁 File Locations

| Item | Location |
|------|----------|
| Main app | `streamlit_ide.py` |
| Assignments | `assignments.json` |
| Student work | `student_submissions/` |
| Docs | `STREAMLIT_IDE_README.md` |
| Setup help | `SETUP_GUIDE.md` |

---

## 🔧 Teacher Tools

### View All Submissions
```powershell
cd student_submissions
dir
```

### Edit Assignments
```powershell
notepad assignments.json
```

### Run on Network (Classroom)
```powershell
python -m streamlit run streamlit_ide.py --server.address 0.0.0.0
```
Students access at: `http://[YOUR-IP]:8501`

### Change Port
```powershell
python -m streamlit run streamlit_ide.py --server.port 9000
```

---

## 📝 Assignment Structure

```json
{
  "Assignment Name": {
    "description": "What students learn",
    "difficulty": "Beginner",
    "starter_code": "# Your template",
    "hints": ["Hint 1", "Hint 2"],
    "tests": [
      {
        "name": "Test description",
        "type": "function_exists",
        "function": "function_name",
        "points": 25
      }
    ]
  }
}
```

---

## 🎓 Teaching Tips

1. **Start Simple**: Begin with "File I/O Basics"
2. **Live Demo**: Show it working before students try
3. **Encourage Testing**: Tell students to use "Run Code" often
4. **Review Errors**: Error messages are learning opportunities
5. **Celebrate Success**: Point out the 🎉 when they get 100%

---

## 💾 Backup Strategy

```powershell
# Backup student work
xcopy student_submissions backup\%date% /E /I

# Or compress it
Compress-Archive -Path student_submissions -DestinationPath backup_submissions.zip
```

---

## 🌐 URLs to Know

| Purpose | URL |
|---------|-----|
| Local IDE | `http://localhost:8501` |
| Streamlit Docs | `https://docs.streamlit.io` |
| Python Docs | `https://docs.python.org/3/` |

---

## 📞 Getting Help

1. **Check terminal** for error messages
2. **Read the error** - it usually tells you what's wrong
3. **Review docs** in `STREAMLIT_IDE_README.md`
4. **Check setup** in `SETUP_GUIDE.md`
5. **View architecture** in `STREAMLIT_ARCHITECTURE.md`

---

## ✨ Pro Tips

- 💡 Use hints when stuck
- 🔄 Save often with 💾 button
- 📖 Read error messages carefully
- 🎯 Test before grading
- 📝 Comment your code
- 🚀 Start with easiest assignment

---

## 🎯 Success Metrics

**You're doing it right if:**
- ✅ Students can load and run code
- ✅ Tests provide clear feedback
- ✅ Scores make sense
- ✅ Errors are helpful, not scary
- ✅ Students learn from mistakes
- ✅ Code saves successfully

---

## 📊 Quick Stats

- **Assignments**: 5 included (easy to add more)
- **Test Types**: 6 different types
- **Points**: 100 per assignment
- **Setup Time**: < 5 minutes
- **Learning Curve**: Minimal
- **Cost**: $0 (totally free)

---

## 🔄 Update Commands

```powershell
# Update Streamlit
python -m pip install --upgrade streamlit

# Update all dependencies
python -m pip install --upgrade -r requirements.txt

# Check versions
python -m streamlit --version
```

---

## 🎨 Customization Quick Wins

### Change Colors
Edit CSS in `streamlit_ide.py` (lines 23-70)

### Add Assignment
Edit `assignments.json` - copy existing format

### Change Port
Add to run command: `--server.port 9000`

### Add Logo
Use `st.image("logo.png")` in sidebar

---

**Print this page and keep it handy! 📄**

---

Built with ❤️ for Python Education | 🐍 Happy Coding! 🐍

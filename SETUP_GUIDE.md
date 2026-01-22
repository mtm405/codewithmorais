# 🚀 Streamlit IDE Setup Guide

## Prerequisites Check

Before starting, you need Python installed. Let's verify:

### Check Python Installation

Open PowerShell and run:
```powershell
python --version
```

Or try:
```powershell
python3 --version
```

Or:
```powershell
py --version
```

**You should see something like:** `Python 3.8.0` or higher

### If Python is Not Installed

1. Download Python from: https://www.python.org/downloads/
2. **Important**: Check "Add Python to PATH" during installation
3. Restart your terminal after installation

---

## Installation Steps

### Step 1: Navigate to Project Directory

```powershell
cd C:\Users\ISNPS\codewithmorais
```

### Step 2: Install Dependencies

Try these commands in order until one works:

```powershell
# Option 1
python -m pip install streamlit watchdog

# Option 2
python3 -m pip install streamlit watchdog

# Option 3
py -m pip install streamlit watchdog

# Option 4 (if you have pip directly)
pip install streamlit watchdog
```

### Step 3: Verify Installation

```powershell
python -m streamlit --version
```

You should see: `Streamlit, version X.X.X`

---

## Running the IDE

### Method 1: PowerShell Script (Easiest)

```powershell
.\run-ide.ps1
```

### Method 2: Batch File

```cmd
run-ide.bat
```

### Method 3: Direct Command

```powershell
python -m streamlit run streamlit_ide.py
```

### Method 4: Alternative Python Command

```powershell
python3 -m streamlit run streamlit_ide.py
# or
py -m streamlit run streamlit_ide.py
```

---

## What Happens When You Run It?

1. ✅ Dependencies are checked/installed automatically
2. 📁 `student_submissions/` folder is created
3. 🌐 Browser opens automatically to `http://localhost:8501`
4. 🎨 You'll see the IDE interface

---

## Using the IDE

### For Students:

1. **Select Assignment** from the sidebar dropdown
2. Click **"Load Starter Code"** button
3. **Write your solution** in the code editor
4. Click **"▶️ Run Code"** to test
5. Click **"🎯 Grade Assignment"** for feedback
6. Click **"💾 Save Code"** to save your work

### For Teachers:

- Review student scores in real-time
- Check saved submissions in `student_submissions/` folder
- Edit `assignments.json` to customize assignments
- Add new test cases as needed

---

## Troubleshooting

### Problem: "Python not found"

**Solution:**
1. Install Python from https://www.python.org/
2. Make sure "Add to PATH" is checked
3. Restart your terminal
4. Try again

### Problem: "streamlit not found"

**Solution:**
```powershell
python -m pip install --upgrade streamlit
```

### Problem: "Port already in use"

**Solution:**
```powershell
python -m streamlit run streamlit_ide.py --server.port 8502
```

### Problem: "Permission denied" on PowerShell script

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running the script again.

### Problem: Browser doesn't open automatically

**Solution:**
Manually open your browser and go to:
```
http://localhost:8501
```

### Problem: Code changes not showing

**Solution:**
- Press **R** in the browser to reload
- Or click the hamburger menu (≡) → "Rerun"
- Or use Ctrl+C in terminal and restart

---

## Quick Test

To test if everything is working:

1. Run the IDE with any method above
2. Select "File I/O Basics" from sidebar
3. Click "Load Starter Code"
4. Click "▶️ Run Code"
5. You should see some output (even if it's errors - that's expected for incomplete code!)

---

## Features Overview

### ✅ What Works:

- ✨ **Real Python Execution** - Not simulation, actual Python!
- 🎯 **Auto-Grading** - Instant feedback on your code
- 💾 **Save Progress** - Download or save your solutions
- 📊 **Visual Feedback** - See your score and what passed/failed
- 🔄 **Hot Reload** - Changes update automatically
- 📝 **5 Assignments** - From beginner to advanced
- 🎨 **Beautiful UI** - Clean, modern interface
- 🛡️ **Safe Execution** - Isolated code execution

### 📦 Assignments Included:

1. **File I/O Basics** - Learn reading & writing
2. **High Score Manager** - Track game scores
3. **Message Logger** - Build a logging system
4. **Student Grade Book** - Manage student data
5. **Configuration Manager** - Save app settings

---

## Advanced Usage

### Run on Local Network (For Classrooms)

```powershell
python -m streamlit run streamlit_ide.py --server.address 0.0.0.0
```

Students can access at: `http://[YOUR-IP]:8501`

### Debug Mode

```powershell
python -m streamlit run streamlit_ide.py --logger.level=debug
```

### Different Port

```powershell
python -m streamlit run streamlit_ide.py --server.port 9000
```

---

## File Structure

```
codewithmorais/
│
├── streamlit_ide.py              # Main application
├── assignments.json              # Assignment configurations
├── run-ide.ps1                   # PowerShell launcher
├── run-ide.bat                   # Windows batch launcher
├── requirements.txt              # Python dependencies
├── STREAMLIT_IDE_README.md       # Full documentation
└── SETUP_GUIDE.md               # This file!
│
└── student_submissions/          # Saved student code (auto-created)
    ├── file_io_basics_20251027_143022.py
    ├── high_score_manager_20251027_143155.py
    └── ...
```

---

## Integration with Your Course

This IDE is designed to work with your existing course materials:

1. Students read the lesson in `public/io.html`
2. They practice in the Streamlit IDE
3. Get instant auto-graded feedback
4. Save their completed assignments
5. You review saved submissions

---

## Next Steps

1. ✅ Get the IDE running (use methods above)
2. 📚 Try the "File I/O Basics" assignment yourself
3. 🎓 Share with students
4. 📊 Monitor their progress in `student_submissions/`
5. ✏️ Customize assignments in `assignments.json`

---

## Getting Help

- 📖 Read the full documentation: `STREAMLIT_IDE_README.md`
- 🌐 Streamlit docs: https://docs.streamlit.io
- 🐛 Check the terminal for error messages
- 💡 Most issues are solved by reinstalling dependencies

---

## Quick Command Reference

```powershell
# Install dependencies
python -m pip install -r requirements.txt

# Run the IDE
python -m streamlit run streamlit_ide.py

# Update Streamlit
python -m pip install --upgrade streamlit

# Check version
python -m streamlit --version

# Clear cache
python -m streamlit cache clear
```

---

## Success Checklist

- [ ] Python is installed and in PATH
- [ ] Streamlit is installed (`streamlit --version` works)
- [ ] You can run `streamlit_ide.py`
- [ ] Browser opens to the IDE
- [ ] You can select and load an assignment
- [ ] Code editor works
- [ ] "Run Code" button executes Python
- [ ] "Grade Assignment" shows test results
- [ ] "Save Code" creates file in `student_submissions/`

---

**🎉 You're all set! Happy coding!**

Need help? Check the terminal output for specific error messages.

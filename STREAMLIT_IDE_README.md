# Streamlit Python IDE - README

## 🐍 Interactive Python IDE with Auto-Grading

A comprehensive Streamlit-based IDE designed for teaching Python File I/O concepts with real-time code execution and automated grading.

### ✨ Features

- **Real-time Code Editor**: Write and test Python code directly in the browser
- **Instant Execution**: Run Python code and see output immediately
- **Auto-Grading System**: Automated test suite that grades student submissions
- **Multiple Assignments**: Pre-configured assignments from beginner to advanced
- **Progress Tracking**: Visual feedback on scores and test results
- **Code Persistence**: Save student submissions with timestamps
- **Error Handling**: Clear error messages and debugging support
- **No JavaScript Required**: Pure Python solution using Streamlit

### 🚀 Quick Start

#### Option 1: PowerShell (Recommended for Windows)
```powershell
.\run-ide.ps1
```

#### Option 2: Command Prompt
```cmd
run-ide.bat
```

#### Option 3: Manual Start
```bash
pip install -r requirements.txt
streamlit run streamlit_ide.py
```

The IDE will automatically open in your default web browser at `http://localhost:8501`

### 📚 Assignments Included

1. **File I/O Basics** (Beginner)
   - Learn to read and write files
   - Use the `with` statement
   - Handle basic file operations

2. **High Score Manager** (Intermediate)
   - Implement a high score tracking system
   - Handle file reading/writing with numbers
   - Manage error handling for missing files

3. **Message Logger** (Intermediate)
   - Build a timestamped logging system
   - Use append mode
   - Work with datetime formatting

4. **Student Grade Book** (Advanced)
   - Create a CSV-based grade management system
   - Parse structured data from files
   - Calculate statistics from stored data

5. **Configuration Manager** (Advanced)
   - Build a settings management system
   - Implement key=value storage
   - Update individual settings without data loss

### 🎯 How to Use

#### For Students:

1. **Select Assignment**: Choose from the sidebar
2. **Load Starter Code**: Click to get the template
3. **Write Your Solution**: Complete the TODO sections
4. **Run Code**: Test your solution
5. **Grade Assignment**: Get instant feedback
6. **Save Work**: Download or save your code

#### For Teachers:

1. **Monitor Progress**: View student scores in real-time
2. **Customize Assignments**: Edit `assignments.json`
3. **Review Submissions**: Check saved files in `student_submissions/`
4. **Add New Tests**: Extend the grading system

### 📂 Project Structure

```
codewithmorais/
├── streamlit_ide.py          # Main IDE application
├── assignments.json          # Assignment configurations and tests
├── run-ide.ps1              # PowerShell launcher
├── run-ide.bat              # Batch file launcher
├── requirements.txt         # Python dependencies
└── student_submissions/     # Saved student code (auto-created)
```

### 🔧 Configuration

#### Adding New Assignments

Edit `assignments.json`:

```json
{
  "Your Assignment Name": {
    "description": "What students will learn",
    "difficulty": "Beginner|Intermediate|Advanced",
    "estimated_time": "15-20 minutes",
    "starter_code": "# Your template code here",
    "hints": [
      "Helpful hint 1",
      "Helpful hint 2"
    ],
    "tests": [
      {
        "name": "Test description",
        "type": "function_exists|file_write|file_read|custom",
        "function": "function_name",
        "points": 25
      }
    ]
  }
}
```

#### Test Types Available

- `function_exists`: Checks if a function is defined
- `file_write`: Tests file writing functionality
- `file_read`: Tests file reading functionality
- `function_call`: Tests function with expected return value
- `custom`: Manual grading (shows as passed for teacher review)

### 🎨 Customization

#### Modify UI Theme

Edit the CSS in `streamlit_ide.py` (lines 23-70)

#### Change Port

```bash
streamlit run streamlit_ide.py --server.port 8080
```

#### Enable Password Protection

```bash
streamlit run streamlit_ide.py --server.enableCORS false --server.enableXsrfProtection true
```

### 📊 Grading System

The auto-grading system:
- ✅ Runs tests in isolated environment
- ✅ Captures output and errors
- ✅ Awards points based on test results
- ✅ Provides detailed feedback
- ✅ Shows percentage scores
- ✅ Prevents cheating with dynamic tests

### 🛡️ Security Features

- **Isolated Execution**: Code runs in temporary files
- **Cleanup**: Auto-removes test files after grading
- **No Persistent State**: Each run is independent
- **Safe File Operations**: Limited to working directory

### 🐛 Troubleshooting

#### "Streamlit not found"
```bash
pip install streamlit
```

#### "Module not found" errors
```bash
pip install -r requirements.txt --upgrade
```

#### Port already in use
```bash
streamlit run streamlit_ide.py --server.port 8502
```

#### Code not updating
- Click "Clear Editor" button
- Refresh the browser page
- Or press 'R' in the browser

### 📝 Best Practices

#### For Students:
- Test frequently with "Run Code"
- Read error messages carefully
- Use hints when stuck
- Save your work regularly

#### For Teachers:
- Review custom-graded tests manually
- Check `student_submissions/` for saved work
- Update assignments based on student feedback
- Add more test cases as needed

### 🔄 Development

#### Watch Mode (Auto-reload on file changes)
```bash
streamlit run streamlit_ide.py
```
Streamlit automatically watches for file changes!

#### Debug Mode
```bash
streamlit run streamlit_ide.py --logger.level=debug
```

### 🌐 Deployment Options

#### Local Network (Classroom)
```bash
streamlit run streamlit_ide.py --server.address 0.0.0.0
```

#### Streamlit Cloud (Free)
1. Push to GitHub
2. Visit [share.streamlit.io](https://share.streamlit.io)
3. Deploy from repository

#### Docker (Coming Soon)
```bash
docker build -t python-ide .
docker run -p 8501:8501 python-ide
```

### 📖 Integration with Course Materials

This IDE complements the `io.html` lesson file in the `public/` directory:

1. Students read the lesson in `io.html`
2. Practice concepts in the Streamlit IDE
3. Get instant feedback and grading
4. Submit completed work

### 🤝 Contributing

To add new features:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

### 📄 License

This project is part of the Code with Morais educational platform.

### 🆘 Support

- Check console output for errors
- Review the Streamlit documentation: [docs.streamlit.io](https://docs.streamlit.io)
- Submit issues on GitHub

### 🎓 Educational Philosophy

This IDE emphasizes:
- **Immediate Feedback**: Learn by doing
- **Progressive Difficulty**: Start simple, build complexity
- **Real Python**: Not simulations, actual Python execution
- **Practical Skills**: Real-world file operations
- **Safe Environment**: Mistakes are okay

---

**Built with ❤️ for Python Education**

🐍 Happy Coding! 🐍

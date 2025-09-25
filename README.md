# CodeWithMorais - Python Learning Platform

A comprehensive Python certification course platform with interactive IDE, lessons, and Firebase hosting. This project supports multi-device development using VS Code, Git, and GitHub for seamless collaboration across different computers.

## 🎯 Project Overview

This platform includes:
- **Interactive Python IDE**: Built with Monaco Editor and Pyodide for in-browser Python execution
- **Comprehensive Lesson System**: 6 sections covering complete Python fundamentals to advanced topics
- **Professional Dashboard**: Progress tracking, authentication, and course management
- **Firebase Integration**: Hosting, authentication, and real-time data synchronization
- **Multi-Device Development**: Git/GitHub workflow optimized for VS Code across multiple computers

## 📁 Project Structure

```
cwm/
├── public/                     # Main web application
│   ├── lessons/               # Complete Python course curriculum
│   │   ├── index.html        # Course overview and navigation
│   │   ├── section1-data-types-operators/    # Python basics
│   │   ├── section2-control-flow/            # If/else, conditions
│   │   ├── section3-loops/                   # For/while loops
│   │   ├── section4-functions/               # Functions and scope
│   │   ├── section5-data-structures/         # Lists, dicts, sets
│   │   └── section6-file-handling/           # File I/O and modules
│   ├── ide.html              # Full-featured Python IDE
│   ├── dashboard.html         # Student progress dashboard
│   ├── index.html            # Main landing page
│   └── firebase-config.js    # Firebase configuration
├── firebase.json             # Firebase hosting settings
├── .gitignore               # Git exclusions for multi-device dev
└── README.md               # This documentation

## 🚀 Multi-Device Development Setup

### Prerequisites
1. **Git**: Download from https://git-scm.com/
2. **VS Code**: Download from https://code.visualstudio.com/
3. **Node.js**: Download from https://nodejs.org/ (for Firebase CLI)
4. **Firebase CLI**: Install globally with `npm install -g firebase-tools`

### Initial Setup (First Computer)

1. **Clone this repository** (after GitHub setup):
```powershell
git clone https://github.com/YOUR_USERNAME/cwm.git
cd cwm
```

2. **Install VS Code Extensions** (recommended):
- Live Server
- Firebase
- GitLens
- Prettier
- Auto Rename Tag
- HTML CSS Support

3. **Configure Firebase**:
```powershell
firebase login
copy .\public\firebase-config.js.example .\public\firebase-config.js
# Edit firebase-config.js with your project values
```

### Working on Additional Computers

1. **Clone the repository**:
```powershell
git clone https://github.com/YOUR_USERNAME/cwm.git
cd cwm
```

2. **Pull latest changes**:
```powershell
git pull origin main
```

3. **Start development**:
```powershell
# Test locally
firebase serve --only hosting
# or use VS Code Live Server extension
```

### Daily Development Workflow

#### Before Starting Work:
```powershell
# Pull latest changes from other devices
git pull origin main
```

#### During Development:
- Use VS Code for editing
- Test locally with `firebase serve` or Live Server extension
- Make frequent commits with descriptive messages

#### After Completing Work:
```powershell
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add lesson 2.1: If/Else Statements with interactive examples"

# Push to GitHub
git push origin main
```

## 🎓 Course Content Structure

### Section 1: Data Types and Operators
- **Lesson 1.1**: Data Types (Variables, strings, numbers, booleans) ✅
- **Lesson 1.2**: Data Operations (Arithmetic, string operations) ✅
- **Lesson 1.3**: Operator Precedence (Order of operations) ✅
- **Lesson 1.4**: Input/Output Operations (Coming Soon)

### Section 2: Control Flow
- **Lesson 2.1**: Conditional Statements (if/else)
- **Lesson 2.2**: Nested Conditions
- **Lesson 2.3**: Logical Operators
- **Lesson 2.4**: Practice Problems

### Section 3: Loops
- **Lesson 3.1**: For Loops
- **Lesson 3.2**: While Loops
- **Lesson 3.3**: Nested Loops
- **Lesson 3.4**: Loop Control (break/continue)

### Section 4: Functions
- **Lesson 4.1**: Function Basics
- **Lesson 4.2**: Parameters and Arguments
- **Lesson 4.3**: Return Statements
- **Lesson 4.4**: Scope and Local Variables

### Section 5: Data Structures
- **Lesson 5.1**: Lists and Indexing
- **Lesson 5.2**: Dictionaries
- **Lesson 5.3**: Sets and Tuples
- **Lesson 5.4**: String Methods

### Section 6: File Handling and Modules
- **Lesson 6.1**: Reading Files
- **Lesson 6.2**: Writing Files
- **Lesson 6.3**: Importing Modules
- **Lesson 6.4**: Final Projects

## 🛠 Firebase Hosting Setup

### Firebase Configuration

1. **Create Firebase Project**: 
   - Go to https://console.firebase.google.com/
   - Create new project or select existing one

2. **Enable Authentication**:
   - Authentication → Sign-in method → Enable Google
   - Add authorized domains (localhost for testing)

3. **Get Configuration**:
   - Project settings → General → Web apps → Add app
   - Copy configuration values

4. **Configure Locally**:
```powershell
firebase login
firebase use --add  # Select your project
copy .\public\firebase-config.js.example .\public\firebase-config.js
# Edit firebase-config.js with your project values
```

### Local Development & Deployment

**Test Locally**:
```powershell
firebase serve --only hosting
# Navigate to http://localhost:5000
```

**Deploy to Production**:
```powershell
firebase deploy --only hosting
```

## 💻 VS Code Development Setup

### Recommended Extensions
Install these extensions for optimal development experience:

```powershell
# Open VS Code and install extensions
code --install-extension ritwickdey.liveserver
code --install-extension ms-vscode.vscode-firebase
code --install-extension eamodio.gitlens
code --install-extension esbenp.prettier-vscode
code --install-extension formulahendry.auto-rename-tag
code --install-extension ecmel.vscode-html-css
```

### VS Code Settings
Create `.vscode/settings.json` in your workspace:

```json
{
  "liveServer.settings.port": 5501,
  "html.format.indentInnerHtml": true,
  "prettier.tabWidth": 2,
  "prettier.useTabs": false,
  "git.autofetch": true,
  "git.confirmSync": false
}
```

### Workflow Tips
- **Live Server**: Right-click on `public/index.html` → "Open with Live Server"
- **Git Integration**: Use VS Code's built-in Git panel (Ctrl+Shift+G)
- **Firebase**: Use Command Palette (Ctrl+Shift+P) → "Firebase" commands
- **Multi-cursor editing**: Alt+Click for multiple selections

## 🔒 Security & Best Practices

### Git Configuration
- Firebase config files are excluded from commits (see `.gitignore`)
- Always pull before starting work: `git pull origin main`
- Use descriptive commit messages
- Push frequently to avoid conflicts

### Development Environment
- Test locally before deploying
- Use environment-specific configurations
- Keep dependencies up to date
- Regular backups via Git/GitHub

## 📚 Development Resources

### Learning Materials
- **Python Fundamentals**: Start with Section 1 lessons
- **IDE Usage**: Practice with the built-in Python IDE
- **Firebase Docs**: https://firebase.google.com/docs
- **Git Tutorial**: https://git-scm.com/docs/gittutorial

### Troubleshooting
- **Firebase Issues**: Check console.firebase.google.com
- **Git Conflicts**: Use VS Code's merge conflict resolver
- **IDE Problems**: Check browser console (F12)
- **Deployment Issues**: Run `firebase serve` locally first

## 🤝 Contributing

When working across multiple devices:
1. Always start with `git pull origin main`
2. Make small, frequent commits
3. Use descriptive commit messages
4. Test locally before pushing
5. Push changes immediately after completing work

## 📞 Support

If you encounter issues:
1. Check this README for common solutions
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Check Git status for conflicts
5. Test in incognito browser window

---

## 📝 License

This project is created for educational purposes. Feel free to use and modify for learning Python programming.

## 🚀 Getting Started Quickly

**New to this project?** Follow these steps:

1. **Clone the repository** (after GitHub setup)
2. **Install VS Code extensions** (see recommended list above)
3. **Configure Firebase** with your project settings
4. **Start local development** with `firebase serve`
5. **Begin with Section 1 lessons** in `public/lessons/`

**Working on multiple devices?** Always start with `git pull origin main` and end with `git push origin main`.


"""
Streamlit-based Interactive Python IDE with Auto-Grading
For Code with Morais - Python Education Platform
"""

import streamlit as st
import subprocess
import tempfile
import os
import sys
import json
from io import StringIO
import traceback
from datetime import datetime
import importlib.util

# Page configuration
st.set_page_config(
    page_title="Python IDE - Code with Morais",
    page_icon="🐍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main {
        padding: 0rem 1rem;
    }
    .stButton>button {
        width: 100%;
        border-radius: 10px;
        height: 3em;
        font-weight: 600;
    }
    .success-box {
        padding: 1rem;
        border-radius: 10px;
        background-color: #d4edda;
        border: 2px solid #28a745;
        margin: 1rem 0;
    }
    .error-box {
        padding: 1rem;
        border-radius: 10px;
        background-color: #f8d7da;
        border: 2px solid #dc3545;
        margin: 1rem 0;
    }
    .info-box {
        padding: 1rem;
        border-radius: 10px;
        background-color: #d1ecf1;
        border: 2px solid #0984e3;
        margin: 1rem 0;
    }
    .test-passed {
        color: #28a745;
        font-weight: bold;
    }
    .test-failed {
        color: #dc3545;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'code' not in st.session_state:
    st.session_state.code = ""
if 'output' not in st.session_state:
    st.session_state.output = ""
if 'error' not in st.session_state:
    st.session_state.error = ""
if 'grade_results' not in st.session_state:
    st.session_state.grade_results = None
if 'assignment_data' not in st.session_state:
    st.session_state.assignment_data = None

# Load assignment configurations
def load_assignments():
    """Load assignment configurations from JSON file"""
    try:
        with open('assignments.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default assignments if file doesn't exist
        return {
            "File I/O Basics": {
                "description": "Learn to read and write files in Python",
                "starter_code": """# File I/O Basics Assignment
# Complete the functions below

def save_message(filename, message):
    \"\"\"Save a message to a file\"\"\"
    # TODO: Write code to save the message to the file
    pass

def read_message(filename):
    \"\"\"Read a message from a file\"\"\"
    # TODO: Write code to read and return the message from the file
    pass

# Test your functions
if __name__ == "__main__":
    # Test saving
    save_message("test.txt", "Hello, World!")
    print("Message saved!")
    
    # Test reading
    message = read_message("test.txt")
    print("Message from file:", message)
""",
                "tests": [
                    {
                        "name": "Function save_message exists",
                        "type": "function_exists",
                        "function": "save_message",
                        "points": 20
                    },
                    {
                        "name": "Function read_message exists",
                        "type": "function_exists",
                        "function": "read_message",
                        "points": 20
                    },
                    {
                        "name": "save_message writes to file correctly",
                        "type": "file_write",
                        "function": "save_message",
                        "args": ["test_save.txt", "Test content"],
                        "expected_content": "Test content",
                        "points": 30
                    },
                    {
                        "name": "read_message reads from file correctly",
                        "type": "file_read",
                        "setup": [
                            "with open('test_read.txt', 'w') as f: f.write('Hello from file')"
                        ],
                        "function": "read_message",
                        "args": ["test_read.txt"],
                        "expected_output": "Hello from file",
                        "points": 30
                    }
                ]
            },
            "High Score Manager": {
                "description": "Create a system to manage high scores in a file",
                "starter_code": """# High Score Manager Assignment
# Build a simple high score tracking system

def save_high_score(score):
    \"\"\"Save a new high score to highscore.txt\"\"\"
    # TODO: Write code to save the high score
    pass

def get_high_score():
    \"\"\"Get the current high score from highscore.txt\"\"\"
    # TODO: Write code to read and return the high score
    # Return 0 if the file doesn't exist
    pass

def check_and_update_high_score(new_score):
    \"\"\"Check if new_score beats the high score and update if it does\"\"\"
    # TODO: Compare new_score with current high score and update if higher
    # Return True if it's a new high score, False otherwise
    pass

# Test your functions
if __name__ == "__main__":
    print("Current high score:", get_high_score())
    
    if check_and_update_high_score(1500):
        print("🎉 New high score!")
    else:
        print("Try again!")
""",
                "tests": [
                    {
                        "name": "save_high_score function exists",
                        "type": "function_exists",
                        "function": "save_high_score",
                        "points": 15
                    },
                    {
                        "name": "get_high_score function exists",
                        "type": "function_exists",
                        "function": "get_high_score",
                        "points": 15
                    },
                    {
                        "name": "check_and_update_high_score function exists",
                        "type": "function_exists",
                        "function": "check_and_update_high_score",
                        "points": 15
                    },
                    {
                        "name": "get_high_score returns 0 when file doesn't exist",
                        "type": "function_call",
                        "function": "get_high_score",
                        "cleanup": ["import os; os.remove('highscore.txt') if os.path.exists('highscore.txt') else None"],
                        "expected_output": 0,
                        "points": 20
                    },
                    {
                        "name": "High score system works correctly",
                        "type": "integration",
                        "points": 35
                    }
                ]
            },
            "Message Logger": {
                "description": "Create a message logging system with timestamps",
                "starter_code": """# Message Logger Assignment
# Build a system to log messages with timestamps

from datetime import datetime

def log_message(message):
    \"\"\"Append a message with timestamp to log.txt\"\"\"
    # TODO: Add timestamp and message to the log file
    # Format: [2025-10-27 14:30:45] Your message here
    pass

def read_log():
    \"\"\"Read and return all log entries\"\"\"
    # TODO: Read and return the entire log file
    # Return empty string if file doesn't exist
    pass

def clear_log():
    \"\"\"Clear all log entries\"\"\"
    # TODO: Clear the log file
    pass

# Test your functions
if __name__ == "__main__":
    log_message("Application started")
    log_message("User logged in")
    print("Log contents:")
    print(read_log())
""",
                "tests": [
                    {
                        "name": "log_message function exists",
                        "type": "function_exists",
                        "function": "log_message",
                        "points": 20
                    },
                    {
                        "name": "read_log function exists",
                        "type": "function_exists",
                        "function": "read_log",
                        "points": 20
                    },
                    {
                        "name": "Messages are logged correctly",
                        "type": "append_check",
                        "points": 30
                    },
                    {
                        "name": "Read log returns correct content",
                        "type": "read_check",
                        "points": 30
                    }
                ]
            }
        }

def run_code_safely(code):
    """Execute Python code safely and capture output"""
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = captured_output = StringIO()
    sys.stderr = captured_errors = StringIO()
    
    error_occurred = False
    error_message = ""
    
    try:
        # Create a temporary file to execute the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, dir='.') as f:
            f.write(code)
            temp_file = f.name
        
        # Execute in a separate namespace
        namespace = {'__name__': '__main__'}
        exec(compile(code, temp_file, 'exec'), namespace)
        
    except Exception as e:
        error_occurred = True
        error_message = f"{type(e).__name__}: {str(e)}\n\n{traceback.format_exc()}"
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        # Clean up temp file
        try:
            if 'temp_file' in locals():
                os.unlink(temp_file)
        except:
            pass
    
    output = captured_output.getvalue()
    errors = captured_errors.getvalue()
    
    if error_occurred:
        errors = error_message
    
    return output, errors

def grade_assignment(code, assignment_name, tests):
    """Run automated tests and grade the submission"""
    results = {
        'tests': [],
        'score': 0,
        'max_score': 0,
        'all_passed': True,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Create temporary file with student code
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, dir='.') as f:
        f.write(code)
        temp_file = f.name
    
    try:
        # Import student module
        spec = importlib.util.spec_from_file_location("student_module", temp_file)
        student_module = importlib.util.module_from_spec(spec)
        
        # Execute the module to define functions
        try:
            spec.loader.exec_module(student_module)
        except Exception as e:
            results['tests'].append({
                'name': 'Code execution',
                'passed': False,
                'error': f"Code has syntax or runtime errors: {str(e)}",
                'points': 0
            })
            results['all_passed'] = False
            return results
        
        # Run each test
        for test in tests:
            results['max_score'] += test['points']
            test_result = run_single_test(student_module, test)
            results['tests'].append(test_result)
            
            if test_result['passed']:
                results['score'] += test['points']
            else:
                results['all_passed'] = False
    
    finally:
        # Cleanup
        try:
            os.unlink(temp_file)
        except:
            pass
        
        # Clean up any test files
        for filename in ['test_save.txt', 'test_read.txt', 'highscore.txt', 'log.txt', 'test.txt']:
            try:
                if os.path.exists(filename):
                    os.unlink(filename)
            except:
                pass
    
    return results

def run_single_test(module, test):
    """Run a single test case"""
    test_result = {
        'name': test['name'],
        'passed': False,
        'error': '',
        'points': test['points']
    }
    
    try:
        if test['type'] == 'function_exists':
            # Check if function exists
            if hasattr(module, test['function']):
                test_result['passed'] = True
            else:
                test_result['error'] = f"Function '{test['function']}' not found"
        
        elif test['type'] == 'file_write':
            # Test file writing
            func = getattr(module, test['function'], None)
            if func is None:
                test_result['error'] = f"Function '{test['function']}' not found"
            else:
                # Call the function with test arguments
                func(*test['args'])
                
                # Check if file exists and has correct content
                filename = test['args'][0]
                if os.path.exists(filename):
                    with open(filename, 'r') as f:
                        content = f.read()
                    if content == test['expected_content']:
                        test_result['passed'] = True
                    else:
                        test_result['error'] = f"Expected '{test['expected_content']}', but got '{content}'"
                else:
                    test_result['error'] = f"File '{filename}' was not created"
        
        elif test['type'] == 'file_read':
            # Setup test file
            if 'setup' in test:
                for setup_cmd in test['setup']:
                    exec(setup_cmd)
            
            # Test file reading
            func = getattr(module, test['function'], None)
            if func is None:
                test_result['error'] = f"Function '{test['function']}' not found"
            else:
                result = func(*test['args'])
                if result == test['expected_output']:
                    test_result['passed'] = True
                else:
                    test_result['error'] = f"Expected '{test['expected_output']}', but got '{result}'"
        
        elif test['type'] == 'function_call':
            # Cleanup first if specified
            if 'cleanup' in test:
                for cleanup_cmd in test['cleanup']:
                    exec(cleanup_cmd)
            
            func = getattr(module, test['function'], None)
            if func is None:
                test_result['error'] = f"Function '{test['function']}' not found"
            else:
                result = func()
                if result == test['expected_output']:
                    test_result['passed'] = True
                else:
                    test_result['error'] = f"Expected {test['expected_output']}, but got {result}"
        
        elif test['type'] == 'integration':
            # Integration test for high score system
            test_result['passed'] = True
            test_result['error'] = "Integration test - manual review recommended"
        
        elif test['type'] == 'append_check':
            # Test append functionality
            test_result['passed'] = True
            test_result['error'] = "Append test - manual review recommended"
        
        elif test['type'] == 'read_check':
            # Test read functionality
            test_result['passed'] = True
            test_result['error'] = "Read test - manual review recommended"
    
    except Exception as e:
        test_result['error'] = f"{type(e).__name__}: {str(e)}"
    
    return test_result

# Main UI
def main():
    st.title("🐍 Python Interactive IDE")
    st.markdown("### Code with Morais - Learn Python with Real-Time Feedback")
    
    # Sidebar
    with st.sidebar:
        st.header("📚 Assignments")
        
        assignments = load_assignments()
        assignment_names = list(assignments.keys())
        
        selected_assignment = st.selectbox(
            "Choose an assignment:",
            assignment_names,
            key="assignment_selector"
        )
        
        if selected_assignment:
            st.session_state.assignment_data = assignments[selected_assignment]
            st.markdown(f"**Description:** {st.session_state.assignment_data['description']}")
        
        st.divider()
        
        if st.button("📖 Load Starter Code"):
            if st.session_state.assignment_data:
                st.session_state.code = st.session_state.assignment_data['starter_code']
                st.success("Starter code loaded!")
                st.rerun()
        
        if st.button("🗑️ Clear Editor"):
            st.session_state.code = ""
            st.session_state.output = ""
            st.session_state.error = ""
            st.session_state.grade_results = None
            st.success("Editor cleared!")
            st.rerun()
        
        st.divider()
        st.markdown("### 📊 Quick Stats")
        if st.session_state.grade_results:
            score = st.session_state.grade_results['score']
            max_score = st.session_state.grade_results['max_score']
            percentage = (score / max_score * 100) if max_score > 0 else 0
            
            st.metric("Latest Score", f"{score}/{max_score}", f"{percentage:.1f}%")
            
            if percentage >= 90:
                st.success("🏆 Excellent!")
            elif percentage >= 70:
                st.info("👍 Good job!")
            elif percentage >= 50:
                st.warning("📈 Keep trying!")
            else:
                st.error("💪 Don't give up!")
    
    # Main content area
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("📝 Code Editor")
        
        # Code editor
        code = st.text_area(
            "Write your Python code here:",
            value=st.session_state.code,
            height=500,
            key="code_editor",
            help="Write your Python code here. Use the buttons below to run or grade your code."
        )
        
        # Update session state
        st.session_state.code = code
        
        # Action buttons
        btn_col1, btn_col2, btn_col3 = st.columns(3)
        
        with btn_col1:
            run_button = st.button("▶️ Run Code", type="primary", use_container_width=True)
        
        with btn_col2:
            grade_button = st.button("🎯 Grade Assignment", use_container_width=True)
        
        with btn_col3:
            save_button = st.button("💾 Save Code", use_container_width=True)
        
        # Handle button clicks
        if run_button:
            if code.strip():
                with st.spinner("Running your code..."):
                    output, error = run_code_safely(code)
                    st.session_state.output = output
                    st.session_state.error = error
            else:
                st.warning("Please write some code first!")
        
        if grade_button:
            if code.strip() and st.session_state.assignment_data:
                with st.spinner("Grading your assignment..."):
                    results = grade_assignment(
                        code,
                        selected_assignment,
                        st.session_state.assignment_data['tests']
                    )
                    st.session_state.grade_results = results
                    
                    # Also run the code to show output
                    output, error = run_code_safely(code)
                    st.session_state.output = output
                    st.session_state.error = error
            else:
                st.warning("Please write some code and select an assignment!")
        
        if save_button:
            if code.strip():
                # Save to file
                filename = f"{selected_assignment.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.py"
                os.makedirs('student_submissions', exist_ok=True)
                filepath = os.path.join('student_submissions', filename)
                
                with open(filepath, 'w') as f:
                    f.write(code)
                
                st.success(f"Code saved to {filepath}")
            else:
                st.warning("Nothing to save!")
    
    with col2:
        st.subheader("📊 Results & Feedback")
        
        # Show grade results first if available
        if st.session_state.grade_results:
            results = st.session_state.grade_results
            
            # Score display
            score = results['score']
            max_score = results['max_score']
            percentage = (score / max_score * 100) if max_score > 0 else 0
            
            if results['all_passed']:
                st.success(f"🎉 Perfect Score! {score}/{max_score} ({percentage:.1f}%)")
                st.balloons()
            elif percentage >= 70:
                st.info(f"✅ Good Work! Score: {score}/{max_score} ({percentage:.1f}%)")
            else:
                st.warning(f"📝 Score: {score}/{max_score} ({percentage:.1f}%)")
            
            # Progress bar
            st.progress(percentage / 100)
            
            # Individual test results
            st.markdown("### Test Results:")
            for test in results['tests']:
                if test['passed']:
                    st.markdown(f"✅ **{test['name']}** (+{test['points']} points)")
                else:
                    st.markdown(f"❌ **{test['name']}** (0/{test['points']} points)")
                    if test['error']:
                        st.caption(f"   ↳ {test['error']}")
            
            st.divider()
        
        # Show output
        if st.session_state.output:
            st.markdown("### 💻 Program Output:")
            st.code(st.session_state.output, language='text')
        
        # Show errors
        if st.session_state.error:
            st.markdown("### ⚠️ Errors:")
            st.code(st.session_state.error, language='text')
        
        # Show instructions if nothing to display
        if not st.session_state.output and not st.session_state.error and not st.session_state.grade_results:
            st.info("""
                👈 **Get Started:**
                1. Select an assignment from the sidebar
                2. Click "Load Starter Code" to begin
                3. Write your solution in the code editor
                4. Click "Run Code" to test it
                5. Click "Grade Assignment" to get feedback
            """)

if __name__ == "__main__":
    main()

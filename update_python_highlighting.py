import re

# Read the file
with open('public/python-exam-1-study-guide.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define replacement patterns for better Python syntax highlighting
replacements = [
    # Variables assignment patterns
    (r'(\n)([a-z_][a-z0-9_]*)\s*=\s*([0-9]+)(\s)', r'\1<span class="variable">\2</span> <span class="operator">=</span> <span class="number">\3</span>\4'),
    (r'(\n)([a-z_][a-z0-9_]*)\s*=\s*([0-9.]+)(\s)', r'\1<span class="variable">\2</span> <span class="operator">=</span> <span class="number">\3</span>\4'),
    (r'(\n)([a-z_][a-z0-9_]*)\s*=\s*(<span class="string">)',  r'\1<span class="variable">\2</span> <span class="operator">=</span> \3'),
    (r'(\n)([a-z_][a-z0-9_]*)\s*=\s*(<span class="keyword">)', r'\1<span class="variable">\2</span> <span class="operator">=</span> \3'),
   
    # Built-in functions
    (r'<span class="function">(str|int|float|bool|len|range|open|input)</span>', r'<span class="builtin">\1</span>'),
    (r'<span class="function">(print)</span>', r'<span class="builtin">\1</span>'),
    
    # Operators in expressions
    (r'(\s)(\+|-)(\s)', r'\1<span class="operator">\2</span>\3'),
    (r'(\s)(\*|/|//|%)(\s)', r'\1<span class="operator">\2</span>\3'),
    (r'(\s)(\*\*)(\s)', r'\1<span class="operator">\2</span>\3'),
    (r'(\s)(==|!=|<=|>=|<|>)(\s)', r'\1<span class="operator">\2</span>\3'),
    (r'(\s)(\+=|-=|\*=|/=|//=|%=|\*\*=)(\s)', r'\1<span class="operator">\2</span>\3'),
    
    # Numbers not already in spans
    (r'(\[|,|\(|\s)([0-9]+\.?[0-9]*)(\]|,|\)|\s)', r'\1<span class="number">\2</span>\3'),
]

# Apply replacements
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Write back
with open('public/python-exam-1-study-guide.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Python syntax highlighting updated!")

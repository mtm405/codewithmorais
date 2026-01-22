# Script to fix radio button names for Quizzes 6-13
# Each quiz has 10 questions with 3 options each
# All options in each question need to share the same name

$file = "c:\Users\ISNPS\codewithmorais\public\python-exam-1-study-guide.html"
$content = Get-Content $file -Raw

# Quiz 6 - Loops
$content = $content -replace 'name="q6_1"', 'name="q6_q1"'
$content = $content -replace 'name="q6_2"', 'name="q6_q1"'
$content = $content -replace 'name="q6_3"', 'name="q6_q1"'
$content = $content -replace 'name="q6_4"', 'name="q6_q2"'
$content = $content -replace 'name="q6_5"', 'name="q6_q2"'
$content = $content -replace 'name="q6_6"', 'name="q6_q2"'
$content = $content -replace 'name="q6_7"', 'name="q6_q3"'
$content = $content -replace 'name="q6_8"', 'name="q6_q3"'
$content = $content -replace 'name="q6_9"', 'name="q6_q3"'
$content = $content -replace 'name="q6_10"', 'name="q6_q4"'
$content = $content -replace 'name="q6_11"', 'name="q6_q4"'
$content = $content -replace 'name="q6_12"', 'name="q6_q4"'
$content = $content -replace 'name="q6_13"', 'name="q6_q5"'
$content = $content -replace 'name="q6_14"', 'name="q6_q5"'
$content = $content -replace 'name="q6_15"', 'name="q6_q5"'
$content = $content -replace 'name="q6_16"', 'name="q6_q6"'
$content = $content -replace 'name="q6_17"', 'name="q6_q6"'
$content = $content -replace 'name="q6_18"', 'name="q6_q6"'
$content = $content -replace 'name="q6_19"', 'name="q6_q7"'
$content = $content -replace 'name="q6_20"', 'name="q6_q7"'
$content = $content -replace 'name="q6_21"', 'name="q6_q7"'
$content = $content -replace 'name="q6_22"', 'name="q6_q8"'
$content = $content -replace 'name="q6_23"', 'name="q6_q8"'
$content = $content -replace 'name="q6_24"', 'name="q6_q8"'
$content = $content -replace 'name="q6_25"', 'name="q6_q9"'
$content = $content -replace 'name="q6_26"', 'name="q6_q9"'
$content = $content -replace 'name="q6_27"', 'name="q6_q9"'
$content = $content -replace 'name="q6_28"', 'name="q6_q10"'
$content = $content -replace 'name="q6_29"', 'name="q6_q10"'
$content = $content -replace 'name="q6_30"', 'name="q6_q10"'

# Quiz 6 answer key
$content = $content -replace "'q6_2': '1,6'", "'q6_q1': '1,6'"
$content = $content -replace "'q6_4': 'break'", "'q6_q2': 'break'"
$content = $content -replace "'q6_8': 'skip'", "'q6_q3': 'skip'"
$content = $content -replace "'q6_11': '3'", "'q6_q4': '3'"
$content = $content -replace "'q6_14': 'items'", "'q6_q5': 'items'"
$content = $content -replace "'q6_17': 'even'", "'q6_q6': 'even'"
$content = $content -replace "'q6_20': '6'", "'q6_q7': '6'"
$content = $content -replace "'q6_23': 'both'", "'q6_q8': 'both'"
$content = $content -replace "'q6_25': 'condition'", "'q6_q9': 'condition'"
$content = $content -replace "'q6_29': 'normal'", "'q6_q10': 'normal'"

# Quiz 7 - Functions
$content = $content -replace 'name="q7_1"([^"])', 'name="q7_q1"$1'
$content = $content -replace 'name="q7_2"', 'name="q7_q1"'
$content = $content -replace 'name="q7_3"', 'name="q7_q1"'
$content = $content -replace 'name="q7_4"', 'name="q7_q2"'
$content = $content -replace 'name="q7_5"([^"])', 'name="q7_q2"$1'
$content = $content -replace 'name="q7_6"', 'name="q7_q2"'
$content = $content -replace 'name="q7_7"([^"])', 'name="q7_q3"$1'
$content = $content -replace 'name="q7_8"', 'name="q7_q3"'
$content = $content -replace 'name="q7_9"', 'name="q7_q3"'
$content = $content -replace 'name="q7_10"([^"])', 'name="q7_q4"$1'
$content = $content -replace 'name="q7_11"', 'name="q7_q4"'
$content = $content -replace 'name="q7_12"', 'name="q7_q4"'
$content = $content -replace 'name="q7_13"([^"])', 'name="q7_q5"$1'
$content = $content -replace 'name="q7_14"', 'name="q7_q5"'
$content = $content -replace 'name="q7_15"', 'name="q7_q5"'
$content = $content -replace 'name="q7_16"([^"])', 'name="q7_q6"$1'
$content = $content -replace 'name="q7_17"', 'name="q7_q6"'
$content = $content -replace 'name="q7_18"', 'name="q7_q6"'
$content = $content -replace 'name="q7_19"', 'name="q7_q7"'
$content = $content -replace 'name="q7_20"([^"])', 'name="q7_q7"$1'
$content = $content -replace 'name="q7_21"', 'name="q7_q7"'
$content = $content -replace 'name="q7_22"([^"])', 'name="q7_q8"$1'
$content = $content -replace 'name="q7_23"', 'name="q7_q8"'
$content = $content -replace 'name="q7_24"', 'name="q7_q8"'
$content = $content -replace 'name="q7_25"([^"])', 'name="q7_q9"$1'
$content = $content -replace 'name="q7_26"', 'name="q7_q9"'
$content = $content -replace 'name="q7_27"', 'name="q7_q9"'
$content = $content -replace 'name="q7_28"([^"])', 'name="q7_q10"$1'
$content = $content -replace 'name="q7_29"', 'name="q7_q10"'
$content = $content -replace 'name="q7_30"', 'name="q7_q10"'

# Quiz 7 answer key
$content = $content -replace "'q7_1': 'def'", "'q7_q1': 'def'"
$content = $content -replace "'q7_5': 'send'", "'q7_q2': 'send'"
$content = $content -replace "'q7_7': 'arguments'", "'q7_q3': 'arguments'"
$content = $content -replace "'q7_10': 'guest'", "'q7_q4': 'guest'"
$content = $content -replace "'q7_13': '8'", "'q7_q5': '8'"
$content = $content -replace "'q7_16': 'yes'", "'q7_q6': 'yes'"
$content = $content -replace "'q7_20': 'no'", "'q7_q7': 'no'"
$content = $content -replace "'q7_22': 'comment'", "'q7_q8': 'comment'"
$content = $content -replace "'q7_25': 'anonymous'", "'q7_q9': 'anonymous'"
$content = $content -replace "'q7_28': 'None'", "'q7_q10': 'None'"

# Quiz 8 - Comments & Formatting
$content = $content -replace 'name="q8_1"', 'name="q8_q1"'
$content = $content -replace 'name="q8_2"([^"])', 'name="q8_q1"$1'
$content = $content -replace 'name="q8_3"', 'name="q8_q1"'
$content = $content -replace 'name="q8_4"([^"])', 'name="q8_q2"$1'
$content = $content -replace 'name="q8_5"', 'name="q8_q2"'
$content = $content -replace 'name="q8_6"', 'name="q8_q2"'
$content = $content -replace 'name="q8_7"([^"])', 'name="q8_q3"$1'
$content = $content -replace 'name="q8_8"', 'name="q8_q3"'
$content = $content -replace 'name="q8_9"', 'name="q8_q3"'
$content = $content -replace 'name="q8_10"([^"])', 'name="q8_q4"$1'
$content = $content -replace 'name="q8_11"', 'name="q8_q4"'
$content = $content -replace 'name="q8_12"', 'name="q8_q4"'
$content = $content -replace 'name="q8_13"([^"])', 'name="q8_q5"$1'
$content = $content -replace 'name="q8_14"', 'name="q8_q5"'
$content = $content -replace 'name="q8_15"', 'name="q8_q5"'
$content = $content -replace 'name="q8_16"([^"])', 'name="q8_q6"$1'
$content = $content -replace 'name="q8_17"', 'name="q8_q6"'
$content = $content -replace 'name="q8_18"', 'name="q8_q6"'
$content = $content -replace 'name="q8_19"([^"])', 'name="q8_q7"$1'
$content = $content -replace 'name="q8_20"([^"])', 'name="q8_q7"$1'
$content = $content -replace 'name="q8_21"', 'name="q8_q7"'
$content = $content -replace 'name="q8_22"([^"])', 'name="q8_q8"$1'
$content = $content -replace 'name="q8_23"', 'name="q8_q8"'
$content = $content -replace 'name="q8_24"', 'name="q8_q8"'
$content = $content -replace 'name="q8_25"([^"])', 'name="q8_q9"$1'
$content = $content -replace 'name="q8_26"', 'name="q8_q9"'
$content = $content -replace 'name="q8_27"', 'name="q8_q9"'
$content = $content -replace 'name="q8_28"([^"])', 'name="q8_q10"$1'
$content = $content -replace 'name="q8_29"', 'name="q8_q10"'
$content = $content -replace 'name="q8_30"', 'name="q8_q10"'

# Quiz 8 answer key
$content = $content -replace "'q8_2': '#'", "'q8_q1': '#'"
$content = $content -replace "'q8_4': 'f'", "'q8_q2': 'f'"
$content = $content -replace "'q8_7': 'triple'", "'q8_q3': 'triple'"
$content = $content -replace "'q8_10': 'hello'", "'q8_q4': 'hello'"
$content = $content -replace "'q8_13': 'result'", "'q8_q5': 'result'"
$content = $content -replace "'q8_16': 'hahaha'", "'q8_q6': 'hahaha'"
$content = $content -replace "'q8_19': '20'", "'q8_q7': '20'"
$content = $content -replace "'q8_22': 'newline'", "'q8_q8': 'newline'"
$content = $content -replace "'q8_25': 'HELLO'", "'q8_q9': 'HELLO'"
$content = $content -replace "'q8_28': 'escape'", "'q8_q10': 'escape'"

# Quiz 9 - File Operations
$content = $content -replace 'name="q9_1"', 'name="q9_q1"'
$content = $content -replace 'name="q9_2"', 'name="q9_q1"'
$content = $content -replace 'name="q9_3"([^"])', 'name="q9_q1"$1'
$content = $content -replace 'name="q9_4"', 'name="q9_q2"'
$content = $content -replace 'name="q9_5"([^"])', 'name="q9_q2"$1'
$content = $content -replace 'name="q9_6"', 'name="q9_q2"'
$content = $content -replace 'name="q9_7"', 'name="q9_q3"'
$content = $content -replace 'name="q9_8"([^"])', 'name="q9_q3"$1'
$content = $content -replace 'name="q9_9"', 'name="q9_q3"'
$content = $content -replace 'name="q9_10"([^"])', 'name="q9_q4"$1'
$content = $content -replace 'name="q9_11"', 'name="q9_q4"'
$content = $content -replace 'name="q9_12"', 'name="q9_q4"'
$content = $content -replace 'name="q9_13"', 'name="q9_q5"'
$content = $content -replace 'name="q9_14"([^"])', 'name="q9_q5"$1'
$content = $content -replace 'name="q9_15"', 'name="q9_q5"'
$content = $content -replace 'name="q9_16"([^"])', 'name="q9_q6"$1'
$content = $content -replace 'name="q9_17"', 'name="q9_q6"'
$content = $content -replace 'name="q9_18"', 'name="q9_q6"'
$content = $content -replace 'name="q9_19"([^"])', 'name="q9_q7"$1'
$content = $content -replace 'name="q9_20"([^"])', 'name="q9_q7"$1'
$content = $content -replace 'name="q9_21"', 'name="q9_q7"'
$content = $content -replace 'name="q9_22"([^"])', 'name="q9_q8"$1'
$content = $content -replace 'name="q9_23"', 'name="q9_q8"'
$content = $content -replace 'name="q9_24"', 'name="q9_q8"'
$content = $content -replace 'name="q9_25"([^"])', 'name="q9_q9"$1'
$content = $content -replace 'name="q9_26"', 'name="q9_q9"'
$content = $content -replace 'name="q9_27"', 'name="q9_q9"'
$content = $content -replace 'name="q9_28"([^"])', 'name="q9_q10"$1'
$content = $content -replace 'name="q9_29"', 'name="q9_q10"'
$content = $content -replace 'name="q9_30"', 'name="q9_q10"'

# Quiz 9 answer key
$content = $content -replace "'q9_3': 'a'", "'q9_q1': 'a'"
$content = $content -replace "'q9_5': 'read'", "'q9_q2': 'read'"
$content = $content -replace "'q9_8': 'overwrite'", "'q9_q3': 'overwrite'"
$content = $content -replace "'q9_10': 'auto'", "'q9_q4': 'auto'"
$content = $content -replace "'q9_14': 'list'", "'q9_q5': 'list'"
$content = $content -replace "'q9_16': 'os'", "'q9_q6': 'os'"
$content = $content -replace "'q9_19': 'close'", "'q9_q7': 'close'"
$content = $content -replace "'q9_22': 'binary'", "'q9_q8': 'binary'"
$content = $content -replace "'q9_25': 'write'", "'q9_q9': 'write'"
$content = $content -replace "'q9_28': 'beginning'", "'q9_q10': 'beginning'"

Write-Output "Quizzes 6-9 fixed. Saving file..."
$content | Set-Content $file -NoNewline

Write-Output "Done! File updated successfully."

# Script to fix radio button names for Quizzes 10-13

$file = "c:\Users\ISNPS\codewithmorais\public\python-exam-1-study-guide.html"
$content = Get-Content $file -Raw

# Quiz 10 - Error Handling (Q1 is drag-drop, Q2-Q10 are radio)
# Q2
$content = $content -replace 'name="q10_1"', 'name="q10_q2"'
$content = $content -replace 'name="q10_2"([^"])', 'name="q10_q2"$1'
$content = $content -replace 'name="q10_3"', 'name="q10_q2"'
# Q3
$content = $content -replace 'name="q10_4"([^"])', 'name="q10_q3"$1'
$content = $content -replace 'name="q10_5"', 'name="q10_q3"'
$content = $content -replace 'name="q10_6"', 'name="q10_q3"'
# Q4
$content = $content -replace 'name="q10_7"', 'name="q10_q4"'
$content = $content -replace 'name="q10_8"([^"])', 'name="q10_q4"$1'
$content = $content -replace 'name="q10_9"', 'name="q10_q4"'
# Q5
$content = $content -replace 'name="q10_10"', 'name="q10_q5"'
$content = $content -replace 'name="q10_11"([^"])', 'name="q10_q5"$1'
$content = $content -replace 'name="q10_12"', 'name="q10_q5"'
# Q6
$content = $content -replace 'name="q10_13"([^"])', 'name="q10_q6"$1'
$content = $content -replace 'name="q10_14"', 'name="q10_q6"'
$content = $content -replace 'name="q10_15"', 'name="q10_q6"'
# Q7
$content = $content -replace 'name="q10_16"([^"])', 'name="q10_q7"$1'
$content = $content -replace 'name="q10_17"', 'name="q10_q7"'
$content = $content -replace 'name="q10_18"', 'name="q10_q7"'
# Q8
$content = $content -replace 'name="q10_19"', 'name="q10_q8"'
$content = $content -replace 'name="q10_20"([^"])', 'name="q10_q8"$1'
$content = $content -replace 'name="q10_21"', 'name="q10_q8"'
# Q9
$content = $content -replace 'name="q10_22"', 'name="q10_q9"'
$content = $content -replace 'name="q10_23"([^"])', 'name="q10_q9"$1'
$content = $content -replace 'name="q10_24"', 'name="q10_q9"'
# Q10
$content = $content -replace 'name="q10_25"([^"])', 'name="q10_q10"$1'
$content = $content -replace 'name="q10_26"', 'name="q10_q10"'
$content = $content -replace 'name="q10_27"', 'name="q10_q10"'

# Quiz 10 answer key
$content = $content -replace "'q10_2': 'raise'", "'q10_q2': 'raise'"
$content = $content -replace "'q10_4': 'handles'", "'q10_q3': 'handles'"
$content = $content -replace "'q10_8': 'always'", "'q10_q4': 'always'"
$content = $content -replace "'q10_11': 'ZeroDivisionError'", "'q10_q5': 'ZeroDivisionError'"
$content = $content -replace "'q10_13': 'yes'", "'q10_q6': 'yes'"
$content = $content -replace "'q10_16': 'as'", "'q10_q7': 'as'"
$content = $content -replace "'q10_20': 'value'", "'q10_q8': 'value'"
$content = $content -replace "'q10_23': 'no-error'", "'q10_q9': 'no-error'"
$content = $content -replace "'q10_25': 'inherit'", "'q10_q10': 'inherit'"

# Quiz 11 - Modules (Q1 is radio, Q2 is checkboxes, Q3-Q10 are radio)
# Q1 - already uses q11_2 which is fine, but let's make it q11_q1
$content = $content -replace 'name="q11_1"', 'name="q11_q1"'
$content = $content -replace 'name="q11_2"([^"])', 'name="q11_q1"$1'
$content = $content -replace 'name="q11_3"', 'name="q11_q1"'
# Q2 - checkboxes should keep unique names (q11_modules stays as-is)
# Q3
$content = $content -replace 'name="q11_4"([^"])', 'name="q11_q3"$1'
$content = $content -replace 'name="q11_5"', 'name="q11_q3"'
$content = $content -replace 'name="q11_6"', 'name="q11_q3"'
# Q4
$content = $content -replace 'name="q11_7"([^"])', 'name="q11_q4"$1'
$content = $content -replace 'name="q11_8"', 'name="q11_q4"'
$content = $content -replace 'name="q11_9"', 'name="q11_q4"'
# Q5
$content = $content -replace 'name="q11_10"([^"])', 'name="q11_q5"$1'
$content = $content -replace 'name="q11_11"', 'name="q11_q5"'
$content = $content -replace 'name="q11_12"', 'name="q11_q5"'
# Q6
$content = $content -replace 'name="q11_13"([^"])', 'name="q11_q6"$1'
$content = $content -replace 'name="q11_14"', 'name="q11_q6"'
$content = $content -replace 'name="q11_15"', 'name="q11_q6"'
# Q7
$content = $content -replace 'name="q11_16"([^"])', 'name="q11_q7"$1'
$content = $content -replace 'name="q11_17"', 'name="q11_q7"'
$content = $content -replace 'name="q11_18"', 'name="q11_q7"'
# Q8
$content = $content -replace 'name="q11_19"([^"])', 'name="q11_q8"$1'
$content = $content -replace 'name="q11_20"([^"])', 'name="q11_q8"$1'
$content = $content -replace 'name="q11_21"', 'name="q11_q8"'
# Q9
$content = $content -replace 'name="q11_22"([^"])', 'name="q11_q9"$1'
$content = $content -replace 'name="q11_23"', 'name="q11_q9"'
$content = $content -replace 'name="q11_24"', 'name="q11_q9"'
# Q10
$content = $content -replace 'name="q11_25"([^"])', 'name="q11_q10"$1'
$content = $content -replace 'name="q11_26"', 'name="q11_q10"'
$content = $content -replace 'name="q11_27"', 'name="q11_q10"'

# Quiz 11 answer key (note: checkboxes are handled separately in submitQuiz11)
$content = $content -replace "const q11_2 = document.querySelector\('input\[name=`"q11_2`"\]:checked'\)", "const q11_q1 = document.querySelector('input[name=`"q11_q1`"]:checked')"
$content = $content -replace "q11_2.value === 'import'", "q11_q1.value === 'import'"
$content = $content -replace "attemptAnswers\['q11_2'\]", "attemptAnswers['q11_q1']"
$content = $content -replace "'q11_4': 'pip'", "'q11_q3': 'pip'"
$content = $content -replace "'q11_7': 'random'", "'q11_q4': 'random'"
$content = $content -replace "'q11_10': 'name'", "'q11_q5': 'name'"
$content = $content -replace "'q11_13': 'dir'", "'q11_q6': 'dir'"
$content = $content -replace "'q11_16': 'namespace'", "'q11_q7': 'namespace'"
$content = $content -replace "'q11_19': 'standard'", "'q11_q8': 'standard'"
$content = $content -replace "'q11_22': 'init'", "'q11_q9': 'init'"
$content = $content -replace "'q11_25': 'yes'", "'q11_q10': 'yes'"

# Quiz 12 - Dictionaries
$content = $content -replace 'name="q12_1"', 'name="q12_q1"'
$content = $content -replace 'name="q12_2"([^"])', 'name="q12_q1"$1'
$content = $content -replace 'name="q12_3"', 'name="q12_q1"'
$content = $content -replace 'name="q12_4"([^"])', 'name="q12_q2"$1'
$content = $content -replace 'name="q12_5"([^"])', 'name="q12_q2"$1'
$content = $content -replace 'name="q12_6"', 'name="q12_q2"'
$content = $content -replace 'name="q12_7"([^"])', 'name="q12_q3"$1'
$content = $content -replace 'name="q12_8"', 'name="q12_q3"'
$content = $content -replace 'name="q12_9"', 'name="q12_q3"'
$content = $content -replace 'name="q12_10"([^"])', 'name="q12_q4"$1'
$content = $content -replace 'name="q12_11"', 'name="q12_q4"'
$content = $content -replace 'name="q12_12"', 'name="q12_q4"'
$content = $content -replace 'name="q12_13"([^"])', 'name="q12_q5"$1'
$content = $content -replace 'name="q12_14"', 'name="q12_q5"'
$content = $content -replace 'name="q12_15"', 'name="q12_q5"'
$content = $content -replace 'name="q12_16"([^"])', 'name="q12_q6"$1'
$content = $content -replace 'name="q12_17"', 'name="q12_q6"'
$content = $content -replace 'name="q12_18"', 'name="q12_q6"'
$content = $content -replace 'name="q12_19"([^"])', 'name="q12_q7"$1'
$content = $content -replace 'name="q12_20"([^"])', 'name="q12_q7"$1'
$content = $content -replace 'name="q12_21"', 'name="q12_q7"'
$content = $content -replace 'name="q12_22"([^"])', 'name="q12_q8"$1'
$content = $content -replace 'name="q12_23"', 'name="q12_q8"'
$content = $content -replace 'name="q12_24"', 'name="q12_q8"'
$content = $content -replace 'name="q12_25"([^"])', 'name="q12_q9"$1'
$content = $content -replace 'name="q12_26"', 'name="q12_q9"'
$content = $content -replace 'name="q12_27"', 'name="q12_q9"'
$content = $content -replace 'name="q12_28"([^"])', 'name="q12_q10"$1'
$content = $content -replace 'name="q12_29"', 'name="q12_q10"'
$content = $content -replace 'name="q12_30"', 'name="q12_q10"'

# Quiz 12 answer key
$content = $content -replace "'q12_1': 'curly'", "'q12_q1': 'curly'"
$content = $content -replace "'q12_4': 'get'", "'q12_q2': 'get'"
$content = $content -replace "'q12_7': 'update'", "'q12_q3': 'update'"
$content = $content -replace "'q12_10': 'keys'", "'q12_q4': 'keys'"
$content = $content -replace "'q12_13': 'immutable'", "'q12_q5': 'immutable'"
$content = $content -replace "'q12_16': 'pop'", "'q12_q6': 'pop'"
$content = $content -replace "'q12_19': 'true'", "'q12_q7': 'true'"
$content = $content -replace "'q12_22': 'items'", "'q12_q8': 'items'"
$content = $content -replace "'q12_25': 'update'", "'q12_q9': 'update'"
$content = $content -replace "'q12_28': 'values'", "'q12_q10': 'values'"

# Quiz 13 - Advanced Topics
$content = $content -replace 'name="q13_1"', 'name="q13_q1"'
$content = $content -replace 'name="q13_2"([^"])', 'name="q13_q1"$1'
$content = $content -replace 'name="q13_3"', 'name="q13_q1"'
$content = $content -replace 'name="q13_4"([^"])', 'name="q13_q2"$1'
$content = $content -replace 'name="q13_5"', 'name="q13_q2"'
$content = $content -replace 'name="q13_6"', 'name="q13_q2"'
$content = $content -replace 'name="q13_7"([^"])', 'name="q13_q3"$1'
$content = $content -replace 'name="q13_8"', 'name="q13_q3"'
$content = $content -replace 'name="q13_9"', 'name="q13_q3"'
$content = $content -replace 'name="q13_10"([^"])', 'name="q13_q4"$1'
$content = $content -replace 'name="q13_11"', 'name="q13_q4"'
$content = $content -replace 'name="q13_12"', 'name="q13_q4"'
$content = $content -replace 'name="q13_13"([^"])', 'name="q13_q5"$1'
$content = $content -replace 'name="q13_14"', 'name="q13_q5"'
$content = $content -replace 'name="q13_15"', 'name="q13_q5"'
$content = $content -replace 'name="q13_16"([^"])', 'name="q13_q6"$1'
$content = $content -replace 'name="q13_17"', 'name="q13_q6"'
$content = $content -replace 'name="q13_18"', 'name="q13_q6"'
$content = $content -replace 'name="q13_19"([^"])', 'name="q13_q7"$1'
$content = $content -replace 'name="q13_20"([^"])', 'name="q13_q7"$1'
$content = $content -replace 'name="q13_21"', 'name="q13_q7"'
$content = $content -replace 'name="q13_22"([^"])', 'name="q13_q8"$1'
$content = $content -replace 'name="q13_23"', 'name="q13_q8"'
$content = $content -replace 'name="q13_24"', 'name="q13_q8"'
$content = $content -replace 'name="q13_25"([^"])', 'name="q13_q9"$1'
$content = $content -replace 'name="q13_26"', 'name="q13_q9"'
$content = $content -replace 'name="q13_27"', 'name="q13_q9"'
$content = $content -replace 'name="q13_28"([^"])', 'name="q13_q10"$1'
$content = $content -replace 'name="q13_29"', 'name="q13_q10"'
$content = $content -replace 'name="q13_30"', 'name="q13_q10"'

# Quiz 13 answer key
$content = $content -replace "'q13_1': 'json'", "'q13_q1': 'json'"
$content = $content -replace "'q13_4': 'comprehension'", "'q13_q2': 'comprehension'"
$content = $content -replace "'q13_7': 'lambda'", "'q13_q3': 'lambda'"
$content = $content -replace "'q13_10': 'generator'", "'q13_q4': 'generator'"
$content = $content -replace "'q13_13': 'decorator'", "'q13_q5': 'decorator'"
$content = $content -replace "'q13_16': 'args'", "'q13_q6': 'args'"
$content = $content -replace "'q13_19': 'True'", "'q13_q7': 'True'"
$content = $content -replace "'q13_22': 'memory'", "'q13_q8': 'memory'"
$content = $content -replace "'q13_25': 'zip'", "'q13_q9': 'zip'"
$content = $content -replace "'q13_28': 'set'", "'q13_q10': 'set'"

Write-Output "Quizzes 10-13 fixed. Saving file..."
$content | Set-Content $file -NoNewline

Write-Output "Done! All quizzes fixed successfully."

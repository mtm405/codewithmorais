$file = "c:\Users\ISNPS\codewithmorais\public\python-exam-1-study-guide.html"
$content = Get-Content $file -Raw

# Question 2 - Fix third option
$content = $content -replace 'name="q13_q1" value="true"> True\s*</label>\s*</div>\s*</div>\s*\s*<div class="quiz-question" data-question="2">', 'name="q13_q1" value="true"> True</label>
                </div>
            </div>

            <div class="quiz-question" data-question="2">'

# Question 2 - First option should be q13_q2
$content = $content -replace '(<div class="quiz-question" data-question="2">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q1" value="true">', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q2" value="true">'

# Question 3 - First two options should be q13_q3
$content = $content -replace '(<div class="quiz-question" data-question="3">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q2"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q3"'
$content = $content -replace '(<div class="quiz-question" data-question="3">.*?name="q13_q3"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q2"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q3"'

# Question 4 - First two options should be q13_q4
$content = $content -replace '(<div class="quiz-question" data-question="4">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q3"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q4"'
$content = $content -replace '(<div class="quiz-question" data-question="4">.*?name="q13_q4"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q3"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q4"'

# Question 5 - First two options should be q13_q5
$content = $content -replace '(<div class="quiz-question" data-question="5">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q4"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q5"'
$content = $content -replace '(<div class="quiz-question" data-question="5">.*?name="q13_q5"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q4"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q5"'

# Question 6 - First two options should be q13_q6
$content = $content -replace '(<div class="quiz-question" data-question="6">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q5"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q6"'
$content = $content -replace '(<div class="quiz-question" data-question="6">.*?name="q13_q6"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q5"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q6"'

# Question 7 - First two options should be q13_q7
$content = $content -replace '(<div class="quiz-question" data-question="7">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q6"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q7"'
$content = $content -replace '(<div class="quiz-question" data-question="7">.*?name="q13_q7"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q6"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q7"'

# Question 8 - All three options should be q13_q8
$content = $content -replace '(<div class="quiz-question" data-question="8">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q7"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q8"'
$content = $content -replace '(<div class="quiz-question" data-question="8">.*?name="q13_q8"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q7"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q8"'

# Question 9 - All three options should be q13_q9
$content = $content -replace '(<div class="quiz-question" data-question="9">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q8"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q9"'
$content = $content -replace '(<div class="quiz-question" data-question="9">.*?name="q13_q9"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q8"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q9"'

# Question 10 - First two options should be q13_q10
$content = $content -replace '(<div class="quiz-question" data-question="10">.*?<div class="quiz-options">)\s*<label class="quiz-option"><input type="radio" name="q13_q9"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q10"'
$content = $content -replace '(<div class="quiz-question" data-question="10">.*?name="q13_q10"[^>]*>.*?</label>)\s*<label class="quiz-option"><input type="radio" name="q13_q9"', '$1
                    <label class="quiz-option"><input type="radio" name="q13_q10"'

$content | Set-Content $file
Write-Host "Quiz 13 radio button names fixed!" -ForegroundColor Green

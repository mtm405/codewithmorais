// modules/quiz/data_medium.js
// Medium quiz data

export const mediumQuizData = {
  title: "Python Data Types (Medium)",
  questions: [
    {
      type: "fill_in_the_blanks",
      id: "medium_1",
      instructions: "Identify the Data Type",
      question: "`len(\"hello\")` is of type: _____ .",
      answers: ["int", "integer"]
    },
    {
      type: "fill_in_the_blanks",
      id: "medium_2",
      instructions: "Identify the Data Type",
      question: "`3.0 + 2` is of type: _____ .",
      answers: ["float", "floating-point"]
    },
    {
      type: "multiple_choice_quiz",
      id: "medium_mcq",
      instructions: "Multiple Choice",
      questions: [
        {
          question: "What is the output of `type(True)`?",
          options: ["<class 'str'>", "<class 'bool'>", "<class 'int'>", "<class 'float'>"],
          correct_index: 1
        },
        {
          question: "Which of these is NOT a valid variable name in Python?",
          options: ["my_var", "2ndVar", "var_2", "varTwo"],
          correct_index: 1
        }
      ]
    }
  ]
};

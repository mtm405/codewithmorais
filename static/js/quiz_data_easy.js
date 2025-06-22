// This file provides the quiz data for the Easy quiz, extracted from lesson_1_1.json quiz_section
window.easyQuizData = {
  title: "Python Data Types",
  questions: [
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_1",
      instructions: "Part 1: Identify the Data Type",
      question: "`42` is of type: _____ .",
      answers: ["int", "integer"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_2",
      instructions: "Part 1: Identify the Data Type",
      question: "`7.0` is of type: _____ .",
      answers: ["float", "floating-point"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_3",
      instructions: "Part 1: Identify the Data Type",
      question: "`\"Coding is fun!\"` is of type: _____ .",
      answers: ["str", "string"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_4",
      instructions: "Part 1: Identify the Data Type",
      question: "`False` is of type: _____ .",
      answers: ["bool", "boolean"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_5",
      instructions: "Part 1: Identify the Data Type",
      question: "`100 / 10` is of type: _____ .",
      answers: ["float", "floating-point"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_6",
      instructions: "Part 1: Identify the Data Type",
      question: "`\"123\" + \"abc\"` is of type: _____ .",
      answers: ["str", "string"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_7",
      instructions: "Part 1: Identify the Data Type",
      question: "`(20 > 5) and (10 == 10)` is of type: _____ .",
      answers: ["bool", "boolean"]
    },
    {
      type: "fill_in_the_blanks",
      id: "practice_datatypes_8",
      instructions: "Part 1: Identify the Data Type",
      question: "`10 * 3.5` is of type: _____ .",
      answers: ["float", "floating-point"]
    },
    {
      type: "multiple_choice_quiz",
      id: "quiz_concepts",
      instructions: "Part 2: Multiple Choice",
      questions: [
        {
          question: "What is the result of `7 * (3 + 2)`?",
          options: ["21", "28", "35", "17"],
          correct_index: 2
        },
        {
          question: "Which operator always results in a `float` in Python?",
          options: ["`+` (addition)", "`-` (subtraction)", "`*` (multiplication)", "`/` (division)"],
          correct_index: 3
        },
        {
          question: "What is the output of `\"Go!\" * 2`?",
          options: ["`\"Go!Go!\"`", "`\"Go! Go!\"`", "`\"Go!2\"`", "Error"],
          correct_index: 0
        },
        {
          question: "Which of these is a boolean value?",
          options: ["`\"True\"`", "`0`", "`False`", "`1`"],
          correct_index: 2
        },
        {
          question: "What does `type(99)` return?",
          options: ["<class 'float'>", "<class 'str'>", "<class 'int'>", "<class 'bool'>"],
          correct_index: 2
        }
      ]
    }
  ]
};

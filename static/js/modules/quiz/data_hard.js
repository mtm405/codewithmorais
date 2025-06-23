// modules/quiz/data_hard.js
// Hard quiz data

export const hardQuizData = {
  title: "Python Data Types (Hard)",
  questions: [
    {
      type: "drag_and_drop",
      id: "hard_drag_1",
      instructions: "Match the Python data type to its correct description.",
      stems: [
        "`list`", "`dict`", "`tuple`", "`set`"
      ],
      options: [
        "Unordered collection of unique elements",
        "Ordered, mutable collection",
        "Immutable, ordered collection",
        "Key-value pairs"
      ],
      correct_mapping: {
        "`list`": "Ordered, mutable collection",
        "`dict`": "Key-value pairs",
        "`tuple`": "Immutable, ordered collection",
        "`set`": "Unordered collection of unique elements"
      }
    },
    {
      type: "debug_challenge",
      id: "hard_debug_1",
      label: "Fix the bug!",
      instructions: "The following code should print the sum of all numbers in the list. Fix the bug so it works.",
      buggy_code: "numbers = [1, 2, 3, 4]\ntotal = 0\nfor n in numbers:\n    total += n\nprint(total",
      solution: {
        explanation: "The print statement is missing a closing parenthesis.",
        correct_code: "numbers = [1, 2, 3, 4]\ntotal = 0\nfor n in numbers:\n    total += n\nprint(total)"
      }
    }
  ]
};

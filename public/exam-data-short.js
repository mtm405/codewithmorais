// Python IT Specialist Practice Exam - 20 Questions (Short Version)
const examQuestions = [
    // Domain 1: Operations using Data Types and Operators (4 Questions)
    {
        id: 1,
        domain: "Data Types and Operators",
        type: "MC",
        text: "What is the final data type of the variable result after the following assignment?",
        code: "result = 4 + 2.0",
        options: ["int", "float", "str", "bool"],
        answer: "float"
    },
    {
        id: 2,
        domain: "Data Types and Operators",
        type: "FITB",
        text: "Given data = \"Python\", what is the result of the slicing operation data[-2:]?",
        placeholder: "Enter your answer (case-sensitive)",
        answer: "on",
        caseSensitive: true
    },
    {
        id: 3,
        domain: "Data Types and Operators",
        type: "T/F",
        text: "The expression 7 < 10 or 5 == 5.0 evaluates to True.",
        options: ["True", "False"],
        answer: "True"
    },
    {
        id: 4,
        domain: "Data Types and Operators",
        type: "FITB",
        text: "What is the result of the floor division expression 19 // 4?",
        placeholder: "Enter the numeric result",
        answer: "4",
        acceptableAnswers: ["4", "4.0"],
        caseSensitive: false
    },

    // Domain 2: Flow Control with Decisions and Loops (5 Questions)
    {
        id: 5,
        domain: "Flow Control",
        type: "MC",
        text: "What is the final value of count after executing this code?",
        code: "count = 0\nfor i in range(5):\n    if i % 2 == 0:\n        continue\n    count += 1",
        options: ["0", "1", "2", "3"],
        answer: "2"
    },
    {
        id: 6,
        domain: "Flow Control",
        type: "MC",
        text: "What is the output of the following code?",
        code: "x = 8\nif x > 10:\n    print(\"A\")\nelif x > 5:\n    print(\"B\")\nelse:\n    print(\"C\")",
        options: ["A", "B", "C", "No output"],
        answer: "B"
    },
    {
        id: 7,
        domain: "Flow Control",
        type: "T/F",
        text: "A while loop is guaranteed to execute at least once.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 8,
        domain: "Flow Control",
        type: "MC",
        text: "What is the output of the following code?",
        code: "for i in range(3):\n    if i == 1:\n        break\n    print(i, end=' ')",
        options: ["0", "0 1", "0 1 2", "1 2"],
        answer: "0"
    },
    {
        id: 9,
        domain: "Flow Control",
        type: "T/F",
        text: "The range(1, 4) function produces the numbers 1, 2, 3, and 4.",
        options: ["True", "False"],
        answer: "False"
    },

    // Domain 3: Input/Output Operations (4 Questions)
    {
        id: 10,
        domain: "Input and Output",
        type: "MC",
        text: "What is the output of the following code?",
        code: "print(\"A\", \"B\", \"C\", sep=\"*\")",
        options: ["A B C", "A*B*C", "ABC", "A * B * C"],
        answer: "A*B*C"
    },
    {
        id: 11,
        domain: "Input and Output",
        type: "MC",
        text: "What is the output of the following code?",
        code: "name = \"Python\"\nprint(name[0:3])",
        options: ["Pyt", "Pyth", "Python", "Py"],
        answer: "Pyt"
    },
    {
        id: 12,
        domain: "Input and Output",
        type: "T/F",
        text: "The input() function always returns the data type entered by the user (e.g., int, float, str).",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 13,
        domain: "Input and Output",
        type: "MC",
        text: "What is the output of the following code?",
        code: "age = 20\nprint(f\"I am {age} years old\")",
        options: ["I am {age} years old", "I am 20 years old", "I am age years old", "Error"],
        answer: "I am 20 years old"
    },

    // Domain 4: Code Documentation and Structure (3 Questions)
    {
        id: 14,
        domain: "Code Documentation and Structure",
        type: "MC",
        text: "What is the output of the following code?",
        code: "def multiply(x, y):\n    return x * y\n\nresult = multiply(4, 5)\nprint(result)",
        options: ["9", "20", "45", "4"],
        answer: "20"
    },
    {
        id: 15,
        domain: "Code Documentation and Structure",
        type: "MC",
        text: "What is the output of the following code?",
        code: "def greet(name=\"World\"):\n    return \"Hello \" + name\n\nprint(greet())",
        options: ["Hello", "Hello World", "Hello name", "Error"],
        answer: "Hello World"
    },
    {
        id: 16,
        domain: "Code Documentation and Structure",
        type: "T/F",
        text: "The pass keyword is primarily used to generate formal function documentation.",
        options: ["True", "False"],
        answer: "False"
    },

    // Domain 5: Troubleshooting and Error Handling (4 Questions)
    {
        id: 17,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "What is the output of the following code?",
        code: "try:\n    result = 20 / 4\n    print(int(result))\nexcept:\n    print(\"Error\")",
        options: ["5", "5.0", "Error", "20"],
        answer: "5"
    },
    {
        id: 18,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "What is the purpose of the except block in a try-except statement?",
        options: [
            "To execute code only when no error occurs",
            "To handle errors that occur in the try block",
            "To always execute code after try",
            "To prevent all errors from occurring"
        ],
        answer: "To handle errors that occur in the try block"
    },
    {
        id: 19,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "Which block of code in a try-except structure will ALWAYS execute, regardless of whether an exception occurs?",
        options: ["try", "except", "finally", "else"],
        answer: "finally"
    },
    {
        id: 20,
        domain: "Troubleshooting and Error Handling",
        type: "T/F",
        text: "Attempting to access a dictionary key that does not exist will result in a runtime error.",
        options: ["True", "False"],
        answer: "True"
    }
];

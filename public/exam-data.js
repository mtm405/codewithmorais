// Python IT Specialist Simulation Exam - Question Data
const examQuestions = [
    // Domain 1: Operations using Data Types and Operators (8 Questions)
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
        type: "MC",
        text: "What is the result of the following expression?",
        code: "2 ** 3 - 4 / 2",
        options: ["4.0", "6.0", "8.0", "10.0"],
        answer: "6.0"
    },
    {
        id: 3,
        domain: "Data Types and Operators",
        type: "FITB",
        text: "Given data = \"Python\", what is the result of the slicing operation data[-2:]?",
        placeholder: "Enter your answer (case-sensitive)",
        answer: "on",
        caseSensitive: true
    },
    {
        id: 4,
        domain: "Data Types and Operators",
        type: "T/F",
        text: "The expression 7 < 10 or 5 == 5.0 evaluates to True.",
        options: ["True", "False"],
        answer: "True"
    },
    {
        id: 5,
        domain: "Data Types and Operators",
        type: "MC",
        text: "What is the output of the following code?",
        code: "my_list = [1, 2, 3, 4, 5]\nprint(my_list[1:4])",
        options: ["[1, 2, 3]", "[2, 3, 4]", "[2, 3, 4, 5]", "[1, 2, 3, 4]"],
        answer: "[2, 3, 4]"
    },
    {
        id: 6,
        domain: "Data Types and Operators",
        type: "FITB",
        text: "What is the result of the floor division expression 19 // 4?",
        placeholder: "Enter the numeric result",
        answer: "4",
        acceptableAnswers: ["4", "4.0"]
    },
    {
        id: 7,
        domain: "Data Types and Operators",
        type: "T/F",
        text: "The code x = 5; y = 5; result = (x is y) will always evaluate to False because integers are immutable.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 8,
        domain: "Data Types and Operators",
        type: "MC",
        text: "What is the output of the following code?",
        code: "x = 10\ny = 3\nprint(x % y)",
        options: ["1", "3", "3.33", "0"],
        answer: "1"
    },

    // Domain 2: Flow Control with Decisions and Loops (8 Questions)
    {
        id: 9,
        domain: "Flow Control",
        type: "MC",
        text: "What is the final value of count after executing this code?",
        code: "count = 0\nfor i in range(5):\n    if i % 2 == 0:\n        continue\n    count += 1",
        options: ["0", "1", "2", "3"],
        answer: "2"
    },
    {
        id: 10,
        domain: "Flow Control",
        type: "MC",
        text: "What is the output of the following code?",
        code: "x = 15\nif x > 20:\n    print(\"A\")\nelif x > 10:\n    print(\"B\")\nelse:\n    print(\"C\")",
        options: ["A", "B", "C", "No output"],
        answer: "B"
    },
    {
        id: 11,
        domain: "Flow Control",
        type: "T/F",
        text: "A while loop is guaranteed to execute at least once.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 12,
        domain: "Flow Control",
        type: "MC",
        text: "What is the output of the following code?",
        code: "result = \"\"\nfor i in range(1, 4):\n    result += str(i)\nprint(result)",
        options: ["123", "1 2 3", "6", "[1, 2, 3]"],
        answer: "123"
    },
    {
        id: 13,
        domain: "Flow Control",
        type: "FITB",
        text: "What is the output of the following code?",
        code: "for x in \"abc\":\n    if x == \"b\":\n        break\n    print(x, end='')",
        placeholder: "Enter the output (case-sensitive)",
        answer: "a",
        caseSensitive: true
    },
    {
        id: 14,
        domain: "Flow Control",
        type: "MC",
        text: "What is the output of the following code?",
        code: "count = 0\nwhile count < 3:\n    print(count, end='')\n    count += 1",
        options: ["012", "123", "0123", "No output"],
        answer: "012"
    },
    {
        id: 15,
        domain: "Flow Control",
        type: "T/F",
        text: "The range(1, 4) function produces the numbers 1, 2, 3, and 4.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 16,
        domain: "Flow Control",
        type: "MC",
        text: "What is the output of the following code?",
        code: "numbers = [1, 2, 3]\nfor num in numbers:\n    if num == 2:\n        continue\n    print(num, end='')",
        options: ["12", "13", "23", "123"],
        answer: "13"
    },

    // Domain 3: Input and Output Operations (6 Questions)
    {
        id: 17,
        domain: "Input and Output Operations",
        type: "MC",
        text: "What is the output of the following code?",
        code: "print(\"Hello\", \"World\", sep=\"-\")",
        options: ["Hello World", "Hello-World", "HelloWorld", "Hello - World"],
        answer: "Hello-World"
    },
    {
        id: 18,
        domain: "Input and Output Operations",
        type: "MC",
        text: "What is the output of the following code?",
        code: "name = \"Alice\"\nage = 25\nprint(f\"{name} is {age} years old\")",
        options: ["Alice is 25 years old", "{name} is {age} years old", "name is age years old", "Alice is age years old"],
        answer: "Alice is 25 years old"
    },
    {
        id: 19,
        domain: "Input and Output Operations",
        type: "T/F",
        text: "The primary benefit of the with statement in file handling is that it automatically closes the file object.",
        options: ["True", "False"],
        answer: "True"
    },
    {
        id: 20,
        domain: "Input and Output Operations",
        type: "MC",
        text: "What is the output of the following code?",
        code: "print(1, 2, 3, sep=\", \", end=\"!\")",
        options: ["1, 2, 3!", "1 2 3!", "123!", "1,2,3!"],
        answer: "1, 2, 3!"
    },
    {
        id: 21,
        domain: "Input and Output Operations",
        type: "MC",
        text: "What is the output of the following code?",
        code: "text = \"Python\"\nprint(text[0:3])",
        options: ["Pyt", "Pyth", "Python", "Py"],
        answer: "Pyt"
    },
    {
        id: 22,
        domain: "Input and Output Operations",
        type: "T/F",
        text: "When a file is opened in write mode ('w'), existing content is kept, and new content is added to the end.",
        options: ["True", "False"],
        answer: "False"
    },

    // Domain 4: Code Documentation and Structure (6 Questions)
    {
        id: 23,
        domain: "Code Documentation and Structure",
        type: "MC",
        text: "What is the output of the following code?",
        code: "def greet(name):\n    return \"Hello, \" + name\n\nresult = greet(\"Bob\")\nprint(result)",
        options: ["Hello, Bob", "Hello, name", "greet(Bob)", "Bob"],
        answer: "Hello, Bob"
    },
    {
        id: 24,
        domain: "Code Documentation and Structure",
        type: "MC",
        text: "What is the output of the following code?",
        code: "def calculate(x, y=5):\n    return x * y\n\nprint(calculate(3))",
        options: ["3", "5", "15", "8"],
        answer: "15"
    },
    {
        id: 25,
        domain: "Code Documentation and Structure",
        type: "T/F",
        text: "A docstring is the same as a comment and is typically ignored by the pydoc utility.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 26,
        domain: "Code Documentation and Structure",
        type: "MC",
        text: "Which structural feature determines the blocks of code that belong to a function or control structure?",
        options: ["Semicolons", "Braces", "Indentation", "Parentheses"],
        answer: "Indentation"
    },
    {
        id: 27,
        domain: "Code Documentation and Structure",
        type: "MC",
        text: "What is the output of the following code?",
        code: "def add(a, b):\n    result = a + b\n    return result\n\nx = add(7, 3)\nprint(x)",
        options: ["7", "3", "10", "73"],
        answer: "10"
    },
    {
        id: 28,
        domain: "Code Documentation and Structure",
        type: "T/F",
        text: "The pass keyword is primarily used to generate formal function documentation.",
        options: ["True", "False"],
        answer: "False"
    },

    // Domain 5: Troubleshooting and Error Handling (6 Questions)
    {
        id: 29,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "What type of error is caused by code that is syntactically correct but produces an unintended or incorrect result?",
        options: ["Syntax error", "Runtime error", "Logic error", "Exception"],
        answer: "Logic error"
    },
    {
        id: 30,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "What is the output of the following code?",
        code: "try:\n    x = 10 / 2\n    print(int(x))\nexcept:\n    print(\"Error\")",
        options: ["5", "5.0", "Error", "10"],
        answer: "5"
    },
    {
        id: 31,
        domain: "Troubleshooting and Error Handling",
        type: "T/F",
        text: "The assertIsInstance method in unittest is used to check if a function's output is numerically equal to a target value.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 32,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "A try block that successfully executes without error will proceed directly to which block if it is present?",
        options: ["except", "finally", "else", "catch"],
        answer: "else"
    },
    {
        id: 33,
        domain: "Troubleshooting and Error Handling",
        type: "MC",
        text: "Which block of code in a try-except structure will ALWAYS execute, regardless of whether an exception occurs?",
        options: ["try", "except", "finally", "else"],
        answer: "finally"
    },
    {
        id: 34,
        domain: "Troubleshooting and Error Handling",
        type: "T/F",
        text: "Attempting to access a dictionary key that does not exist will result in a runtime error.",
        options: ["True", "False"],
        answer: "True"
    },

    // Domain 6: Operations using Modules and Tools (6 Questions)
    {
        id: 35,
        domain: "Operations using Modules and Tools",
        type: "MC",
        text: "Which math function is used to get the value of pi (π)?",
        options: ["math.PI", "math.pi", "math.getPi()", "math.PI()"],
        answer: "math.pi"
    },
    {
        id: 36,
        domain: "Operations using Modules and Tools",
        type: "MC",
        text: "What is the output of the following code?",
        code: "import math\nresult = math.sqrt(16)\nprint(int(result))",
        options: ["4", "16", "4.0", "256"],
        answer: "4"
    },
    {
        id: 37,
        domain: "Operations using Modules and Tools",
        type: "T/F",
        text: "The random.shuffle() function returns a new, shuffled list.",
        options: ["True", "False"],
        answer: "False"
    },
    {
        id: 38,
        domain: "Operations using Modules and Tools",
        type: "MC",
        text: "What is the output of the following code?",
        code: "import random\nrandom.seed(42)\nprint(random.choice([10, 20, 30]))",
        options: ["10", "20", "30", "Random value"],
        answer: "30"
    },
    {
        id: 39,
        domain: "Operations using Modules and Tools",
        type: "MC",
        text: "What is the output of the following code?",
        code: "import math\nprint(math.ceil(4.3))",
        options: ["4", "5", "4.3", "4.0"],
        answer: "5"
    },
    {
        id: 40,
        domain: "Operations using Modules and Tools",
        type: "T/F",
        text: "Using import math allows you to call the function as sqrt(9).",
        options: ["True", "False"],
        answer: "False"
    }
];

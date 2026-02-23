export const javascriptPlayground = {
    title: "The JavaScript Codex",
    subtitle: "Begin your journey to JavaScript mastery",
    chapters: [
      // ΓöÇΓöÇΓöÇ CHAPTER 1: VARIABLES ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      {
        id: "variables",
        title: "Variables & Data Types",
        description:
          "Master the fundamentals of JavaScript variables and data types",
        totalXp: 300,
        problems: [
          {
            id: "js-var-1",
            title: "Your First Variable",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Declare a variable named \`message\` using \`const\` and assign it the string value "Hello World".`,
            hints: [
              "Use the \`const\` keyword to declare a variable.",
              'The syntax is: const variableName = "value";',
            ],
            starterCode: `// Declare your variable here\n`,
            testFunction: `
try {
  if (typeof message === 'undefined') {
    console.log(JSON.stringify({ success: false, message: "Variable 'message' is not defined." }));
  } else if (message !== "Hello World") {
    console.log(JSON.stringify({ success: false, message: "Expected 'Hello World' but got '" + message + "'." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Great job! You declared your first variable." }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-var-2",
            title: "Let vs Const",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Declare a variable \`score\` using \`let\` with an initial value of \`0\`, then reassign it to \`10\`.`,
            hints: [
              "Use \`let\` for variables you plan to reassign.",
              "Assign 0 first, then on the next line set score = 10.",
            ],
            starterCode: `// Declare score with let and set to 0\n// Then update score to 10\n`,
            testFunction: `
try {
  if (typeof score === 'undefined') {
    console.log(JSON.stringify({ success: false, message: "Variable 'score' is not defined." }));
  } else if (score !== 10) {
    console.log(JSON.stringify({ success: false, message: "Expected score to be 10 but got " + score + "." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Correct! \`let\` allows reassignment." }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-var-3",
            title: "Data Type Check",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create three variables:
- \`name\` (string) with value "eduQuest"
- \`level\` (number) with value 42
- \`isActive\` (boolean) with value true`,
            hints: [
              "Use const for all three.",
              "Strings use quotes, numbers don't, booleans are true/false.",
            ],
            starterCode: `// Create three variables\n`,
            testFunction: `
try {
  let errors = [];
  if (typeof name === 'undefined') errors.push("'name' is not defined");
  else if (typeof name !== 'string' || name !== "eduQuest") errors.push("'name' should be the string \\"eduQuest\\"");
  if (typeof level === 'undefined') errors.push("'level' is not defined");
  else if (typeof level !== 'number' || level !== 42) errors.push("'level' should be the number 42");
  if (typeof isActive === 'undefined') errors.push("'isActive' is not defined");
  else if (typeof isActive !== 'boolean' || isActive !== true) errors.push("'isActive' should be true");
  if (errors.length > 0) {
    console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
  } else {
    console.log(JSON.stringify({ success: true, message: "All three variables are correct!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-var-4",
            title: "Template Literals",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a variable \`greeting\` using template literals. Given \`userName = "Alex"\`, set greeting to "Hello, Alex! Welcome to eduQuest."`,
            hints: [
              "Use backticks: \`Hello, \\${userName}!\`",
              "Template literals use \\${ } for interpolation.",
            ],
            starterCode: `const userName = "Alex";\n// Create greeting using template literals\n`,
            testFunction: `
try {
  if (typeof greeting === 'undefined') {
    console.log(JSON.stringify({ success: false, message: "Variable 'greeting' is not defined." }));
  } else if (greeting !== "Hello, Alex! Welcome to eduQuest.") {
    console.log(JSON.stringify({ success: false, message: "Expected 'Hello, Alex! Welcome to eduQuest.' but got '" + greeting + "'." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Template literals mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-var-5",
            title: "String Methods",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Given \`text = "JavaScript"\`, create:
- \`upper\` ΓÇö the text in all uppercase
- \`len\` ΓÇö the length of the text
- \`firstChar\` ΓÇö the first character`,
            hints: ["Use .toUpperCase(), .length, and .charAt(0) or [0]."],
            starterCode: `const text = "JavaScript";\n// Create upper, len, and firstChar\n`,
            testFunction: `
try {
  let errors = [];
  if (typeof upper === 'undefined') errors.push("'upper' is not defined");
  else if (upper !== "JAVASCRIPT") errors.push("'upper' should be 'JAVASCRIPT'");
  if (typeof len === 'undefined') errors.push("'len' is not defined");
  else if (len !== 10) errors.push("'len' should be 10");
  if (typeof firstChar === 'undefined') errors.push("'firstChar' is not defined");
  else if (firstChar !== "J") errors.push("'firstChar' should be 'J'");
  if (errors.length > 0) {
    console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
  } else {
    console.log(JSON.stringify({ success: true, message: "String methods mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-var-6",
            title: "Type Conversion",
            difficulty: "Medium",
            xp: 50,
            isCompleted: false,
            description: `Given \`numStr = "42"\`, create:
- \`num\` ΓÇö convert it to a number
- \`backToStr\` ΓÇö convert num back to a string`,
            hints: [
              "Use Number() or parseInt() to convert string to number.",
              "Use String() or .toString() to convert back.",
            ],
            starterCode: `const numStr = "42";\n// Convert to number, then back to string\n`,
            testFunction: `
try {
  let errors = [];
  if (typeof num === 'undefined') errors.push("'num' is not defined");
  else if (typeof num !== 'number' || num !== 42) errors.push("'num' should be the number 42");
  if (typeof backToStr === 'undefined') errors.push("'backToStr' is not defined");
  else if (typeof backToStr !== 'string' || backToStr !== "42") errors.push("'backToStr' should be the string '42'");
  if (errors.length > 0) {
    console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Type conversion mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
        ],
      },

      // ΓöÇΓöÇΓöÇ CHAPTER 2: CONDITIONALS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      {
        id: "conditionals",
        title: "Conditionals & Logic",
        description: "Make decisions with if/else and comparison operators",
        totalXp: 250,
        problems: [
          {
            id: "js-cond-1",
            title: "Positive or Negative",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`checkSign(num)\` that returns:
- "positive" if num > 0
- "negative" if num < 0
- "zero" if num === 0`,
            hints: ["Use if/else if/else.", "Return string values."],
            starterCode: `function checkSign(num) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof checkSign !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'checkSign' is not defined." }));
  } else {
    let errors = [];
    if (checkSign(5) !== "positive") errors.push("checkSign(5) should return 'positive'");
    if (checkSign(-3) !== "negative") errors.push("checkSign(-3) should return 'negative'");
    if (checkSign(0) !== "zero") errors.push("checkSign(0) should return 'zero'");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "All cases handled correctly!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-cond-2",
            title: "Grade Calculator",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`getGrade(score)\` that returns:
- "A" for score >= 90
- "B" for score >= 80
- "C" for score >= 70
- "D" for score >= 60
- "F" for anything below 60`,
            hints: [
              "Use if/else if chain, checking from highest to lowest.",
              "The order of conditions matters!",
            ],
            starterCode: `function getGrade(score) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof getGrade !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'getGrade' is not defined." }));
  } else {
    let errors = [];
    if (getGrade(95) !== "A") errors.push("getGrade(95) should return 'A'");
    if (getGrade(85) !== "B") errors.push("getGrade(85) should return 'B'");
    if (getGrade(75) !== "C") errors.push("getGrade(75) should return 'C'");
    if (getGrade(65) !== "D") errors.push("getGrade(65) should return 'D'");
    if (getGrade(50) !== "F") errors.push("getGrade(50) should return 'F'");
    if (getGrade(90) !== "A") errors.push("getGrade(90) should return 'A' (boundary)");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Grade calculator works perfectly!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-cond-3",
            title: "Ternary Operator",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`canVote(age)\` that uses the ternary operator to return "Yes" if age >= 18, otherwise "No".`,
            hints: ["Ternary syntax: condition ? valueIfTrue : valueIfFalse"],
            starterCode: `function canVote(age) {\n  // Use the ternary operator\n}\n`,
            testFunction: `
try {
  if (typeof canVote !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'canVote' is not defined." }));
  } else {
    let errors = [];
    if (canVote(20) !== "Yes") errors.push("canVote(20) should return 'Yes'");
    if (canVote(15) !== "No") errors.push("canVote(15) should return 'No'");
    if (canVote(18) !== "Yes") errors.push("canVote(18) should return 'Yes'");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Ternary operator mastered!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-cond-4",
            title: "Logical Operators",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`canRide(height, age)\` that returns true only if height >= 120 AND age >= 10.`,
            hints: [
              "Use the && (AND) operator.",
              "Both conditions must be true.",
            ],
            starterCode: `function canRide(height, age) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof canRide !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'canRide' is not defined." }));
  } else {
    let errors = [];
    if (canRide(130, 12) !== true) errors.push("canRide(130, 12) should return true");
    if (canRide(110, 12) !== false) errors.push("canRide(110, 12) should return false (too short)");
    if (canRide(130, 8) !== false) errors.push("canRide(130, 8) should return false (too young)");
    if (canRide(100, 5) !== false) errors.push("canRide(100, 5) should return false (both fail)");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Logical operators working!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
        ],
      },

      // ΓöÇΓöÇΓöÇ CHAPTER 3: FUNCTIONS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      {
        id: "functions",
        title: "Functions",
        description: "Learn to create reusable blocks of code",
        totalXp: 350,
        problems: [
          {
            id: "js-func-1",
            title: "Add Two Numbers",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`add(a, b)\` that returns the sum of a and b.`,
            hints: ["Use the return keyword.", "return a + b;"],
            starterCode: `function add(a, b) {\n  // Return the sum\n}\n`,
            testFunction: `
try {
  if (typeof add !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'add' is not defined." }));
  } else {
    let errors = [];
    if (add(2, 3) !== 5) errors.push("add(2, 3) should return 5");
    if (add(-1, 1) !== 0) errors.push("add(-1, 1) should return 0");
    if (add(0, 0) !== 0) errors.push("add(0, 0) should return 0");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Function works!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-func-2",
            title: "Arrow Functions",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create an arrow function \`multiply\` that takes two numbers and returns their product.`,
            hints: ["Arrow syntax: const multiply = (a, b) => a * b;"],
            starterCode: `// Create an arrow function called multiply\n`,
            testFunction: `
try {
  if (typeof multiply !== 'function') {
    console.log(JSON.stringify({ success: false, message: "'multiply' is not defined as a function." }));
  } else {
    let errors = [];
    if (multiply(3, 4) !== 12) errors.push("multiply(3, 4) should return 12");
    if (multiply(0, 5) !== 0) errors.push("multiply(0, 5) should return 0");
    if (multiply(-2, 3) !== -6) errors.push("multiply(-2, 3) should return -6");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Arrow function works!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-func-3",
            title: "Default Parameters",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`greet(name, greeting)\` where:
- \`greeting\` defaults to "Hello" if not provided
- Returns the string "\${greeting}, \${name}!"`,
            hints: [
              'Use default parameter: function greet(name, greeting = "Hello")',
              "Use template literals for the return value.",
            ],
            starterCode: `function greet(name, greeting) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof greet !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'greet' is not defined." }));
  } else {
    let errors = [];
    if (greet("Alex") !== "Hello, Alex!") errors.push("greet('Alex') should return 'Hello, Alex!'");
    if (greet("Sam", "Hey") !== "Hey, Sam!") errors.push("greet('Sam', 'Hey') should return 'Hey, Sam!'");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Default parameters work!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-func-4",
            title: "Return Early",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`divide(a, b)\` that:
- Returns "Cannot divide by zero" if b is 0
- Otherwise returns a / b`,
            hints: [
              "Check for zero first and return early.",
              "Use an if statement before the main logic.",
            ],
            starterCode: `function divide(a, b) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof divide !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'divide' is not defined." }));
  } else {
    let errors = [];
    if (divide(10, 2) !== 5) errors.push("divide(10, 2) should return 5");
    if (divide(10, 0) !== "Cannot divide by zero") errors.push("divide(10, 0) should return 'Cannot divide by zero'");
    if (divide(0, 5) !== 0) errors.push("divide(0, 5) should return 0");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Early return pattern mastered!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-func-5",
            title: "Higher-Order Function",
            difficulty: "Hard",
            xp: 100,
            isCompleted: false,
            description: `Write a function \`applyOperation(a, b, operation)\` that takes two numbers and a callback function, then returns the result of calling operation(a, b).`,
            hints: [
              "A higher-order function accepts or returns another function.",
              "Just call operation(a, b) and return the result.",
            ],
            starterCode: `function applyOperation(a, b, operation) {\n  // Call operation with a and b\n}\n`,
            testFunction: `
try {
  if (typeof applyOperation !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'applyOperation' is not defined." }));
  } else {
    let errors = [];
    const addFn = (x, y) => x + y;
    const mulFn = (x, y) => x * y;
    if (applyOperation(3, 4, addFn) !== 7) errors.push("applyOperation(3, 4, add) should return 7");
    if (applyOperation(3, 4, mulFn) !== 12) errors.push("applyOperation(3, 4, multiply) should return 12");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Higher-order functions unlocked!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
        ],
      },

      // ΓöÇΓöÇΓöÇ CHAPTER 4: LOOPS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      {
        id: "loops",
        title: "Loops",
        description: "Repeat actions with for and while loops",
        totalXp: 350,
        problems: [
          {
            id: "js-loop-1",
            title: "Sum 1 to N",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`sumTo(n)\` that returns the sum of all numbers from 1 to n (inclusive).`,
            hints: [
              "Use a for loop from 1 to n.",
              "Keep a running total variable.",
            ],
            starterCode: `function sumTo(n) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof sumTo !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'sumTo' is not defined." }));
  } else {
    let errors = [];
    if (sumTo(5) !== 15) errors.push("sumTo(5) should return 15");
    if (sumTo(10) !== 55) errors.push("sumTo(10) should return 55");
    if (sumTo(1) !== 1) errors.push("sumTo(1) should return 1");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Loop logic is solid!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-loop-2",
            title: "FizzBuzz",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`fizzBuzz(n)\` that returns an array from 1 to n where:
- Multiples of 3 are replaced with "Fizz"
- Multiples of 5 are replaced with "Buzz"
- Multiples of both are replaced with "FizzBuzz"
- All other numbers stay as numbers`,
            hints: [
              "Check divisible by 15 first (both 3 and 5).",
              "Use % (modulo) operator to check divisibility.",
              "Push results into an array and return it.",
            ],
            starterCode: `function fizzBuzz(n) {\n  // Return an array\n}\n`,
            testFunction: `
try {
  if (typeof fizzBuzz !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'fizzBuzz' is not defined." }));
  } else {
    const result = fizzBuzz(15);
    if (!Array.isArray(result)) {
      console.log(JSON.stringify({ success: false, message: "fizzBuzz should return an array." }));
    } else {
      let errors = [];
      if (result[0] !== 1) errors.push("Index 0 should be 1");
      if (result[2] !== "Fizz") errors.push("Index 2 should be 'Fizz' (3)");
      if (result[4] !== "Buzz") errors.push("Index 4 should be 'Buzz' (5)");
      if (result[14] !== "FizzBuzz") errors.push("Index 14 should be 'FizzBuzz' (15)");
      if (result.length !== 15) errors.push("Array length should be 15");
      if (errors.length > 0) {
        console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
      } else {
        console.log(JSON.stringify({ success: true, message: "FizzBuzz complete!" }));
      }
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-loop-3",
            title: "Count Vowels",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`countVowels(str)\` that returns the number of vowels (a, e, i, o, u) in the string. Case insensitive.`,
            hints: [
              "Convert to lowercase first.",
              "Use .includes() to check if a character is a vowel.",
            ],
            starterCode: `function countVowels(str) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof countVowels !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'countVowels' is not defined." }));
  } else {
    let errors = [];
    if (countVowels("hello") !== 2) errors.push("countVowels('hello') should return 2");
    if (countVowels("AEIOU") !== 5) errors.push("countVowels('AEIOU') should return 5");
    if (countVowels("xyz") !== 0) errors.push("countVowels('xyz') should return 0");
    if (countVowels("JavaScript") !== 3) errors.push("countVowels('JavaScript') should return 3");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Vowel counter works perfectly!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-loop-4",
            title: "Reverse a String",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`reverseString(str)\` that returns the string reversed. Do NOT use .reverse().`,
            hints: [
              "Loop from the end of the string to the beginning.",
              "Build a new string character by character.",
            ],
            starterCode: `function reverseString(str) {\n  // Don't use .reverse()\n}\n`,
            testFunction: `
try {
  if (typeof reverseString !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'reverseString' is not defined." }));
  } else {
    let errors = [];
    if (reverseString("hello") !== "olleh") errors.push("reverseString('hello') should return 'olleh'");
    if (reverseString("abc") !== "cba") errors.push("reverseString('abc') should return 'cba'");
    if (reverseString("a") !== "a") errors.push("reverseString('a') should return 'a'");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "String reversal complete!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-loop-5",
            title: "Find Maximum",
            difficulty: "Medium",
            xp: 100,
            isCompleted: false,
            description: `Write a function \`findMax(arr)\` that returns the largest number in an array. Do NOT use Math.max.`,
            hints: [
              "Start with the first element as the current max.",
              "Loop through and compare each element.",
            ],
            starterCode: `function findMax(arr) {\n  // Don't use Math.max\n}\n`,
            testFunction: `
try {
  if (typeof findMax !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'findMax' is not defined." }));
  } else {
    let errors = [];
    if (findMax([1, 5, 3, 9, 2]) !== 9) errors.push("findMax([1,5,3,9,2]) should return 9");
    if (findMax([-1, -5, -3]) !== -1) errors.push("findMax([-1,-5,-3]) should return -1");
    if (findMax([42]) !== 42) errors.push("findMax([42]) should return 42");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Max finder works!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
        ],
      },

      // ΓöÇΓöÇΓöÇ CHAPTER 5: ARRAYS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      {
        id: "arrays",
        title: "Arrays",
        description: "Work with ordered collections of data",
        totalXp: 350,
        problems: [
          {
            id: "js-arr-1",
            title: "Array Basics",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create an array called \`fruits\` with these values: "apple", "banana", "cherry". Then create a variable \`count\` set to the length of the array.`,
            hints: [
              "Use square brackets: ['apple', 'banana', 'cherry']",
              "Use .length to get the count.",
            ],
            starterCode: `// Create fruits array and count variable\n`,
            testFunction: `
try {
  let errors = [];
  if (typeof fruits === 'undefined') errors.push("'fruits' is not defined");
  else if (!Array.isArray(fruits)) errors.push("'fruits' should be an array");
  else if (fruits.length !== 3) errors.push("'fruits' should have 3 items");
  else if (fruits[0] !== "apple" || fruits[1] !== "banana" || fruits[2] !== "cherry") errors.push("fruits should be ['apple', 'banana', 'cherry']");
  if (typeof count === 'undefined') errors.push("'count' is not defined");
  else if (count !== 3) errors.push("'count' should be 3");
  if (errors.length > 0) {
    console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Array basics mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-arr-2",
            title: "Map Transform",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`doubleAll(arr)\` that uses \`.map()\` to return a new array where every number is doubled.`,
            hints: [
              "Use arr.map(num => num * 2).",
              ".map() returns a new array.",
            ],
            starterCode: `function doubleAll(arr) {\n  // Use .map()\n}\n`,
            testFunction: `
try {
  if (typeof doubleAll !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'doubleAll' is not defined." }));
  } else {
    const r1 = doubleAll([1, 2, 3]);
    const r2 = doubleAll([0, -1, 5]);
    let errors = [];
    if (JSON.stringify(r1) !== '[2,4,6]') errors.push("doubleAll([1,2,3]) should return [2,4,6]");
    if (JSON.stringify(r2) !== '[0,-2,10]') errors.push("doubleAll([0,-1,5]) should return [0,-2,10]");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: ".map() mastered!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-arr-3",
            title: "Filter Evens",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Write a function \`getEvens(arr)\` that uses \`.filter()\` to return only the even numbers.`,
            hints: [
              "Use arr.filter(n => n % 2 === 0).",
              "Even numbers have remainder 0 when divided by 2.",
            ],
            starterCode: `function getEvens(arr) {\n  // Use .filter()\n}\n`,
            testFunction: `
try {
  if (typeof getEvens !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'getEvens' is not defined." }));
  } else {
    let errors = [];
    if (JSON.stringify(getEvens([1,2,3,4,5,6])) !== '[2,4,6]') errors.push("getEvens([1,2,3,4,5,6]) should return [2,4,6]");
    if (JSON.stringify(getEvens([1,3,5])) !== '[]') errors.push("getEvens([1,3,5]) should return []");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: ".filter() mastered!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-arr-4",
            title: "Reduce Sum",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`arraySum(arr)\` that uses \`.reduce()\` to return the sum of all numbers.`,
            hints: [
              "reduce takes a callback (acc, val) => acc + val.",
              "Set the initial value to 0.",
            ],
            starterCode: `function arraySum(arr) {\n  // Use .reduce()\n}\n`,
            testFunction: `
try {
  if (typeof arraySum !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'arraySum' is not defined." }));
  } else {
    let errors = [];
    if (arraySum([1,2,3]) !== 6) errors.push("arraySum([1,2,3]) should return 6");
    if (arraySum([10,20,30]) !== 60) errors.push("arraySum([10,20,30]) should return 60");
    if (arraySum([]) !== 0) errors.push("arraySum([]) should return 0");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: ".reduce() mastered!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-arr-5",
            title: "Remove Duplicates",
            difficulty: "Hard",
            xp: 125,
            isCompleted: false,
            description: `Write a function \`removeDuplicates(arr)\` that returns a new array with duplicates removed. Maintain original order.`,
            hints: [
              "You can use new Set(arr) and spread it back.",
              "Or use .filter() with .indexOf().",
            ],
            starterCode: `function removeDuplicates(arr) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof removeDuplicates !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'removeDuplicates' is not defined." }));
  } else {
    let errors = [];
    if (JSON.stringify(removeDuplicates([1,2,2,3,3,3])) !== '[1,2,3]') errors.push("removeDuplicates([1,2,2,3,3,3]) should return [1,2,3]");
    if (JSON.stringify(removeDuplicates(["a","b","a"])) !== '["a","b"]') errors.push("removeDuplicates(['a','b','a']) should return ['a','b']");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Duplicates handled!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
        ],
      },

      // ΓöÇΓöÇΓöÇ CHAPTER 6: OBJECTS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      {
        id: "objects",
        title: "Objects",
        description: "Work with key-value pairs and object structures",
        totalXp: 300,
        problems: [
          {
            id: "js-obj-1",
            title: "Create an Object",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create an object \`person\` with properties:
- \`name\`: "Alex"
- \`age\`: 25
- \`city\`: "New York"`,
            hints: [
              "Use curly braces: { name: 'Alex', age: 25, city: 'New York' }",
            ],
            starterCode: `// Create your person object\n`,
            testFunction: `
try {
  if (typeof person === 'undefined') {
    console.log(JSON.stringify({ success: false, message: "'person' is not defined." }));
  } else if (typeof person !== 'object' || person === null) {
    console.log(JSON.stringify({ success: false, message: "'person' should be an object." }));
  } else {
    let errors = [];
    if (person.name !== "Alex") errors.push("person.name should be 'Alex'");
    if (person.age !== 25) errors.push("person.age should be 25");
    if (person.city !== "New York") errors.push("person.city should be 'New York'");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Object created perfectly!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-obj-2",
            title: "Object Destructuring",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Given the object below, use destructuring to create individual variables \`title\`, \`author\`, and \`year\`.`,
            hints: [
              "Syntax: const { title, author, year } = book;",
              "The variable names must match the property names.",
            ],
            starterCode: `const book = { title: "1984", author: "George Orwell", year: 1949 };\n// Destructure book into title, author, year\n`,
            testFunction: `
try {
  let errors = [];
  if (typeof title === 'undefined') errors.push("'title' is not defined");
  else if (title !== "1984") errors.push("'title' should be '1984'");
  if (typeof author === 'undefined') errors.push("'author' is not defined");
  else if (author !== "George Orwell") errors.push("'author' should be 'George Orwell'");
  if (typeof year === 'undefined') errors.push("'year' is not defined");
  else if (year !== 1949) errors.push("'year' should be 1949");
  if (errors.length > 0) {
    console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Destructuring mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-obj-3",
            title: "Object Keys & Values",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Write a function \`countProperties(obj)\` that returns the number of keys the object has.`,
            hints: [
              "Use Object.keys(obj) to get an array of keys.",
              "Return the .length of that array.",
            ],
            starterCode: `function countProperties(obj) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof countProperties !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'countProperties' is not defined." }));
  } else {
    let errors = [];
    if (countProperties({a:1, b:2, c:3}) !== 3) errors.push("countProperties({a:1,b:2,c:3}) should return 3");
    if (countProperties({}) !== 0) errors.push("countProperties({}) should return 0");
    if (countProperties({x:1}) !== 1) errors.push("countProperties({x:1}) should return 1");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Object.keys mastered!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
          {
            id: "js-obj-4",
            title: "Merge Objects",
            difficulty: "Medium",
            xp: 100,
            isCompleted: false,
            description: `Write a function \`mergeObjects(obj1, obj2)\` that returns a new object containing all properties from both objects. If both have the same key, obj2's value should win.`,
            hints: [
              "Use the spread operator: { ...obj1, ...obj2 }",
              "The later spread wins on conflicts.",
            ],
            starterCode: `function mergeObjects(obj1, obj2) {\n  // Your code here\n}\n`,
            testFunction: `
try {
  if (typeof mergeObjects !== 'function') {
    console.log(JSON.stringify({ success: false, message: "Function 'mergeObjects' is not defined." }));
  } else {
    const r = mergeObjects({a:1, b:2}, {b:3, c:4});
    let errors = [];
    if (r.a !== 1) errors.push("result.a should be 1");
    if (r.b !== 3) errors.push("result.b should be 3 (from obj2)");
    if (r.c !== 4) errors.push("result.c should be 4");
    if (errors.length > 0) {
      console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
    } else {
      console.log(JSON.stringify({ success: true, message: "Object merging complete!" }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
          },
        ],
      },
    ],
  };

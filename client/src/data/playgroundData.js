export const PLAYGROUND_DATA = {
  javascript: {
    title: "The JavaScript Codex",
    subtitle: "Begin your journey to JavaScript mastery",
    chapters: [
      // ─── CHAPTER 1: VARIABLES ────────────────────────────
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
- \`upper\` — the text in all uppercase
- \`len\` — the length of the text
- \`firstChar\` — the first character`,
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
- \`num\` — convert it to a number
- \`backToStr\` — convert num back to a string`,
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

      // ─── CHAPTER 2: CONDITIONALS ─────────────────────────
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

      // ─── CHAPTER 3: FUNCTIONS ─────────────────────────────
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

      // ─── CHAPTER 4: LOOPS ────────────────────────────────
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

      // ─── CHAPTER 5: ARRAYS ───────────────────────────────
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

      // ─── CHAPTER 6: OBJECTS ──────────────────────────────
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
  },

  html: {
    title: "The EduQuestHTML Codex",
    subtitle: "Begin your journey as a Digital Architect",
    livePreview: true,
    chapters: [
      {
        id: "html-foundation",
        title: "The Foundation",
        description: "Discover the ancient tags and build your first temple",
        totalXp: 300,
        problems: [
          {
            id: "html-f-1",
            title: "The First Incantation",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create the DOCTYPE declaration at the beginning of your document. This tells the browser that you're writing HTML5.\n\nThen create a basic HTML structure with:\n- An \`<html>\` tag\n- A \`<head>\` tag with a \`<title>\` of "My Page"\n- A \`<body>\` tag with an \`<h1>\` saying "Hello World"`,
            hints: [
              "Start with <!DOCTYPE html>",
              "The basic structure is: html > head + body",
              "Put <title> inside <head>",
            ],
            starterCode: `<!-- Start your journey here... -->\n`,
            testFunction: `const html = doc.documentElement; const h1 = doc.querySelector('h1'); const title = doc.querySelector('title'); if (!html) return { success: false, message: "No <html> element found." }; if (!doc.head) return { success: false, message: "No <head> element found." }; if (!title || title.textContent !== "My Page") return { success: false, message: "Title should be 'My Page'." }; if (!doc.body) return { success: false, message: "No <body> element found." }; if (!h1 || h1.textContent !== "Hello World") return { success: false, message: "Need an <h1> with 'Hello World'." }; return { success: true, message: "Your first HTML page is alive!" };`,
          },
          {
            id: "html-f-2",
            title: "Heading Hierarchy",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a heading hierarchy using all six heading levels (h1 through h6). Each should contain the text "Heading X" where X is the level number.`,
            hints: ["Use <h1> through <h6>", "Example: <h1>Heading 1</h1>"],
            starterCode: `<!-- Create all 6 heading levels -->\n`,
            testFunction: `let errors = []; for (let i = 1; i <= 6; i++) { const h = doc.querySelector('h'+i); if (!h) errors.push('Missing <h'+i+'>'); else if (h.textContent !== 'Heading '+i) errors.push('<h'+i+'> should say "Heading '+i+'"'); } if (errors.length) return { success: false, message: errors.join('. ') }; return { success: true, message: "All heading levels mastered!" };`,
          },
          {
            id: "html-f-3",
            title: "Paragraphs & Line Breaks",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create two paragraphs:\n- First: "The web is built with HTML."\n- Second: "CSS makes it beautiful."\n\nAdd a horizontal rule \`<hr>\` between them.`,
            hints: ["Use <p> for paragraphs", "<hr> creates a horizontal line"],
            starterCode: `<!-- Create paragraphs with a horizontal rule -->\n`,
            testFunction: `const ps = doc.querySelectorAll('p'); const hr = doc.querySelector('hr'); if (ps.length < 2) return { success: false, message: "Need at least 2 paragraphs." }; if (!hr) return { success: false, message: "Missing <hr> element." }; if (ps[0].textContent.trim() !== "The web is built with HTML.") return { success: false, message: "First paragraph text is wrong." }; if (ps[1].textContent.trim() !== "CSS makes it beautiful.") return { success: false, message: "Second paragraph text is wrong." }; return { success: true, message: "Paragraphs and rules mastered!" };`,
          },
          {
            id: "html-f-4",
            title: "Bold & Italic",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a paragraph that contains:\n- The word "bold" wrapped in a \`<strong>\` tag\n- The word "italic" wrapped in an \`<em>\` tag`,
            hints: ["<strong> makes text bold", "<em> makes text italic"],
            starterCode: `<p>\n  <!-- Add bold and italic text -->\n</p>\n`,
            testFunction: `const strong = doc.querySelector('strong'); const em = doc.querySelector('em'); if (!strong) return { success: false, message: "Missing <strong> element." }; if (!em) return { success: false, message: "Missing <em> element." }; if (!strong.textContent.includes('bold')) return { success: false, message: "<strong> should contain 'bold'." }; if (!em.textContent.includes('italic')) return { success: false, message: "<em> should contain 'italic'." }; return { success: true, message: "Text formatting complete!" };`,
          },
          {
            id: "html-f-5",
            title: "Comments",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create an HTML comment that says "This is a comment" and below it a paragraph saying "This is visible".`,
            hints: [
              "Comments use <!-- text -->",
              "Comments are not displayed in the browser",
            ],
            starterCode: `<!-- Write your code here -->\n`,
            testFunction: `const p = doc.querySelector('p'); if (!p) return { success: false, message: "Missing <p> element." }; if (p.textContent.trim() !== "This is visible") return { success: false, message: "Paragraph should say 'This is visible'." }; return { success: true, message: "Comments understood!" };`,
          },
        ],
      },
      {
        id: "html-text",
        title: "The Text Scrolls",
        description:
          "Master the art of formatting text and creating readable documents",
        totalXp: 350,
        problems: [
          {
            id: "html-t-1",
            title: "Ordered Lists",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create an ordered list (\`<ol>\`) with 3 items:\n1. "HTML"\n2. "CSS"\n3. "JavaScript"`,
            hints: ["Use <ol> for ordered list", "Each item uses <li>"],
            starterCode: `<!-- Create an ordered list -->\n`,
            testFunction: `const ol = doc.querySelector('ol'); if (!ol) return { success: false, message: "Missing <ol> element." }; const items = ol.querySelectorAll('li'); if (items.length !== 3) return { success: false, message: "Need exactly 3 list items." }; const expected = ["HTML","CSS","JavaScript"]; for (let i=0;i<3;i++) { if (items[i].textContent.trim() !== expected[i]) return { success: false, message: "Item "+(i+1)+" should be '"+expected[i]+"'." }; } return { success: true, message: "Ordered list created!" };`,
          },
          {
            id: "html-t-2",
            title: "Unordered Lists",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create an unordered list (\`<ul>\`) of 3 fruits: "Apple", "Banana", "Cherry".`,
            hints: ["Use <ul> for bullet lists", "Each item is an <li>"],
            starterCode: `<!-- Create an unordered list -->\n`,
            testFunction: `const ul = doc.querySelector('ul'); if (!ul) return { success: false, message: "Missing <ul>." }; const items = ul.querySelectorAll('li'); if (items.length !== 3) return { success: false, message: "Need 3 items." }; const expected = ["Apple","Banana","Cherry"]; for (let i=0;i<3;i++) { if (items[i].textContent.trim() !== expected[i]) return { success: false, message: "Item "+(i+1)+" should be '"+expected[i]+"'." }; } return { success: true, message: "Unordered list done!" };`,
          },
          {
            id: "html-t-3",
            title: "Blockquotes",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a \`<blockquote>\` element containing the text: "The only way to learn programming is by writing code."`,
            hints: ["Use the <blockquote> tag"],
            starterCode: `<!-- Create a blockquote -->\n`,
            testFunction: `const bq = doc.querySelector('blockquote'); if (!bq) return { success: false, message: "Missing <blockquote>." }; if (!bq.textContent.includes("The only way to learn programming is by writing code")) return { success: false, message: "Blockquote text doesn't match." }; return { success: true, message: "Blockquote mastered!" };`,
          },
          {
            id: "html-t-4",
            title: "Code Elements",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create a paragraph that says "Use the " followed by a \`<code>\` element containing "console.log()" followed by " function to debug."`,
            hints: ["<code> is for inline code", "Nest it inside a <p>"],
            starterCode: `<!-- Show inline code -->\n`,
            testFunction: `const code = doc.querySelector('code'); const p = doc.querySelector('p'); if (!p) return { success: false, message: "Missing <p>." }; if (!code) return { success: false, message: "Missing <code>." }; if (!code.textContent.includes("console.log()")) return { success: false, message: "<code> should contain 'console.log()'." }; return { success: true, message: "Code element works!" };`,
          },
          {
            id: "html-t-5",
            title: "Preformatted Text",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Use \`<pre>\` to display this ASCII art exactly as written:\n\`\`\`\n  /\\\\\n /  \\\\\n/____\\\\\n\`\`\``,
            hints: ["<pre> preserves whitespace and line breaks"],
            starterCode: `<!-- Use <pre> for preformatted text -->\n`,
            testFunction: `const pre = doc.querySelector('pre'); if (!pre) return { success: false, message: "Missing <pre> element." }; if (!pre.textContent.includes('/')) return { success: false, message: "<pre> should contain ASCII art." }; return { success: true, message: "Preformatted text works!" };`,
          },
          {
            id: "html-t-6",
            title: "Subscript & Superscript",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create:\n- A paragraph showing "H₂O" using \`<sub>\` (subscript for the 2)\n- A paragraph showing "E=mc²" using \`<sup>\` (superscript for the 2)`,
            hints: ["<sub> for subscript", "<sup> for superscript"],
            starterCode: `<!-- Show subscript and superscript -->\n`,
            testFunction: `const sub = doc.querySelector('sub'); const sup = doc.querySelector('sup'); if (!sub) return { success: false, message: "Missing <sub>." }; if (!sup) return { success: false, message: "Missing <sup>." }; return { success: true, message: "Sub/superscript mastered!" };`,
          },
        ],
      },
      {
        id: "html-links",
        title: "The Linking Portals",
        description:
          "Open portals to other pages and navigate the digital universe",
        totalXp: 300,
        problems: [
          {
            id: "html-l-1",
            title: "Your First Link",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a link (\`<a>\`) that:\n- Has the text "Visit Google"\n- Points to "https://google.com"\n- Opens in a new tab (target="_blank")`,
            hints: [
              "Use <a href='url'>text</a>",
              "Add target='_blank' to open in new tab",
            ],
            starterCode: `<!-- Create a link -->\n`,
            testFunction: `const a = doc.querySelector('a'); if (!a) return { success: false, message: "Missing <a> element." }; if (a.textContent.trim() !== "Visit Google") return { success: false, message: "Link text should be 'Visit Google'." }; if (!a.href.includes("google.com")) return { success: false, message: "href should point to google.com." }; if (a.target !== "_blank") return { success: false, message: "Missing target='_blank'." }; return { success: true, message: "Link created!" };`,
          },
          {
            id: "html-l-2",
            title: "Adding Images",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Add an image (\`<img>\`) with:\n- src="https://via.placeholder.com/200"\n- alt="Placeholder Image"\n- width of 200`,
            hints: ["<img> is self-closing", "Always include an alt attribute"],
            starterCode: `<!-- Add an image -->\n`,
            testFunction: `const img = doc.querySelector('img'); if (!img) return { success: false, message: "Missing <img>." }; if (!img.alt || img.alt !== "Placeholder Image") return { success: false, message: "alt should be 'Placeholder Image'." }; if (!img.src.includes("placeholder")) return { success: false, message: "src should be the placeholder URL." }; return { success: true, message: "Image added!" };`,
          },
          {
            id: "html-l-3",
            title: "Navigation Menu",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create a \`<nav>\` element containing an unordered list with 3 links:\n- "Home" linking to "#home"\n- "About" linking to "#about"\n- "Contact" linking to "#contact"`,
            hints: ["Wrap <ul> inside <nav>", "Each <li> contains an <a>"],
            starterCode: `<!-- Create a navigation menu -->\n`,
            testFunction: `const nav = doc.querySelector('nav'); if (!nav) return { success: false, message: "Missing <nav>." }; const links = nav.querySelectorAll('a'); if (links.length < 3) return { success: false, message: "Need at least 3 links in nav." }; const ul = nav.querySelector('ul'); if (!ul) return { success: false, message: "Links should be in a <ul>." }; return { success: true, message: "Navigation menu created!" };`,
          },
          {
            id: "html-l-4",
            title: "Email & Phone Links",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create two links:\n- One with \`mailto:hello@example.com\` and text "Email Us"\n- One with \`tel:+1234567890\` and text "Call Us"`,
            hints: ["Use mailto: for email links", "Use tel: for phone links"],
            starterCode: `<!-- Create email and phone links -->\n`,
            testFunction: `const links = doc.querySelectorAll('a'); if (links.length < 2) return { success: false, message: "Need 2 links." }; let hasMailto = false, hasTel = false; links.forEach(a => { if (a.href.includes('mailto:')) hasMailto = true; if (a.href.includes('tel:')) hasTel = true; }); if (!hasMailto) return { success: false, message: "Missing mailto: link." }; if (!hasTel) return { success: false, message: "Missing tel: link." }; return { success: true, message: "Special links work!" };`,
          },
        ],
      },
      {
        id: "html-forms",
        title: "The Input Scrolls",
        description: "Master forms and capture user data",
        totalXp: 350,
        problems: [
          {
            id: "html-fo-1",
            title: "Basic Form",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create a \`<form>\` with:\n- A text input with name="username" and placeholder="Enter username"\n- A password input with name="password"\n- A submit button with text "Login"`,
            hints: [
              "type='text' for text input",
              "type='password' for password",
              "type='submit' for button",
            ],
            starterCode: `<!-- Create a login form -->\n`,
            testFunction: `const form = doc.querySelector('form'); if (!form) return { success: false, message: "Missing <form>." }; const user = form.querySelector('input[name="username"]'); const pass = form.querySelector('input[name="password"]'); const btn = form.querySelector('[type="submit"], button'); if (!user) return { success: false, message: "Missing username input." }; if (!pass) return { success: false, message: "Missing password input." }; if (!btn) return { success: false, message: "Missing submit button." }; return { success: true, message: "Login form created!" };`,
          },
          {
            id: "html-fo-2",
            title: "Labels & Accessibility",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create a form with a \`<label>\` and \`<input>\` pair. The label should say "Email:" and have a \`for\` attribute matching the input's \`id\` of "email". The input should be type="email".`,
            hints: [
              "<label for='id'> links to <input id='id'>",
              "This improves accessibility",
            ],
            starterCode: `<form>\n  <!-- Add label and input -->\n</form>\n`,
            testFunction: `const label = doc.querySelector('label'); const input = doc.querySelector('input[type="email"]'); if (!label) return { success: false, message: "Missing <label>." }; if (!input) return { success: false, message: "Missing email input." }; if (!input.id) return { success: false, message: "Input needs an id." }; if (label.htmlFor !== input.id) return { success: false, message: "Label 'for' must match input 'id'." }; return { success: true, message: "Accessible form!" };`,
          },
          {
            id: "html-fo-3",
            title: "Select Dropdown",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a \`<select>\` dropdown with name="color" and 3 options:\n- "Red" (value="red")\n- "Green" (value="green")\n- "Blue" (value="blue")`,
            hints: [
              "Use <select> with <option> children",
              "Each option has a value attribute",
            ],
            starterCode: `<!-- Create a dropdown -->\n`,
            testFunction: `const select = doc.querySelector('select'); if (!select) return { success: false, message: "Missing <select>." }; const opts = select.querySelectorAll('option'); if (opts.length < 3) return { success: false, message: "Need 3 options." }; return { success: true, message: "Dropdown created!" };`,
          },
          {
            id: "html-fo-4",
            title: "Table of Data",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create a \`<table>\` with:\n- A \`<thead>\` row with headers: "Name", "Age"\n- A \`<tbody>\` with 2 rows of data:\n  - "Alice", "25"\n  - "Bob", "30"`,
            hints: [
              "Use <th> for header cells",
              "Use <td> for data cells",
              "Wrap header row in <thead>, data in <tbody>",
            ],
            starterCode: `<!-- Create a data table -->\n`,
            testFunction: `const table = doc.querySelector('table'); if (!table) return { success: false, message: "Missing <table>." }; const thead = table.querySelector('thead'); const tbody = table.querySelector('tbody'); if (!thead) return { success: false, message: "Missing <thead>." }; if (!tbody) return { success: false, message: "Missing <tbody>." }; const ths = thead.querySelectorAll('th'); if (ths.length < 2) return { success: false, message: "Need 2 header cells." }; const rows = tbody.querySelectorAll('tr'); if (rows.length < 2) return { success: false, message: "Need 2 data rows." }; return { success: true, message: "Table created!" };`,
          },
          {
            id: "html-fo-5",
            title: "Semantic HTML",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Build a semantic page structure using:\n- \`<header>\` with an \`<h1>\` saying "My Website"\n- \`<main>\` with a \`<p>\` saying "Welcome!"\n- \`<footer>\` with text "© 2024"`,
            hints: [
              "Semantic tags describe their purpose",
              "<header>, <main>, <footer> structure a page",
            ],
            starterCode: `<!-- Build a semantic page -->\n`,
            testFunction: `const header = doc.querySelector('header'); const main = doc.querySelector('main'); const footer = doc.querySelector('footer'); if (!header) return { success: false, message: "Missing <header>." }; if (!main) return { success: false, message: "Missing <main>." }; if (!footer) return { success: false, message: "Missing <footer>." }; if (!header.querySelector('h1')) return { success: false, message: "<header> needs an <h1>." }; if (!main.querySelector('p')) return { success: false, message: "<main> needs a <p>." }; return { success: true, message: "Semantic HTML mastered!" };`,
          },
        ],
      },
    ],
  },

  css: {
    title: "The EduQuestCSS Codex",
    subtitle: "Begin your journey as a Digital Stylist",
    livePreview: true,
    chapters: [
      {
        id: "css-palette",
        title: "The Palette",
        description:
          "Discover selectors, colors, and text styling fundamentals",
        totalXp: 350,
        problems: [
          {
            id: "css-p-1",
            title: "The First Brushstroke",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Use the \`body\` selector to set the text color to red. Type your CSS in the editor and see the preview update in real time.`,
            hints: [
              "Use body { color: red; }",
              "The color property controls text color",
            ],
            baseHtml: `<h1>Welcome to CSS</h1>\n<p>This text should turn red when you style the body element.</p>`,
            starterCode: `/* Write your CSS here */\n`,
            testFunction: `const body = doc.body; const style = doc.defaultView.getComputedStyle(body); const color = style.color; if (color === 'rgb(255, 0, 0)' || color === 'red') return { success: true, message: "The brush has spoken! Text is red." }; return { success: false, message: "Text color should be red. Current: " + color };`,
          },
          {
            id: "css-p-2",
            title: "Background Magic",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Set the \`body\` background-color to \`#1a1a2e\` (dark navy) and the text color to \`white\`.`,
            hints: [
              "background-color changes the background",
              "Use hex colors like #1a1a2e",
            ],
            baseHtml: `<h1>Dark Mode</h1>\n<p>Make this page dark and elegant.</p>`,
            starterCode: `/* Style the body */\n`,
            testFunction: `const style = doc.defaultView.getComputedStyle(doc.body); const bg = style.backgroundColor; const color = style.color; if (bg !== 'rgb(26, 26, 46)') return { success: false, message: "Background should be #1a1a2e." }; if (color !== 'rgb(255, 255, 255)') return { success: false, message: "Text color should be white." }; return { success: true, message: "Dark mode activated!" };`,
          },
          {
            id: "css-p-3",
            title: "Font Sizing",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Set the \`h1\` font-size to \`48px\` and the \`p\` font-size to \`18px\`.`,
            hints: ["Use font-size property", "h1 { font-size: 48px; }"],
            baseHtml: `<h1>Big Title</h1>\n<p>Normal paragraph text.</p>`,
            starterCode: `/* Set font sizes */\n`,
            testFunction: `const h1s = doc.defaultView.getComputedStyle(doc.querySelector('h1')); const ps = doc.defaultView.getComputedStyle(doc.querySelector('p')); if (h1s.fontSize !== '48px') return { success: false, message: "h1 font-size should be 48px. Got: " + h1s.fontSize }; if (ps.fontSize !== '18px') return { success: false, message: "p font-size should be 18px. Got: " + ps.fontSize }; return { success: true, message: "Font sizing mastered!" };`,
          },
          {
            id: "css-p-4",
            title: "Text Alignment",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Center the \`h1\` text and justify the \`p\` text.`,
            hints: ["text-align: center for h1", "text-align: justify for p"],
            baseHtml: `<h1>Centered Title</h1>\n<p>This paragraph should be justified so that the text stretches to fill the full width of the container evenly on both sides.</p>`,
            starterCode: `/* Align text */\n`,
            testFunction: `const h1s = doc.defaultView.getComputedStyle(doc.querySelector('h1')); const ps = doc.defaultView.getComputedStyle(doc.querySelector('p')); if (h1s.textAlign !== 'center') return { success: false, message: "h1 should be center-aligned." }; if (ps.textAlign !== 'justify') return { success: false, message: "p should be justified." }; return { success: true, message: "Text alignment perfect!" };`,
          },
          {
            id: "css-p-5",
            title: "Class Selector",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Style the element with class \`.highlight\` to have:\n- Background: yellow\n- Font-weight: bold\n- Padding: 4px 8px`,
            hints: [
              "Use .highlight { } to target the class",
              "background: yellow or background-color: yellow",
            ],
            baseHtml: `<p>This is normal text. <span class="highlight">This is highlighted.</span> Back to normal.</p>`,
            starterCode: `/* Style the .highlight class */\n`,
            testFunction: `const el = doc.querySelector('.highlight'); if (!el) return { success: false, message: "No .highlight element found." }; const s = doc.defaultView.getComputedStyle(el); if (s.backgroundColor !== 'rgb(255, 255, 0)') return { success: false, message: "Background should be yellow." }; const fw = parseInt(s.fontWeight); if (fw < 700 && s.fontWeight !== 'bold') return { success: false, message: "Font-weight should be bold." }; return { success: true, message: "Class selector works!" };`,
          },
          {
            id: "css-p-6",
            title: "Text Decoration",
            difficulty: "Easy",
            xp: 75,
            isCompleted: false,
            description: `Style links (\`a\`) to have:\n- color: #e74c3c (red)\n- No underline (text-decoration: none)\n- On hover: underline should appear`,
            hints: [
              "a { text-decoration: none; }",
              "a:hover { text-decoration: underline; }",
            ],
            baseHtml: `<p>Visit our <a href="#">awesome website</a> for more info.</p>`,
            starterCode: `/* Style the links */\n`,
            testFunction: `const a = doc.querySelector('a'); if (!a) return { success: false, message: "No link found." }; const s = doc.defaultView.getComputedStyle(a); if (s.textDecorationLine === 'underline') return { success: false, message: "Link should not have underline by default." }; if (s.color !== 'rgb(231, 76, 60)') return { success: false, message: "Link color should be #e74c3c." }; return { success: true, message: "Link styling done!" };`,
          },
        ],
      },
      {
        id: "css-box",
        title: "The Box",
        description: "Master the box model: padding, margin, and borders",
        totalXp: 400,
        problems: [
          {
            id: "css-b-1",
            title: "Padding Power",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Add \`20px\` of padding to the \`.card\` element on all sides.`,
            hints: ["padding: 20px adds space inside the element"],
            baseHtml: `<div class="card">I'm a card with padding!</div>`,
            starterCode: `.card {\n  background: #f0f0f0;\n  /* Add padding */\n}\n`,
            testFunction: `const el = doc.querySelector('.card'); if (!el) return { success: false, message: "No .card found." }; const s = doc.defaultView.getComputedStyle(el); if (s.paddingTop !== '20px') return { success: false, message: "Padding should be 20px. Got: " + s.paddingTop }; return { success: true, message: "Padding applied!" };`,
          },
          {
            id: "css-b-2",
            title: "Margin Matters",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Center a \`.box\` element horizontally using \`margin: 0 auto\` and give it a width of \`300px\`.`,
            hints: [
              "margin: 0 auto centers block elements",
              "Must have a width set",
            ],
            baseHtml: `<div class="box">I should be centered!</div>`,
            starterCode: `.box {\n  background: #3498db;\n  color: white;\n  padding: 20px;\n  /* Center me */\n}\n`,
            testFunction: `const el = doc.querySelector('.box'); if (!el) return { success: false, message: "No .box found." }; const s = doc.defaultView.getComputedStyle(el); if (s.width !== '300px') return { success: false, message: "Width should be 300px." }; if (s.marginLeft !== s.marginRight) return { success: false, message: "Use margin: 0 auto to center." }; return { success: true, message: "Box centered!" };`,
          },
          {
            id: "css-b-3",
            title: "Border Styling",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Add a border to \`.card\`:\n- 2px solid\n- Color: #e74c3c\n- Border-radius: 8px`,
            hints: [
              "border: 2px solid #e74c3c",
              "border-radius rounds corners",
            ],
            baseHtml: `<div class="card">Styled card with border</div>`,
            starterCode: `.card {\n  padding: 20px;\n  /* Add border */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.card')); if (!s.borderTopWidth || s.borderTopWidth !== '2px') return { success: false, message: "Border width should be 2px." }; if (s.borderTopStyle !== 'solid') return { success: false, message: "Border style should be solid." }; if (s.borderRadius !== '8px') return { success: false, message: "Border-radius should be 8px." }; return { success: true, message: "Border applied!" };`,
          },
          {
            id: "css-b-4",
            title: "Box Shadow",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Add a box-shadow to \`.card\`. Use values like: \`0 4px 6px rgba(0,0,0,0.1)\``,
            hints: [
              "box-shadow: x y blur color",
              "rgba allows transparent colors",
            ],
            baseHtml: `<div class="card">I have a shadow!</div>`,
            starterCode: `.card {\n  padding: 24px;\n  background: white;\n  border-radius: 8px;\n  /* Add shadow */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.card')); if (s.boxShadow === 'none' || !s.boxShadow) return { success: false, message: "Add a box-shadow." }; return { success: true, message: "Shadow added!" };`,
          },
          {
            id: "css-b-5",
            title: "Box Sizing",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Set \`.box\` to:\n- width: 200px\n- padding: 20px\n- border: 5px solid black\n- box-sizing: border-box\n\nWith border-box, the total width stays 200px.`,
            hints: [
              "box-sizing: border-box includes padding and border in the width",
            ],
            baseHtml: `<div class="box">Border Box Model</div>`,
            starterCode: `.box {\n  background: #ecf0f1;\n  /* Set width, padding, border, and box-sizing */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.box')); if (s.boxSizing !== 'border-box') return { success: false, message: "Set box-sizing to border-box." }; if (s.width !== '200px') return { success: false, message: "Width should be 200px." }; return { success: true, message: "Box sizing mastered!" };`,
          },
          {
            id: "css-b-6",
            title: "Width & Height",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Create a \`.square\` that is exactly 100px × 100px with a red background.`,
            hints: [
              "Set both width and height",
              "background: red or background-color: red",
            ],
            baseHtml: `<div class="square"></div>`,
            starterCode: `.square {\n  /* Make a 100x100 red square */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.square')); if (s.width !== '100px') return { success: false, message: "Width should be 100px." }; if (s.height !== '100px') return { success: false, message: "Height should be 100px." }; if (s.backgroundColor !== 'rgb(255, 0, 0)') return { success: false, message: "Background should be red." }; return { success: true, message: "Red square created!" };`,
          },
          {
            id: "css-b-7",
            title: "Overflow Control",
            difficulty: "Medium",
            xp: 50,
            isCompleted: false,
            description: `Set \`.container\` to:\n- height: 100px\n- overflow: auto\n\nThis creates a scrollable area.`,
            hints: ["overflow: auto adds scrollbars when needed"],
            baseHtml: `<div class="container"><p>Line 1</p><p>Line 2</p><p>Line 3</p><p>Line 4</p><p>Line 5</p><p>Line 6</p><p>Line 7</p><p>Line 8</p></div>`,
            starterCode: `.container {\n  border: 1px solid #ccc;\n  /* Set height and overflow */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.container')); if (s.height !== '100px') return { success: false, message: "Height should be 100px." }; if (s.overflow !== 'auto' && s.overflowY !== 'auto') return { success: false, message: "Overflow should be auto." }; return { success: true, message: "Overflow control works!" };`,
          },
        ],
      },
      {
        id: "css-typography",
        title: "The Typography",
        description: "Master fonts, text styling, and readability",
        totalXp: 300,
        problems: [
          {
            id: "css-ty-1",
            title: "Font Family",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Set the body font to \`'Georgia', serif\`.`,
            hints: [
              "font-family sets the typeface",
              "Include a fallback like serif",
            ],
            baseHtml: `<h1>Typography</h1><p>Beautiful fonts make beautiful pages.</p>`,
            starterCode: `/* Set the font */\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.body); if (!s.fontFamily.toLowerCase().includes('georgia')) return { success: false, message: "Font should include Georgia." }; return { success: true, message: "Font set!" };`,
          },
          {
            id: "css-ty-2",
            title: "Line Height & Spacing",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Set the paragraph's:\n- line-height to 1.8\n- letter-spacing to 1px`,
            hints: [
              "line-height controls space between lines",
              "letter-spacing controls space between characters",
            ],
            baseHtml: `<p>This paragraph should have better readability with increased line height and letter spacing for a more comfortable reading experience.</p>`,
            starterCode: `p {\n  /* Set line-height and letter-spacing */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('p')); const lh = parseFloat(s.lineHeight) / parseFloat(s.fontSize); if (Math.abs(lh - 1.8) > 0.1) return { success: false, message: "line-height should be 1.8." }; if (s.letterSpacing !== '1px') return { success: false, message: "letter-spacing should be 1px." }; return { success: true, message: "Spacing perfected!" };`,
          },
          {
            id: "css-ty-3",
            title: "Text Transform",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Transform the \`h1\` text to uppercase using CSS.`,
            hints: ["text-transform: uppercase"],
            baseHtml: `<h1>make me uppercase</h1>`,
            starterCode: `/* Transform the heading */\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('h1')); if (s.textTransform !== 'uppercase') return { success: false, message: "h1 text-transform should be uppercase." }; return { success: true, message: "Text transformed!" };`,
          },
          {
            id: "css-ty-4",
            title: "Custom List Styling",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Style the unordered list:\n- Remove default bullets (list-style: none)\n- Add padding: 0\n- Give each \`li\` a left border of 3px solid #3498db and padding-left of 12px`,
            hints: ["list-style: none removes bullets", "Style li separately"],
            baseHtml: `<ul><li>Item One</li><li>Item Two</li><li>Item Three</li></ul>`,
            starterCode: `ul {\n  /* Remove bullets */\n}\nli {\n  /* Add border and padding */\n}\n`,
            testFunction: `const ul = doc.defaultView.getComputedStyle(doc.querySelector('ul')); const li = doc.defaultView.getComputedStyle(doc.querySelector('li')); if (ul.listStyleType !== 'none') return { success: false, message: "Remove list bullets with list-style: none." }; if (li.borderLeftStyle !== 'solid') return { success: false, message: "li needs a left border." }; return { success: true, message: "List styled!" };`,
          },
          {
            id: "css-ty-5",
            title: "First Letter & Line",
            difficulty: "Hard",
            xp: 75,
            isCompleted: false,
            description: `Use CSS pseudo-elements to:\n- Make the \`::first-letter\` of the paragraph 32px and bold\n- Style the \`::first-line\` with color #e74c3c`,
            hints: [
              "p::first-letter targets the first letter",
              "p::first-line targets the first visible line",
            ],
            baseHtml: `<p>Once upon a time in the land of CSS, developers discovered the power of pseudo-elements and their pages were never the same again.</p>`,
            starterCode: `/* Style first letter and first line */\n`,
            testFunction: `const styles = doc.querySelectorAll('style'); let css = ''; styles.forEach(s => css += s.textContent); if (!css.includes('first-letter')) return { success: false, message: "Use ::first-letter pseudo-element." }; if (!css.includes('first-line')) return { success: false, message: "Use ::first-line pseudo-element." }; return { success: true, message: "Pseudo-elements mastered!" };`,
          },
        ],
      },
      {
        id: "css-layout",
        title: "The Layout",
        description: "Master Flexbox and create responsive layouts",
        totalXp: 400,
        problems: [
          {
            id: "css-la-1",
            title: "Flexbox Basics",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Make \`.container\` a flex container and arrange the items in a row with \`gap: 16px\`.`,
            hints: [
              "display: flex creates a flex container",
              "gap adds space between items",
            ],
            baseHtml: `<div class="container"><div class="item" style="background:#e74c3c;padding:20px;color:white">A</div><div class="item" style="background:#3498db;padding:20px;color:white">B</div><div class="item" style="background:#2ecc71;padding:20px;color:white">C</div></div>`,
            starterCode: `.container {\n  /* Make this a flex container */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.container')); if (s.display !== 'flex') return { success: false, message: "Set display: flex." }; if (s.gap !== '16px') return { success: false, message: "Set gap: 16px." }; return { success: true, message: "Flexbox activated!" };`,
          },
          {
            id: "css-la-2",
            title: "Center Everything",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Center the \`.box\` both horizontally and vertically inside \`.container\` using flexbox. Set container height to 300px.`,
            hints: [
              "justify-content: center for horizontal",
              "align-items: center for vertical",
              "Don't forget display: flex",
            ],
            baseHtml: `<div class="container"><div class="box" style="background:#9b59b6;color:white;padding:20px;border-radius:8px">Centered!</div></div>`,
            starterCode: `.container {\n  height: 300px;\n  background: #ecf0f1;\n  /* Center the box */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.container')); if (s.display !== 'flex') return { success: false, message: "Need display: flex." }; if (s.justifyContent !== 'center') return { success: false, message: "Set justify-content: center." }; if (s.alignItems !== 'center') return { success: false, message: "Set align-items: center." }; return { success: true, message: "Perfectly centered!" };`,
          },
          {
            id: "css-la-3",
            title: "Flex Direction",
            difficulty: "Easy",
            xp: 50,
            isCompleted: false,
            description: `Change \`.container\` to stack items vertically using \`flex-direction: column\` with \`gap: 12px\`.`,
            hints: ["flex-direction: column stacks vertically"],
            baseHtml: `<div class="container"><div style="background:#e74c3c;padding:16px;color:white;border-radius:4px">Top</div><div style="background:#3498db;padding:16px;color:white;border-radius:4px">Middle</div><div style="background:#2ecc71;padding:16px;color:white;border-radius:4px">Bottom</div></div>`,
            starterCode: `.container {\n  display: flex;\n  /* Stack vertically */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.container')); if (s.flexDirection !== 'column') return { success: false, message: "Set flex-direction: column." }; if (s.gap !== '12px') return { success: false, message: "Set gap: 12px." }; return { success: true, message: "Column layout done!" };`,
          },
          {
            id: "css-la-4",
            title: "Space Between",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Create a navigation bar: \`.navbar\` should use flexbox with \`justify-content: space-between\` and \`align-items: center\`. Set padding to 16px and background to #2c3e50.`,
            hints: [
              "space-between pushes items to edges",
              "align-items: center vertically centers",
            ],
            baseHtml: `<div class="navbar"><span style="color:white;font-weight:bold">Logo</span><div><a href="#" style="color:#ecf0f1;margin:0 8px">Home</a><a href="#" style="color:#ecf0f1;margin:0 8px">About</a><a href="#" style="color:#ecf0f1;margin:0 8px">Contact</a></div></div>`,
            starterCode: `.navbar {\n  /* Style the navbar */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.navbar')); if (s.display !== 'flex') return { success: false, message: "Need display: flex." }; if (s.justifyContent !== 'space-between') return { success: false, message: "Set justify-content: space-between." }; if (s.alignItems !== 'center') return { success: false, message: "Set align-items: center." }; return { success: true, message: "Navbar styled!" };`,
          },
          {
            id: "css-la-5",
            title: "Flex Wrap",
            difficulty: "Medium",
            xp: 75,
            isCompleted: false,
            description: `Make \`.grid\` a flex container that wraps items. Each \`.item\` should be 150px wide. Add gap of 12px.`,
            hints: [
              "flex-wrap: wrap allows items to flow to next line",
              "Set width on .item",
            ],
            baseHtml: `<div class="grid"><div class="item">1</div><div class="item">2</div><div class="item">3</div><div class="item">4</div><div class="item">5</div><div class="item">6</div></div>`,
            starterCode: `.grid {\n  /* Flex with wrap */\n}\n.item {\n  background: #3498db;\n  color: white;\n  padding: 20px;\n  text-align: center;\n  border-radius: 4px;\n  /* Set width */\n}\n`,
            testFunction: `const s = doc.defaultView.getComputedStyle(doc.querySelector('.grid')); if (s.display !== 'flex') return { success: false, message: "Need display: flex." }; if (s.flexWrap !== 'wrap') return { success: false, message: "Set flex-wrap: wrap." }; const item = doc.defaultView.getComputedStyle(doc.querySelector('.item')); if (item.width !== '150px') return { success: false, message: ".item width should be 150px." }; return { success: true, message: "Flex wrap works!" };`,
          },
          {
            id: "css-la-6",
            title: "Holy Grail Layout",
            difficulty: "Hard",
            xp: 100,
            isCompleted: false,
            description: `Create a classic layout with \`.page\` as a column flex container (min-height: 100vh):\n- \`.header\` — height: 60px, background: #2c3e50\n- \`.content\` — flex: 1 (takes remaining space)\n- \`.footer\` — height: 40px, background: #34495e`,
            hints: [
              "flex-direction: column on .page",
              "flex: 1 on .content makes it grow",
            ],
            baseHtml: `<div class="page"><div class="header" style="color:white;display:flex;align-items:center;padding:0 16px">Header</div><div class="content" style="padding:16px">Main Content Area</div><div class="footer" style="color:white;display:flex;align-items:center;padding:0 16px">Footer</div></div>`,
            starterCode: `.page {\n  /* Column layout */\n}\n.header {\n  /* Header styles */\n}\n.content {\n  /* Grow to fill */\n}\n.footer {\n  /* Footer styles */\n}\n`,
            testFunction: `const page = doc.defaultView.getComputedStyle(doc.querySelector('.page')); if (page.display !== 'flex') return { success: false, message: ".page needs display: flex." }; if (page.flexDirection !== 'column') return { success: false, message: ".page needs flex-direction: column." }; const content = doc.defaultView.getComputedStyle(doc.querySelector('.content')); if (content.flexGrow !== '1') return { success: false, message: ".content needs flex: 1." }; return { success: true, message: "Holy Grail layout complete!" };`,
          },
        ],
      },
    ],
  },
};

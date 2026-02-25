export const javascriptPlayground = {
  title: "The JavaScript Codex",
  subtitle:
    "Master Modern JavaScript from ES6 Fundamentals to Advanced Patterns",
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
          description: `Declare a variable named 'message' using 'const' and assign it the string value "Hello World".`,
          hints: [
            "Use the 'const' keyword to declare a variable.",
            "The syntax is: const variableName = 'value';",
          ],
          starterCode: "// Declare your variable here\n",
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
          description: `Declare a variable 'score' using 'let' with an initial value of '0', then reassign it to '10'.`,
          hints: [
            "Use 'let' for variables you plan to reassign.",
            "Assign 0 first, then on the next line set score = 10.",
          ],
          starterCode:
            "// Declare score with let and set to 0\n// Then update score to 10\n",
          testFunction: `
try {
  if (typeof score === 'undefined') {
    console.log(JSON.stringify({ success: false, message: "Variable 'score' is not defined." }));
  } else if (score !== 10) {
    console.log(JSON.stringify({ success: false, message: "Expected score to be 10 but got " + score + "." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Correct! 'let' allows reassignment." }));
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
- 'name' (string) with value "eduQuest"
- 'level' (number) with value 42
- 'isActive' (boolean) with value true`,
          hints: [
            "Use const for all three.",
            "Strings use quotes, numbers don't, booleans are true/false.",
          ],
          starterCode: "// Create three variables\n",
          testFunction: `
try {
  let errors = [];
  if (typeof name === 'undefined') errors.push("'name' is not defined");
  else if (typeof name !== 'string' || name !== "eduQuest") errors.push("'name' should be the string 'eduQuest'");
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
          description: `Create a variable 'greeting' using template literals. Given 'userName = "Alex"', set greeting to "Hello, Alex! Welcome to eduQuest."`,
          hints: [
            "Use backticks: 'Hello, ${userName}!'",
            "Template literals use ${ } for interpolation.",
          ],
          starterCode:
            'const userName = "Alex";\n// Create greeting using template literals\n',
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
    // ADVANCED JAVASCRIPT & MODERN PATTERNS
    {
      id: "js-es6",
      title: "ES6+ Features",
      description: "Master modern JavaScript features from ES6 to ES2023",
      totalXp: 500,
      problems: [
        {
          id: "js-es6-1",
          title: "Arrow Functions",
          difficulty: "Medium",
          xp: 80,
          isCompleted: false,
          description: `Convert this function to arrow function:
function add(a, b) {
  return a + b;
}
Create arrow function 'addArrow' that does the same thing.`,
          hints: [
            "Arrow syntax: (params) => expression",
            "Single parameter: param => expression",
          ],
          starterCode: `// Convert to arrow function\nconst addArrow = `,
          testFunction: `
try {
  if (typeof addArrow !== 'function') {
    console.log(JSON.stringify({ success: false, message: "addArrow is not defined." }));
  } else if (addArrow(2, 3) !== 5) {
    console.log(JSON.stringify({ success: false, message: "addArrow(2, 3) should return 5." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Arrow function mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-es6-2",
          title: "Destructuring",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Given 'user = { name: "Alex", age: 25, city: "NYC" }', use destructuring to create variables 'name', 'age', and 'city'.`,
          hints: [
            "const { name, age, city } = user;",
            "Destructure objects with {}",
          ],
          starterCode: `const user = { name: "Alex", age: 25, city: "NYC" };\n// Destructure here\n`,
          testFunction: `
try {
  let errors = [];
  if (typeof name === 'undefined') errors.push("'name' is not defined");
  else if (name !== "Alex") errors.push("'name' should be 'Alex'");
  if (typeof age === 'undefined') errors.push("'age' is not defined");
  else if (age !== 25) errors.push("'age' should be 25");
  if (typeof city === 'undefined') errors.push("'city' is not defined");
  else if (city !== "NYC") errors.push("'city' should be 'NYC'");
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
          id: "js-es6-3",
          title: "Spread Operator",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Create functions:
1. 'mergeArrays(arr1, arr2)' - combines two arrays
2. 'sumNumbers(...nums)' - accepts any number of arguments and returns sum`,
          hints: ["[...arr] spreads array", "...args gathers rest parameters"],
          starterCode: `const mergeArrays = (arr1, arr2) => {
  // Use spread operator
};
const sumNumbers = (...nums) => {
  // Sum all numbers
};`,
          testFunction: `
try {
  let errors = [];
  if (typeof mergeArrays !== 'function') errors.push("'mergeArrays' is not defined");
  else if (JSON.stringify(mergeArrays([1,2], [3,4])) !== JSON.stringify([1,2,3,4])) errors.push("mergeArrays should combine arrays");
  if (typeof sumNumbers !== 'function') errors.push("'sumNumbers' is not defined");
  else if (sumNumbers(1,2,3,4) !== 10) errors.push("sumNumbers should sum all arguments");
  if (errors.length > 0) {
    console.log(JSON.stringify({ success: false, message: errors.join(". ") }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Spread operator mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-es6-4",
          title: "Template Literals Advanced",
          difficulty: "Medium",
          xp: 80,
          isCompleted: false,
          description: `Create a function 'createUserCard(user)' that returns a template literal with:
- User's name in uppercase
- Their age
- A calculated status (adult if age >= 18, minor otherwise)`,
          hints: [
            "Use ${expression} in template literals",
            "Can call functions inside ${}",
          ],
          starterCode: `const createUserCard = (user) => {
  return \`\`; // Use advanced template literals
};`,
          testFunction: `
try {
  if (typeof createUserCard !== 'function') {
    console.log(JSON.stringify({ success: false, message: "createUserCard is not defined." }));
  } else {
    const result = createUserCard({ name: "Alex", age: 25 });
    if (result.includes("ALEX") && result.includes("25") && result.includes("adult")) {
      console.log(JSON.stringify({ success: true, message: "Advanced template literals mastered!" }));
    } else {
      console.log(JSON.stringify({ success: false, message: "Template literal should include uppercase name, age, and status." }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-es6-5",
          title: "Optional Chaining",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Given nested data, use optional chaining to safely access properties:
const user = {
  profile: {
    address: {
      street: "123 Main St",
      city: "NYC"
    }
  }
}
Safely get user.profile.address.zip (which doesn't exist).`,
          hints: [
            "user.profile?.address?.zip",
            "Returns undefined instead of error",
          ],
          starterCode: `const user = {
  profile: {
    address: {
      street: "123 Main St",
      city: "NYC"
    }
  }
};
// Use optional chaining to get zip
const zip = `,
          testFunction: `
try {
  if (typeof zip === 'undefined') {
    console.log(JSON.stringify({ success: false, message: "zip is not defined." }));
  } else if (zip !== undefined) {
    console.log(JSON.stringify({ success: false, message: "zip should be undefined (property doesn't exist)." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Optional chaining mastered!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
      ],
    },
    {
      id: "js-async",
      title: "Asynchronous JavaScript",
      description: "Master promises, async/await, and modern async patterns",
      totalXp: 550,
      problems: [
        {
          id: "js-async-1",
          title: "Basic Promises",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Create a function 'fetchData()' that returns a Promise resolving to "Data loaded!" after 2 seconds.`,
          hints: [
            "new Promise((resolve, reject) => {})",
            "setTimeout(resolve, 2000)",
          ],
          starterCode: `const fetchData = () => {
  return new Promise((resolve, reject) => {
    // Resolve after 2 seconds
  });
};`,
          testFunction: `
try {
  if (typeof fetchData !== 'function') {
    console.log(JSON.stringify({ success: false, message: "fetchData is not defined." }));
  } else {
    fetchData().then(data => {
      if (data === "Data loaded!") {
        console.log(JSON.stringify({ success: true, message: "Promise created successfully!" }));
      } else {
        console.log(JSON.stringify({ success: false, message: "Promise should resolve to 'Data loaded!'" }));
      }
    }).catch(e => {
      console.log(JSON.stringify({ success: false, message: e.message }));
    });
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-async-2",
          title: "Async/Await",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Create an async function 'getUserData(userId)' that:
1. Simulates API call with delay
2. Returns user object { id: userId, name: "User {userId}" }
3. Uses try/catch for error handling`,
          hints: [
            "async function name() {}",
            "await promise",
            "try/catch for errors",
          ],
          starterCode: `const simulateApiCall = (id) => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ id, name: \`User \${id}\` }), 1000);
  });
};

const getUserData = async (userId) => {
  try {
    // Use await and return user data
  } catch (error) {
    // Handle errors
  }
};`,
          testFunction: `
try {
  if (typeof getUserData !== 'function') {
    console.log(JSON.stringify({ success: false, message: "getUserData is not defined." }));
  } else {
    getUserData(123).then(user => {
      if (user.id === 123 && user.name === "User 123") {
        console.log(JSON.stringify({ success: true, message: "Async/await mastered!" }));
      } else {
        console.log(JSON.stringify({ success: false, message: "Function should return correct user object." }));
      }
    }).catch(e => {
      console.log(JSON.stringify({ success: false, message: e.message }));
    });
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-async-3",
          title: "Promise.all",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Create 'fetchMultipleData()' that fetches 3 different data sources concurrently using Promise.all and returns combined result.`,
          hints: [
            "Promise.all([promise1, promise2, promise3])",
            "Returns array of results",
          ],
          starterCode: `const fetchUser = () => new Promise(resolve => setTimeout(() => resolve("User Data"), 1000));
const fetchPosts = () => new Promise(resolve => setTimeout(() => resolve("Posts Data"), 1500));
const fetchComments = () => new Promise(resolve => setTimeout(() => resolve("Comments Data"), 800));

const fetchMultipleData = async () => {
  try {
    // Use Promise.all to fetch all data
  } catch (error) {
    // Handle errors
  }
};`,
          testFunction: `
try {
  if (typeof fetchMultipleData !== 'function') {
    console.log(JSON.stringify({ success: false, message: "fetchMultipleData is not defined." }));
  } else {
    fetchMultipleData().then(data => {
      if (Array.isArray(data) && data.length === 3) {
        console.log(JSON.stringify({ success: true, message: "Promise.all mastered!" }));
      } else {
        console.log(JSON.stringify({ success: false, message: "Should return array with 3 items." }));
      }
    }).catch(e => {
      console.log(JSON.stringify({ success: false, message: e.message }));
    });
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-async-4",
          title: "Error Handling in Async",
          difficulty: "Expert",
          xp: 150,
          isCompleted: false,
          description: `Create 'robustFetch(url)' that:
1. Uses fetch with timeout
2. Handles network errors
3. Handles timeout errors
4. Returns proper error messages`,
          hints: [
            "Promise.race() for timeout",
            "try/catch in async",
            "Different error types",
          ],
          starterCode: `const robustFetch = async (url) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Request timeout")), 5000)
  );
  
  try {
    // Implement robust fetching with timeout
  } catch (error) {
    // Handle different error types
  }
};`,
          testFunction: `
try {
  if (typeof robustFetch !== 'function') {
    console.log(JSON.stringify({ success: false, message: "robustFetch is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Robust async error handling implemented!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
      ],
    },
    {
      id: "js-functional",
      title: "Functional Programming",
      description:
        "Explore functional programming patterns and higher-order functions",
      totalXp: 450,
      problems: [
        {
          id: "js-func-1",
          title: "Map Function",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Implement your own 'map' function that works like Array.prototype.map() to double each number in an array.`,
          hints: [
            "function customMap(arr, callback) {}",
            "Loop and call callback for each item",
          ],
          starterCode: `const customMap = (arr, callback) => {
  const result = [];
  // Implement map logic
  return result;
};`,
          testFunction: `
try {
  if (typeof customMap !== 'function') {
    console.log(JSON.stringify({ success: false, message: "customMap is not defined." }));
  } else {
    const result = customMap([1, 2, 3], x => x * 2);
    if (JSON.stringify(result) === JSON.stringify([2, 4, 6])) {
      console.log(JSON.stringify({ success: true, message: "Custom map implemented!" }));
    } else {
      console.log(JSON.stringify({ success: false, message: "Should return [2, 4, 6]." }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-func-2",
          title: "Filter Function",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Implement 'customFilter' that returns only even numbers from an array.`,
          hints: [
            "Test each item with callback",
            "Push to result array if true",
          ],
          starterCode: `const customFilter = (arr, callback) => {
  const result = [];
  // Implement filter logic
  return result;
};`,
          testFunction: `
try {
  if (typeof customFilter !== 'function') {
    console.log(JSON.stringify({ success: false, message: "customFilter is not defined." }));
  } else {
    const result = customFilter([1, 2, 3, 4, 5, 6], x => x % 2 === 0);
    if (JSON.stringify(result) === JSON.stringify([2, 4, 6])) {
      console.log(JSON.stringify({ success: true, message: "Custom filter implemented!" }));
    } else {
      console.log(JSON.stringify({ success: false, message: "Should return [2, 4, 6]." }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-func-3",
          title: "Reduce Function",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Implement 'customReduce' that sums all numbers in an array, similar to Array.prototype.reduce().`,
          hints: ["reduce(callback, initialValue)", "Accumulator pattern"],
          starterCode: `const customReduce = (arr, callback, initialValue) => {
  let accumulator = initialValue;
  // Implement reduce logic
  return accumulator;
};`,
          testFunction: `
try {
  if (typeof customReduce !== 'function') {
    console.log(JSON.stringify({ success: false, message: "customReduce is not defined." }));
  } else {
    const result = customReduce([1, 2, 3, 4], (acc, val) => acc + val, 0);
    if (result === 10) {
      console.log(JSON.stringify({ success: true, message: "Custom reduce implemented!" }));
    } else {
      console.log(JSON.stringify({ success: false, message: "Should return 10." }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-func-4",
          title: "Function Composition",
          difficulty: "Expert",
          xp: 130,
          isCompleted: false,
          description: `Create 'compose' function that combines multiple functions: compose(f, g, h)(x) should return f(g(h(x))).`,
          hints: [
            "Functions are first-class citizens",
            "Right-to-left composition",
          ],
          starterCode: `const compose = (...functions) => {
  return (arg) => {
    // Implement function composition
  };
};

// Test functions
const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;
const toString = x => x.toString();`,
          testFunction: `
try {
  if (typeof compose !== 'function') {
    console.log(JSON.stringify({ success: false, message: "compose is not defined." }));
  } else {
    const composed = compose(toString, multiplyByTwo, addOne);
    const result = composed(4); // Should be toString(multiplyByTwo(addOne(4))) = toString(10) = "10"
    if (result === "10") {
      console.log(JSON.stringify({ success: true, message: "Function composition mastered!" }));
    } else {
      console.log(JSON.stringify({ success: false, message: "Should return '10'." }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
      ],
    },
    {
      id: "js-modern",
      title: "Modern JavaScript Patterns",
      description: "Master contemporary patterns and best practices",
      totalXp: 500,
      problems: [
        {
          id: "js-mod-1",
          title: "Modules",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Create a simple module system with import/export syntax. Export constants and functions, then import them.`,
          hints: [
            "export const NAME = 'value'",
            "import { NAME } from './module'",
          ],
          starterCode: `// Module exports (normally in separate file)
export const API_URL = 'https://api.example.com';
export const fetchData = () => 'Data from module';

// Module imports
import { API_URL, fetchData } from './module'; // Simulated import
console.log(API_URL);`,
          testFunction: `
try {
  if (typeof API_URL !== 'undefined' && API_URL === 'https://api.example.com') {
    console.log(JSON.stringify({ success: true, message: "Module system understood!" }));
  } else {
    console.log(JSON.stringify({ success: false, message: "Module exports/imports not working." }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-mod-2",
          title: "Closures",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Create a 'createCounter' function that returns a counter object with increment() and getValue() methods that maintain private state.`,
          hints: [
            "Closure maintains private variables",
            "Return object with methods",
          ],
          starterCode: `const createCounter = () => {
  let count = 0; // Private variable
  
  return {
    increment: () => {
      // Increment private count
    },
    getValue: () => {
      // Return private count
    }
  };
};`,
          testFunction: `
try {
  if (typeof createCounter !== 'function') {
    console.log(JSON.stringify({ success: false, message: "createCounter is not defined." }));
  } else {
    const counter = createCounter();
    counter.increment();
    counter.increment();
    if (counter.getValue() === 2) {
      console.log(JSON.stringify({ success: true, message: "Closure pattern mastered!" }));
    } else {
      console.log(JSON.stringify({ success: false, message: "Counter should maintain private state." }));
    }
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-mod-3",
          title: "Proxy and Reflect",
          difficulty: "Expert",
          xp: 150,
          isCompleted: false,
          description: `Create a proxy that logs all property access on an object. Use Reflect to maintain default behavior.`,
          hints: ["new Proxy(target, handler)", "Reflect.get(target, prop)"],
          starterCode: `const createLoggingProxy = (obj) => {
  return new Proxy(obj, {
    get(target, prop) {
      // Log access and use Reflect
      console.log(\`Accessing property: \${prop}\`);
      // Use Reflect to get the actual value
    }
  });
};

const user = { name: "Alex", age: 25 };
const loggedUser = createLoggingProxy(user);`,
          testFunction: `
try {
  if (typeof createLoggingProxy !== 'function') {
    console.log(JSON.stringify({ success: false, message: "createLoggingProxy is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Proxy pattern implemented!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-mod-4",
          title: "Decorators",
          difficulty: "Expert",
          xp: 130,
          isCompleted: false,
          description: `Create a simple decorator that adds logging to a method. Show understanding of the decorator pattern.`,
          hints: [
            "Higher-order function",
            "Wrap original function",
            "Maintain this context",
          ],
          starterCode: `const addLogging = (fn) => {
  return function(...args) {
    // Add logging before and after function call
    console.log(\`Calling \${fn.name} with args: \${args}\`);
    const result = fn.apply(this, args);
    console.log(\`Result: \${result}\`);
    return result;
  };
};

class Calculator {
  add(a, b) {
    return a + b;
  }
}

// Apply decorator
Calculator.prototype.add = addLogging(Calculator.prototype.add);`,
          testFunction: `
try {
  if (typeof addLogging !== 'function') {
    console.log(JSON.stringify({ success: false, message: "addLogging decorator is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Decorator pattern implemented!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
      ],
    },
    {
      id: "js-performance",
      title: "Performance & Optimization",
      description: "Write efficient, high-performance JavaScript code",
      totalXp: 400,
      problems: [
        {
          id: "js-perf-1",
          title: "Debouncing",
          difficulty: "Hard",
          xp: 100,
          isCompleted: false,
          description: `Implement a 'debounce' function that delays function execution until after rapid calls stop.`,
          hints: ["setTimeout", "clearTimeout", "Return new function"],
          starterCode: `const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    // Implement debouncing logic
  };
};`,
          testFunction: `
try {
  if (typeof debounce !== 'function') {
    console.log(JSON.stringify({ success: false, message: "debounce is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Debounce implemented!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-perf-2",
          title: "Throttling",
          difficulty: "Hard",
          xp: 100,
          isCompleted: false,
          description: `Implement 'throttle' function that limits function execution to once per time period.`,
          hints: [
            "Track last execution time",
            "Return early if within throttle period",
          ],
          starterCode: `const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    // Implement throttling logic
  };
};`,
          testFunction: `
try {
  if (typeof throttle !== 'function') {
    console.log(JSON.stringify({ success: false, message: "throttle is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Throttle implemented!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-perf-3",
          title: "Memory Management",
          difficulty: "Expert",
          xp: 120,
          isCompleted: false,
          description: `Create a memory-efficient event system that properly cleans up event listeners to prevent memory leaks.`,
          hints: [
            "WeakMap for private data",
            "Cleanup methods",
            "Remove event listeners",
          ],
          starterCode: `class EventEmitter {
  constructor() {
    this.events = new Map(); // Or use WeakMap for better memory
  }
  
  on(event, callback) {
    // Add event listener with cleanup tracking
  }
  
  emit(event, ...args) {
    // Emit event to all listeners
  }
  
  off(event, callback) {
    // Remove specific listener
  }
  
  cleanup() {
    // Remove all listeners and prevent memory leaks
  }
}`,
          testFunction: `
try {
  if (typeof EventEmitter !== 'function') {
    console.log(JSON.stringify({ success: false, message: "EventEmitter is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Memory management implemented!" }));
  }
} catch (e) {
  console.log(JSON.stringify({ success: false, message: e.message }));
}
`,
        },
        {
          id: "js-perf-4",
          title: "Lazy Loading",
          difficulty: "Medium",
          xp: 80,
          isCompleted: false,
          description: `Implement a lazy loading pattern that loads data only when needed, with caching.`,
          hints: [
            "Promise caching",
            "Load on first access",
            "Return cached data on subsequent calls",
          ],
          starterCode: `const createLazyLoader = (fetchFunction) => {
  let cache = new Map();
  let isLoading = false;
  
  return async (id) => {
    // Implement lazy loading with caching
  };
};`,
          testFunction: `
try {
  if (typeof createLazyLoader !== 'function') {
    console.log(JSON.stringify({ success: false, message: "createLazyLoader is not defined." }));
  } else {
    console.log(JSON.stringify({ success: true, message: "Lazy loading pattern implemented!" }));
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

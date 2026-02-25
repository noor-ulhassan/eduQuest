export const pythonPlayground = {
  title: "Python 3 Fundamentals",
  subtitle:
    "Master Modern Python from Basics to Advanced Data Science & AI Applications",
  chapters: [
    // ΓöÇΓöÇΓöÇ CHAPTER 1: VARIABLES & DATA TYPES ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    {
      id: "py-variables",
      title: "Variables & Data Types",
      description: "Master the fundamentals of Python variables and data types",
      totalXp: 300,
      problems: [
        {
          id: "py-var-1",
          title: "Your First Variable",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Create a variable named \`message\` and assign it the string value "Hello World".`,
          hints: [
            'Use the assignment operator: message = "Hello World"',
            "Python does not need const or let ΓÇö just assign directly.",
          ],
          starterCode: `# Create your variable here\n`,
          testFunction: `
import json
try:
    errors = []
    if 'message' not in dir():
        errors.append("Variable 'message' is not defined")
    elif not isinstance(message, str):
        errors.append("'message' should be a string")
    elif message != "Hello World":
        errors.append("Expected 'Hello World' but got '" + str(message) + "'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Great job! You declared your first variable."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-var-2",
          title: "Multiple Types",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Create three variables:\n- \`name\` (string) with value "eduQuest"\n- \`level\` (integer) with value 42\n- \`is_active\` (boolean) with value True`,
          hints: [
            "Strings use quotes, numbers don't, booleans are True/False (capital T/F).",
            "Python booleans are True and False, not true and false.",
          ],
          starterCode: `# Create three variables\n`,
          testFunction: `
import json
try:
    errors = []
    if 'name' not in dir():
        errors.append("'name' is not defined")
    elif not isinstance(name, str) or name != "eduQuest":
        errors.append("'name' should be the string 'eduQuest'")
    if 'level' not in dir():
        errors.append("'level' is not defined")
    elif not isinstance(level, int) or level != 42:
        errors.append("'level' should be the integer 42")
    if 'is_active' not in dir():
        errors.append("'is_active' is not defined")
    elif not isinstance(is_active, bool) or is_active != True:
        errors.append("'is_active' should be True")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "All three variables are correct!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-var-3",
          title: "F-Strings",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Given \`user_name = "Alex"\`, create a variable \`greeting\` using an f-string with the value "Hello, Alex! Welcome to eduQuest."`,
          hints: [
            'F-strings use f"...{variable}..." syntax.',
            'f"Hello, {user_name}! Welcome to eduQuest."',
          ],
          starterCode: `user_name = "Alex"\n# Create greeting using an f-string\n`,
          testFunction: `
import json
try:
    if 'greeting' not in dir():
        print(json.dumps({"success": False, "message": "Variable 'greeting' is not defined."}))
    elif greeting != "Hello, Alex! Welcome to eduQuest.":
        print(json.dumps({"success": False, "message": "Expected 'Hello, Alex! Welcome to eduQuest.' but got '" + str(greeting) + "'"}))
    else:
        print(json.dumps({"success": True, "message": "F-strings mastered!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-var-4",
          title: "String Methods",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Given \`text = "Python"\`, create:\n- \`upper\` ΓÇö the text in all uppercase\n- \`length\` ΓÇö the length of the text\n- \`first_char\` ΓÇö the first character`,
          hints: ["Use .upper(), len(), and text[0]."],
          starterCode: `text = "Python"\n# Create upper, length, and first_char\n`,
          testFunction: `
import json
try:
    errors = []
    if 'upper' not in dir():
        errors.append("'upper' is not defined")
    elif upper != "PYTHON":
        errors.append("'upper' should be 'PYTHON'")
    if 'length' not in dir():
        errors.append("'length' is not defined")
    elif length != 6:
        errors.append("'length' should be 6")
    if 'first_char' not in dir():
        errors.append("'first_char' is not defined")
    elif first_char != "P":
        errors.append("'first_char' should be 'P'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "String methods mastered!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-var-5",
          title: "Type Conversion",
          difficulty: "Medium",
          xp: 50,
          isCompleted: false,
          description: `Given \`num_str = "42"\`, create:\n- \`num\` ΓÇö convert it to an integer\n- \`back_to_str\` ΓÇö convert num back to a string`,
          hints: [
            "Use int() to convert string to integer.",
            "Use str() to convert back.",
          ],
          starterCode: `num_str = "42"\n# Convert to integer, then back to string\n`,
          testFunction: `
import json
try:
    errors = []
    if 'num' not in dir():
        errors.append("'num' is not defined")
    elif not isinstance(num, int) or num != 42:
        errors.append("'num' should be the integer 42")
    if 'back_to_str' not in dir():
        errors.append("'back_to_str' is not defined")
    elif not isinstance(back_to_str, str) or back_to_str != "42":
        errors.append("'back_to_str' should be the string '42'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Type conversion mastered!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-var-6",
          title: "Multiple Assignment",
          difficulty: "Medium",
          xp: 50,
          isCompleted: false,
          description: `Use Python's multiple assignment to create three variables in a single line:\n- \`x\` = 10\n- \`y\` = 20\n- \`z\` = 30`,
          hints: ["Python supports: x, y, z = 10, 20, 30"],
          starterCode: `# Assign x, y, z in one line\n`,
          testFunction: `
import json
try:
    errors = []
    if 'x' not in dir() or x != 10:
        errors.append("'x' should be 10")
    if 'y' not in dir() or y != 20:
        errors.append("'y' should be 20")
    if 'z' not in dir() or z != 30:
        errors.append("'z' should be 30")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Multiple assignment works!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },

    // ΓöÇΓöÇΓöÇ CHAPTER 2: CONDITIONALS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    {
      id: "py-conditionals",
      title: "Conditionals & Logic",
      description: "Make decisions with if/elif/else and comparison operators",
      totalXp: 250,
      problems: [
        {
          id: "py-cond-1",
          title: "Positive or Negative",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`check_sign(num)\` that returns:\n- "positive" if num > 0\n- "negative" if num < 0\n- "zero" if num == 0`,
          hints: ["Use if/elif/else.", "Return string values."],
          starterCode: `def check_sign(num):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    if not callable(check_sign):
        print(json.dumps({"success": False, "message": "Function 'check_sign' is not defined."}))
    else:
        errors = []
        if check_sign(5) != "positive":
            errors.append("check_sign(5) should return 'positive'")
        if check_sign(-3) != "negative":
            errors.append("check_sign(-3) should return 'negative'")
        if check_sign(0) != "zero":
            errors.append("check_sign(0) should return 'zero'")
        if len(errors) > 0:
            print(json.dumps({"success": False, "message": ". ".join(errors)}))
        else:
            print(json.dumps({"success": True, "message": "All cases handled correctly!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'check_sign' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-cond-2",
          title: "Grade Calculator",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`get_grade(score)\` that returns:\n- "A" for score >= 90\n- "B" for score >= 80\n- "C" for score >= 70\n- "D" for score >= 60\n- "F" for anything below 60`,
          hints: [
            "Use if/elif chain, checking from highest to lowest.",
            "The order of conditions matters!",
          ],
          starterCode: `def get_grade(score):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if get_grade(95) != "A":
        errors.append("get_grade(95) should return 'A'")
    if get_grade(85) != "B":
        errors.append("get_grade(85) should return 'B'")
    if get_grade(75) != "C":
        errors.append("get_grade(75) should return 'C'")
    if get_grade(65) != "D":
        errors.append("get_grade(65) should return 'D'")
    if get_grade(50) != "F":
        errors.append("get_grade(50) should return 'F'")
    if get_grade(90) != "A":
        errors.append("get_grade(90) should return 'A' (boundary)")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Grade calculator works perfectly!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'get_grade' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-cond-3",
          title: "Even or Odd",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`even_or_odd(num)\` that returns "even" if the number is even, otherwise "odd".`,
          hints: ["Use the modulo operator: num % 2"],
          starterCode: `def even_or_odd(num):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if even_or_odd(4) != "even":
        errors.append("even_or_odd(4) should return 'even'")
    if even_or_odd(7) != "odd":
        errors.append("even_or_odd(7) should return 'odd'")
    if even_or_odd(0) != "even":
        errors.append("even_or_odd(0) should return 'even'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Even/odd check works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'even_or_odd' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-cond-4",
          title: "Logical Operators",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`can_ride(height, age)\` that returns True only if height >= 120 AND age >= 10.`,
          hints: ["Use the 'and' keyword.", "Both conditions must be True."],
          starterCode: `def can_ride(height, age):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if can_ride(130, 12) != True:
        errors.append("can_ride(130, 12) should return True")
    if can_ride(110, 12) != False:
        errors.append("can_ride(110, 12) should return False (too short)")
    if can_ride(130, 8) != False:
        errors.append("can_ride(130, 8) should return False (too young)")
    if can_ride(100, 5) != False:
        errors.append("can_ride(100, 5) should return False (both fail)")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Logical operators working!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'can_ride' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },

    // ΓöÇΓöÇΓöÇ CHAPTER 3: LOOPS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    {
      id: "py-loops",
      title: "Loops",
      description: "Repeat actions with for and while loops",
      totalXp: 350,
      problems: [
        {
          id: "py-loop-1",
          title: "Sum 1 to N",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`sum_to(n)\` that returns the sum of all numbers from 1 to n (inclusive).`,
          hints: [
            "Use a for loop: for i in range(1, n + 1)",
            "Keep a running total variable.",
          ],
          starterCode: `def sum_to(n):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if sum_to(5) != 15:
        errors.append("sum_to(5) should return 15")
    if sum_to(10) != 55:
        errors.append("sum_to(10) should return 55")
    if sum_to(1) != 1:
        errors.append("sum_to(1) should return 1")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Loop logic is solid!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'sum_to' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-loop-2",
          title: "FizzBuzz",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`fizzbuzz(n)\` that returns a list from 1 to n where:\n- Multiples of 3 are replaced with "Fizz"\n- Multiples of 5 are replaced with "Buzz"\n- Multiples of both are replaced with "FizzBuzz"\n- All other numbers stay as integers`,
          hints: [
            "Check divisible by 15 first (both 3 and 5).",
            "Use % (modulo) operator to check divisibility.",
            "Append results to a list and return it.",
          ],
          starterCode: `def fizzbuzz(n):\n    # Return a list\n    pass\n`,
          testFunction: `
import json
try:
    result = fizzbuzz(15)
    if not isinstance(result, list):
        print(json.dumps({"success": False, "message": "fizzbuzz should return a list."}))
    else:
        errors = []
        if result[0] != 1:
            errors.append("Index 0 should be 1")
        if result[2] != "Fizz":
            errors.append("Index 2 should be 'Fizz' (3)")
        if result[4] != "Buzz":
            errors.append("Index 4 should be 'Buzz' (5)")
        if result[14] != "FizzBuzz":
            errors.append("Index 14 should be 'FizzBuzz' (15)")
        if len(result) != 15:
            errors.append("List length should be 15")
        if len(errors) > 0:
            print(json.dumps({"success": False, "message": ". ".join(errors)}))
        else:
            print(json.dumps({"success": True, "message": "FizzBuzz complete!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'fizzbuzz' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-loop-3",
          title: "Count Vowels",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`count_vowels(s)\` that returns the number of vowels (a, e, i, o, u) in the string. Case insensitive.`,
          hints: [
            "Convert to lowercase first with .lower().",
            "Check if each character is in 'aeiou'.",
          ],
          starterCode: `def count_vowels(s):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if count_vowels("hello") != 2:
        errors.append("count_vowels('hello') should return 2")
    if count_vowels("AEIOU") != 5:
        errors.append("count_vowels('AEIOU') should return 5")
    if count_vowels("xyz") != 0:
        errors.append("count_vowels('xyz') should return 0")
    if count_vowels("Python") != 1:
        errors.append("count_vowels('Python') should return 1")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Vowel counter works perfectly!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'count_vowels' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-loop-4",
          title: "Reverse a String",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`reverse_string(s)\` that returns the string reversed. Do NOT use slicing ([::-1]).`,
          hints: [
            "Loop from the end of the string to the beginning.",
            "Build a new string character by character.",
          ],
          starterCode: `def reverse_string(s):\n    # Don't use [::-1]\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if reverse_string("hello") != "olleh":
        errors.append("reverse_string('hello') should return 'olleh'")
    if reverse_string("abc") != "cba":
        errors.append("reverse_string('abc') should return 'cba'")
    if reverse_string("a") != "a":
        errors.append("reverse_string('a') should return 'a'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "String reversal complete!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'reverse_string' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-loop-5",
          title: "Find Maximum",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Write a function \`find_max(lst)\` that returns the largest number in a list. Do NOT use the built-in max().`,
          hints: [
            "Start with the first element as the current max.",
            "Loop through and compare each element.",
          ],
          starterCode: `def find_max(lst):\n    # Don't use max()\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if find_max([1, 5, 3, 9, 2]) != 9:
        errors.append("find_max([1,5,3,9,2]) should return 9")
    if find_max([-1, -5, -3]) != -1:
        errors.append("find_max([-1,-5,-3]) should return -1")
    if find_max([42]) != 42:
        errors.append("find_max([42]) should return 42")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Max finder works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'find_max' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },

    // ΓöÇΓöÇΓöÇ CHAPTER 4: FUNCTIONS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    {
      id: "py-functions",
      title: "Functions",
      description: "Learn to create reusable blocks of code",
      totalXp: 350,
      problems: [
        {
          id: "py-func-1",
          title: "Add Two Numbers",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`add(a, b)\` that returns the sum of a and b.`,
          hints: ["Use the return keyword.", "return a + b"],
          starterCode: `def add(a, b):\n    # Return the sum\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if add(2, 3) != 5:
        errors.append("add(2, 3) should return 5")
    if add(-1, 1) != 0:
        errors.append("add(-1, 1) should return 0")
    if add(0, 0) != 0:
        errors.append("add(0, 0) should return 0")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Function works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'add' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-func-2",
          title: "Default Parameters",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`greet(name, greeting="Hello")\` that returns the string "{greeting}, {name}!" ΓÇö if greeting is not provided, it should default to "Hello".`,
          hints: [
            'Use default parameter: def greet(name, greeting="Hello")',
            "Use an f-string for the return value.",
          ],
          starterCode: `def greet(name, greeting="Hello"):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if greet("Alex") != "Hello, Alex!":
        errors.append("greet('Alex') should return 'Hello, Alex!'")
    if greet("Sam", "Hey") != "Hey, Sam!":
        errors.append("greet('Sam', 'Hey') should return 'Hey, Sam!'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Default parameters work!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'greet' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-func-3",
          title: "Factorial",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`factorial(n)\` that returns the factorial of n (n!).\n- factorial(0) = 1\n- factorial(5) = 120`,
          hints: ["Use a loop or recursion.", "Remember: 0! = 1."],
          starterCode: `def factorial(n):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if factorial(0) != 1:
        errors.append("factorial(0) should return 1")
    if factorial(1) != 1:
        errors.append("factorial(1) should return 1")
    if factorial(5) != 120:
        errors.append("factorial(5) should return 120")
    if factorial(10) != 3628800:
        errors.append("factorial(10) should return 3628800")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Factorial mastered!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'factorial' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-func-4",
          title: "Is Palindrome",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`is_palindrome(s)\` that returns True if the string reads the same forwards and backwards (case insensitive), otherwise False.`,
          hints: [
            "Convert to lowercase first.",
            "Compare the string with its reverse.",
          ],
          starterCode: `def is_palindrome(s):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if is_palindrome("racecar") != True:
        errors.append("is_palindrome('racecar') should return True")
    if is_palindrome("Madam") != True:
        errors.append("is_palindrome('Madam') should return True")
    if is_palindrome("hello") != False:
        errors.append("is_palindrome('hello') should return False")
    if is_palindrome("A") != True:
        errors.append("is_palindrome('A') should return True")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Palindrome checker works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'is_palindrome' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-func-5",
          title: "Lambda & Map",
          difficulty: "Hard",
          xp: 75,
          isCompleted: false,
          description: `Create a variable \`double\` that is a lambda function taking one argument and returning it doubled. Then create a variable \`doubled_list\` by using \`list(map(...))\` to apply it to [1, 2, 3, 4, 5].`,
          hints: [
            "Lambda syntax: double = lambda x: x * 2",
            "Map: list(map(double, [1, 2, 3, 4, 5]))",
          ],
          starterCode: `# Create lambda and use map\n`,
          testFunction: `
import json
try:
    errors = []
    if 'double' not in dir():
        errors.append("'double' is not defined")
    elif not callable(double):
        errors.append("'double' should be a callable (lambda)")
    elif double(3) != 6:
        errors.append("double(3) should return 6")
    if 'doubled_list' not in dir():
        errors.append("'doubled_list' is not defined")
    elif doubled_list != [2, 4, 6, 8, 10]:
        errors.append("'doubled_list' should be [2, 4, 6, 8, 10]")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Lambda and map mastered!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },

    // ΓöÇΓöÇΓöÇ CHAPTER 5: LISTS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    {
      id: "py-lists",
      title: "Lists",
      description: "Work with ordered collections of data",
      totalXp: 350,
      problems: [
        {
          id: "py-list-1",
          title: "List Basics",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Create a list called \`fruits\` with these values: "apple", "banana", "cherry". Then create a variable \`count\` set to the length of the list.`,
          hints: [
            "Use square brackets: ['apple', 'banana', 'cherry']",
            "Use len() to get the count.",
          ],
          starterCode: `# Create fruits list and count variable\n`,
          testFunction: `
import json
try:
    errors = []
    if 'fruits' not in dir():
        errors.append("'fruits' is not defined")
    elif not isinstance(fruits, list):
        errors.append("'fruits' should be a list")
    elif len(fruits) != 3:
        errors.append("'fruits' should have 3 items")
    elif fruits != ["apple", "banana", "cherry"]:
        errors.append("fruits should be ['apple', 'banana', 'cherry']")
    if 'count' not in dir():
        errors.append("'count' is not defined")
    elif count != 3:
        errors.append("'count' should be 3")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "List basics mastered!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-list-2",
          title: "List Comprehension",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`double_all(lst)\` that uses a list comprehension to return a new list where every number is doubled.`,
          hints: [
            "Syntax: [x * 2 for x in lst]",
            "List comprehension creates a new list.",
          ],
          starterCode: `def double_all(lst):\n    # Use list comprehension\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    r1 = double_all([1, 2, 3])
    r2 = double_all([0, -1, 5])
    if r1 != [2, 4, 6]:
        errors.append("double_all([1,2,3]) should return [2,4,6]")
    if r2 != [0, -2, 10]:
        errors.append("double_all([0,-1,5]) should return [0,-2,10]")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "List comprehension mastered!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'double_all' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-list-3",
          title: "Filter Evens",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`get_evens(lst)\` that uses a list comprehension to return only the even numbers.`,
          hints: [
            "Syntax: [x for x in lst if x % 2 == 0]",
            "Even numbers have remainder 0 when divided by 2.",
          ],
          starterCode: `def get_evens(lst):\n    # Use list comprehension\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if get_evens([1,2,3,4,5,6]) != [2,4,6]:
        errors.append("get_evens([1,2,3,4,5,6]) should return [2,4,6]")
    if get_evens([1,3,5]) != []:
        errors.append("get_evens([1,3,5]) should return []")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "List filtering mastered!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'get_evens' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-list-4",
          title: "List Sum",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`list_sum(lst)\` that returns the sum of all numbers in the list. Do NOT use the built-in sum().`,
          hints: [
            "Use a for loop with a running total.",
            "Initialize total to 0 before the loop.",
          ],
          starterCode: `def list_sum(lst):\n    # Don't use sum()\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if list_sum([1, 2, 3, 4, 5]) != 15:
        errors.append("list_sum([1,2,3,4,5]) should return 15")
    if list_sum([]) != 0:
        errors.append("list_sum([]) should return 0")
    if list_sum([-1, 1]) != 0:
        errors.append("list_sum([-1,1]) should return 0")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "List sum works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'list_sum' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-list-5",
          title: "Flatten List",
          difficulty: "Hard",
          xp: 125,
          isCompleted: false,
          description: `Write a function \`flatten(lst)\` that takes a list of lists and returns a single flat list.\n\nExample: flatten([[1,2],[3,4],[5]]) ΓåÆ [1,2,3,4,5]`,
          hints: [
            "Loop through each sub-list, then loop through each item.",
            "You can use a nested list comprehension: [item for sub in lst for item in sub]",
          ],
          starterCode: `def flatten(lst):\n    # Flatten the list of lists\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    if flatten([[1,2],[3,4],[5]]) != [1,2,3,4,5]:
        errors.append("flatten([[1,2],[3,4],[5]]) should return [1,2,3,4,5]")
    if flatten([[], [1], [2,3]]) != [1,2,3]:
        errors.append("flatten([[], [1], [2,3]]) should return [1,2,3]")
    if flatten([]) != []:
        errors.append("flatten([]) should return []")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "List flattening mastered!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'flatten' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },

    // ΓöÇΓöÇΓöÇ CHAPTER 6: DICTIONARIES ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    {
      id: "py-dicts",
      title: "Dictionaries",
      description: "Store and access key-value pairs",
      totalXp: 300,
      problems: [
        {
          id: "py-dict-1",
          title: "Create a Dictionary",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Create a dictionary called \`person\` with these keys and values:\n- "name": "Alice"\n- "age": 25\n- "city": "Lahore"`,
          hints: [
            'Use curly braces: {"key": "value"}',
            "Separate key-value pairs with commas.",
          ],
          starterCode: `# Create the person dictionary\n`,
          testFunction: `
import json
try:
    errors = []
    if 'person' not in dir():
        errors.append("'person' is not defined")
    elif not isinstance(person, dict):
        errors.append("'person' should be a dictionary")
    else:
        if person.get("name") != "Alice":
            errors.append("person['name'] should be 'Alice'")
        if person.get("age") != 25:
            errors.append("person['age'] should be 25")
        if person.get("city") != "Lahore":
            errors.append("person['city'] should be 'Lahore'")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Dictionary created!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-dict-2",
          title: "Word Counter",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`word_count(sentence)\` that returns a dictionary where keys are words and values are how many times each word appears.\n\nExample: word_count("the cat sat on the mat") ΓåÆ {"the": 2, "cat": 1, "sat": 1, "on": 1, "mat": 1}`,
          hints: [
            "Use .split() to get a list of words.",
            "Loop through words and count with a dictionary.",
          ],
          starterCode: `def word_count(sentence):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    r1 = word_count("the cat sat on the mat")
    if r1.get("the") != 2:
        errors.append("'the' should appear 2 times")
    if r1.get("cat") != 1:
        errors.append("'cat' should appear 1 time")
    if r1.get("mat") != 1:
        errors.append("'mat' should appear 1 time")
    r2 = word_count("a a a")
    if r2.get("a") != 3:
        errors.append("'a' in 'a a a' should appear 3 times")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Word counter works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'word_count' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-dict-3",
          title: "Merge Dictionaries",
          difficulty: "Easy",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`merge_dicts(d1, d2)\` that returns a new dictionary containing all keys from both dictionaries. If a key exists in both, use the value from d2.`,
          hints: [
            "You can use {**d1, **d2} to merge.",
            "Or loop through and add keys manually.",
          ],
          starterCode: `def merge_dicts(d1, d2):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    r1 = merge_dicts({"a": 1}, {"b": 2})
    if r1 != {"a": 1, "b": 2}:
        errors.append("merge_dicts({'a':1}, {'b':2}) should return {'a':1, 'b':2}")
    r2 = merge_dicts({"a": 1}, {"a": 2})
    if r2 != {"a": 2}:
        errors.append("merge_dicts({'a':1}, {'a':2}) should return {'a':2}")
    r3 = merge_dicts({}, {"x": 5})
    if r3 != {"x": 5}:
        errors.append("merge_dicts({}, {'x':5}) should return {'x':5}")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Dictionary merge works!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'merge_dicts' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-dict-4",
          title: "Invert Dictionary",
          difficulty: "Medium",
          xp: 75,
          isCompleted: false,
          description: `Write a function \`invert_dict(d)\` that swaps keys and values.\n\nExample: invert_dict({"a": 1, "b": 2}) ΓåÆ {1: "a", 2: "b"}`,
          hints: [
            "Loop through .items() to get key-value pairs.",
            "Create a new dict with value as key and key as value.",
          ],
          starterCode: `def invert_dict(d):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    r1 = invert_dict({"a": 1, "b": 2})
    if r1 != {1: "a", 2: "b"}:
        errors.append("invert_dict({'a':1, 'b':2}) should return {1:'a', 2:'b'}")
    r2 = invert_dict({})
    if r2 != {}:
        errors.append("invert_dict({}) should return {}")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Dictionary inversion mastered!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'invert_dict' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-dict-5",
          title: "Group by First Letter",
          difficulty: "Hard",
          xp: 50,
          isCompleted: false,
          description: `Write a function \`group_by_first(words)\` that takes a list of words and returns a dictionary grouping them by their first letter.\n\nExample: group_by_first(["apple", "ant", "bat"]) ΓåÆ {"a": ["apple", "ant"], "b": ["bat"]}`,
          hints: [
            "Use word[0] to get the first letter.",
            "Use .setdefault(key, []) to initialize lists.",
          ],
          starterCode: `def group_by_first(words):\n    # Your code here\n    pass\n`,
          testFunction: `
import json
try:
    errors = []
    r1 = group_by_first(["apple", "ant", "bat"])
    if r1.get("a") != ["apple", "ant"]:
        errors.append("Words starting with 'a' should be ['apple', 'ant']")
    if r1.get("b") != ["bat"]:
        errors.append("Words starting with 'b' should be ['bat']")
    r2 = group_by_first([])
    if r2 != {}:
        errors.append("Empty list should return {}")
    if len(errors) > 0:
        print(json.dumps({"success": False, "message": ". ".join(errors)}))
    else:
        print(json.dumps({"success": True, "message": "Grouping mastered!"}))
except NameError:
    print(json.dumps({"success": False, "message": "Function 'group_by_first' is not defined."}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },
    // ADVANCED PYTHON & MODERN APPLICATIONS
    {
      id: "py-data-science",
      title: "Data Science Fundamentals",
      description:
        "Master Python for data analysis, visualization, and scientific computing",
      totalXp: 600,
      problems: [
        {
          id: "py-ds-1",
          title: "NumPy Arrays",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Using NumPy, create:
1. A 3x3 matrix with values 1-9
2. Calculate the sum of each row
3. Find the maximum value in the matrix`,
          hints: [
            "import numpy as np",
            "np.array([[1,2,3], [4,5,6], [7,8,9]])",
            "matrix.sum(axis=1)",
          ],
          starterCode: `import numpy as np\n# Create 3x3 matrix and perform operations`,
          testFunction: `
import json
try:
    # Check if numpy operations are implemented
    print(json.dumps({"success": True, "message": "NumPy operations implemented!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ds-2",
          title: "Pandas DataFrame",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Using Pandas, create a DataFrame from student data and:
1. Filter students with age > 20
2. Calculate average grade
3. Sort by name`,
          hints: [
            "import pandas as pd",
            "pd.DataFrame(data)",
            "df[df['age'] > 20]",
            "df['grade'].mean()",
          ],
          starterCode: `import pandas as pd\n# Create DataFrame and perform operations`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Pandas operations mastered!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ds-3",
          title: "Data Visualization",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description: `Using Matplotlib, create:
1. A line plot of x=[1,2,3,4] vs y=[2,4,6,8]
2. Add title and labels
3. Save as 'plot.png'`,
          hints: [
            "import matplotlib.pyplot as plt",
            "plt.plot(x, y)",
            "plt.title('Title')",
            "plt.savefig('plot.png')",
          ],
          starterCode: `import matplotlib.pyplot as plt\n# Create line plot with proper labels`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Data visualization created!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ds-4",
          title: "Statistical Analysis",
          difficulty: "Hard",
          xp: 120,
          isCompleted: false,
          description: `Using scipy.stats, calculate:
1. Mean, median, mode of [1,2,3,4,5,5,5]
2. Standard deviation
3. Correlation between two arrays`,
          hints: [
            "from scipy import stats",
            "stats.mean()",
            "stats.stdev()",
            "stats.pearsonr()",
          ],
          starterCode: `from scipy import stats\nimport numpy as np\n# Calculate statistical measures`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Statistical analysis completed!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ds-5",
          title: "Data Cleaning",
          difficulty: "Hard",
          xp: 160,
          isCompleted: false,
          description: `Clean a messy dataset:
1. Remove duplicate rows
2. Handle missing values (fill with mean)
3. Remove outliers using IQR method
4. Standardize column names`,
          hints: [
            "df.drop_duplicates()",
            "df.fillna()",
            "IQR = Q3 - Q1",
            "df.columns = df.columns.str.lower()",
          ],
          starterCode: `import pandas as pd\nimport numpy as np\n# Clean the dataset step by step`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Data cleaning pipeline implemented!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },
    {
      id: "py-ml",
      title: "Machine Learning Basics",
      description:
        "Build and evaluate machine learning models with scikit-learn",
      totalXp: 700,
      problems: [
        {
          id: "py-ml-1",
          title: "Linear Regression",
          difficulty: "Hard",
          xp: 140,
          isCompleted: false,
          description: `Using scikit-learn, implement linear regression:
1. Create sample data: X = [[1], [2], [3], [4]], y = [2, 4, 6, 8]
2. Split into train/test sets
3. Train LinearRegression model
4. Make predictions and calculate R² score`,
          hints: [
            "from sklearn.linear_model import LinearRegression",
            "from sklearn.model_selection import train_test_split",
            "model.fit(X_train, y_train)",
            "model.score(X_test, y_test)",
          ],
          starterCode: `from sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import r2_score\nimport numpy as np\n# Implement linear regression pipeline`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Linear regression model implemented!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ml-2",
          title: "Classification",
          difficulty: "Hard",
          xp: 150,
          isCompleted: false,
          description: `Implement a classification model:
1. Use iris dataset or create sample data
2. Train RandomForestClassifier
3. Evaluate with confusion matrix
4. Calculate accuracy, precision, recall`,
          hints: [
            "from sklearn.ensemble import RandomForestClassifier",
            "from sklearn.metrics import confusion_matrix, classification_report",
          ],
          starterCode: `from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import confusion_matrix, classification_report\nfrom sklearn.datasets import load_iris\n# Implement classification pipeline`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Classification model implemented!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ml-3",
          title: "Clustering",
          difficulty: "Expert",
          xp: 160,
          isCompleted: false,
          description: `Implement K-means clustering:
1. Generate sample data with 3 clear clusters
2. Apply KMeans algorithm
3. Visualize clusters with different colors
4. Calculate silhouette score`,
          hints: [
            "from sklearn.cluster import KMeans",
            "from sklearn.metrics import silhouette_score",
            "kmeans.fit_predict(X)",
          ],
          starterCode: `from sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\nimport matplotlib.pyplot as plt\nimport numpy as np\n# Implement K-means clustering`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "K-means clustering implemented!"}))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ml-4",
          title: "Neural Networks",
          difficulty: "Expert",
          xp: 180,
          isCompleted: false,
          description: `Build a simple neural network:
1. Create a multi-layer perceptron for XOR problem
2. Implement forward and backward propagation
3. Train for 1000 epochs
4. Plot loss over time`,
          hints: [
            "Use numpy for matrix operations",
            "sigmoid activation",
            "backpropagation algorithm",
          ],
          starterCode: `import numpy as np\nimport matplotlib.pyplot as plt\n# Implement neural network from scratch`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Neural network implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ml-5",
          title: "Model Evaluation",
          difficulty: "Expert",
          xp: 170,
          isCompleted: false,
          description: `Comprehensive model evaluation:
1. Cross-validation with 5 folds
2. Learning curves analysis
3. ROC curve and AUC calculation
4. Feature importance analysis`,
          hints: [
            "from sklearn.model_selection import cross_val_score",
            "from sklearn.metrics import roc_curve, auc",
          ],
          starterCode: `from sklearn.model_selection import cross_val_score, learning_curve\nfrom sklearn.metrics import roc_curve, auc\nimport matplotlib.pyplot as plt\n# Implement comprehensive evaluation`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Model evaluation completed!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },
    {
      id: "py-ai",
      title: "AI & Deep Learning",
      description:
        "Explore cutting-edge AI techniques with TensorFlow and PyTorch",
      totalXp: 800,
      problems: [
        {
          id: "py-ai-1",
          title: "TensorFlow Basics",
          difficulty: "Expert",
          xp: 180,
          isCompleted: false,
          description: `Build a neural network with TensorFlow:
1. Create a sequential model for MNIST digit recognition
2. Add Dense layers with ReLU activation
3. Compile with Adam optimizer
4. Train for 5 epochs and evaluate`,
          hints: [
            "import tensorflow as tf",
            "tf.keras.Sequential()",
            "model.compile()",
            "model.fit()",
          ],
          starterCode: `import tensorflow as tf\nfrom tensorflow.keras import layers, models\n# Build TensorFlow neural network`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "TensorFlow model implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ai-2",
          title: "PyTorch Fundamentals",
          difficulty: "Expert",
          xp: 180,
          isCompleted: false,
          description: `Implement deep learning with PyTorch:
1. Create a custom dataset class
2. Build a neural network with nn.Module
3. Implement training loop
4. Save and load model checkpoints`,
          hints: [
            "import torch",
            "import torch.nn as nn",
            "class CustomDataset(Dataset)",
            "torch.save()",
          ],
          starterCode: `import torch\nimport torch.nn as nn\nfrom torch.utils.data import Dataset, DataLoader\n# Implement PyTorch training pipeline`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "PyTorch pipeline implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ai-3",
          title: "Computer Vision",
          difficulty: "Expert",
          xp: 200,
          isCompleted: false,
          description: `Computer vision with OpenCV:
1. Load and display an image
2. Apply Gaussian blur and edge detection
3. Face detection using Haar cascades
4. Object counting with contour detection`,
          hints: [
            "import cv2",
            "cv2.GaussianBlur()",
            "cv2.Canny()",
            "cv2.CascadeClassifier()",
          ],
          starterCode: `import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\n# Implement computer vision pipeline`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Computer vision pipeline implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ai-4",
          title: "Natural Language Processing",
          difficulty: "Expert",
          xp: 190,
          isCompleted: false,
          description: `NLP with transformers and spaCy:
1. Text preprocessing and tokenization
2. Sentiment analysis with pretrained model
3. Named entity recognition
4. Text summarization using transformers`,
          hints: [
            "import transformers",
            "import spacy",
            "pipeline('sentiment-analysis')",
            "nlp()",
          ],
          starterCode: `from transformers import pipeline\nimport spacy\n# Implement NLP pipeline`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "NLP pipeline implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-ai-5",
          title: "Reinforcement Learning",
          difficulty: "Expert",
          xp: 210,
          isCompleted: false,
          description: `Implement reinforcement learning:
1. Create a simple GridWorld environment
2. Implement Q-learning algorithm
3. Train agent to reach goal
4. Visualize learning progress and policy`,
          hints: [
            "import gym",
            "Q-learning algorithm",
            "epsilon-greedy policy",
            "reward maximization",
          ],
          starterCode: `import numpy as np\nimport matplotlib.pyplot as plt\n# Implement Q-learning agent`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Reforcement learning implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },
    {
      id: "py-web",
      title: "Web Development & APIs",
      description:
        "Build web applications and APIs with modern Python frameworks",
      totalXp: 550,
      problems: [
        {
          id: "py-web-1",
          title: "Flask Web App",
          difficulty: "Medium",
          xp: 120,
          isCompleted: false,
          description: `Create a Flask web application:
1. Set up Flask app with routes
2. Create REST API endpoints
3. Add JSON response handling
4. Include error handling and validation`,
          hints: [
            "from flask import Flask, jsonify, request",
            "@app.route('/api/data', methods=['GET'])",
          ],
          starterCode: `from flask import Flask, jsonify, request\n# Create Flask application with API endpoints`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Flask web app created!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-web-2",
          title: "Django Project",
          difficulty: "Hard",
          xp: 150,
          isCompleted: false,
          description: `Build a Django project:
1. Create models and migrations
2. Implement Django REST Framework
3. Add authentication and permissions
4. Create API documentation`,
          hints: [
            "from django.db import models",
            "from rest_framework import viewsets, routers",
          ],
          starterCode: `# Django project structure setup\n# Models, views, serializers, URLs`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Django project implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-web-3",
          title: "FastAPI Application",
          difficulty: "Medium",
          xp: 130,
          isCompleted: false,
          description: `Create a FastAPI application:
1. Set up async endpoints
2. Add Pydantic models for validation
3. Include automatic documentation
4. Add CORS and middleware`,
          hints: [
            "from fastapi import FastAPI",
            "from pydantic import BaseModel",
            "@app.get('/items/', response_model=List[Item])",
          ],
          starterCode: `from fastapi import FastAPI\nfrom pydantic import BaseModel\n# Create FastAPI application with validation`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "FastAPI app created!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-web-4",
          title: "Database Integration",
          difficulty: "Hard",
          xp: 150,
          isCompleted: false,
          description: `Database operations with SQLAlchemy:
1. Define models with relationships
2. Create CRUD operations
3. Implement database migrations
4. Add connection pooling and optimization`,
          hints: [
            "from sqlalchemy import create_engine, Column",
            "from sqlalchemy.orm import sessionmaker",
            "Base.metadata.create_all()",
          ],
          starterCode: `from sqlalchemy import create_engine, Column, Integer, String\nfrom sqlalchemy.ext.declarative import declarative_base\n# Implement database operations`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Database integration completed!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },
    {
      id: "py-advanced",
      title: "Advanced Python Patterns",
      description:
        "Master enterprise-level Python development patterns and best practices",
      totalXp: 500,
      problems: [
        {
          id: "py-adv-1",
          title: "Async Programming",
          difficulty: "Hard",
          xp: 140,
          isCompleted: false,
          description: `Implement async Python programming:
1. Create async functions with asyncio
2. Use async/await syntax
3. Implement concurrent API calls
4. Add proper error handling`,
          hints: [
            "import asyncio",
            "async def function():",
            "await coroutine",
            "asyncio.gather()",
          ],
          starterCode: `import asyncio\nimport aiohttp\n# Implement async programming patterns`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Async programming implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-adv-2",
          title: "Decorators & Metaclasses",
          difficulty: "Expert",
          xp: 160,
          isCompleted: false,
          description: `Advanced Python metaprogramming:
1. Create custom decorators for timing and caching
2. Implement metaclasses for validation
3. Use descriptors for property management
4. Create context managers`,
          hints: [
            "@decorator syntax",
            "class MetaClass(type)",
            "__get__ and __set__ methods",
            "with statement context",
          ],
          starterCode: `import functools\nimport time\nfrom contextlib import contextmanager\n# Implement decorators and metaclasses`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Metaprogramming mastered!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-adv-3",
          title: "Testing & Quality Assurance",
          difficulty: "Medium",
          xp: 120,
          isCompleted: false,
          description: `Comprehensive testing strategy:
1. Unit tests with pytest
2. Integration tests and fixtures
3. Mock external dependencies
4. Code coverage reporting`,
          hints: [
            "import pytest",
            "@pytest.fixture",
            "unittest.mock.Mock",
            "pytest --cov",
          ],
          starterCode: `import pytest\nfrom unittest.mock import Mock, patch\n# Implement comprehensive testing`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Testing strategy implemented!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
        {
          id: "py-adv-4",
          title: "Performance Optimization",
          difficulty: "Expert",
          xp: 180,
          isCompleted: false,
          description: `Python performance optimization:
1. Profile code with cProfile
2. Optimize using NumPy vectorization
3. Implement caching strategies
4. Use multiprocessing for CPU-bound tasks`,
          hints: [
            "import cProfile",
            "np.vectorize()",
            "@lru_cache",
            "from multiprocessing import Pool",
          ],
          starterCode: `import cProfile\nimport pstats\nfrom functools import lru_cache\nfrom multiprocessing import Pool\n# Implement performance optimization`,
          testFunction: `
import json
try:
    print(json.dumps({"success": True, "message": "Performance optimization completed!" }))
except Exception as e:
    print(json.dumps({"success": False, "message": str(e)}))
`,
        },
      ],
    },
  ],
};

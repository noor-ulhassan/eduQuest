export const reactPlayground = {
  title: "The React Workshop",
  subtitle: "Build dynamic UIs with the world's most popular front-end library",
  chapters: [
    // ─── CHAPTER 1: JSX FUNDAMENTALS ───────────────────────────────
    {
      id: "jsx",
      title: "JSX Fundamentals",
      description: "Learn the syntax that powers React components",
      totalXp: 300,
      problems: [
        {
          id: "react-jsx-1",
          title: "Hello, React!",
          difficulty: "Easy",
          xp: 50,
          description: `Create a component called \`App\` that renders an \`<h1>\` with the text "Hello, React!".

You don't need to import React — it's already available globally.`,
          hints: [
            "A React component is a function that returns JSX.",
            "function App() { return <h1>Hello, React!</h1>; }",
          ],
          starterCode: `function App() {\n  // Return an <h1> with "Hello, React!"\n}\n`,
          testFunction: `
const h1 = doc.querySelector("#root h1");
if (!h1) return { success: false, message: "No <h1> found. Make sure App returns an <h1> element." };
if (h1.textContent.trim() !== "Hello, React!")
  return { success: false, message: \`Expected "Hello, React!" but got "\${h1.textContent.trim()}"\` };
return { success: true, message: "Your first React component works!" };`,
        },
        {
          id: "react-jsx-2",
          title: "JSX Expressions",
          difficulty: "Easy",
          xp: 50,
          description: `Create an \`App\` component that renders a \`<p>\` tag containing the result of \`7 * 6\` using a JSX expression.

The rendered text should be: \`42\``,
          hints: [
            "Use curly braces {} to embed JavaScript expressions in JSX.",
            "return <p>{7 * 6}</p>;",
          ],
          starterCode: `function App() {\n  // Render a <p> with the result of 7 * 6\n}\n`,
          testFunction: `
const p = doc.querySelector("#root p");
if (!p) return { success: false, message: "No <p> found. Render a <p> element." };
if (p.textContent.trim() !== "42")
  return { success: false, message: \`Expected "42" but got "\${p.textContent.trim()}". Use {7 * 6} in JSX.\` };
return { success: true, message: "JSX expressions work!" };`,
        },
        {
          id: "react-jsx-3",
          title: "Dynamic Values",
          difficulty: "Easy",
          xp: 50,
          description: `Declare a \`const name = "EduQuest"\` at the top of your \`App\` function, then render an \`<h2>\` that displays: \`Welcome to EduQuest\``,
          hints: [
            "Declare the variable inside the function body before the return.",
            "return <h2>Welcome to {name}</h2>;",
          ],
          starterCode: `function App() {\n  const name = "EduQuest";\n  // Render <h2>Welcome to {name}</h2>\n}\n`,
          testFunction: `
const h2 = doc.querySelector("#root h2");
if (!h2) return { success: false, message: "No <h2> found." };
if (!h2.textContent.includes("EduQuest"))
  return { success: false, message: \`Expected text to include "EduQuest" but got "\${h2.textContent}"\` };
return { success: true, message: "Dynamic values in JSX!" };`,
        },
        {
          id: "react-jsx-4",
          title: "Conditional Rendering",
          difficulty: "Easy",
          xp: 50,
          description: `Create an \`App\` component with \`const isLoggedIn = true\`. Render:
- An \`<h2>Welcome back!</h2>\` when \`isLoggedIn\` is true
- A \`<h2>Please log in.</h2>\` when false

Use the ternary operator.`,
          hints: [
            "Syntax: {condition ? <A /> : <B />}",
            "return <h2>{isLoggedIn ? 'Welcome back!' : 'Please log in.'}</h2>;",
          ],
          starterCode: `function App() {\n  const isLoggedIn = true;\n  // Use ternary to render different <h2>\n}\n`,
          testFunction: `
const h2 = doc.querySelector("#root h2");
if (!h2) return { success: false, message: "No <h2> found." };
if (!h2.textContent.includes("Welcome back"))
  return { success: false, message: \`Expected "Welcome back!" but got "\${h2.textContent}"\` };
return { success: true, message: "Conditional rendering works!" };`,
        },
        {
          id: "react-jsx-5",
          title: "Rendering a List",
          difficulty: "Medium",
          xp: 75,
          description: `Create an \`App\` component that renders a \`<ul>\` containing these fruits as \`<li>\` elements:
\`["Apple", "Banana", "Cherry"]\`

Use \`.map()\` with a \`key\` prop.`,
          hints: [
            "const fruits = ['Apple', 'Banana', 'Cherry'];",
            "return <ul>{fruits.map(f => <li key={f}>{f}</li>)}</ul>;",
          ],
          starterCode: `function App() {\n  const fruits = ["Apple", "Banana", "Cherry"];\n  // Map fruits to <li> inside a <ul>\n}\n`,
          testFunction: `
const lis = doc.querySelectorAll("#root li");
if (lis.length < 3) return { success: false, message: \`Expected 3 <li> elements but found \${lis.length}.\` };
const texts = Array.from(lis).map(l => l.textContent.trim());
if (!texts.includes("Apple") || !texts.includes("Banana") || !texts.includes("Cherry"))
  return { success: false, message: "List items should be Apple, Banana, Cherry." };
return { success: true, message: "List rendering with map works!" };`,
        },
        {
          id: "react-jsx-6",
          title: "className & Styles",
          difficulty: "Easy",
          xp: 50,
          description: `Create an \`App\` that renders a \`<div>\` with:
- \`className="card"\`
- An inline style setting \`backgroundColor\` to \`"#f0f4ff"\`
- Any text inside it`,
          hints: [
            "JSX uses className instead of class.",
            'Use style={{ backgroundColor: "#f0f4ff" }} for inline styles.',
          ],
          starterCode: `function App() {\n  return (\n    // <div> with className="card" and inline background color\n  );\n}\n`,
          testFunction: `
const div = doc.querySelector("#root .card");
if (!div) return { success: false, message: 'No element with className="card" found.' };
const bg = div.style.backgroundColor;
if (!bg) return { success: false, message: "No inline backgroundColor style found on the .card element." };
return { success: true, message: "className and inline styles work!" };`,
        },
        // ✦ INTERACTIVE — fill in the JSX tags
        {
          id: "react-ib-jsx-1",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "JSX Tag Match",
          difficulty: "Easy",
          xp: 60,
          description:
            "Fill in the correct JSX tags to make this component render an h1 heading.",
          codeTemplate: [
            { type: "code", content: "function App() {\n  return (\n    " },
            { type: "blank", id: "b1", hint: "open tag", width: "74px" },
            { type: "code", content: "Hello, React!" },
            { type: "blank", id: "b2", hint: "close tag", width: "82px" },
            { type: "code", content: "\n  );\n}" },
          ],
          tokens: [
            { id: "t1", label: "<h1>", code: "<h1>", color: "sky" },
            { id: "t2", label: "</h1>", code: "</h1>", color: "sky" },
            { id: "t3", label: "<p>", code: "<p>", color: "emerald" },
            { id: "t4", label: "</p>", code: "</p>", color: "emerald" },
            { id: "t5", label: "<div>", code: "<div>", color: "amber" },
          ],
          answers: { b1: "t1", b2: "t2" },
        },
        // ✦ INTERACTIVE — JSX expressions
        {
          id: "react-ib-jsx-2",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "JSX Expressions",
          difficulty: "Easy",
          xp: 60,
          description:
            "Use curly braces to embed the variable value inside JSX. Fill in the correct expression.",
          codeTemplate: [
            {
              type: "code",
              content:
                "function App() {\n  const year = 2024;\n  return <p>Year: ",
            },
            { type: "blank", id: "b1", hint: "expression", width: "80px" },
            { type: "code", content: "</p>;\n}" },
          ],
          tokens: [
            { id: "t1", label: "{year}", code: "{year}", color: "amber" },
            { id: "t2", label: "year", code: "year", color: "zinc" },
            { id: "t3", label: "{2024}", code: "{2024}", color: "sky" },
            { id: "t4", label: "(year)", code: "(year)", color: "rose" },
          ],
          answers: { b1: "t1" },
        },
      ],
    },

    // ─── CHAPTER 2: COMPONENTS & PROPS ────────────────────────────
    {
      id: "components",
      title: "Components & Props",
      description: "Build reusable UI with custom components",
      totalXp: 350,
      problems: [
        {
          id: "react-comp-1",
          title: "Your First Component",
          difficulty: "Easy",
          xp: 50,
          description: `Create a \`Greeting\` component that renders \`<p>Hello from Greeting!</p>\`.

Then in \`App\`, render \`<Greeting />\`.`,
          hints: [
            "Define function Greeting() { return <p>…</p>; } above App.",
            "In App, return <Greeting />;",
          ],
          starterCode: `function Greeting() {\n  // Return a <p> element\n}\n\nfunction App() {\n  return <Greeting />;\n}\n`,
          testFunction: `
const p = doc.querySelector("#root p");
if (!p) return { success: false, message: "No <p> found. Make sure Greeting renders a <p>." };
if (!p.textContent.includes("Greeting"))
  return { success: false, message: \`<p> should mention "Greeting". Got: "\${p.textContent}"\` };
return { success: true, message: "Your first custom component works!" };`,
        },
        {
          id: "react-comp-2",
          title: "Using Props",
          difficulty: "Easy",
          xp: 50,
          description: `Create a \`Welcome\` component that accepts a \`name\` prop and renders:
\`<h2>Welcome, {name}!</h2>\`

In \`App\`, render \`<Welcome name="Alex" />\``,
          hints: [
            "function Welcome({ name }) { return <h2>Welcome, {name}!</h2>; }",
          ],
          starterCode: `function Welcome({ name }) {\n  // Render <h2>Welcome, {name}!</h2>\n}\n\nfunction App() {\n  return <Welcome name="Alex" />;\n}\n`,
          testFunction: `
const h2 = doc.querySelector("#root h2");
if (!h2) return { success: false, message: "No <h2> found." };
if (!h2.textContent.includes("Alex"))
  return { success: false, message: \`Expected "Alex" in h2. Got: "\${h2.textContent}"\` };
return { success: true, message: "Props work!" };`,
        },
        {
          id: "react-comp-3",
          title: "Multiple Props",
          difficulty: "Easy",
          xp: 50,
          description: `Create a \`Card\` component with \`title\` and \`description\` props. Render:
\`<h3>{title}</h3>\`
\`<p>{description}</p>\`

In \`App\`, render \`<Card title="React" description="A UI library" />\``,
          hints: [
            "Destructure both props: function Card({ title, description })",
          ],
          starterCode: `function Card({ title, description }) {\n  // Render title in <h3> and description in <p>\n}\n\nfunction App() {\n  return <Card title="React" description="A UI library" />;\n}\n`,
          testFunction: `
const h3 = doc.querySelector("#root h3");
const p  = doc.querySelector("#root p");
if (!h3) return { success: false, message: "No <h3> found for title." };
if (!p)  return { success: false, message: "No <p> found for description." };
if (!h3.textContent.includes("React")) return { success: false, message: \`h3 should contain "React". Got: "\${h3.textContent}"\` };
if (!p.textContent.includes("library")) return { success: false, message: \`p should mention "library". Got: "\${p.textContent}"\` };
return { success: true, message: "Multiple props work!" };`,
        },
        {
          id: "react-comp-4",
          title: "Children Prop",
          difficulty: "Medium",
          xp: 75,
          description: `Create a \`Box\` component that wraps \`{children}\` in a \`<div>\`.

In \`App\`, render:
\`<Box><p>I am inside Box!</p></Box>\``,
          hints: [
            "function Box({ children }) { return <div>{children}</div>; }",
          ],
          starterCode: `function Box({ children }) {\n  // Wrap children in a <div>\n}\n\nfunction App() {\n  return <Box><p>I am inside Box!</p></Box>;\n}\n`,
          testFunction: `
const p = doc.querySelector("#root p");
if (!p) return { success: false, message: "No <p> found. Make sure Box renders its children." };
if (!p.textContent.includes("inside Box"))
  return { success: false, message: \`p text should include "inside Box". Got: "\${p.textContent}"\` };
return { success: true, message: "The children prop works!" };`,
        },
        {
          id: "react-comp-5",
          title: "Component Composition",
          difficulty: "Medium",
          xp: 75,
          description: `Create two components:
- \`Header\`: renders \`<header><h1>EduQuest</h1></header>\`
- \`Footer\`: renders \`<footer><p>© 2024</p></footer>\`

\`App\` should render both inside a \`<div>\`.`,
          hints: [
            "Remember to wrap both components in a single parent element or Fragment.",
          ],
          starterCode: `function Header() {\n  // render <header><h1>EduQuest</h1></header>\n}\n\nfunction Footer() {\n  // render <footer><p>© 2024</p></footer>\n}\n\nfunction App() {\n  return (\n    <div>\n      {/* Render Header and Footer */}\n    </div>\n  );\n}\n`,
          testFunction: `
const h1 = doc.querySelector("#root h1");
const footer = doc.querySelector("#root footer");
if (!h1) return { success: false, message: "No <h1> found. Render the Header component." };
if (!footer) return { success: false, message: "No <footer> found. Render the Footer component." };
return { success: true, message: "Component composition works!" };`,
        },
        {
          id: "react-comp-6",
          title: "List Component",
          difficulty: "Medium",
          xp: 75,
          description: `Create a \`SkillList\` component that accepts a \`skills\` prop (array of strings) and renders each as an \`<li>\`.

In \`App\`, render \`<SkillList skills={["HTML", "CSS", "React"]} />\``,
          hints: [
            "function SkillList({ skills }) { return <ul>{skills.map(s => <li key={s}>{s}</li>)}</ul>; }",
          ],
          starterCode: `function SkillList({ skills }) {\n  // Map skills to <li> elements\n}\n\nfunction App() {\n  return <SkillList skills={["HTML", "CSS", "React"]} />;\n}\n`,
          testFunction: `
const lis = doc.querySelectorAll("#root li");
if (lis.length < 3) return { success: false, message: \`Expected 3 <li> elements. Found \${lis.length}.\` };
const texts = Array.from(lis).map(li => li.textContent);
if (!texts.some(t => t.includes("React"))) return { success: false, message: '"React" not found in list items.' };
return { success: true, message: "List component with props!" };`,
        },
        // ✦ INTERACTIVE — props destructuring
        {
          id: "react-ib-comp-1",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "Props Destructuring",
          difficulty: "Easy",
          xp: 70,
          description:
            "Fill in the function parameter to correctly destructure the name prop.",
          codeTemplate: [
            { type: "code", content: "function Greeting(" },
            { type: "blank", id: "b1", hint: "parameter", width: "96px" },
            {
              type: "code",
              content: ") {\n  return <h2>Hello, {name}!</h2>;\n}",
            },
          ],
          tokens: [
            { id: "t1", label: "{ name }", code: "{ name }", color: "sky" },
            { id: "t2", label: "props", code: "props", color: "emerald" },
            { id: "t3", label: "name", code: "name", color: "amber" },
            { id: "t4", label: "{ props }", code: "{ props }", color: "rose" },
          ],
          answers: { b1: "t1" },
        },
        // ✦ INTERACTIVE — passing props
        {
          id: "react-ib-comp-2",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "Passing Props",
          difficulty: "Easy",
          xp: 70,
          description:
            "Fill in the correct prop name to pass the name value to the Greeting component.",
          codeTemplate: [
            { type: "code", content: "function App() {\n  return <Greeting " },
            { type: "blank", id: "b1", hint: "prop name", width: "72px" },
            { type: "code", content: '="Alex" />;\n}' },
          ],
          tokens: [
            { id: "t1", label: "name", code: "name", color: "sky" },
            { id: "t2", label: "value", code: "value", color: "emerald" },
            { id: "t3", label: "prop", code: "prop", color: "amber" },
            { id: "t4", label: "title", code: "title", color: "rose" },
          ],
          answers: { b1: "t1" },
        },
      ],
    },

    // ─── CHAPTER 3: STATE & EVENTS ────────────────────────────────
    {
      id: "state",
      title: "State & Events",
      description: "Make your components interactive with useState",
      totalXp: 375,
      problems: [
        {
          id: "react-state-1",
          title: "useState Counter",
          difficulty: "Easy",
          xp: 75,
          description: `Create a counter using \`useState\`:
- Display the count in a \`<p>\` element
- A \`<button>\` with text "Increment" that increases the count by 1
- Initial count should be \`0\``,
          hints: [
            "const [count, setCount] = useState(0);",
            "onClick={() => setCount(count + 1)}",
          ],
          starterCode: `function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>{count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n`,
          testFunction: `
const p = doc.querySelector("#root p");
const btn = doc.querySelector("#root button");
if (!p) return { success: false, message: "No <p> found to display count." };
if (!btn) return { success: false, message: "No <button> found." };
if (p.textContent.trim() !== "0") return { success: false, message: \`Initial count should be 0. Got: "\${p.textContent.trim()}"\` };
btn.click(); btn.click();
return { success: true, message: "useState counter working!" };`,
        },
        {
          id: "react-state-2",
          title: "Toggle Visibility",
          difficulty: "Easy",
          xp: 75,
          description: `Create a toggle using \`useState\`:
- A \`<button>\` that says "Show" or "Hide" depending on state
- When visible, show a \`<p>Hello World</p>\`
- Initially hidden (\`isVisible = false\`)`,
          hints: [
            "const [isVisible, setIsVisible] = useState(false);",
            "{isVisible && <p>Hello World</p>}",
          ],
          starterCode: `function App() {\n  const [isVisible, setIsVisible] = useState(false);\n\n  return (\n    <div>\n      <button onClick={() => setIsVisible(!isVisible)}>\n        {isVisible ? "Hide" : "Show"}\n      </button>\n      {isVisible && <p>Hello World</p>}\n    </div>\n  );\n}\n`,
          testFunction: `
const btn = doc.querySelector("#root button");
if (!btn) return { success: false, message: "No <button> found." };
if (btn.textContent.trim() !== "Show") return { success: false, message: \`Button should say "Show" initially. Got: "\${btn.textContent.trim()}"\` };
const p = doc.querySelector("#root p");
if (p) return { success: false, message: "<p> should be hidden initially (isVisible = false)." };
return { success: true, message: "Toggle visibility works!" };`,
        },
        {
          id: "react-state-3",
          title: "Controlled Input",
          difficulty: "Medium",
          xp: 75,
          description: `Create a controlled text input:
- An \`<input>\` that updates state on every keystroke
- A \`<p>\` below showing: \`You typed: {value}\`
- Initial value is an empty string`,
          hints: [
            "const [value, setValue] = useState('');",
            "onChange={e => setValue(e.target.value)}",
          ],
          starterCode: `function App() {\n  const [value, setValue] = useState("");\n\n  return (\n    <div>\n      <input\n        value={value}\n        onChange={(e) => setValue(e.target.value)}\n        placeholder="Type something..."\n      />\n      <p>You typed: {value}</p>\n    </div>\n  );\n}\n`,
          testFunction: `
const input = doc.querySelector("#root input");
const p = doc.querySelector("#root p");
if (!input) return { success: false, message: "No <input> found." };
if (!p) return { success: false, message: "No <p> found to display typed text." };
if (!p.textContent.includes("You typed:")) return { success: false, message: \`<p> should say "You typed: ...". Got: "\${p.textContent}"\` };
return { success: true, message: "Controlled input works!" };`,
        },
        {
          id: "react-state-4",
          title: "Like Button",
          difficulty: "Medium",
          xp: 75,
          description: `Create a like button:
- State: \`liked\` (boolean, starts false) and \`count\` (number, starts 0)
- A \`<button>\` showing "❤️ Like" or "💔 Unlike" based on liked state
- A \`<span>\` showing the count
- Clicking toggles liked and increments/decrements count`,
          hints: [
            "Two separate useState calls — one for liked, one for count.",
            "If liked, clicking should set liked=false and count-1. If !liked, set liked=true and count+1.",
          ],
          starterCode: `function App() {\n  const [liked, setLiked] = useState(false);\n  const [count, setCount] = useState(0);\n\n  const toggle = () => {\n    setLiked(!liked);\n    setCount(liked ? count - 1 : count + 1);\n  };\n\n  return (\n    <div>\n      <button onClick={toggle}>{liked ? "💔 Unlike" : "❤️ Like"}</button>\n      <span>{count}</span>\n    </div>\n  );\n}\n`,
          testFunction: `
const btn = doc.querySelector("#root button");
const span = doc.querySelector("#root span");
if (!btn) return { success: false, message: "No <button> found." };
if (!span) return { success: false, message: "No <span> found to show count." };
if (span.textContent.trim() !== "0") return { success: false, message: \`Initial count should be 0. Got: "\${span.textContent}"\` };
if (!btn.textContent.includes("Like")) return { success: false, message: 'Button should say "Like" or "Unlike".' };
return { success: true, message: "Like button state works!" };`,
        },
        {
          id: "react-state-5",
          title: "Simple Form",
          difficulty: "Hard",
          xp: 100,
          description: `Build a name form:
- An \`<input>\` for entering a name
- A submit \`<button>\`
- On submit, add the name to a list and clear the input
- Render submitted names as \`<li>\` elements`,
          hints: [
            "const [names, setNames] = useState([]);",
            "const [input, setInput] = useState('');",
            "On submit: setNames([...names, input]); setInput('');",
          ],
          starterCode: `function App() {\n  const [input, setInput] = useState("");\n  const [names, setNames] = useState([]);\n\n  const handleSubmit = () => {\n    if (!input.trim()) return;\n    setNames([...names, input]);\n    setInput("");\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter name" />\n      <button onClick={handleSubmit}>Add</button>\n      <ul>\n        {names.map((n, i) => <li key={i}>{n}</li>)}\n      </ul>\n    </div>\n  );\n}\n`,
          testFunction: `
const input = doc.querySelector("#root input");
const btn = doc.querySelector("#root button");
const ul = doc.querySelector("#root ul");
if (!input) return { success: false, message: "No <input> found." };
if (!btn) return { success: false, message: "No <button> found." };
if (!ul) return { success: false, message: "No <ul> found to display names." };
return { success: true, message: "Form with list state works!" };`,
        },
        // ✦ INTERACTIVE — useState destructure
        {
          id: "react-ib-state-1",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "useState Destructure",
          difficulty: "Medium",
          xp: 80,
          description:
            "Fill in the correct variable names when destructuring useState for a counter.",
          codeTemplate: [
            { type: "code", content: "function App() {\n  const [" },
            { type: "blank", id: "b1", hint: "state var", width: "72px" },
            { type: "code", content: ", " },
            { type: "blank", id: "b2", hint: "setter fn", width: "96px" },
            { type: "code", content: "] = useState(0);\n}" },
          ],
          tokens: [
            { id: "t1", label: "count", code: "count", color: "sky" },
            { id: "t2", label: "setCount", code: "setCount", color: "purple" },
            { id: "t3", label: "value", code: "value", color: "emerald" },
            { id: "t4", label: "state", code: "state", color: "amber" },
            { id: "t5", label: "update", code: "update", color: "rose" },
          ],
          answers: { b1: "t1", b2: "t2" },
        },
        // ✦ INTERACTIVE — event handler prop
        {
          id: "react-ib-state-2",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "Event Handler Prop",
          difficulty: "Medium",
          xp: 80,
          description:
            "Fill in the correct React event prop to wire the click handler to the button.",
          codeTemplate: [
            {
              type: "code",
              content:
                "function App() {\n  const handleClick = () => alert('Clicked!');\n  return <button ",
            },
            { type: "blank", id: "b1", hint: "event prop", width: "96px" },
            { type: "code", content: "={handleClick}>Click Me</button>;\n}" },
          ],
          tokens: [
            { id: "t1", label: "onClick", code: "onClick", color: "rose" },
            { id: "t2", label: "onChange", code: "onChange", color: "sky" },
            { id: "t3", label: "onHover", code: "onHover", color: "emerald" },
            { id: "t4", label: "onPress", code: "onPress", color: "amber" },
          ],
          answers: { b1: "t1" },
        },
      ],
    },

    // ─── CHAPTER 4: USEEFFECT ──────────────────────────────────────
    {
      id: "effects",
      title: "useEffect & Side Effects",
      description: "Run code outside the render cycle",
      totalXp: 300,
      problems: [
        {
          id: "react-effect-1",
          title: "useEffect Basics",
          difficulty: "Easy",
          xp: 75,
          description: `Use \`useEffect\` (with an empty \`[]\` dependency array) to set the text of a \`<p id="status">\` to "Mounted!" after the component mounts.`,
          hints: [
            "useEffect(() => { ... }, []);  // runs once after mount",
            'document.getElementById("status").textContent = "Mounted!";',
          ],
          starterCode: `function App() {\n  useEffect(() => {\n    // Set id="status" paragraph text to "Mounted!"\n  }, []);\n\n  return <p id="status">Not mounted yet</p>;\n}\n`,
          testFunction: `
const p = doc.getElementById("status");
if (!p) return { success: false, message: 'No element with id="status" found.' };
if (p.textContent.trim() !== "Mounted!")
  return { success: false, message: \`Expected "Mounted!" but got "\${p.textContent.trim()}"\`. };
return { success: true, message: "useEffect runs after mount!" };`,
        },
        {
          id: "react-effect-2",
          title: "Effect with Dependencies",
          difficulty: "Medium",
          xp: 75,
          description: `Create a component with:
- A \`count\` state (starts at 0)
- An "Increment" button
- A \`<p id="log">\` that shows \`Count is: {count}\`
- A \`useEffect\` that runs when \`count\` changes and logs to console`,
          hints: ["useEffect(() => { console.log(count); }, [count]);"],
          starterCode: `function App() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    // This runs every time count changes\n    console.log("Count changed:", count);\n  }, [count]);\n\n  return (\n    <div>\n      <p id="log">Count is: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n`,
          testFunction: `
const p = doc.getElementById("log");
const btn = doc.querySelector("#root button");
if (!p) return { success: false, message: 'No <p id="log"> found.' };
if (!btn) return { success: false, message: "No <button> found." };
if (!p.textContent.includes("Count is:")) return { success: false, message: \`p should say "Count is: ...". Got: "\${p.textContent}"\` };
return { success: true, message: "useEffect with dependencies works!" };`,
        },
        {
          id: "react-effect-3",
          title: "Document Title",
          difficulty: "Medium",
          xp: 75,
          description: `Build a component with a \`count\` state and a button. Use \`useEffect\` to update \`document.title\` to \`"Count: \${count}"\` every time count changes.`,
          hints: ["document.title = `Count: ${count}`;  inside useEffect"],
          starterCode: `function App() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = \`Count: \${count}\`;\n  }, [count]);\n\n  return (\n    <div>\n      <p>{count}</p>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}\n`,
          testFunction: `
const p = doc.querySelector("#root p");
const btn = doc.querySelector("#root button");
if (!p || !btn) return { success: false, message: "Need a <p> and a <button>." };
if (doc.title !== "Count: 0") return { success: false, message: \`document.title should be "Count: 0" on load. Got: "\${doc.title}"\` };
return { success: true, message: "document.title updated with useEffect!" };`,
        },
        {
          id: "react-effect-4",
          title: "Cleanup Effect",
          difficulty: "Hard",
          xp: 100,
          description: `Create a timer component:
- A \`seconds\` state starting at 0
- \`useEffect\` with \`setInterval\` that increments seconds every 1000ms
- Return a cleanup that \`clearInterval\` to prevent memory leaks
- Display: \`<p>Seconds: {seconds}</p>\``,
          hints: [
            "const id = setInterval(() => setSeconds(s => s + 1), 1000);",
            "return () => clearInterval(id);   ← the cleanup function",
          ],
          starterCode: `function App() {\n  const [seconds, setSeconds] = useState(0);\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setSeconds(s => s + 1);\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);\n\n  return <p>Seconds: {seconds}</p>;\n}\n`,
          testFunction: `
const p = doc.querySelector("#root p");
if (!p) return { success: false, message: "No <p> found." };
if (!p.textContent.includes("Seconds:")) return { success: false, message: \`<p> should say "Seconds: ...". Got: "\${p.textContent}"\` };
return { success: true, message: "Cleanup effect with setInterval!" };`,
        },
        // ✦ INTERACTIVE — useEffect dependency array
        {
          id: "react-ib-effect-1",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "useEffect Dependencies",
          difficulty: "Medium",
          xp: 90,
          description:
            "Fill in the dependency array so this effect re-runs whenever 'count' changes (not on every render).",
          codeTemplate: [
            {
              type: "code",
              content: "useEffect(() => {\n  console.log(count);\n}, ",
            },
            { type: "blank", id: "b1", hint: "deps array", width: "90px" },
            { type: "code", content: ");" },
          ],
          tokens: [
            { id: "t1", label: "[count]", code: "[count]", color: "purple" },
            { id: "t2", label: "[]", code: "[]", color: "sky" },
            {
              id: "t3",
              label: "[count, id]",
              code: "[count, id]",
              color: "amber",
            },
            { id: "t4", label: "count", code: "count", color: "emerald" },
          ],
          answers: { b1: "t1" },
        },
      ],
    },

    // ─── CHAPTER 5: LISTS & CONDITIONAL UI ────────────────────────
    {
      id: "lists",
      title: "Lists & Conditional UI",
      description: "Master dynamic rendering patterns in React",
      totalXp: 275,
      problems: [
        {
          id: "react-list-1",
          title: "Data-Driven List",
          difficulty: "Easy",
          xp: 50,
          description: `Render this array as a \`<ul>\` of \`<li>\` elements. Each \`<li>\` must have a \`key\` prop.

\`const langs = ["JavaScript", "Python", "Rust", "Go"];\``,
          hints: ["langs.map(l => <li key={l}>{l}</li>)"],
          starterCode: `function App() {\n  const langs = ["JavaScript", "Python", "Rust", "Go"];\n  return (\n    <ul>\n      {/* Map langs to <li> elements with key */}\n    </ul>\n  );\n}\n`,
          testFunction: `
const lis = doc.querySelectorAll("#root li");
if (lis.length < 4) return { success: false, message: \`Expected 4 <li> but found \${lis.length}.\` };
const texts = Array.from(lis).map(l => l.textContent);
if (!texts.some(t => t.includes("Rust"))) return { success: false, message: '"Rust" not found in list.' };
return { success: true, message: "Data-driven list rendered!" };`,
        },
        {
          id: "react-list-2",
          title: "Filter Before Rendering",
          difficulty: "Medium",
          xp: 75,
          description: `Given this list, render only the numbers **greater than 3** as \`<li>\` elements:
\`[1, 2, 3, 4, 5, 6, 7]\``,
          hints: [
            "Chain .filter() before .map()",
            "nums.filter(n => n > 3).map(n => <li key={n}>{n}</li>)",
          ],
          starterCode: `function App() {\n  const nums = [1, 2, 3, 4, 5, 6, 7];\n  return (\n    <ul>\n      {/* Filter nums > 3, then map to <li> */}\n    </ul>\n  );\n}\n`,
          testFunction: `
const lis = doc.querySelectorAll("#root li");
if (lis.length !== 4) return { success: false, message: \`Expected 4 items (4,5,6,7) but found \${lis.length}.\` };
const vals = Array.from(lis).map(l => Number(l.textContent));
if (vals.some(v => v <= 3)) return { success: false, message: "List should only contain numbers > 3." };
return { success: true, message: "Filter + map pattern works!" };`,
        },
        {
          id: "react-list-3",
          title: "Short-Circuit Rendering",
          difficulty: "Easy",
          xp: 50,
          description: `Create an \`App\` with \`const hasError = true\`. Use the \`&&\` operator to only render \`<p className="error">Something went wrong!</p>\` when \`hasError\` is \`true\`.`,
          hints: [
            "{hasError && <p className='error'>Something went wrong!</p>}",
          ],
          starterCode: `function App() {\n  const hasError = true;\n  return (\n    <div>\n      {/* Render error <p> only when hasError is true */}\n    </div>\n  );\n}\n`,
          testFunction: `
const p = doc.querySelector("#root .error");
if (!p) return { success: false, message: 'No element with className="error" found. Use the && operator.' };
if (!p.textContent.includes("went wrong")) return { success: false, message: \`Expected "Something went wrong!". Got: "\${p.textContent}"\` };
return { success: true, message: "Short-circuit rendering with && works!" };`,
        },
        {
          id: "react-list-4",
          title: "Dynamic className",
          difficulty: "Medium",
          xp: 100,
          description: `Render a list of tasks. Each task has \`{ id, text, done }\`. Apply \`className="done"\` to any \`<li>\` where \`done\` is true.

\`const tasks = [{ id:1, text:"Learn JSX", done:true }, { id:2, text:"Build a project", done:false }]\``,
          hints: ["className={task.done ? 'done' : ''}"],
          starterCode: `function App() {\n  const tasks = [\n    { id: 1, text: "Learn JSX", done: true },\n    { id: 2, text: "Build a project", done: false },\n  ];\n  return (\n    <ul>\n      {tasks.map(task => (\n        <li key={task.id} className={task.done ? "done" : ""}>\n          {task.text}\n        </li>\n      ))}\n    </ul>\n  );\n}\n`,
          testFunction: `
const doneLis = doc.querySelectorAll("#root li.done");
if (doneLis.length !== 1) return { success: false, message: \`Expected 1 <li class="done"> but found \${doneLis.length}.\` };
if (!doneLis[0].textContent.includes("JSX")) return { success: false, message: '"Learn JSX" should have class done.' };
return { success: true, message: "Dynamic className works!" };`,
        },
        // ✦ INTERACTIVE — key prop in lists
        {
          id: "react-ib-list-1",
          type: "interactive",
          interactiveType: "fill-blank",
          title: "The key Prop",
          difficulty: "Medium",
          xp: 80,
          description:
            "React needs a special prop when rendering lists. Fill in the required prop name.",
          codeTemplate: [
            { type: "code", content: "fruits.map(fruit => (\n  <li " },
            { type: "blank", id: "b1", hint: "prop name", width: "60px" },
            { type: "code", content: "={fruit}>{fruit}</li>\n));" },
          ],
          tokens: [
            { id: "t1", label: "key", code: "key", color: "sky" },
            { id: "t2", label: "id", code: "id", color: "emerald" },
            { id: "t3", label: "index", code: "index", color: "amber" },
            { id: "t4", label: "name", code: "name", color: "rose" },
          ],
          answers: { b1: "t1" },
        },
      ],
    },

    // ─── CHAPTER 6: MINI PROJECTS ─────────────────────────────────
    {
      id: "projects",
      title: "Mini Projects",
      description: "Put it all together and build real React apps",
      totalXp: 450,
      problems: [
        {
          id: "react-proj-1",
          title: "Counter App",
          difficulty: "Medium",
          xp: 100,
          description: `Build a complete counter app with three buttons:
- **+** — increments count
- **−** — decrements count (min 0)
- **Reset** — resets to 0

Display the count in an \`<h2>\` element.`,
          hints: [
            "Use one useState for count.",
            "For decrement: setCount(c => Math.max(0, c - 1))",
          ],
          starterCode: `function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n      <button onClick={() => setCount(c => Math.max(0, c - 1))}>−</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}\n`,
          testFunction: `
const h2 = doc.querySelector("#root h2");
const btns = doc.querySelectorAll("#root button");
if (!h2) return { success: false, message: "No <h2> found for count display." };
if (btns.length < 3) return { success: false, message: \`Need at least 3 buttons. Found \${btns.length}.\` };
if (h2.textContent.trim() !== "0") return { success: false, message: \`Initial count should be 0. Got: "\${h2.textContent.trim()}"\` };
return { success: true, message: "Counter app complete! +" };`,
        },
        {
          id: "react-proj-2",
          title: "Todo List",
          difficulty: "Hard",
          xp: 150,
          description: `Build a functional Todo app:
- \`<input>\` to type a new todo
- \`<button>\` to add it to the list
- Each todo shows as an \`<li>\` with a **Delete** button
- Clicking Delete removes that todo from the list`,
          hints: [
            "const [todos, setTodos] = useState([]);",
            "Remove: setTodos(todos.filter((_, i) => i !== index))",
          ],
          starterCode: `function App() {\n  const [input, setInput] = useState("");\n  const [todos, setTodos] = useState([]);\n\n  const addTodo = () => {\n    if (!input.trim()) return;\n    setTodos([...todos, input]);\n    setInput("");\n  };\n\n  const removeTodo = (i) => {\n    setTodos(todos.filter((_, idx) => idx !== i));\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} placeholder="New todo..." />\n      <button onClick={addTodo}>Add</button>\n      <ul>\n        {todos.map((todo, i) => (\n          <li key={i}>\n            {todo}\n            <button onClick={() => removeTodo(i)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n`,
          testFunction: `
const input = doc.querySelector("#root input");
const addBtn = doc.querySelector("#root > div > button");
const ul = doc.querySelector("#root ul");
if (!input) return { success: false, message: "No <input> found." };
if (!addBtn) return { success: false, message: "No add <button> found." };
if (!ul) return { success: false, message: "No <ul> found to display todos." };
return { success: true, message: "Todo list app complete!" };`,
        },
        {
          id: "react-proj-3",
          title: "Color Palette",
          difficulty: "Medium",
          xp: 200,
          description: `Build an interactive color palette:
- An array of color objects: \`[{ name, hex }]\`
- Render each as a clickable \`<div>\` with that background color
- Track a \`selected\` state
- Show the selected color's name and hex code below

Use at least 4 colors.`,
          hints: [
            "const [selected, setSelected] = useState(null);",
            "Style: style={{ backgroundColor: color.hex, width: 60, height: 60 }}",
          ],
          starterCode: `function App() {\n  const colors = [\n    { name: "Coral", hex: "#FF6B6B" },\n    { name: "Sky", hex: "#4ECDC4" },\n    { name: "Sun", hex: "#FFE66D" },\n    { name: "Lavender", hex: "#A8E6CF" },\n  ];\n  const [selected, setSelected] = useState(null);\n\n  return (\n    <div>\n      <div style={{ display: "flex", gap: 12 }}>\n        {colors.map(c => (\n          <div\n            key={c.name}\n            onClick={() => setSelected(c)}\n            style={{ backgroundColor: c.hex, width: 60, height: 60, borderRadius: 8, cursor: "pointer" }}\n          />\n        ))}\n      </div>\n      {selected && (\n        <p>{selected.name} — {selected.hex}</p>\n      )}\n    </div>\n  );\n}\n`,
          testFunction: `
const swatches = doc.querySelectorAll("#root div > div > div");
if (swatches.length < 4) return { success: false, message: \`Expected at least 4 color swatches. Found \${swatches.length}.\` };
return { success: true, message: "🎨 Color palette app complete! You've finished the React Playground!" };`,
        },
      ],
    },
  ],
};

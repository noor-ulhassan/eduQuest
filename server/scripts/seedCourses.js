import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { Course } from "../models/AiCourse.js";
import { callAiModel } from "../config/aiProvider.js";

const ADMIN_EMAIL = "test@gmail.com";
const ADMIN_NAME = "test";

const fetchVideoId = async (topicName) => {
  try {
    const query = encodeURIComponent(`${topicName} tutorial`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&q=${query}&key=${process.env.YOUTUBE_API_KEY}`;
    const ytRes = await fetch(url);
    const ytData = await ytRes.json();
    return ytData?.items?.[0]?.id?.videoId ?? null;
  } catch {
    return null;
  }
};

const COURSE_DEFINITIONS = [
  {
    language: "javascript",
    name: "JavaScript Fundamentals",
    description: "Master the core building blocks of JavaScript — from variables and functions to async programming and DOM manipulation.",
    category: "Web Development",
    level: "Beginner",
    chapters: [
      { chapterName: "Variables & Data Types", duration: "45 min", topics: ["Variables", "var/let/const", "Primitive Types", "Type Coercion", "typeof"] },
      { chapterName: "Operators & Expressions", duration: "40 min", topics: ["Arithmetic", "Comparison", "Logical", "Ternary", "Nullish Coalescing"] },
      { chapterName: "Control Flow", duration: "40 min", topics: ["if/else", "switch", "Truthy & Falsy", "Short-circuit"] },
      { chapterName: "Functions & Scope", duration: "50 min", topics: ["Function Declarations", "Arrow Functions", "Closures", "Default Params"] },
      { chapterName: "Arrays", duration: "50 min", topics: ["Array Methods", "map/filter/reduce", "Spread", "Destructuring"] },
      { chapterName: "Objects", duration: "45 min", topics: ["Object Literals", "Property Access", "Destructuring", "Spread"] },
      { chapterName: "Loops", duration: "40 min", topics: ["for", "while", "for...of", "for...in", "forEach"] },
      { chapterName: "DOM Manipulation", duration: "50 min", topics: ["Selecting Elements", "Modifying DOM", "Creating Elements"] },
      { chapterName: "Events", duration: "45 min", topics: ["Event Listeners", "Event Object", "Event Delegation"] },
      { chapterName: "Async JavaScript", duration: "55 min", topics: ["Callbacks", "Promises", "async/await", "Fetch API"] },
    ],
  },
  {
    language: "html",
    name: "HTML Essentials",
    description: "Learn the structure and semantics of modern HTML — build accessible, well-structured web pages from scratch.",
    category: "Web Development",
    level: "Beginner",
    chapters: [
      { chapterName: "Document Structure", duration: "35 min", topics: ["DOCTYPE", "head/body", "Meta Tags", "HTML Comments"] },
      { chapterName: "Text & Headings", duration: "30 min", topics: ["Headings", "Paragraphs", "Text Formatting", "Quotations"] },
      { chapterName: "Links & Images", duration: "35 min", topics: ["Anchor Tags", "Image Tags", "Paths", "Attributes"] },
      { chapterName: "Lists & Tables", duration: "35 min", topics: ["Ordered/Unordered Lists", "Nested Lists", "Table Structure"] },
      { chapterName: "Forms & Input", duration: "45 min", topics: ["Form Element", "Input Types", "Labels", "Validation Attributes"] },
      { chapterName: "Semantic HTML", duration: "40 min", topics: ["header/nav/main/footer", "article/section", "aside", "Why Semantics"] },
      { chapterName: "Media Elements", duration: "35 min", topics: ["HTML Video", "HTML Audio", "iframes", "Responsive Media"] },
      { chapterName: "Accessibility", duration: "40 min", topics: ["Alt Text", "ARIA Roles", "Tab Index", "Accessible Forms"] },
    ],
  },
  {
    language: "css",
    name: "CSS Mastery",
    description: "From selectors to animations — learn CSS layout, responsive design, and modern styling techniques.",
    category: "Web Development",
    level: "Beginner",
    chapters: [
      { chapterName: "Selectors & Specificity", duration: "40 min", topics: ["Element/Class/ID", "Pseudo-classes", "Pseudo-elements", "Specificity"] },
      { chapterName: "Box Model", duration: "40 min", topics: ["Content/Padding/Border/Margin", "box-sizing", "Overflow", "display"] },
      { chapterName: "Flexbox", duration: "50 min", topics: ["flex container", "flex-direction", "justify-content", "align-items", "flex-wrap"] },
      { chapterName: "CSS Grid", duration: "50 min", topics: ["grid-template-columns", "grid-template-rows", "grid-gap", "grid-area"] },
      { chapterName: "Typography & Fonts", duration: "35 min", topics: ["font-family", "font-size/units", "line-height", "Google Fonts"] },
      { chapterName: "Colors & Gradients", duration: "35 min", topics: ["hex/rgb/hsl", "opacity", "linear-gradient", "CSS Variables"] },
      { chapterName: "Transitions & Animations", duration: "45 min", topics: ["transition", "transform", "@keyframes", "Timing Functions"] },
      { chapterName: "Responsive Design", duration: "45 min", topics: ["Media Queries", "Mobile-first", "Viewport Units", "Breakpoints"] },
    ],
  },
  {
    language: "python",
    name: "Python Programming",
    description: "A comprehensive introduction to Python — covering core syntax, data structures, file handling, and error management.",
    category: "Programming",
    level: "Beginner",
    chapters: [
      { chapterName: "Variables & Data Types", duration: "40 min", topics: ["Variables", "int/float/str/bool", "Type Conversion", "None"] },
      { chapterName: "Operators", duration: "35 min", topics: ["Arithmetic", "Comparison", "Logical", "Augmented Assignment"] },
      { chapterName: "Control Flow", duration: "40 min", topics: ["if/elif/else", "Nested Conditions", "Ternary Expression"] },
      { chapterName: "Functions", duration: "50 min", topics: ["Defining Functions", "Parameters", "Return Values", "Lambda"] },
      { chapterName: "Lists & Tuples", duration: "45 min", topics: ["List Methods", "Slicing", "Tuples", "List Comprehensions"] },
      { chapterName: "Dictionaries", duration: "45 min", topics: ["Creating Dicts", "Accessing Values", "Dict Methods", "Dict Comprehensions"] },
      { chapterName: "Loops", duration: "40 min", topics: ["for Loop", "while Loop", "range()", "enumerate & zip"] },
      { chapterName: "String Methods", duration: "40 min", topics: ["Indexing/Slicing", "Common Methods", "f-Strings", "Formatting"] },
      { chapterName: "File I/O", duration: "40 min", topics: ["Opening Files", "Reading", "Writing", "Context Managers"] },
      { chapterName: "Error Handling", duration: "40 min", topics: ["try/except", "Specific Exceptions", "finally", "Raising Exceptions"] },
    ],
  },
  {
    language: "react",
    name: "React Development",
    description: "Build modern UIs with React — components, hooks, state management, and the Context API.",
    category: "Frontend Development",
    level: "Beginner",
    chapters: [
      { chapterName: "JSX Basics", duration: "40 min", topics: ["What is JSX", "JSX Expressions", "Rendering Elements", "JSX vs HTML"] },
      { chapterName: "Components & Props", duration: "45 min", topics: ["Functional Components", "Props", "Prop Types", "Default Props"] },
      { chapterName: "State & useState", duration: "50 min", topics: ["useState Hook", "State Updates", "State vs Props", "Multiple State"] },
      { chapterName: "Event Handling", duration: "40 min", topics: ["onClick", "onChange", "onSubmit", "Synthetic Events"] },
      { chapterName: "Conditional Rendering", duration: "35 min", topics: ["Ternary in JSX", "&& Operator", "Rendering null"] },
      { chapterName: "Lists & Keys", duration: "40 min", topics: ["Array.map() in JSX", "The key Prop", "Dynamic Lists"] },
      { chapterName: "useEffect", duration: "50 min", topics: ["Side Effects", "Dependency Array", "Cleanup Functions"] },
      { chapterName: "Forms", duration: "45 min", topics: ["Controlled Components", "Form Submission", "Validation"] },
      { chapterName: "Component Composition", duration: "45 min", topics: ["Children Prop", "Reusable Components", "Component Hierarchy"] },
      { chapterName: "Context API", duration: "50 min", topics: ["Prop Drilling", "createContext", "useContext", "Provider"] },
    ],
  },
  {
    language: "dsa",
    name: "Data Structures & Algorithms",
    description: "Build a strong foundation in DSA — from Big O notation to dynamic programming, with visual explanations.",
    category: "Computer Science",
    level: "Beginner",
    chapters: [
      { chapterName: "Big O Notation", duration: "40 min", topics: ["Time Complexity", "Space Complexity", "Common Complexities"] },
      { chapterName: "Arrays & Searching", duration: "50 min", topics: ["Array Operations", "Linear Search", "Binary Search", "Two Pointers"] },
      { chapterName: "Sorting Algorithms", duration: "55 min", topics: ["Bubble Sort", "Selection Sort", "Merge Sort", "Quick Sort"] },
      { chapterName: "Linked Lists", duration: "50 min", topics: ["Node Structure", "Singly Linked List", "Doubly Linked List", "Operations"] },
      { chapterName: "Stacks & Queues", duration: "45 min", topics: ["Stack (LIFO)", "Queue (FIFO)", "Implementation", "Applications"] },
      { chapterName: "Recursion", duration: "50 min", topics: ["Base Case", "Call Stack", "Recursive Patterns", "Memoization Intro"] },
      { chapterName: "Trees", duration: "55 min", topics: ["Tree Terminology", "Binary Trees", "Traversal (BFS/DFS)", "BST"] },
      { chapterName: "Graphs", duration: "55 min", topics: ["Graph Representations", "BFS", "DFS", "Directed vs Undirected"] },
      { chapterName: "Hash Tables", duration: "45 min", topics: ["Hashing", "Hash Functions", "Collision Handling", "Applications"] },
      { chapterName: "Dynamic Programming", duration: "55 min", topics: ["Overlapping Subproblems", "Memoization", "Tabulation", "Classic Problems"] },
    ],
  },
];

const generateChapterContent = async (chapter) => {
  const prompt = `Depends on Chapter name and Topic Generate content for each topic in HTML
    and give response in JSON format.
    Schema: {
      "chapterName": "string",
      "topics": [
        {
          "topic": "string",
          "content": "string (html format)",
          "proTip": "string (a useful pro tip about the topic)",
          "keyConcepts": [
             { "title": "string", "description": "string", "icon": "string (material symbol name like 'dns' or 'stream')" }
          ],
          "imagePrompt": "string (abstract futuristic digital architecture concept describing the topic)",
          "diagram": "string (valid Mermaid.js graph TD syntax if the topic involves a process, flow, algorithm, architecture, sequence, comparison, or data structure — otherwise empty string \\"\\")"
        }
      ]
    }
    Rules for the diagram field:
    - Use ONLY "graph TD" as the diagram type. No other Mermaid diagram types allowed.
    - Return valid, renderable Mermaid.js syntax with no markdown fences or backticks — plain string only.
    - Return empty string "" for topics that are simple definitions, introductions, or concept explanations that do not involve steps, flows, or structural relationships.
    : User Input: ${JSON.stringify(chapter)}`;

  let chapterContentData = await callAiModel(prompt);

  const videoIds = await Promise.all(
    chapterContentData.topics.map((t) => fetchVideoId(t.topic))
  );

  chapterContentData.topics = chapterContentData.topics.map((t, i) => ({
    ...t,
    videoId: videoIds[i],
  }));

  return chapterContentData;
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const courseDef of COURSE_DEFINITIONS) {
      const existing = await Course.findOne({ language: courseDef.language, userEmail: ADMIN_EMAIL });
      if (existing) {
        console.log(`Skipping ${courseDef.language} — already seeded`);
        continue;
      }

      console.log(`\n=== Seeding: ${courseDef.name} (${courseDef.language}) ===`);

      const chapters = [];
      for (let i = 0; i < courseDef.chapters.length; i++) {
        const ch = courseDef.chapters[i];
        console.log(`  Generating chapter ${i + 1}/${courseDef.chapters.length}: ${ch.chapterName}`);
        try {
          const content = await generateChapterContent(ch);
          chapters.push(content);
        } catch (err) {
          console.error(`  ERROR generating chapter "${ch.chapterName}":`, err.message);
          chapters.push(ch);
        }
      }

      const courseId = uuidv4();
      await Course.create({
        courseId,
        name: courseDef.name,
        description: courseDef.description,
        noOfChapters: courseDef.chapters.length,
        level: courseDef.level,
        category: courseDef.category,
        courseOutput: {
          name: courseDef.name,
          description: courseDef.description,
          category: courseDef.category,
          level: courseDef.level,
          noOfChapters: courseDef.chapters.length,
          chapters,
          achievements: [
            { title: "First Step", icon: "flag", description: "Complete your first chapter" },
            { title: "Halfway There", icon: "bolt", description: "Complete half the course" },
            { title: "Course Complete", icon: "emoji_events", description: "Finish all chapters" },
          ],
        },
        userEmail: ADMIN_EMAIL,
        userName: ADMIN_NAME,
        userProfileImage: "",
        isPublished: true,
        language: courseDef.language,
      });

      console.log(`  ✓ ${courseDef.name} seeded successfully`);
    }

    console.log("\n=== All courses seeded! ===");
  } catch (err) {
    console.error("Seed script failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();

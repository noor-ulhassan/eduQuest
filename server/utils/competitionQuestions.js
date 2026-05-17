import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── PROMPT INPUT SANITIZATION ────────────────────────────
const ALLOWED_PROMPT_CHARS = /[^a-zA-Z0-9 .,'!?:()\-_#@&+/]/g;
const INJECTION_PATTERNS =
  /\b(ignore|forget|disregard|override|system prompt|instruction)\b/gi;

function sanitizePromptInput(str, maxLen = 200) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/[\r\n\t]/g, " ")
    .replace(ALLOWED_PROMPT_CHARS, "")
    .replace(INJECTION_PATTERNS, "")
    .trim()
    .slice(0, maxLen);
}

// ─── GEMINI CLIENT SINGLETON ──────────────────────────────
let _genAI = null;
let _model = null;
function getModel() {
  if (!_model) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    _model = _genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { temperature: 0.95 },
    });
  }
  return _model;
}

// ─── DIFFICULTY TONE MAPPING ──────────────────────────────
const DIFFICULTY_TONES = {
  easy: `Tone: Beginner-friendly and encouraging. Use simple, clear language.
Focus on: syntax basics, fundamental concepts, simple logic puzzles.
Style: Think of a friendly tutor helping a student learn.`,
  medium: `Tone: Professional and practical, like a code review.
Focus on: real-world patterns, debugging common issues, practical tradeoffs.
Style: Think of a senior developer mentoring a junior.`,
  hard: `Tone: Architect-level, demanding deep expertise.
Focus on: system design, performance optimization, complex integrations, edge cases.
Style: Think of a principal engineer conducting a technical interview.`,
};

// ─── CHALLENGE MODE PROMPTS ───────────────────────────────

function buildClassicQuizPrompt({
  difficulty,
  topic,
  description,
  totalQuestions,
}) {
  const topicLine = topic
    ? `Topic: ${topic}`
    : "Topic: general technology, computer science, and programming concepts";
  const descLine = description ? `Additional context: ${description}` : "";

  return `
You are a quiz question generator for a competitive knowledge game.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

${topicLine}
${descLine}

Generate ${totalQuestions} engaging multiple-choice questions.

Each question must have:
- question: clear question text
- options: array of EXACTLY 4 answer choices
- correctAnswer: must match one option EXACTLY
- explanation: brief explanation why the answer is correct
- difficulty: "${difficulty}"

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": ""
    }
  ]
}
`;
}

function buildScenarioChallengePrompt({
  difficulty,
  topic,
  description,
  totalQuestions,
}) {
  const topicLine = topic
    ? `Domain: ${topic}`
    : "Domain: software engineering and web development";
  const descLine = description ? `Additional context: ${description}` : "";

  return `
You are an immersive scenario-based quiz designer. Each question must present a REALISTIC MINI-STORY before asking a question.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

${topicLine}
${descLine}

Generate ${totalQuestions} scenario-based multiple-choice questions.

RULES:
- Each question MUST start with a vivid, real-world scenario (2-4 sentences) that sets up the problem
- Use specific character names, company contexts, and project situations
- The question should require APPLYING knowledge to the scenario, not just recalling facts
- Scenarios should be varied: startup decisions, debugging situations, architecture choices, team discussions, deadline pressure, etc.

Example scenario style:
"Sarah, a backend developer at a fintech startup, notices their MongoDB queries are taking 3+ seconds during peak hours. The collection has 2 million user transaction documents with frequent reads on 'userId' and 'timestamp' fields. Her team lead asks her to optimize the database layer before the next sprint review."

Each question must have:
- scenario: the story/narrative setup (2-4 sentences, with character names and context)
- question: the actual question tied to the scenario
- options: array of EXACTLY 4 answer choices
- correctAnswer: must match one option EXACTLY
- explanation: why this answer is correct in the scenario's context
- difficulty: "${difficulty}"

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "scenario": "",
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": ""
    }
  ]
}
`;
}

function buildDebugDetectivePrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
}) {
  const topicLine = topic ? `Focus area: ${topic}` : "";
  const descLine = description ? `Additional context: ${description}` : "";

  return `
You are a "Debug Detective" challenge designer. Each question presents BUGGY CODE that the competitor must fix.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

Language: ${language}
${topicLine}
${descLine}

Generate ${totalQuestions} debugging challenges.

RULES:
- Each challenge presents a SHORT code snippet (5-15 lines) with exactly ONE bug
- Include a narrative: WHO wrote this code and WHY it's broken (e.g., "A junior developer wrote this utility function but users report incorrect results...")
- The bug should be realistic: off-by-one errors, wrong comparisons, missing await, incorrect array methods, scope issues, etc.
- Provide 4 options describing what the fix should be
- The buggy code should be syntactically valid but logically incorrect

Each question must have:
- scenario: narrative context (who wrote it, what's happening, 1-2 sentences)
- question: "What is the bug in this code?" or similar
- buggyCode: the code snippet with the bug (as a string, use \\\\n for newlines)
- options: array of EXACTLY 4 possible fixes/explanations
- correctAnswer: must match one option EXACTLY
- explanation: detailed explanation of the bug and fix
- difficulty: "${difficulty}"

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "scenario": "",
      "question": "",
      "buggyCode": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": ""
    }
  ]
}
`;
}

function buildProductionOutagePrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
}) {
  const topicLine = topic
    ? `System type: ${topic}`
    : "System type: MERN stack web application";
  const descLine = description ? `Additional context: ${description}` : "";

  return `
You are a "Production Outage" crisis simulator. Create HIGH-PRESSURE scenarios where a live system is broken and the competitor must identify the root cause.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

Language: ${language}
${topicLine}
${descLine}

Generate ${totalQuestions} production outage challenges.

RULES:
- Start each with an URGENT scenario: "🚨 CRITICAL: The checkout API is returning 500 errors. 2,000 users are affected..."
- Include the broken code snippet (an Express route, React component, database query, etc.)
- The bug should be something that would actually cause a production issue: unhandled promises, missing error handling, memory leaks, wrong HTTP status codes, race conditions, etc.
- Create the feeling of real incident response

Each question must have:
- scenario: urgent incident description with emojis and stakes (2-3 sentences)
- question: "What is causing this outage?" or "How do you fix this immediately?"
- buggyCode: the production code with the issue (as a string, use \\\\n for newlines)
- options: array of EXACTLY 4 possible root causes/fixes
- correctAnswer: must match one option EXACTLY
- explanation: post-mortem style explanation of the root cause
- difficulty: "${difficulty}"

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "scenario": "",
      "question": "",
      "buggyCode": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": ""
    }
  ]
}
`;
}

function buildCodeRefactorPrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
}) {
  const topicLine = topic ? `Focus area: ${topic}` : "";
  const descLine = description ? `Additional context: ${description}` : "";

  return `
You are a "Code Refactor" challenge designer. Present WORKING but POORLY WRITTEN code that needs improvement.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

Language: ${language}
${topicLine}
${descLine}

Generate ${totalQuestions} code refactoring challenges.

RULES:
- Each challenge shows functioning but messy/inefficient code (8-15 lines)
- Include a narrative: "This code was written during a hackathon and now needs to be production-ready..."
- Issues can be: poor naming, God functions, magic numbers, missing error handling, O(n²) when O(n) is possible, callback hell, etc.
- Present 4 options for the BEST refactored version or approach
- The code must WORK but be clearly improvable

Each question must have:
- scenario: context about why this code needs refactoring (1-2 sentences)
- question: "Which refactoring best improves this code?" or similar
- buggyCode: the working-but-messy code (as a string, use \\\\n for newlines)  
- options: array of EXACTLY 4 refactoring approaches
- correctAnswer: must match one option EXACTLY
- explanation: why this refactoring is the best choice
- difficulty: "${difficulty}"

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "scenario": "",
      "question": "",
      "buggyCode": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": ""
    }
  ]
}
`;
}

function buildMissingLinkPrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
  category,
}) {
  const topicLine = topic ? `Domain: ${topic}` : "";
  const descLine = description ? `Additional context: ${description}` : "";
  const isGeneral = category === "general";

  const focusArea = isGeneral
    ? `Generate questions about connecting concepts: "Given this database schema, what API endpoint design would be correct?" or "Given this user requirement, which architecture pattern fits?"`
    : `Generate questions about connecting different parts of a ${language} full-stack application: "Given this MongoDB schema and React component, write the missing Express controller" or "Given this API response, what should the frontend state look like?"`;

  return `
You are a "Missing Link" challenge designer. Present PARTIAL context and ask the competitor to identify or complete the MISSING PIECE.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

Language: ${language}
${topicLine}
${descLine}

${focusArea}

Generate ${totalQuestions} "missing link" challenges.

RULES:
- Show two connected pieces of a system with the bridge between them missing
- Include a narrative: "The frontend team built this component, the database team designed this schema. What Express route connects them?"
- The question tests understanding of how different parts of a system INTEGRATE
- Present 4 options for the missing piece

Each question must have:
- scenario: narrative about the system and what exists (2-3 sentences)
- question: "What is the missing piece?" or "Which implementation correctly connects these?"
- contextCode: the existing code/schema that provides context (as a string, use \\\\n for newlines). For general category, this can be a text description of the architecture.
- options: array of EXACTLY 4 possible missing pieces
- correctAnswer: must match one option EXACTLY
- explanation: why this piece correctly connects the system
- difficulty: "${difficulty}"

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "scenario": "",
      "question": "",
      "contextCode": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": ""
    }
  ]
}
`;
}

// ─── INTERACTIVE MODE ─────────────────────────────────────
function buildInteractivePrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
  category,
}) {
  const isGeneral = category === "general";
  const topicLine = topic
    ? `Topic: ${topic}`
    : isGeneral
      ? "Topic: general technology, science, and computer science concepts"
      : `Topic: ${language} programming`;
  const descLine = description ? `Additional context: ${description}` : "";
  const topicForInstruction =
    topic || (isGeneral ? "general knowledge" : language + " programming");

  // Distribute question types — pick randomly, ensuring variety
  // fill_blank removed: unreliable grading and poor UX
  const types = isGeneral
    ? [
        "drag_order",
        "drag_match",
        "slider_adjust",
        "drag_order",
        "drag_match",
      ]
    : [
        "drag_order",
        "drag_match",
        "predict_output",
        "slider_adjust",
        "drag_order",
        "drag_match",
      ];

  // Build distribution then SHUFFLE so order is random each game
  const typeDistribution = [];
  for (let i = 0; i < totalQuestions; i++) {
    typeDistribution.push(types[i % types.length]);
  }
  // Fisher-Yates shuffle
  for (let i = typeDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typeDistribution[i], typeDistribution[j]] = [
      typeDistribution[j],
      typeDistribution[i],
    ];
  }

  const typeCounts = typeDistribution.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const typeBreakdown = Object.entries(typeCounts)
    .map(([type, count]) => `- ${count}x "${type}"`)
    .join("\n");

  // Build the ordered list so AI generates them in shuffled order
  const orderedList = typeDistribution
    .map((t, i) => `  ${i + 1}. ${t}`)
    .join("\n");

  // Unique seed for anti-caching
  const seed = Math.floor(Math.random() * 100000);

  return `
You are an interactive quiz question generator for a competitive education game.
Seed: ${seed} (use this to ensure unique output every time)

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

${topicLine}
${descLine}
${isGeneral ? "Category: General Knowledge (NO coding/programming questions — focus on concepts, facts, and real-world knowledge)" : `Language: ${language}`}

Generate EXACTLY ${totalQuestions} COMPLETELY ORIGINAL questions about "${topicForInstruction}" with these INTERACTIVE TYPES:
${typeBreakdown}

Generate them in THIS EXACT ORDER (do NOT rearrange):
${orderedList}

Each question MUST have:
- interactionType: one of "drag_order", "drag_match"${!isGeneral ? ', "predict_output"' : ""}, "slider_adjust"
- difficulty: "${difficulty}"

CRITICAL RULES:
1. Every question MUST be 100% ORIGINAL — create NEW content from scratch about "${topicForInstruction}"
2. Every question must test a DIFFERENT concept — NO two questions should cover similar topics
3. The schemas below show ONLY the JSON structure. ALL content inside must be YOUR OWN creation.

=== drag_order ===
User drags items into correct sequential order. Good for process steps, sorting, ranking.
Schema: { "interactionType": "drag_order", "question": "...", "items": ["A", "B", "C", "D"], "correctOrder": [2, 0, 3, 1], "explanation": "...", "difficulty": "${difficulty}" }
Rules: "items" is the shuffled display list. "correctOrder[i]" = index in items of the item that should be at position i. Use 4-6 items.

=== drag_match ===
User matches left column items to right column items. Good for term-definition, concept-example pairs.
Schema: { "interactionType": "drag_match", "question": "...", "pairs": [{"left": "...", "right": "..."}, ...], "explanation": "...", "difficulty": "${difficulty}" }
Rules: EXACTLY 4 pairs. pairs[i].left matches pairs[i].right.

=== slider_adjust ===
User adjusts sliders to find correct numeric values. Good for tuning parameters, thresholds, configurations.
Schema: { "interactionType": "slider_adjust", "question": "...", "sliders": [{"label": "...", "unit": "...", "min": 0, "max": 100, "step": 1, "correctValue": 42, "tolerance": 2}], "explanation": "...", "difficulty": "${difficulty}" }
Rules: 1-3 sliders. correctValue must NOT be min, max, or exact midpoint. tolerance=0 means exact match.

${
  !isGeneral
    ? `
=== predict_output ===
User reads code and types what it outputs. Good for tracing logic, understanding execution.
Schema: { "interactionType": "predict_output", "question": "...", "codeSnippet": "...", "acceptedAnswers": ["format1", "format2"], "explanation": "...", "difficulty": "${difficulty}" }
Rules: Include 3-5 accepted format variations. Keep outputs SHORT (single line).
`
    : ""
}

FINAL REMINDERS:
- Return ONLY valid JSON. No markdown. No backticks.
- ALL questions must be ORIGINAL and about "${topicForInstruction}" — do NOT use generic/placeholder content.
- Each question tests a DIFFERENT concept within the topic.
- Follow the exact type order specified above.

Return JSON:
{
  "questions": [ ...array of ${totalQuestions} question objects... ]
}
`;
}

// ─── VISUAL INTERACTIVE MODE (Programming only) ───────────
function buildVisualInteractivePrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
}) {
  const topicStr  = topic || `${language} programming`;
  const topicLine = topic ? `Topic: ${topic}` : `Topic: ${language} programming concepts`;
  const descLine  = description ? `Additional context: ${description}` : "";
  const seed      = Math.floor(Math.random() * 100000);

  // Cycle through all 6 interaction types in shuffled order for maximum variety
  const allTypes = [
    "visual_sequence", // robot grid — pointer/algorithm navigation
    "code_trace",      // drag execution snapshots into chronological order
    "drag_order",      // drag algorithm steps into correct sequence
    "drag_match",      // match programming terms to definitions
    "predict_output",  // read code and type its output
    "slider_adjust",   // tune numeric parameters (complexity, thresholds)
  ];
  // Shuffle the cycle order so every game is different
  const shuffledBase = [...allTypes].sort(() => Math.random() - 0.5);
  const types = Array.from({ length: totalQuestions }, (_, i) => shuffledBase[i % shuffledBase.length]);
  const typeCounts    = types.reduce((a, t) => { a[t] = (a[t] || 0) + 1; return a; }, {});
  const typeBreakdown = Object.entries(typeCounts).map(([t, n]) => `- ${n}x "${t}"`).join("\n");
  const orderedList   = types.map((t, i) => `  ${i + 1}. ${t}`).join("\n");

  // Concept pool — pick varied sub-topics so no two questions are alike
  const allConcepts = [
    `array index traversal (iterating through elements in ${language})`,
    `stack push/pop sequence (LIFO data structure in ${language})`,
    `queue enqueue/dequeue (FIFO data structure in ${language})`,
    `linked list pointer advancement (following .next references)`,
    `binary search left/right navigation (halving the search space)`,
    `BFS level-order expansion (exploring neighbors before going deeper)`,
    `DFS backtracking (going deep, then backing up)`,
    `two-pointer convergence (left and right pointers meeting)`,
    `sliding window movement (advancing a fixed-size window)`,
    `sorting algorithm swap steps (bubble/selection sort comparisons)`,
    `tree traversal (in-order / pre-order / post-order steps)`,
    `hash map bucket navigation (key hashing to slot)`,
    `recursion call and return sequence (call stack depth)`,
    `memoization cache hit/miss flow`,
    `event loop task queue processing`,
    `promise chain resolution order`,
    `closure variable capture sequence`,
    `prototype chain lookup steps`,
    `garbage collection reachability walk`,
    `regex backtracking steps`,
  ];
  // Shuffle and take one per question
  const shuffledConcepts = [...allConcepts].sort(() => Math.random() - 0.5);
  const assignedConcepts = types.map((_, i) => shuffledConcepts[i % shuffledConcepts.length]);
  const conceptMap = types.map((t, i) => `  Q${i + 1} (${t}): "${assignedConcepts[i]}"`).join("\n");

  return `
You are a Brilliant.org-style programming puzzle designer for a competitive education platform.
Seed: ${seed}

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}
${topicLine}
${descLine}
Language: ${language}

Generate EXACTLY ${totalQuestions} visual interactive questions about "${topicStr}":
${typeBreakdown}

In this EXACT order:
${orderedList}

CONCEPT ASSIGNMENT — each question MUST model the specific concept listed below (do NOT swap them):
${conceptMap}

The question text and context must clearly describe the assigned concept. Do NOT generate generic "guide the robot" or "assign x=5" questions.

════════════════════════════════════════
TYPE: visual_sequence
════════════════════════════════════════
A grid represents a memory/data structure. A robot (pointer/cursor/algorithm head) navigates it.
The user arranges command blocks into the correct execution order to make the algorithm complete.

RULES:
• Grid: rows 2–4, cols 2–4. startPos ≠ goalPos. Choose DIFFERENT configs each time.
• startDir: "right" | "left" | "up" | "down"  — vary this across questions.
• Command strings: ONLY use "Move Forward" | "Turn Left" | "Turn Right" | "Move Backward"
• items: 3–7 commands in SHUFFLED order (NOT execution order)
• correctOrder[i] = index into items array that executes at position i
• MANDATORY PATH VERIFICATION — trace every step before writing correctOrder:
    pos = startPos, dir = startDir
    for each correctOrder[i]:
      cmd = items[correctOrder[i]]
      apply cmd to pos/dir
      if pos goes out of bounds → INVALID, redesign
      if pos hits a wall → INVALID, redesign
    final pos MUST equal goalPos
• walls: array of [row, col] blocked cells — add 0–2 walls for variety

MOVEMENT RULES:
• "Move Forward"  → pos += delta[dir]   (right:[0,+1], left:[0,-1], up:[-1,0], down:[+1,0])
• "Turn Left"     → dir CCW: right→up→left→down→right
• "Turn Right"    → dir CW:  right→down→left→up→right
• "Move Backward" → pos -= delta[dir]

THREE WORKED EXAMPLES — create questions UNLIKE all of these:

EXAMPLE A — 3×3, start=[0,0] dir=right, goal=[2,2], walls=[]:
  Trace: right→[0,1], right→[0,2], Turn Right(now down), down→[1,2], down→[2,2] ✓
  items (shuffled): ["Move Forward","Turn Right","Move Forward","Move Forward","Move Forward"]
  correctOrder: [0,1,2,3,4]
  → shuffled better: items=["Turn Right","Move Forward","Move Forward","Move Forward","Move Forward"], correctOrder=[1,0,2,3,4]

EXAMPLE B — 4×3, start=[3,2] dir=up, goal=[0,0], walls=[[2,1]]:
  Trace: up→[2,2], up→[1,2], Turn Left(now left), left→[1,1], left→[1,0], Turn Left(now down)...
  Redesign to avoid wall: Turn Right(now right)... actually go left from [1,2] to [1,0], Turn Left(now down)→wrong
  Better path: up→[2,2], Turn Left(now left), left→[2,1] WALL! Redesign.
  Final path: up→[2,2], up→[1,2], Turn Left(now left), left→[1,1], left→[1,0], Turn Left(now down), Move Forward→[2,0]... not goal
  → This illustrates: ALWAYS verify. Redesign until valid.

EXAMPLE C — 2×4, start=[1,0] dir=right, goal=[0,3], walls=[]:
  Trace: right→[1,1], right→[1,2], right→[1,3], Turn Left(now up), up→[0,3] ✓
  items (shuffled): ["Move Forward","Turn Left","Move Forward","Move Forward","Move Forward"]
  correctOrder: [0,2,3,4,1]... wait: step0=items[0]="MF"→[1,1], step1=items[2]="MF"→[1,2], step2=items[3]="MF"→[1,3], step3=items[4]="MF"... no.
  Corrected: items=["Turn Left","Move Forward","Move Forward","Move Forward","Move Forward"]
  correctOrder=[1,2,3,0,4]: step0=items[1]="MF"→[1,1], step1=items[2]="MF"→[1,2], step2=items[3]="MF"→[1,3], step3=items[0]="TL"→up, step4=items[4]="MF"→[0,3] ✓

DO NOT COPY any of these examples. Create original grid configurations.

Schema:
{
  "interactionType": "visual_sequence",
  "question": "...(describe the algorithm/pointer operation being simulated, e.g. 'Guide the array pointer from the last element to index 0')...",
  "context": "...(one sentence: the exact ${language} concept this grid models, e.g. 'Simulates a stack pointer walking from the top frame back to the base')...",
  "gridConfig": {
    "rows": <2-4>,
    "cols": <2-4>,
    "startPos": [row, col],
    "startDir": "right|left|up|down",
    "goalPos": [row, col],
    "walls": [[row,col], ...]
  },
  "items": ["Move Forward", "Turn Left", ...],
  "correctOrder": [<verified indexes>],
  "explanation": "...(step-by-step trace showing each pos change AND how it maps to the ${language} concept)...",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
TYPE: code_trace
════════════════════════════════════════
User sees a code snippet and drags execution snapshot cards into chronological order.

RULES:
• codeSnippet: 4–10 lines of REAL ${language} code for the assigned concept. Use:
  - for/while loops with accumulator or counter variables
  - if/else branches that change variable values
  - function calls with meaningful return values
  - array or object mutations (push, pop, splice, etc.)
  - Nested operations (loop inside condition, function modifying array, etc.)
  NEVER use trivial patterns like x=5; y=x*2; z=y-3
• steps: 3–5 snapshot objects in GENUINELY SHUFFLED order (NOT execution order — shuffle them)
• Each step: { "lineLabel": "exact code line", "variables": { all vars currently in scope with current values } }
  For loop iterations: show the variable state at EACH iteration as a separate step
• correctOrder[i] = index into steps that executes at step i
• VERIFY: following correctOrder through steps must trace the actual code execution

EXAMPLE A — For-loop accumulator (do NOT copy):
codeSnippet: "total = 0\\nfor i in range(1, 4):\\n    total += i\\nprint(total)"
steps (shuffled): [
  { "lineLabel": "total += i", "variables": { "i": 3, "total": 6 } },
  { "lineLabel": "total = 0",  "variables": { "total": 0 } },
  { "lineLabel": "total += i", "variables": { "i": 1, "total": 1 } },
  { "lineLabel": "print(total)","variables": { "total": 6 } },
  { "lineLabel": "total += i", "variables": { "i": 2, "total": 3 } }
]
correctOrder: [1, 2, 4, 0, 3]
← step[1]="total=0" first, step[2]="total+=1(i=1)" second, step[4]="total+=2(i=2)" third, step[0]="total+=3(i=3)" fourth, step[3]="print" last

EXAMPLE B — Conditional branch (do NOT copy):
codeSnippet: "arr = [4, 2, 7]\\nmax_val = arr[0]\\nfor x in arr:\\n    if x > max_val:\\n        max_val = x\\nreturn max_val"
steps (shuffled): [
  { "lineLabel": "max_val = arr[0]", "variables": { "arr": [4,2,7], "max_val": 4 } },
  { "lineLabel": "max_val = x",      "variables": { "arr": [4,2,7], "max_val": 7, "x": 7 } },
  { "lineLabel": "return max_val",   "variables": { "arr": [4,2,7], "max_val": 7 } },
  { "lineLabel": "arr = [4, 2, 7]",  "variables": { "arr": [4,2,7] } },
  { "lineLabel": "if x > max_val",   "variables": { "arr": [4,2,7], "max_val": 4, "x": 7 } }
]
correctOrder: [3, 0, 4, 1, 2]

DO NOT copy these examples. Create original code that matches the assigned concept.

Schema:
{
  "interactionType": "code_trace",
  "question": "...(what this code computes and what concept it demonstrates)...",
  "codeSnippet": "...(real multi-line code, use \\n for newlines)...",
  "steps": [
    { "lineLabel": "...", "variables": { "varName": value } }
  ],
  "correctOrder": [<verified indexes>],
  "explanation": "...(step-by-step trace AND the ${language} concept demonstrated)...",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
TYPE: drag_order
════════════════════════════════════════
User drags items into the correct sequential order. Use for algorithm steps, process flows, sorting phases, lifecycle events.

RULES:
• items: 4–6 steps/concepts in SHUFFLED order (NOT the correct order)
• correctOrder[i] = index into items that should be at position i
• items MUST be genuinely shuffled — not in correct order

EXAMPLE (do NOT copy):
question: "Arrange the steps of the merge sort algorithm in correct order"
items (shuffled): ["Merge sorted halves", "Divide array in half", "Recursively sort right half", "Recursively sort left half", "Return base case (len≤1)"]
correctOrder: [4, 1, 3, 2, 0]
← step0=items[4]="Return base case", step1=items[1]="Divide", step2=items[3]="Sort left", step3=items[2]="Sort right", step4=items[0]="Merge"

Schema:
{
  "interactionType": "drag_order",
  "question": "...(arrange these ${language} _____ steps in the correct order)...",
  "items": ["step A", "step B", "step C", "step D", "step E"],
  "correctOrder": [verified indexes],
  "explanation": "...(why this is the correct sequence)...",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
TYPE: drag_match
════════════════════════════════════════
User matches left-column terms to right-column definitions. Use for term/concept pairing.

RULES:
• EXACTLY 4 pairs. pairs[i].left matches pairs[i].right.
• Terms should be from the assigned concept — specific, unambiguous

EXAMPLE (do NOT copy):
pairs: [
  { "left": "O(1) space", "right": "In-place sorting algorithm" },
  { "left": "O(n log n)", "right": "Merge sort time complexity" },
  { "left": "Stable sort", "right": "Preserves order of equal elements" },
  { "left": "Pivot element", "right": "Used in quicksort partitioning" }
]

Schema:
{
  "interactionType": "drag_match",
  "question": "Match each ${language} concept to its correct definition",
  "pairs": [
    { "left": "...", "right": "..." },
    { "left": "...", "right": "..." },
    { "left": "...", "right": "..." },
    { "left": "...", "right": "..." }
  ],
  "explanation": "...",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
TYPE: predict_output
════════════════════════════════════════
User reads a code snippet and types what it prints/returns. Use for output tracing.

RULES:
• codeSnippet: 4–8 lines of ${language} with a CLEAR, deterministic single-line output
• acceptedAnswers: 3–5 variations of the correct output (different whitespace, quote styles, etc.)
• Output must be SHORT (one line). No complex multi-line outputs.

EXAMPLE (do NOT copy):
codeSnippet: "def count_vowels(s):\\n    return sum(1 for c in s if c in 'aeiou')\\nprint(count_vowels('algorithm'))"
acceptedAnswers: ["3", "3\\n"]

Schema:
{
  "interactionType": "predict_output",
  "question": "What does this ${language} code output?",
  "codeSnippet": "...(use \\n for newlines)...",
  "acceptedAnswers": ["exact output", "variant2", "variant3"],
  "explanation": "...(step-by-step trace)...",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
TYPE: slider_adjust
════════════════════════════════════════
User adjusts sliders to find correct numeric values. Use for complexity parameters, thresholds, performance tuning.

RULES:
• 1–2 sliders. Each has: label, unit, min, max, step, correctValue, tolerance
• correctValue must NOT be at min, max, or exact midpoint
• tolerance: how close the user must get (0 = exact, >0 = within range)

EXAMPLE (do NOT copy):
sliders: [
  { "label": "Time complexity exponent", "unit": "", "min": 1, "max": 4, "step": 1, "correctValue": 2, "tolerance": 0 },
  { "label": "Cache hit rate threshold", "unit": "%", "min": 0, "max": 100, "step": 5, "correctValue": 75, "tolerance": 5 }
]

Schema:
{
  "interactionType": "slider_adjust",
  "question": "...(set the correct values for this ${language} algorithm's parameters)...",
  "sliders": [
    { "label": "...", "unit": "...", "min": 0, "max": 100, "step": 1, "correctValue": 42, "tolerance": 2 }
  ],
  "explanation": "...",
  "difficulty": "${difficulty}"
}

════════════════════════════════════════
ABSOLUTE RULES:
• Return ONLY valid JSON — no markdown, no backticks, no comments
• Every question covers the SPECIFIC concept assigned to it above
• visual_sequence: manually trace EVERY step. The robot MUST reach goalPos. Invalid paths fail.
• code_trace: steps MUST be shuffled — if they are in execution order, that is WRONG
• drag_order: items MUST be shuffled — not in the correct order
• Do NOT repeat grid configurations, positions, or directions across questions
• Do NOT copy worked examples — create entirely original scenarios

Return JSON:
{ "questions": [ ...${totalQuestions} question objects... ] }
`;
}

// ─── PROGRAMMING CLASSIC MODE ─────────────────────────────
function buildClassicProgrammingPrompt({
  difficulty,
  language,
  topic,
  description,
  totalQuestions,
}) {
  const progTopicLine = topic ? `\nFocus the challenges on: ${topic}` : "";
  const progDescLine = description
    ? `\nAdditional context: ${description}`
    : "";

  return `
You are a competitive programming question generator.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

Generate ${totalQuestions} ${difficulty}-level coding challenges in ${language}.${progTopicLine}${progDescLine}

Each challenge must have:
- title: short problem name
- description: clear problem statement with examples
- starterCode: function signature with comments
- testCases: a test script that calls the function with inputs and prints a JSON result like {"success": true/false, "message": "..."} 
  The test script should test at least 3 cases. It should be appended AFTER the user's code.
- correctAnswer: a reference solution (DO NOT send to players)
- difficulty: "${difficulty}"
- explanation: brief explanation of the approach

IMPORTANT for testCases:
- The testCases string will be APPENDED to the user's code and run via Piston API
- It must call the function defined in starterCode
- It must print EXACTLY one line of JSON: {"success": true, "message": "All tests passed!"} or {"success": false, "message": "Test failed: ..."}
- Do NOT use require/import in testCases

Return ONLY valid JSON. No markdown. No backticks.
Schema:
{
  "questions": [
    {
      "interactionType": "code",
      "title": "",
      "description": "",
      "starterCode": "",
      "testCases": "",
      "correctAnswer": "",
      "difficulty": "",
      "explanation": ""
    }
  ]
}
`;
}

// ─── CHALLENGE MODE REGISTRY ──────────────────────────────
const CHALLENGE_MODES = {
  // General category modes
  classic: {
    general: buildClassicQuizPrompt,
    programming: buildClassicProgrammingPrompt,
  },
  scenario: {
    general: buildScenarioChallengePrompt,
    programming: buildScenarioChallengePrompt,
  },
  debug: {
    general: buildDebugDetectivePrompt,
    programming: buildDebugDetectivePrompt,
  },
  outage: {
    general: buildProductionOutagePrompt,
    programming: buildProductionOutagePrompt,
  },
  refactor: {
    general: buildCodeRefactorPrompt,
    programming: buildCodeRefactorPrompt,
  },
  missing: {
    general: buildMissingLinkPrompt,
    programming: buildMissingLinkPrompt,
  },
  interactive: {
    general: buildInteractivePrompt,
    programming: buildInteractivePrompt,
  },
  visual_interactive: {
    general: buildInteractivePrompt,
    programming: buildVisualInteractivePrompt,
  },
};

// ─── SERVER-SIDE ROBOT PATH VALIDATOR ────────────────────
// Mirrors the logic in client/src/components/competition/visual/robotSimulator.js
function validateVisualSequencePath(q) {
  try {
    const { gridConfig, items, correctOrder } = q;
    if (!gridConfig || !Array.isArray(items) || !Array.isArray(correctOrder)) return false;
    const { startPos, startDir, goalPos, rows, cols, walls = [] } = gridConfig;
    if (!startPos || !startDir || !goalPos || !rows || !cols) return false;

    const MOVE_DELTA = { right: [0, 1], left: [0, -1], up: [-1, 0], down: [1, 0] };
    const TURN_RIGHT = { right: "down", down: "left", left: "up", up: "right" };
    const TURN_LEFT  = { right: "up",   up: "left",  left: "down", down: "right" };
    const TURN_AROUND = { right: "left", left: "right", up: "down", down: "up" };

    let pos = [...startPos];
    let dir = startDir;

    for (const idx of correctOrder) {
      if (idx < 0 || idx >= items.length) return false;
      const cmd = String(items[idx]).toLowerCase();

      if (cmd.includes("forward")) {
        const [dr, dc] = MOVE_DELTA[dir] || [0, 0];
        pos = [pos[0] + dr, pos[1] + dc];
      } else if (cmd.includes("turn right") || cmd.includes("rotate right")) {
        dir = TURN_RIGHT[dir] || dir;
      } else if (cmd.includes("turn left") || cmd.includes("rotate left")) {
        dir = TURN_LEFT[dir] || dir;
      } else if (cmd.includes("backward") || cmd.includes("back")) {
        const [dr, dc] = MOVE_DELTA[dir] || [0, 0];
        pos = [pos[0] - dr, pos[1] - dc];
      } else if (cmd.includes("turn around") || cmd.includes("u-turn")) {
        dir = TURN_AROUND[dir] || dir;
      }

      // Bounds check
      if (pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols) return false;
      // Wall check
      if (walls.some(w => Array.isArray(w) && w[0] === pos[0] && w[1] === pos[1])) return false;
    }

    return pos[0] === goalPos[0] && pos[1] === goalPos[1];
  } catch {
    return false;
  }
}

// ─── QUESTION VALIDATION ──────────────────────────────────
function validateQuestion(q, index) {
  // Every question must have text content
  if (!q.question && !q.title) {
    console.warn(`[Validation] Q${index + 1}: Missing question text`);
    return false;
  }

  const iType = q.interactionType;

  if (iType === "code") {
    if (!q.starterCode || !q.testCases) {
      console.warn(`[Validation] Q${index + 1}: code question missing starterCode/testCases`);
      return false;
    }
  } else if (!iType || iType === "mcq") {
    // Fallback: if it looks like a code question but missing interactionType
    if (q.starterCode && q.testCases) return true;
    // MCQ: must have options array with correctAnswer in it
    if (!Array.isArray(q.options) || q.options.length < 2) {
      console.warn(`[Validation] Q${index + 1}: MCQ missing options`);
      return false;
    }
    if (q.correctAnswer !== undefined && !q.options.includes(q.correctAnswer)) {
      console.warn(`[Validation] Q${index + 1}: correctAnswer not in options`);
      return false;
    }
  } else if (iType === "drag_order") {
    if (!Array.isArray(q.items) || !Array.isArray(q.correctOrder)) {
      console.warn(`[Validation] Q${index + 1}: drag_order missing items/correctOrder`);
      return false;
    }
    if (q.items.length !== q.correctOrder.length) {
      console.warn(`[Validation] Q${index + 1}: drag_order items/correctOrder length mismatch`);
      return false;
    }
    // Reject trivially-in-order correctOrder for 4+ items (AI forgot to shuffle items)
    const doSorted = [...q.correctOrder].map(Number).sort((a, b) => a - b);
    if (doSorted.some((v, i) => v !== i)) {
      console.warn(`[Validation] Q${index + 1}: drag_order correctOrder has invalid indices`);
      return false;
    }
    if (q.correctOrder.every((v, i) => Number(v) === i) && q.items.length >= 4) {
      console.warn(`[Validation] Q${index + 1}: drag_order correctOrder is [0,1,2,...] — items appear unshuffled`);
      return false;
    }
  } else if (iType === "drag_match") {
    if (!Array.isArray(q.pairs) || q.pairs.length < 2) {
      console.warn(`[Validation] Q${index + 1}: drag_match missing pairs`);
      return false;
    }
    if (q.pairs.some((p) => !p.left || !p.right)) {
      console.warn(
        `[Validation] Q${index + 1}: drag_match pair missing left/right`,
      );
      return false;
    }
  } else if (iType === "fill_blank") {
    if (!q.codeTemplate || !Array.isArray(q.blanks) || q.blanks.length === 0) {
      console.warn(
        `[Validation] Q${index + 1}: fill_blank missing codeTemplate/blanks`,
      );
      return false;
    }
  } else if (iType === "slider_adjust") {
    if (!Array.isArray(q.sliders) || q.sliders.length === 0) {
      console.warn(`[Validation] Q${index + 1}: slider_adjust missing sliders`);
      return false;
    }
    if (q.sliders.some((s) => s.correctValue === undefined)) {
      console.warn(`[Validation] Q${index + 1}: slider missing correctValue`);
      return false;
    }
  } else if (iType === "visual_sequence") {
    if (!Array.isArray(q.items) || !Array.isArray(q.correctOrder) || !q.gridConfig) {
      console.warn(`[Validation] Q${index + 1}: visual_sequence missing items/correctOrder/gridConfig`);
      return false;
    }
    if (q.items.length !== q.correctOrder.length) {
      console.warn(`[Validation] Q${index + 1}: visual_sequence items/correctOrder length mismatch`);
      return false;
    }
    if (!Array.isArray(q.gridConfig.startPos) || !Array.isArray(q.gridConfig.goalPos)) {
      console.warn(`[Validation] Q${index + 1}: visual_sequence gridConfig missing startPos/goalPos`);
      return false;
    }
    // Ensure correctOrder is a valid permutation (no duplicates, all valid indices)
    const sorted = [...q.correctOrder].map(Number).sort((a, b) => a - b);
    if (sorted.some((v, i) => v !== i || !Number.isInteger(v))) {
      console.warn(`[Validation] Q${index + 1}: visual_sequence correctOrder is not a valid permutation`);
      return false;
    }
    // Verify the robot actually reaches goalPos following correctOrder
    if (!validateVisualSequencePath(q)) {
      console.warn(`[Validation] Q${index + 1}: visual_sequence path does not reach goalPos`);
      return false;
    }
  } else if (iType === "code_trace") {
    if (!Array.isArray(q.steps) || !Array.isArray(q.correctOrder) || !q.codeSnippet) {
      console.warn(`[Validation] Q${index + 1}: code_trace missing steps/correctOrder/codeSnippet`);
      return false;
    }
    if (q.steps.length !== q.correctOrder.length) {
      console.warn(`[Validation] Q${index + 1}: code_trace steps/correctOrder length mismatch`);
      return false;
    }
    // Ensure correctOrder is a valid permutation
    const ctSorted = [...q.correctOrder].map(Number).sort((a, b) => a - b);
    if (ctSorted.some((v, i) => v !== i || !Number.isInteger(v))) {
      console.warn(`[Validation] Q${index + 1}: code_trace correctOrder is not a valid permutation`);
      return false;
    }
    // Warn if steps appear to be in execution order (AI forgot to shuffle)
    // Only reject if 5 steps — [0,1,2,3,4] ascending is extremely unlikely to be valid
    const isInOrder = q.correctOrder.every((v, i) => Number(v) === i);
    if (isInOrder && q.steps.length >= 5) {
      console.warn(`[Validation] Q${index + 1}: code_trace correctOrder is [0,1,2,3,4] — AI likely forgot to shuffle; discarding`);
      return false;
    }
  }

  return true;
}

// ─── MAIN EXPORT ──────────────────────────────────────────
export const generateCompetitionQuestions = async ({
  category,
  challengeMode = "classic",
  difficulty = "medium",
  language = "javascript",
  topic = "",
  description = "",
  totalQuestions = 5,
}) => {
  const model = getModel();

  const safeTopic = sanitizePromptInput(topic);
  const safeDescription = sanitizePromptInput(description, 400);

  // Resolve which prompt builder to use
  const modeBuilders =
    CHALLENGE_MODES[challengeMode] || CHALLENGE_MODES.classic;
  const buildPrompt = modeBuilders[category] || modeBuilders.general;

  const prompt = buildPrompt({
    difficulty,
    language,
    topic: safeTopic,
    description: safeDescription,
    totalQuestions,
    category,
  });

  console.log(
    `[Questions] Generating: mode=${challengeMode}, category=${category}, difficulty=${difficulty}, count=${totalQuestions}`,
  );

  // Visual interactive needs more retries — path validation is strict
  const MAX_RETRIES = challengeMode === "visual_interactive" ? 5 : 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const timeoutMs = challengeMode === "visual_interactive" ? 60000 : 30000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Gemini API timed out after ${timeoutMs / 1000}s`)),
          timeoutMs,
        ),
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise,
      ]);

      const text = (await result.response).text();

      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        console.error(
          `[CompetitionQuestions] Attempt ${attempt}: Failed to parse Gemini response:`,
          e,
        );
        console.error(
          "[CompetitionQuestions] Raw text:",
          cleanedText.substring(0, 500),
        );
        lastError = new Error("Failed to parse AI response as JSON");
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`[CompetitionQuestions] Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw lastError;
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        lastError = new Error("Invalid question format from AI");
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(
            `[CompetitionQuestions] Invalid format, retrying in ${delay}ms...`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw lastError;
      }

      // Debug: log question types and first 60 chars of each question
      console.log(
        `[Questions] Generated ${parsed.questions.length} questions:`,
        parsed.questions
          .map(
            (q, i) =>
              `\n  ${i + 1}. [${q.interactionType || "mcq"}] ${(q.question || q.title || "").substring(0, 60)}`,
          )
          .join(""),
      );

      // Validate each question before returning
      const validQuestions = parsed.questions.filter((q, i) =>
        validateQuestion(q, i),
      );
      if (validQuestions.length === 0) {
        lastError = new Error("All generated questions failed validation");
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(
            `[CompetitionQuestions] All questions invalid, retrying in ${delay}ms...`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw lastError;
      }
      if (validQuestions.length < parsed.questions.length) {
        console.warn(
          `[Questions] ${parsed.questions.length - validQuestions.length} questions filtered out by validation`,
        );
      }

      return validQuestions;
    } catch (err) {
      lastError = err;
      if (err.status === 429) {
        console.error(
          `[CompetitionQuestions] Quota exceeded (429) — skipping retries`,
        );
        throw new Error("QUOTA_EXCEEDED");
      }
      if (err.name === "AbortError") {
        console.error(
          `[CompetitionQuestions] Attempt ${attempt}: Timed out after 30s`,
        );
      } else {
        console.error(
          `[CompetitionQuestions] Attempt ${attempt}: ${err.message}`,
        );
      }
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[CompetitionQuestions] Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw (
    lastError || new Error("Failed to generate questions after all retries")
  );
};

// ─── AVAILABLE MODES PER CATEGORY ─────────────────────────
export const AVAILABLE_MODES = {
  general: [
    {
      id: "classic",
      name: "Classic Quiz",
      icon: "📝",
      description: "Standard multiple-choice questions",
    },
    {
      id: "scenario",
      name: "Scenario Challenge",
      icon: "🎭",
      description: "Real-world narrative-based problems",
    },
  ],
  programming: [
    {
      id: "classic",
      name: "Classic Coding",
      icon: "💻",
      description: "Write code to solve challenges",
    },
    {
      id: "scenario",
      name: "Scenario Challenge",
      icon: "🎭",
      description: "Real-world narrative-based problems",
    },
    {
      id: "debug",
      name: "Debug Detective",
      icon: "🔍",
      description: "Find and fix bugs in code snippets",
    },
    {
      id: "outage",
      name: "Production Outage",
      icon: "🚨",
      description: "High-pressure incident response",
    },
    {
      id: "visual_interactive",
      name: "Visual Interactive",
      icon: "🎮",
      description: "Brilliant-style visual puzzles — grid navigation & code tracing",
    },
  ],
};

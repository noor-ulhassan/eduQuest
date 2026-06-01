// All AI prompt builder functions for each challenge mode.
// Each function receives the game settings and returns the prompt string.

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

function buildClassicQuizPrompt({ difficulty, topic, description, totalQuestions, category }) {
  const isGeneral = category === "general";
  const topicLine = topic
    ? `Topic: ${topic}`
    : isGeneral
      ? "Topic: general knowledge (history, science, geography, literature, arts, sports, current events, everyday facts)"
      : "Topic: general technology, computer science, and programming concepts";
  const descLine = description ? `Additional context: ${description}` : "";

  const topicLock = isGeneral ? `
TOPIC LOCK — ABSOLUTELY CRITICAL:
- Every question MUST be exclusively about "${topic || "general knowledge"}".
- Do NOT use computer science, programming, software engineering, databases, algorithms, or developer scenarios UNLESS the topic itself is one of those.
- Do NOT shoehorn tech examples ("a developer doing X", "an API that...", "a function...") into a non-tech topic.
- Do NOT use code, function names, or technical jargon as answer choices for a non-technical topic.
- If the topic is "Ancient Rome", every question is about Ancient Rome — not about "tech in Rome", not about "a programmer studying Rome".
- Stay strictly within the domain implied by the topic.
` : "";

  return `
You are a quiz question generator for a competitive knowledge game.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

${topicLine}
${descLine}
${topicLock}
Generate ${totalQuestions} engaging multiple-choice questions${topic ? ` about "${topic}"` : ""}.

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

function buildScenarioChallengePrompt({ difficulty, topic, description, totalQuestions, category }) {
  const isGeneral = category === "general";
  const topicLine = topic
    ? `Domain: ${topic}`
    : isGeneral
      ? "Domain: general knowledge (everyday life, history, science, professions, society)"
      : "Domain: software engineering and web development";
  const descLine = description ? `Additional context: ${description}` : "";

  const exampleLine = isGeneral
    ? `Example scenario style (mirror the structure, NOT the subject):
"Marco, a vineyard owner in Tuscany, notices his grapes are ripening two weeks earlier than they did a decade ago. He's debating whether to plant a heat-tolerant variety or invest in shade nets. His agronomist visits next week to advise."`
    : `Example scenario style:
"Sarah, a backend developer at a fintech startup, notices their MongoDB queries are taking 3+ seconds during peak hours. The collection has 2 million user transaction documents with frequent reads on 'userId' and 'timestamp' fields. Her team lead asks her to optimize the database layer before the next sprint review."`;

  const topicLock = isGeneral ? `
TOPIC LOCK — ABSOLUTELY CRITICAL:
- Every scenario AND every question MUST be set within the domain "${topic || "general knowledge"}".
- Do NOT use computer science, programming, software engineering, databases, algorithms, or developer scenarios UNLESS the topic itself is one of those.
- Characters in scenarios should fit the topic (e.g., for "Ancient Rome" — senators, soldiers, merchants — NOT "a developer named Sarah").
- Do NOT use technical jargon, code, or developer settings unless the topic is technical.
- The scenario is a vehicle for testing knowledge of "${topic || "the topic"}", not a setting where unrelated tech happens.
` : "";

  return `
You are an immersive scenario-based quiz designer. Each question must present a REALISTIC MINI-STORY before asking a question.

${DIFFICULTY_TONES[difficulty] || DIFFICULTY_TONES.medium}

${topicLine}
${descLine}
${topicLock}
Generate ${totalQuestions} scenario-based multiple-choice questions${topic ? ` about "${topic}"` : ""}.

RULES:
- Each question MUST start with a vivid, real-world scenario (2-4 sentences) that sets up the problem
- Use specific character names${isGeneral ? " (names and roles appropriate to the topic)" : ", company contexts, and project situations"}
- The question should require APPLYING knowledge to the scenario, not just recalling facts
- Scenarios should be varied${isGeneral ? " in setting and stakes within the topic" : ": startup decisions, debugging situations, architecture choices, team discussions, deadline pressure, etc."}

${exampleLine}

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

function buildDebugDetectivePrompt({ difficulty, language, topic, description, totalQuestions }) {
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

function buildProductionOutagePrompt({ difficulty, language, topic, description, totalQuestions }) {
  const topicLine = topic ? `System type: ${topic}` : "System type: MERN stack web application";
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

function buildInteractivePrompt({ difficulty, language, topic, description, totalQuestions, category }) {
  const isGeneral = category === "general";
  const topicLine = topic
    ? `Topic: ${topic}`
    : isGeneral
      ? "Topic: general technology, science, and computer science concepts"
      : `Topic: ${language} programming`;
  const descLine = description ? `Additional context: ${description}` : "";
  const topicForInstruction = topic || (isGeneral ? "general knowledge" : language + " programming");

  const types = isGeneral
    ? ["drag_order", "drag_match", "slider_adjust", "drag_order", "drag_match"]
    : ["drag_order", "drag_match", "predict_output", "slider_adjust", "drag_order", "drag_match"];

  const typeDistribution = [];
  for (let i = 0; i < totalQuestions; i++) typeDistribution.push(types[i % types.length]);
  for (let i = typeDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typeDistribution[i], typeDistribution[j]] = [typeDistribution[j], typeDistribution[i]];
  }

  const typeCounts = typeDistribution.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const typeBreakdown = Object.entries(typeCounts).map(([type, count]) => `- ${count}x "${type}"`).join("\n");
  const orderedList = typeDistribution.map((t, i) => `  ${i + 1}. ${t}`).join("\n");
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

${!isGeneral ? `
=== predict_output ===
User reads code and types what it outputs. Good for tracing logic, understanding execution.
Schema: { "interactionType": "predict_output", "question": "...", "codeSnippet": "...", "acceptedAnswers": ["format1", "format2"], "explanation": "...", "difficulty": "${difficulty}" }
Rules: Include 3-5 accepted format variations. Keep outputs SHORT (single line).
` : ""}

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

function buildVisualInteractivePrompt({ difficulty, language, topic, description, totalQuestions }) {
  const topicStr = topic || `${language} programming`;
  const topicLine = topic ? `Topic: ${topic}` : `Topic: ${language} programming concepts`;
  const descLine = description ? `Additional context: ${description}` : "";
  const seed = Math.floor(Math.random() * 100000);

  const allTypes = ["visual_sequence", "code_trace", "drag_order", "drag_match", "predict_output", "slider_adjust"];
  const shuffledBase = [...allTypes].sort(() => Math.random() - 0.5);
  const types = Array.from({ length: totalQuestions }, (_, i) => shuffledBase[i % shuffledBase.length]);

  const typeCounts = types.reduce((a, t) => { a[t] = (a[t] || 0) + 1; return a; }, {});
  const typeBreakdown = Object.entries(typeCounts).map(([t, n]) => `- ${n}x "${t}"`).join("\n");
  const orderedList = types.map((t, i) => `  ${i + 1}. ${t}`).join("\n");

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
• Grid: rows 2-4, cols 2-4. startPos ≠ goalPos. Choose DIFFERENT configs each time.
• startDir: "right" | "left" | "up" | "down"  — vary this across questions.
• Command strings: ONLY use "Move Forward" | "Turn Left" | "Turn Right" | "Move Backward"
• items: 3-7 commands in SHUFFLED order (NOT execution order)
• correctOrder[i] = index into items array that executes at position i
• MANDATORY PATH VERIFICATION — trace every step before writing correctOrder:
    pos = startPos, dir = startDir
    for each correctOrder[i]:
      cmd = items[correctOrder[i]]
      apply cmd to pos/dir
      if pos goes out of bounds → INVALID, redesign
      if pos hits a wall → INVALID, redesign
    final pos MUST equal goalPos
• walls: array of [row, col] blocked cells — add 0-2 walls for variety

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
• codeSnippet: 4-10 lines of REAL ${language} code for the assigned concept. Use:
  - for/while loops with accumulator or counter variables
  - if/else branches that change variable values
  - function calls with meaningful return values
  - array or object mutations (push, pop, splice, etc.)
  - Nested operations (loop inside condition, function modifying array, etc.)
  NEVER use trivial patterns like x=5; y=x*2; z=y-3
• steps: 3-5 snapshot objects in GENUINELY SHUFFLED order (NOT execution order — shuffle them)
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
• items: 4-6 steps/concepts in SHUFFLED order (NOT the correct order)
• correctOrder[i] = index into items that should be at position i
• items MUST be genuinely shuffled — not in correct order

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
• codeSnippet: 4-8 lines of ${language} with a CLEAR, deterministic single-line output
• acceptedAnswers: 3-5 variations of the correct output
• Output must be SHORT (one line). No complex multi-line outputs.

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
• 1-2 sliders. Each has: label, unit, min, max, step, correctValue, tolerance
• correctValue must NOT be at min, max, or exact midpoint

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

function buildClassicProgrammingPrompt({ difficulty, language, topic, description, totalQuestions }) {
  const progTopicLine = topic ? `\nFocus the challenges on: ${topic}` : "";
  const progDescLine = description ? `\nAdditional context: ${description}` : "";

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

// Maps challengeMode → { general: builderFn, programming: builderFn }
export const CHALLENGE_MODES = {
  classic:          { general: buildClassicQuizPrompt,      programming: buildClassicProgrammingPrompt },
  scenario:         { general: buildScenarioChallengePrompt, programming: buildScenarioChallengePrompt },
  debug:            { general: buildDebugDetectivePrompt,    programming: buildDebugDetectivePrompt },
  outage:           { general: buildProductionOutagePrompt,  programming: buildProductionOutagePrompt },
  visual_interactive: { general: buildInteractivePrompt,    programming: buildVisualInteractivePrompt },
};

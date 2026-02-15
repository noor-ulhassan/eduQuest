import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const types = isGeneral
    ? [
        "type_answer",
        "drag_order",
        "drag_match",
        "slider_adjust",
        "type_answer",
      ]
    : [
        "type_answer",
        "drag_order",
        "drag_match",
        "fill_blank",
        "predict_output",
        "slider_adjust",
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
- interactionType: one of "type_answer", "drag_order", "drag_match"${!isGeneral ? ', "fill_blank", "predict_output"' : ""}, "slider_adjust"
- difficulty: "${difficulty}"

CRITICAL RULES:
1. Every question MUST be 100% ORIGINAL — create NEW content from scratch about "${topicForInstruction}"
2. Every question must test a DIFFERENT concept — NO two questions should cover similar topics
3. The schemas below show ONLY the JSON structure. ALL content inside must be YOUR OWN creation.

=== type_answer ===
User types a short text answer. Good for definitions, terminology, quick recall.
Schema: { "interactionType": "type_answer", "question": "...", "hint": "...", "acceptedAnswers": ["ans1", "ans2", "ans3"], "explanation": "...", "difficulty": "${difficulty}" }
Rules: Include 3-5 accepted answer format variations.

=== drag_order ===
User drags items into correct sequential order. Good for process steps, sorting, ranking.
Schema: { "interactionType": "drag_order", "question": "...", "items": ["A", "B", "C", "D"], "correctOrder": [2, 0, 3, 1], "explanation": "...", "difficulty": "${difficulty}" }
Rules: "items" is the shuffled display list. "correctOrder[i]" = index in items of the item that should be at position i. Use 4-6 items.

=== drag_match ===
User matches left column items to right column items. Good for term-definition, concept-example pairs.
Schema: { "interactionType": "drag_match", "question": "...", "pairs": [{"left": "...", "right": "..."}, ...], "explanation": "...", "difficulty": "${difficulty}" }
Rules: EXACTLY 4 pairs. pairs[i].left matches pairs[i].right.
${
  !isGeneral
    ? `
=== fill_blank ===
Code with blanks user fills in. Good for syntax, API usage, code patterns.
Schema: { "interactionType": "fill_blank", "question": "...", "codeTemplate": "code with ___ blanks", "blanks": ["answer1", "answer2"], "hint": "...", "explanation": "...", "difficulty": "${difficulty}" }
Rules: Use "___" (three underscores) for each blank. 1-3 blanks per question.
`
    : ""
}
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
};

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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { temperature: 0.95 },
  });

  // Resolve which prompt builder to use
  const modeBuilders =
    CHALLENGE_MODES[challengeMode] || CHALLENGE_MODES.classic;
  const buildPrompt = modeBuilders[category] || modeBuilders.general;

  const prompt = buildPrompt({
    difficulty,
    language,
    topic,
    description,
    totalQuestions,
    category,
  });

  console.log(
    `[Questions] Generating: mode=${challengeMode}, category=${category}, difficulty=${difficulty}, count=${totalQuestions}`,
  );

  const result = await model.generateContent(prompt);
  const text = (await result.response).text();

  const cleanedText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (e) {
    console.error("[CompetitionQuestions] Failed to parse Gemini response:", e);
    console.error(
      "[CompetitionQuestions] Raw text:",
      cleanedText.substring(0, 500),
    );
    throw new Error("Failed to generate questions");
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid question format from AI");
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

  return parsed.questions;
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
    {
      id: "missing",
      name: "The Missing Link",
      icon: "🧩",
      description: "Connect the dots between system parts",
    },
    {
      id: "interactive",
      name: "Interactive",
      icon: "🎮",
      description: "Type, drag, match & predict — mixed interactive challenges",
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
      id: "refactor",
      name: "Code Refactor",
      icon: "♻️",
      description: "Improve messy but working code",
    },
    {
      id: "missing",
      name: "The Missing Link",
      icon: "🧩",
      description: "Fill in the missing system piece",
    },
    {
      id: "interactive",
      name: "Interactive",
      icon: "🎮",
      description: "Type, drag, match & predict — mixed interactive challenges",
    },
  ],
};

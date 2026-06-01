import { callAiModel }     from "../../config/aiProvider.js";
import { CHALLENGE_MODES } from "./prompts.js";
import { validateQuestion } from "./validator.js";

const ALLOWED_PROMPT_CHARS = /[^a-zA-Z0-9 .,'!?:()\-_#@&+/]/g;
const INJECTION_PATTERNS   = /\b(ignore|forget|disregard|override|system prompt|instruction)\b/gi;

function sanitizeInput(str, maxLen = 200) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[\r\n\t]/g, " ").replace(ALLOWED_PROMPT_CHARS, "").replace(INJECTION_PATTERNS, "").trim().slice(0, maxLen);
}

const wait = (attempt) => new Promise(r => setTimeout(r, Math.pow(2, attempt - 1) * 1000));

export async function generateCompetitionQuestions({
  category,
  challengeMode = "classic",
  difficulty    = "medium",
  language      = "javascript",
  topic         = "",
  description   = "",
  totalQuestions = 5,
}) {
  const safeTopic       = sanitizeInput(topic);
  const safeDescription = sanitizeInput(description, 400);

  const modeBuilders = CHALLENGE_MODES[challengeMode] || CHALLENGE_MODES.classic;
  const buildPrompt  = modeBuilders[category] || modeBuilders.general;

  const prompt = buildPrompt({ difficulty, language, topic: safeTopic, description: safeDescription, totalQuestions, category });

  console.log(`[Questions] Generating: mode=${challengeMode}, category=${category}, difficulty=${difficulty}, count=${totalQuestions}`);

  const MAX_RETRIES = challengeMode === "visual_interactive" ? 5 : 3;
  const TIMEOUT_MS  = challengeMode === "visual_interactive" ? 60000 : 30000;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`AI timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS),
      );

      const parsed = await Promise.race([
        callAiModel(prompt, { json: true, model: "gemini-3.1-flash-lite" }),
        timeoutPromise,
      ]);

      if (!parsed?.questions || !Array.isArray(parsed.questions)) {
        lastError = new Error("Invalid question format from AI");
        if (attempt < MAX_RETRIES) { await wait(attempt); continue; }
        throw lastError;
      }

      console.log(
        `[Questions] Generated ${parsed.questions.length} questions:`,
        parsed.questions.map((q, i) => `\n  ${i + 1}. [${q.interactionType || "mcq"}] ${(q.question || q.title || "").substring(0, 60)}`).join(""),
      );

      const validQuestions = parsed.questions.filter((q, i) => validateQuestion(q, i));
      if (validQuestions.length === 0) {
        lastError = new Error("All generated questions failed validation");
        if (attempt < MAX_RETRIES) { await wait(attempt); continue; }
        throw lastError;
      }
      if (validQuestions.length < parsed.questions.length) {
        console.warn(`[Questions] ${parsed.questions.length - validQuestions.length} questions filtered out`);
      }

      return validQuestions;
    } catch (err) {
      lastError = err;
      if (err.status === 429 || err.message?.includes("QUOTA_EXCEEDED")) throw new Error("QUOTA_EXCEEDED");
      console.error(`[CompetitionQuestions] Attempt ${attempt}: ${err.message}`);
      if (attempt < MAX_RETRIES) await wait(attempt);
    }
  }

  throw lastError || new Error("Failed to generate questions after all retries");
}

export const AVAILABLE_MODES = {
  general: [
    { id: "classic",  name: "Classic Quiz",        icon: "📝", description: "Standard multiple-choice questions" },
    { id: "scenario", name: "Scenario Challenge",  icon: "🎭", description: "Real-world narrative-based problems" },
  ],
  programming: [
    { id: "classic",           name: "Classic Coding",    icon: "💻", description: "Write code to solve challenges" },
    { id: "scenario",          name: "Scenario Challenge", icon: "🎭", description: "Real-world narrative-based problems" },
    { id: "debug",             name: "Debug Detective",    icon: "🔍", description: "Find and fix bugs in code snippets" },
    { id: "outage",            name: "Production Outage",  icon: "🚨", description: "High-pressure incident response" },
    { id: "visual_interactive",name: "Visual Interactive", icon: "🎮", description: "Brilliant-style visual puzzles — grid navigation & code tracing" },
  ],
};

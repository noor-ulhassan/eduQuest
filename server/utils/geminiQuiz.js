import { callAiModel } from "../config/aiProvider.js";

export const generateQuizFromGemini = async ({
  context,
  numberOfQuestions = 5,
  difficulty = "medium",
}) => {
  if (!context || typeof context !== "string") {
    throw new Error("Context is required to generate a quiz");
  }

  const MAX_CHARS = 15000;
  context = context.slice(0, MAX_CHARS);

  const prompt = `
You are an AI quiz generator.

STRICT RULES:
- Use ONLY the information provided in the CONTEXT.
- Do NOT use outside knowledge.
- Output ONLY valid JSON.
- No markdown. No backticks. No extra text.

CONTEXT:
${context}

TASK:
Generate ${numberOfQuestions} multiple-choice questions.
Difficulty level: ${difficulty}

Each question must include:
- question (string)
- options (array of EXACTLY 4 strings)
- correctAnswer (must match one option exactly)
- explanation (short, based only on context)
- difficulty ("easy" | "medium" | "hard")

JSON SCHEMA:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": "",
      "difficulty": "${difficulty}",
      "sourceQuote": "The exact verbatim sentence from the context that proves the answer."
    }
  ]
}
`;

  const aiResponse = await callAiModel(prompt);

  if (!aiResponse.questions || !Array.isArray(aiResponse.questions)) {
    throw new Error("Invalid quiz format returned by AI");
  }

  return aiResponse;
};

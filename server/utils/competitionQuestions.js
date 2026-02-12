import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateCompetitionQuestions = async ({
  category,
  difficulty = "medium",
  language = "javascript",
  topic = "",
  description = "",
  totalQuestions = 5,
}) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  let prompt;

  if (category === "programming") {
    const progTopicLine = topic ? `\nFocus the challenges on: ${topic}` : "";
    const progDescLine = description
      ? `\nAdditional context: ${description}`
      : "";

    prompt = `
You are a competitive programming question generator.

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
  } else {
    const topicLine = topic
      ? `Topic: ${topic}`
      : "Topic: general technology, computer science, and programming concepts";
    const descriptionLine = description ? `Details: ${description}` : "";

    prompt = `
You are a quiz question generator for a competitive knowledge game.

${topicLine}
${descriptionLine}

Generate ${totalQuestions} ${difficulty}-level multiple-choice questions based on the topic${description ? " and details" : ""} above.

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
    throw new Error("Failed to generate questions");
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid question format from AI");
  }

  return parsed.questions;
};

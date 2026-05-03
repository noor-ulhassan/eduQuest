import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

let geminiClient = null;
let groqClient = null;

function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
}

function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const GROQ_MODEL_MAP = {
  "gemini-flash-latest": "llama-3.3-70b-versatile",
  "gemini-3.1-flash-lite-preview": "llama-3.1-8b-instant",
};

// Safety fallback only — strict JSON is enforced via native JSON mode in Gemini (responseMimeType) and Groq (response_format)
function cleanJsonResponse(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function isRateLimitError(error) {
  const msg = (error.message || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("resource exhausted") ||
    msg.includes("heavy traffic") ||
    msg.includes("overloaded")
  );
}

async function callGemini(prompt, model, json) {
  const gemini = getGeminiClient();
  const config = json
    ? { generationConfig: { responseMimeType: "application/json" } }
    : {};
  const geminiModel = gemini.getGenerativeModel({ model, ...config });
  const result = await geminiModel.generateContent(prompt);
  return (await result.response).text();
}

async function callGroq(prompt, geminiModelName, json) {
  const groq = getGroqClient();
  const groqModel = GROQ_MODEL_MAP[geminiModelName] || "llama-3.3-70b-versatile";

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: groqModel,
    ...(json && { response_format: { type: "json_object" } }),
  });

  return completion.choices[0].message.content;
}

export async function callAiModel(prompt, options = {}) {
  const { json = true, model = "gemini-flash-latest" } = options;

  try {
    const text = await callGemini(prompt, model, json);
    return json ? JSON.parse(cleanJsonResponse(text)) : text;
  } catch (error) {
    if (!isRateLimitError(error)) throw error;
    console.warn(`Gemini rate limited (${model}), falling back to Groq...`);
  }

  const text = await callGroq(prompt, model, json);
  return json ? JSON.parse(cleanJsonResponse(text)) : text;
}

export async function callAiModelChat({ systemPrompt, history, message }) {
  try {
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
    });

    const chatHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    return (await result.response).text();
  } catch (error) {
    if (!isRateLimitError(error)) throw error;
    console.warn("Gemini rate limited for chat, falling back to Groq...");
  }

  const groq = getGroqClient();
  const messages = [
    { role: "system", content: systemPrompt },
    ...(history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  const completion = await groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
  });

  return completion.choices[0].message.content;
}

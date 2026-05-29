import { Curriculum } from "../models/Curriculum.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { callAiModel } from "../config/aiProvider.js";
import { nanoid } from "nanoid";

export const getAllCurriculumsMetadata = asyncHandler(async (req, res) => {
  const curriculums = await Curriculum.find(
    {},
    'language title subtitle executionMode chapters.title chapters.problems._id'
  );

  const metadata = curriculums.map(c => {
    const totalProblems = c.chapters.reduce((sum, ch) => sum + ch.problems.length, 0);
    return {
      language: c.language,
      title: c.title,
      subtitle: c.subtitle || "",
      executionMode: c.executionMode || "piston",
      totalProblems,
      totalChapters: c.chapters.length,
      lessons: c.chapters.slice(0, 2).map(ch => ch.title),
    };
  });

  return res.status(200).json(new ApiResponse(200, { metadata }));
});

export const getCurriculumByLanguage = asyncHandler(async (req, res) => {
  const { language } = req.params;
  if (!language?.trim()) throw new ApiError(400, "Language required");

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  return res.status(200).json(new ApiResponse(200, { curriculum }));
});

export const addProblem = asyncHandler(async (req, res) => {
  const { language, chapterId } = req.params;
  const problemData = req.body;

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  const chapter = curriculum.chapters.find(ch => ch.id === chapterId);
  if (!chapter) throw new ApiError(404, "Chapter not found");

  if (!["Easy", "Medium", "Hard", "Expert"].includes(problemData.difficulty)) {
    throw new ApiError(400, "Invalid difficulty");
  }

  chapter.problems.push(problemData);
  await curriculum.save();

  return res.status(201).json(new ApiResponse(201, { problem: problemData }));
});

export const updateProblem = asyncHandler(async (req, res) => {
  const { language, problemId } = req.params;
  const updates = req.body;

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  let problemFound = false;
  for (const chapter of curriculum.chapters) {
    const problemIndex = chapter.problems.findIndex(p => p.id === problemId);
    if (problemIndex !== -1) {
      Object.assign(chapter.problems[problemIndex], updates);
      curriculum.markModified("chapters");
      problemFound = true;
      break;
    }
  }

  if (!problemFound) throw new ApiError(404, "Problem not found");

  await curriculum.save();
  return res.status(200).json(new ApiResponse(200, null, "Problem updated"));
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const { language, problemId } = req.params;

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  let problemFound = false;
  for (const chapter of curriculum.chapters) {
    const problemIndex = chapter.problems.findIndex(p => p.id === problemId);
    if (problemIndex !== -1) {
      chapter.problems.splice(problemIndex, 1);
      problemFound = true;
      break;
    }
  }

  if (!problemFound) throw new ApiError(404, "Problem not found");

  await curriculum.save();
  return res.status(200).json(new ApiResponse(200, null, "Problem deleted"));
});

// ── Curriculum CRUD ───────────────────────────────────────────────────────────

export const deleteCurriculum = asyncHandler(async (req, res) => {
  const { language } = req.params;
  if (!language?.trim()) throw new ApiError(400, "Language required");

  const result = await Curriculum.deleteOne({ language });
  if (result.deletedCount === 0) throw new ApiError(404, "Curriculum not found");

  return res.status(200).json(new ApiResponse(200, null, "Curriculum deleted"));
});

export const createCurriculum = asyncHandler(async (req, res) => {
  const { language, title, subtitle, executionMode, pistonLanguage } = req.body;
  if (!language?.trim()) throw new ApiError(400, "Language required");

  const validModes = ["piston", "livepreview", "react"];
  const mode = validModes.includes(executionMode) ? executionMode : "piston";

  const existing = await Curriculum.findOne({ language });
  if (existing) throw new ApiError(409, "Curriculum already exists for this language");

  const curriculum = await Curriculum.create({
    language,
    title: title || `${language} Playground`,
    subtitle: subtitle || "",
    executionMode: mode,
    pistonLanguage: pistonLanguage?.trim() || null,
    chapters: [],
  });
  return res.status(201).json(new ApiResponse(201, { curriculum }, "Curriculum created"));
});

export const updateCurriculumSettings = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const { title, subtitle, executionMode, pistonLanguage } = req.body;
  const validModes = ["piston", "livepreview", "react"];

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  if (title !== undefined) curriculum.title = title;
  if (subtitle !== undefined) curriculum.subtitle = subtitle;
  if (executionMode !== undefined && validModes.includes(executionMode)) curriculum.executionMode = executionMode;
  if (pistonLanguage !== undefined) curriculum.pistonLanguage = pistonLanguage?.trim() || null;

  await curriculum.save();
  return res.status(200).json(new ApiResponse(200, { curriculum }, "Settings updated"));
});

// ── Chapter CRUD ──────────────────────────────────────────────────────────────

export const addChapter = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const { title, description } = req.body;
  if (!title) throw new ApiError(400, "Title required");

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  const chapter = { id: nanoid(8), title, description: description || "", totalXp: 0, problems: [] };
  curriculum.chapters.push(chapter);
  await curriculum.save();

  return res.status(201).json(new ApiResponse(201, { chapter }, "Chapter added"));
});

export const updateChapter = asyncHandler(async (req, res) => {
  const { language, chapterId } = req.params;
  const { title, description } = req.body;

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  const chapter = curriculum.chapters.find((c) => c.id === chapterId);
  if (!chapter) throw new ApiError(404, "Chapter not found");

  if (title !== undefined) chapter.title = title;
  if (description !== undefined) chapter.description = description;
  await curriculum.save();

  return res.status(200).json(new ApiResponse(200, { chapter }, "Chapter updated"));
});

export const deleteChapter = asyncHandler(async (req, res) => {
  const { language, chapterId } = req.params;

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  const idx = curriculum.chapters.findIndex((c) => c.id === chapterId);
  if (idx === -1) throw new ApiError(404, "Chapter not found");

  curriculum.chapters.splice(idx, 1);
  await curriculum.save();

  return res.status(200).json(new ApiResponse(200, null, "Chapter deleted"));
});

// ── AI Problem Generation ─────────────────────────────────────────────────────

export const generateProblems = asyncHandler(async (req, res) => {
  const { language, chapterId } = req.params;
  const { chapterTitle, count = 3 } = req.body;

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) throw new ApiError(404, "Curriculum not found");

  const chapter = curriculum.chapters.find((c) => c.id === chapterId);
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const mode = curriculum.executionMode || (
    ["html", "css"].includes(language) ? "livepreview" :
    language === "react" ? "react" : "piston"
  );
  const isLivePreview = mode === "livepreview";
  const isReact = mode === "react";

  let testFunctionNote = "";
  if (isReact) {
    testFunctionNote = `testFunction: a JS string run inside an iframe that receives win and doc (React component rendered via ReactDOM into #root). Must call window.parent.postMessage({type:"TEST_RESULT",success:bool,message:"..."},"*") — or simply return {success, message}.`;
  } else if (isLivePreview) {
    const docNote = language === "css"
      ? "receives doc (the document with CSS applied via <style> and baseHtml injected into body)"
      : "receives doc (the document with user's HTML as body content)";
    testFunctionNote = `testFunction: a JS string run inside an iframe, ${docNote}. Must call window.parent.postMessage({type:"TEST_RESULT",success:bool,message:"..."},"*") — or simply return {success, message} from new Function("doc", fn)(document).`;
  } else {
    testFunctionNote = `testFunction: a string of ${language} code appended to user's solution that prints exactly ONE JSON line at the end: {"success":true,"message":"Correct!"} or {"success":false,"message":"..."} — no other print statements.`;
  }

  const starterNote = `starterCode is a plain string.`;

  const prompt = `You are a coding-education problem designer. Generate exactly ${count} distinct coding problems for a "${language}" playground (execution mode: ${mode}), chapter titled "${chapterTitle}".

${starterNote}
${testFunctionNote}
${isLivePreview ? `baseHtml: provide a small HTML snippet the student styles/modifies (required for CSS, optional for HTML).` : ""}

Return ONLY raw JSON — no markdown, no explanation:
{
  "problems": [
    {
      "id": "<8-char alphanumeric unique id>",
      "title": "...",
      "difficulty": "Easy|Medium|Hard",
      "xp": <10-50>,
      "description": "Clear task description (use backticks for inline code e.g. \`console.log()\`)",
      "hints": ["hint 1", "hint 2"],
      "starterCode": "...",
      "testFunction": "...",
      ${isLivePreview ? '"baseHtml": "...",' : ""}
      "type": "code"
    }
  ]
}`;

  const result = await callAiModel(prompt, { json: true });
  const problems = result?.problems;
  if (!Array.isArray(problems) || problems.length === 0) throw new ApiError(500, "AI returned no problems");

  problems.forEach((p) => {
    if (!p.id) p.id = nanoid(8);
    chapter.problems.push(p);
  });
  await curriculum.save();

  return res.status(200).json(new ApiResponse(200, { problems }, "Problems generated"));
});

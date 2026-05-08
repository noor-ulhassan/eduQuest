import { Curriculum } from "../models/Curriculum.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getAllCurriculumsMetadata = asyncHandler(async (req, res) => {
  const curriculums = await Curriculum.find({}, 'language chapters.title chapters.problems._id');

  const metadata = curriculums.map(c => {
    const totalProblems = c.chapters.reduce((sum, ch) => sum + ch.problems.length, 0);
    return {
      language: c.language,
      totalProblems,
      totalChapters: c.chapters.length,
      lessons: c.chapters.slice(0, 2).map(ch => ch.title)
    };
  });

  return res.status(200).json(new ApiResponse(200, { metadata }));
});

export const getCurriculumByLanguage = asyncHandler(async (req, res) => {
  const { language } = req.params;

  if (
    !["html", "css", "javascript", "python", "react", "dsa"].includes(language)
  ) {
    throw new ApiError(400, "Invalid language");
  }

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
      chapter.problems[problemIndex] = { ...chapter.problems[problemIndex], ...updates };
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

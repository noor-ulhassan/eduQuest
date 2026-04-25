import { Curriculum } from "../models/Curriculum.js";

export const getAllCurriculumsMetadata = async (req, res) => {
  try {
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

    return res.status(200).json({ success: true, metadata });
  } catch (error) {
    console.error("Error fetching curriculum metadata:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCurriculumByLanguage = async (req, res) => {
  try {
    const { language } = req.params;

    if (
      !["html", "css", "javascript", "python", "react", "dsa"].includes(
        language,
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid language" });
    }

    const curriculum = await Curriculum.findOne({ language });

    if (!curriculum) {
      return res
        .status(404)
        .json({ success: false, message: "Curriculum not found" });
    }

    return res.status(200).json({ success: true, curriculum });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/v1/curriculum/:language/chapter/:chapterId/problem
export const addProblem = async (req, res) => {
  try {
    const { language, chapterId } = req.params;
    const problemData = req.body;

    const curriculum = await Curriculum.findOne({ language });
    if (!curriculum) return res.status(404).json({ success: false, message: "Curriculum not found" });

    const chapter = curriculum.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });

    // Validate difficulty
    if (!["Easy", "Medium", "Hard", "Expert"].includes(problemData.difficulty)) {
      return res.status(400).json({ success: false, message: "Invalid difficulty" });
    }

    chapter.problems.push(problemData);
    await curriculum.save();

    return res.status(201).json({ success: true, problem: problemData });
  } catch (error) {
    console.error("Error adding problem:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/v1/curriculum/:language/problem/:problemId
export const updateProblem = async (req, res) => {
  try {
    const { language, problemId } = req.params;
    const updates = req.body;

    const curriculum = await Curriculum.findOne({ language });
    if (!curriculum) return res.status(404).json({ success: false, message: "Curriculum not found" });

    let problemFound = false;
    for (const chapter of curriculum.chapters) {
      const problemIndex = chapter.problems.findIndex(p => p.id === problemId);
      if (problemIndex !== -1) {
        chapter.problems[problemIndex] = { ...chapter.problems[problemIndex], ...updates };
        problemFound = true;
        break;
      }
    }

    if (!problemFound) return res.status(404).json({ success: false, message: "Problem not found" });

    await curriculum.save();
    return res.status(200).json({ success: true, message: "Problem updated" });
  } catch (error) {
    console.error("Error updating problem:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/v1/curriculum/:language/problem/:problemId
export const deleteProblem = async (req, res) => {
  try {
    const { language, problemId } = req.params;

    const curriculum = await Curriculum.findOne({ language });
    if (!curriculum) return res.status(404).json({ success: false, message: "Curriculum not found" });

    let problemFound = false;
    for (const chapter of curriculum.chapters) {
      const problemIndex = chapter.problems.findIndex(p => p.id === problemId);
      if (problemIndex !== -1) {
        chapter.problems.splice(problemIndex, 1);
        problemFound = true;
        break;
      }
    }

    if (!problemFound) return res.status(404).json({ success: false, message: "Problem not found" });

    await curriculum.save();
    return res.status(200).json({ success: true, message: "Problem deleted" });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

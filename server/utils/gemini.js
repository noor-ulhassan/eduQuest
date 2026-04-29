//// hi from old version

import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { Course } from "../models/AiCourse.js";
import Enrollment from "../models/EnrollmentModel.js";
import { User } from "../models/user.model.js";

export const geminiCourseGenerator = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
    });

    const {
      name,
      description,
      category,
      level,
      noOfChapters,
      userEmail,
      userName,
      userProfileImage,
    } = req.body;

    if (!name || !description || !category || !level || !noOfChapters) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Prefer authenticated user data over body fields for security
    const resolvedUserEmail = req.user?.email || userEmail;
    const resolvedUserName = req.user?.name || userName;
    const resolvedUserProfileImage = req.user?.avatarUrl || userProfileImage;

    if (!resolvedUserEmail) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user email is required",
      });
    }

    const prompt = `Generate Learning Course depends on following details:
    - Topic: ${name}
    - Description: ${description}
    - Category: ${category}
    - Level: ${level}
    - No of Chapters: ${noOfChapters}

    In which Make sure to add Course Name, Description. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format Chapter Name, Topic under each chapters, Duration for each chapters etc, in JSON format only.

    Schema:
    {
      "course": {
        "name": "string",
        "description": "string",
        "category": "string",
        "level": "string",
        "noOfChapters": "number",
        "chapters": [
          {
            "chapterName": "string",
            "duration": "string",
            "topics": ["string"]
          }
        ],
        "achievements": [
          {
            "title": "string",
            "icon": "string (material symbol name, e.g. 'wb_sunny', 'auto_fix_high', 'bug_report')",
            "description": "string"
          }
        ]
      }
    }
    Return ONLY raw JSON. No markdown. No backticks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini course JSON:",
        parseError,
        cleanedText,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to parse course data from AI",
      });
    }

    const courseId = uuidv4();

    const newCourse = await Course.create({
      courseId: courseId,
      name: name,
      description: description,
      noOfChapters: Number(noOfChapters),
      level: level,
      category: category,

      courseOutput: aiResponse.course,
      userEmail: resolvedUserEmail,
      userName: resolvedUserName,
      userProfileImage: resolvedUserProfileImage,
    });

    console.log("New Course Created: ", newCourse);

    return res.status(200).json({
      success: true,
      courseId: newCourse.courseId,
      data: newCourse,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate course",
      error: error.message,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId: courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course: course,
    });
  } catch (error) {
    console.error("Fetch Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const generateChapterContent = async (req, res) => {
  try {
    const { courseId, chapter, index } = req.body;

    // ── Guard: skip regeneration if content already exists in DB ──
    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      const existingChapter = existingCourse.courseOutput?.chapters?.[index];
      const existingTopics = existingChapter?.topics || [];
      // If topics are already objects (not raw strings), content was previously generated
      if (existingTopics.length > 0 && typeof existingTopics[0] === "object") {
        return res.status(200).json({
          success: true,
          data: existingChapter,
          cached: true,
        });
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Depends on Chapter name and Topic Generate content for each topic in HTML
    and give response in JSON format.
    Schema: {
      "chapterName": "string",
      "topics": [
        {
          "topic": "string",
          "content": "string (html format)",
          "proTip": "string (a useful pro tip about the topic)",
          "keyConcepts": [
             { "title": "string", "description": "string", "icon": "string (material symbol name like 'dns' or 'stream')" }
          ],
          "imagePrompt": "string (abstract futuristic digital architecture concept describing the topic)",
          "diagram": "string (valid Mermaid.js graph TD syntax if the topic involves a process, flow, algorithm, architecture, sequence, comparison, or data structure — otherwise empty string \"\")"
        }
      ]
    }
    Rules for the diagram field:
    - Use ONLY "graph TD" as the diagram type. No other Mermaid diagram types allowed.
    - Return valid, renderable Mermaid.js syntax with no markdown fences or backticks — plain string only.
    - Return empty string "" for topics that are simple definitions, introductions, or concept explanations that do not involve steps, flows, or structural relationships.
    : User Input: ${JSON.stringify(chapter)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    let chapterContentData;
    try {
      chapterContentData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini chapter JSON:",
        parseError,
        cleanedText,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to parse chapter content from AI",
      });
    }

    const fetchVideoId = async (topicName) => {
      try {
        const query = encodeURIComponent(`${topicName} tutorial`);
        const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&q=${query}&key=${process.env.YOUTUBE_API_KEY}`;
        const ytRes = await fetch(url);
        const ytData = await ytRes.json();
        return ytData?.items?.[0]?.id?.videoId ?? null;
      } catch {
        return null;
      }
    };

    const videoIds = await Promise.all(
      chapterContentData.topics.map((t) => fetchVideoId(t.topic)),
    );

    chapterContentData.topics = chapterContentData.topics.map((t, i) => ({
      ...t,
      videoId: videoIds[i],
    }));

    await Course.findOneAndUpdate(
      { courseId: courseId },
      {
        $set: { [`courseOutput.chapters.${index}`]: chapterContentData },
      },
    );

    return res.status(200).json({
      success: true,
      data: chapterContentData,
    });
  } catch (error) {
    console.error("Chapter Generation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { email } = req.query;

    const courses = await Course.find({ userEmail: email }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      courses: courses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ------------------------------------------------------------------------------------------//

export const enrollToCourse = async (req, res) => {
  try {
    const { courseId, userEmail } = req.body;

    if (!courseId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Course ID and User Email are required",
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      courseId,
      userEmail,
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: "User is already enrolled",
        enrollment: existingEnrollment,
      });
    }

    const newEnrollment = await Enrollment.create({
      courseId,
      userEmail,
      completedChapters: [],
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===========================================================================//

// 1. Get Enrollment Status (Fixes the 404)
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId, email } = req.query;
    const enrollment = await Enrollment.findOne({ courseId, userEmail: email });

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    return res.status(200).json({ success: true, enrollment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Mark Chapter Completed + Auto-Unlock Achievements
export const markChapterCompleted = async (req, res) => {
  try {
    const { enrollmentId, chapterName } = req.body;

    if (!enrollmentId || !chapterName) {
      return res.status(400).json({
        success: false,
        message: "enrollmentId and chapterName are required",
      });
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        $addToSet: { completedChapters: chapterName },
      },
      { new: true },
    );

    if (!updatedEnrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // --- Auto-unlock achievements based on progress milestones ---
    const course = await Course.findOne({
      courseId: updatedEnrollment.courseId,
    });
    if (course) {
      const totalChapters =
        course.noOfChapters || course.courseOutput?.chapters?.length || 1;
      const completedCount = updatedEnrollment.completedChapters.length;
      const achievements = course.courseOutput?.achievements || [];
      const newUnlocks = [];

      // Milestone: first chapter completed → unlock achievement[0]
      if (completedCount >= 1 && achievements[0]) {
        newUnlocks.push(achievements[0].title);
      }
      // Milestone: 50% completed → unlock achievement[1]
      if (completedCount >= Math.ceil(totalChapters / 2) && achievements[1]) {
        newUnlocks.push(achievements[1].title);
      }
      // Milestone: all chapters completed → unlock achievement[2] and beyond
      if (completedCount >= totalChapters) {
        achievements.slice(2).forEach((ach) => newUnlocks.push(ach.title));
      }

      if (newUnlocks.length > 0) {
        await Enrollment.findByIdAndUpdate(enrollmentId, {
          $addToSet: { unlockedAchievements: { $each: newUnlocks } },
        });
        // Re-fetch to get latest state
        const finalEnrollment = await Enrollment.findById(enrollmentId);
        return res
          .status(200)
          .json({ success: true, enrollment: finalEnrollment });
      }
    }

    return res
      .status(200)
      .json({ success: true, enrollment: updatedEnrollment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//-----------------------------------------------------------------------------------.//

export const getUserEnrollments = async (req, res) => {
  try {
    const { email } = req.query;

    const enrollments = await Enrollment.find({ userEmail: email });

    // 2. For each enrollment, get the course details
    const enrolledCourses = await Promise.all(
      enrollments.map(async (enroll) => {
        const course = await Course.findOne({ courseId: enroll.courseId });
        if (!course) return null;

        // Calculate progress percentage
        const totalChapters = course.noOfChapters || 0;
        const completedChaptersCount = enroll.completedChapters?.length || 0;
        const progress =
          totalChapters > 0
            ? Math.round((completedChaptersCount / totalChapters) * 100)
            : 0;

        return {
          ...course._doc,
          completedChapters: enroll.completedChapters,
          progress: progress,
          enrollmentId: enroll._id,
        };
      }),
    );

    // Filter out any nulls if a course was deleted
    const filteredCourses = enrolledCourses.filter((course) => course !== null);

    return res.status(200).json({
      success: true,
      enrolledCourses: filteredCourses,
    });
  } catch (error) {
    console.error("Fetch Enrollments Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

//------------------------------------------//

export const updateUserXP = async (req, res) => {
  try {
    const { xpAmount } = req.body; // Frontend decides the amount
    const userEmail = req.user.email; // Securely get email from token

    const parsedXP = Number(xpAmount);
    if (!Number.isFinite(parsedXP) || parsedXP <= 0) {
      return res.status(400).json({
        success: false,
        message: "xpAmount must be a positive number",
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 1. Add the XP
    user.xp = (user.xp || 0) + parsedXP;

    // 2. Calculate Level (e.g., every 1000 XP is a level)
    const newLevel = Math.floor(user.xp / 1000) + 1;

    // Check if user leveled up to trigger a special response later
    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    // 3. Update Rank
    if (user.level >= 10) user.rank = "Silver";
    if (user.level >= 20) user.rank = "Gold";
    if (user.level >= 50) user.rank = "Grandmaster";

    await user.save();

    return res.status(200).json({
      success: true,
      message: leveledUp ? "Level Up!" : "XP Updated",
      user: {
        xp: user.xp,
        level: user.level,
        rank: user.rank,
        badges: user.badges,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//==============================================================//

export const geminiPdfSummarizer = async (req, res) => {
  try {
    const { text, maxSentences = 5 } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text content is required for summarization",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const MAX_CHARS = 15000;
    const safeText = text.slice(0, MAX_CHARS);

    const prompt = `
You are an expert educational content summarizer.

TASK:
- Summarize the following content for a student.
- Use clear, simple language.
- Limit the summary to about ${maxSentences} short sentences.

CONTEXT:
${safeText}

OUTPUT FORMAT (JSON ONLY, no markdown, no backticks):
{
  "summary": "overall summary as a single string",
  "bullets": ["bullet 1", "bullet 2", "bullet 3"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const cleanedText = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini PDF summary JSON:",
        parseError,
        cleanedText,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to parse summary data from AI",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("Gemini PDF Summarizer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate course",
      error: error.message,
    });
  }
};

// utils/geminiQuizGenerator.js

export const generateQuizFromGemini = async ({
  context,
  numberOfQuestions = 5,
  difficulty = "medium",
}) => {
  try {
    if (!context || typeof context !== "string") {
      throw new Error("Context is required to generate a quiz");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

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

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const aiResponse = JSON.parse(cleanedText);

    if (!aiResponse.questions || !Array.isArray(aiResponse.questions)) {
      throw new Error("Invalid quiz format returned by AI");
    }

    return aiResponse; // Return quiz JSON
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FLASHCARD GENERATION
// ═══════════════════════════════════════════════════════════════════════════
export const generateFlashcards = async (req, res) => {
  try {
    const { courseId, chapterIndex } = req.body;

    if (!courseId || chapterIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "courseId and chapterIndex are required",
      });
    }

    const course = await Course.findOne({ courseId });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const chapter = course.courseOutput?.chapters?.[chapterIndex];
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Based on the following chapter content, generate flashcards for study and revision.
Each flashcard should have a "front" (question or term), a "back" (answer or definition), and a "hint" (a short clue).
Generate between 8 and 15 flashcards that cover the key concepts comprehensively.

Return ONLY valid JSON in this exact schema:
{
  "flashcards": [
    { "front": "string", "back": "string", "hint": "string" }
  ]
}

Chapter: ${JSON.stringify(chapter)}`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanedText);

    return res.status(200).json({
      success: true,
      flashcards: parsed.flashcards || [],
    });
  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AI MENTOR CHAT (Course-contextual)
// ═══════════════════════════════════════════════════════════════════════════
export const courseMentorChat = async (req, res) => {
  try {
    const { courseId, chapterIndex, message, history } = req.body;

    if (!courseId || chapterIndex === undefined || !message) {
      return res.status(400).json({
        success: false,
        message: "courseId, chapterIndex, and message are required",
      });
    }

    const course = await Course.findOne({ courseId });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const chapter = course.courseOutput?.chapters?.[chapterIndex];
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: `You are an expert AI mentor and tutor for the course "${course.name}".
You are currently helping a student with Chapter: "${chapter.chapterName}".

Here is the full chapter content for context:
${JSON.stringify(chapter)}

Rules:
- Answer questions clearly and concisely based on the chapter content.
- If the student asks something outside the chapter scope, briefly answer but guide them back.
- Use examples and analogies to explain complex concepts.
- Be encouraging, friendly, and supportive.
- Keep responses under 300 words unless the student asks for a detailed explanation.
- Format your responses in clean markdown with code blocks where appropriate.`,
    });

    // Build chat history from previous messages
    const chatHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const responseText = (await result.response).text();

    return res.status(200).json({
      success: true,
      reply: responseText,
    });
  } catch (error) {
    console.error("Mentor Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

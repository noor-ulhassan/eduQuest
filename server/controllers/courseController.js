import { v4 as uuidv4 } from "uuid";
import { Course } from "../models/AiCourse.js";
import Enrollment from "../models/EnrollmentModel.js";
import { User } from "../models/user.model.js";
import { callAiModel, callAiModelChat } from "../config/aiProvider.js";
import { processEvent, XP_EVENTS } from "../services/GamificationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const geminiCourseGenerator = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, "All fields are required");
  }

  const resolvedUserEmail = req.user?.email || userEmail;
  const resolvedUserName = req.user?.name || userName;
  const resolvedUserProfileImage = req.user?.avatarUrl || userProfileImage;

  if (!resolvedUserEmail) {
    throw new ApiError(400, "Authenticated user email is required");
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

  const aiResponse = await callAiModel(prompt, { model: "gemini-3.1-flash-lite-preview" });

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

  return res.status(200).json(
    new ApiResponse(200, {
      courseId: newCourse.courseId,
      data: newCourse,
    }),
  );
});

export const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findOne({ courseId: courseId });
  if (!course) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, { course }));
});

export const generateChapterContent = asyncHandler(async (req, res) => {
  const { courseId, chapter, index } = req.body;

  const existingCourse = await Course.findOne({ courseId });
  if (existingCourse) {
    const existingChapter = existingCourse.courseOutput?.chapters?.[index];
    const existingTopics = existingChapter?.topics || [];
    if (existingTopics.length > 0 && typeof existingTopics[0] === "object") {
      return res.status(200).json(
        new ApiResponse(200, { data: existingChapter, cached: true }),
      );
    }
  }

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

  let chapterContentData = await callAiModel(prompt);

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

  return res
    .status(200)
    .json(new ApiResponse(200, { data: chapterContentData }));
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ userEmail: req.user.email }).sort({
    createdAt: -1,
  });

  return res.status(200).json(new ApiResponse(200, { courses }));
});

export const enrollToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userEmail = req.user.email;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  const existingEnrollment = await Enrollment.findOne({
    courseId,
    userEmail,
  });

  if (existingEnrollment) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { enrollment: existingEnrollment },
        "User is already enrolled",
      ),
    );
  }

  const newEnrollment = await Enrollment.create({
    courseId,
    userEmail,
    completedChapters: [],
  });

  return res.status(201).json(
    new ApiResponse(201, { enrollment: newEnrollment }, "Enrolled successfully"),
  );
});

export const getEnrollmentStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  const enrollment = await Enrollment.findOne({ courseId, userEmail: req.user.email });

  if (!enrollment) throw new ApiError(404, "Enrollment not found");

  return res.status(200).json(new ApiResponse(200, { enrollment }));
});

export const markChapterCompleted = asyncHandler(async (req, res) => {
  const { enrollmentId, chapterName } = req.body;

  if (!enrollmentId || !chapterName) {
    throw new ApiError(400, "enrollmentId and chapterName are required");
  }

  // Snapshot previous state so we can detect first-time course completion
  const prevEnrollment = await Enrollment.findOne({ _id: enrollmentId, userEmail: req.user.email });
  if (!prevEnrollment) throw new ApiError(404, "Enrollment not found");
  const chapterIsNew = !prevEnrollment.completedChapters.includes(chapterName);

  const updatedEnrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { $addToSet: { completedChapters: chapterName } },
    { new: true },
  );

  const course = await Course.findOne({ courseId: updatedEnrollment.courseId });
  if (course) {
    const totalChapters = course.noOfChapters || course.courseOutput?.chapters?.length || 1;
    const completedCount = updatedEnrollment.completedChapters.length;
    const isCourseNewlyComplete = chapterIsNew && completedCount >= totalChapters;
    const achievements = course.courseOutput?.achievements || [];
    const newUnlocks = [];

    if (completedCount >= 1 && achievements[0]) {
      newUnlocks.push(achievements[0].title);
    }
    if (completedCount >= Math.ceil(totalChapters / 2) && achievements[1]) {
      newUnlocks.push(achievements[1].title);
    }
    if (completedCount >= totalChapters) {
      achievements.slice(2).forEach((ach) => newUnlocks.push(ach.title));
    }

    if (newUnlocks.length > 0) {
      await Enrollment.findByIdAndUpdate(enrollmentId, {
        $addToSet: { unlockedAchievements: { $each: newUnlocks } },
      });
      const finalEnrollment = await Enrollment.findById(enrollmentId);
      const user = await User.findById(req.user._id);
      const updatedUser = await processEvent(user, XP_EVENTS.WORKSPACE_CHAPTER, { courseCompleted: isCourseNewlyComplete });
      return res.status(200).json(
        new ApiResponse(200, {
          enrollment: finalEnrollment,
          xpAwarded: isCourseNewlyComplete ? 300 : 150,
          courseCompleted: isCourseNewlyComplete,
          user: {
            xp: updatedUser.xp,
            level: updatedUser.level,
            league: updatedUser.league,
            badges: updatedUser.badges,
          },
        }),
      );
    }

    const user = await User.findById(req.user._id);
    const updatedUser = await processEvent(user, XP_EVENTS.WORKSPACE_CHAPTER, { courseCompleted: isCourseNewlyComplete });
    return res.status(200).json(
      new ApiResponse(200, {
        enrollment: updatedEnrollment,
        xpAwarded: isCourseNewlyComplete ? 300 : 150,
        courseCompleted: isCourseNewlyComplete,
        user: {
          xp: updatedUser.xp,
          level: updatedUser.level,
          league: updatedUser.league,
          badges: updatedUser.badges,
        },
      }),
    );
  }

  const user = await User.findById(req.user._id);
  const updatedUser = await processEvent(user, XP_EVENTS.WORKSPACE_CHAPTER, {});
  return res.status(200).json(
    new ApiResponse(200, {
      enrollment: updatedEnrollment,
      xpAwarded: 150,
      user: {
        xp: updatedUser.xp,
        level: updatedUser.level,
        league: updatedUser.league,
        badges: updatedUser.badges,
      },
    }),
  );
});

export const getUserEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ userEmail: req.user.email });

  const enrolledCourses = await Promise.all(
    enrollments.map(async (enroll) => {
      const course = await Course.findOne({ courseId: enroll.courseId });
      if (!course) return null;

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

  const filteredCourses = enrolledCourses.filter((course) => course !== null);

  return res
    .status(200)
    .json(new ApiResponse(200, { enrolledCourses: filteredCourses }));
});

export const generateFlashcards = asyncHandler(async (req, res) => {
  const { courseId, chapterIndex } = req.body;

  if (!courseId || chapterIndex === undefined) {
    throw new ApiError(400, "courseId and chapterIndex are required");
  }

  const course = await Course.findOne({ courseId });
  if (!course) throw new ApiError(404, "Course not found");

  const chapter = course.courseOutput?.chapters?.[chapterIndex];
  if (!chapter) throw new ApiError(404, "Chapter not found");

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

  const parsed = await callAiModel(prompt);

  return res
    .status(200)
    .json(new ApiResponse(200, { flashcards: parsed.flashcards || [] }));
});

export const courseMentorChat = asyncHandler(async (req, res) => {
  const { courseId, chapterIndex, message, history } = req.body;

  if (!courseId || chapterIndex === undefined || !message) {
    throw new ApiError(400, "courseId, chapterIndex, and message are required");
  }

  const course = await Course.findOne({ courseId });
  if (!course) throw new ApiError(404, "Course not found");

  const chapter = course.courseOutput?.chapters?.[chapterIndex];
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const responseText = await callAiModelChat({
    systemPrompt: `You are an expert AI mentor and tutor for the course "${course.name}".
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
    history,
    message,
  });

  return res.status(200).json(new ApiResponse(200, { reply: responseText }));
});

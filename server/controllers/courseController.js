import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import { Course } from "../models/AiCourse.js";
import { Chapter } from "../models/Chapter.js";
import Enrollment from "../models/EnrollmentModel.js";
import { User } from "../models/user.model.js";
import { callAiModel, callAiModelChat } from "../config/aiProvider.js";
import { processEvent, XP_EVENTS } from "../services/GamificationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { computeAndSave } from "../services/SuggestionEngine.js";

export const geminiCourseGenerator = asyncHandler(async (req, res) => {
  const { name, description, level, noOfChapters, language } = req.body;
  const category = req.body.category || name;

  if (!name || !description || !level || !noOfChapters) {
    throw new ApiError(400, "All fields are required");
  }

  const resolvedUserEmail = req.user.email;
  const resolvedUserName = req.user.name;
  const resolvedUserProfileImage = req.user.avatarUrl;

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

  // const aiResponse = await callAiModel(prompt, { model: "gemini-3.1-flash-lite-preview" });
  const aiResponse = await callAiModel(prompt);

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
    language: language || "general",
    status: "outline",
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
  if (!existingCourse) throw new ApiError(404, "Course not found");

  // Cache: return existing Chapter doc if blocks already generated
  const existingChapter = await Chapter.findOne({
    courseId,
    chapterNumber: index + 1,
  });
  if (existingChapter?.blocks?.length > 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { data: existingChapter, cached: true }));
  }

  const prompt = `You are a technical course content generator for an online CS learning platform.
Generate rich, structured chapter content for the chapter below.
Return ONLY valid JSON — no markdown fences, no backticks, no explanation outside the JSON.

Course: "${existingCourse.name}"
Description: "${existingCourse.description}"
Chapter: ${JSON.stringify(chapter)}

Return this exact JSON structure:
{
  "title": "Chapter Title",
  "blocks": [
    { "id": "b1", "type": "text", "content": "## Heading\\nMarkdown explanation with **bold**, bullet points, and clear structure." },
    { "id": "b2", "type": "concept-card", "title": "Key Term", "subtitle": "One-line definition of the term" },
    { "id": "b3", "type": "code", "language": "<inferred-language>", "code": "// real, runnable example code" },
    { "id": "b4", "type": "pro-tip", "content": "A concise, practical tip the student should remember" },
    { "id": "b5", "type": "mermaid", "content": "graph TD; A[Start] --> B[Step]; B --> C[End]" },
    { "id": "b6", "type": "youtube", "url": "", "videoTitle": "specific YouTube search query for this topic" }
  ]
}

Rules (follow strictly):
1. Return ONLY valid JSON. No markdown fences. No text outside the JSON object.
2. Generate between 6 and 10 blocks total.
3. Infer the programming language from the course name and description. Use it consistently in all "code" blocks (e.g. Flutter → dart, Python → python, React/JavaScript → javascript, C++ → cpp).
4. Use "text" blocks for all Markdown explanations. Write proper Markdown: ## headings, bullet points, **bold** terms.
5. Always include at least one "code" block with real, runnable example code.
6. Always include at least one "pro-tip" block with a practical takeaway.
7. Include "concept-card" blocks for key terms (title = term name, subtitle = one-line definition).
8. Include a "mermaid" block ONLY if the topic has a clear flow, process, algorithm, or data structure. Use ONLY "graph TD" syntax. Omit the block entirely if not applicable.
9. For every "youtube" block: leave "url" as empty string. Set "videoTitle" to a specific search query that finds a good tutorial video.
10. Do NOT include any "playground-task" blocks. Practice tasks are linked separately by the admin.
11. All block "id" values must be unique strings (b1, b2, b3, ...).`;

  const aiResponse = await callAiModel(prompt);

  if (!aiResponse?.title || !Array.isArray(aiResponse?.blocks)) {
    throw new ApiError(500, "AI returned invalid chapter structure");
  }

  // Fetch real YouTube URLs for youtube blocks
  const fetchYouTubeUrl = async (videoTitle) => {
    try {
      const query = encodeURIComponent(`${existingCourse.name} ${videoTitle}`);
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&relevanceLanguage=en&videoDuration=medium&q=${query}&key=${process.env.YOUTUBE_API_KEY}`;
      const ytRes = await fetch(apiUrl);
      const ytData = await ytRes.json();
      const videoId = ytData?.items?.[0]?.id?.videoId;
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
    } catch {
      return "";
    }
  };

  // Replace AI placeholder IDs with nanoid and fill YouTube URLs
  const blocks = await Promise.all(
    aiResponse.blocks.map(async (block) => {
      const id = nanoid(8);
      if (block.type === "youtube" && block.videoTitle && !block.url) {
        const url = await fetchYouTubeUrl(block.videoTitle);
        return { ...block, id, url };
      }
      return { ...block, id };
    }),
  );

  // Upsert Chapter document
  const savedChapter = await Chapter.findOneAndUpdate(
    { courseId, chapterNumber: index + 1 },
    { courseId, chapterNumber: index + 1, title: aiResponse.title, blocks },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Link Chapter ObjectId into Course.chapters array and set status to draft
  await Course.findOneAndUpdate(
    { courseId },
    {
      $addToSet: { chapters: savedChapter._id },
      $set: {
        status: "draft",
        [`courseOutput.chapters.${index}`]: {
          chapterName: aiResponse.title,
          blocks,
        },
      },
    },
  );

  return res.status(200).json(new ApiResponse(200, { data: savedChapter }));
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";

  const query = isAdmin ? { userEmail: req.user.email } : { isPublished: true };

  const courses = await Course.find(query).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, { courses }));
});

export const publishCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findOne({ courseId });
  if (!course) throw new ApiError(404, "Course not found");

  course.isPublished = !course.isPublished;
  if (course.isPublished) course.status = "published";
  else if (course.status === "published") course.status = "draft";
  await course.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { course },
        course.isPublished ? "Course published" : "Course unpublished",
      ),
    );
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findOneAndDelete({ courseId });
  if (!course) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, null, "Course deleted"));
});

export const updateCourseChapter = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { index, chapterData } = req.body;

  if (index === undefined || !chapterData) {
    throw new ApiError(400, "index and chapterData are required");
  }

  await Course.findOneAndUpdate(
    { courseId },
    { $set: { [`courseOutput.chapters.${index}`]: chapterData } },
  );

  return res.status(200).json(new ApiResponse(200, null, "Chapter updated"));
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
    return res
      .status(200)
      .json(
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

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { enrollment: newEnrollment },
        "Enrolled successfully",
      ),
    );
});

export const getEnrollmentStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  const enrollment = await Enrollment.findOne({
    courseId,
    userEmail: req.user.email,
  });

  if (!enrollment) throw new ApiError(404, "Enrollment not found");

  return res.status(200).json(new ApiResponse(200, { enrollment }));
});

export const markChapterCompleted = asyncHandler(async (req, res) => {
  const { enrollmentId, chapterName } = req.body;

  if (!enrollmentId || !chapterName) {
    throw new ApiError(400, "enrollmentId and chapterName are required");
  }

  // Snapshot previous state so we can detect first-time course completion
  const prevEnrollment = await Enrollment.findOne({
    _id: enrollmentId,
    userEmail: req.user.email,
  });
  if (!prevEnrollment) throw new ApiError(404, "Enrollment not found");
  const chapterIsNew = !prevEnrollment.completedChapters.includes(chapterName);

  const updatedEnrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { $addToSet: { completedChapters: chapterName } },
    { new: true },
  );

  const course = await Course.findOne({ courseId: updatedEnrollment.courseId });
  if (course) {
    const totalChapters =
      course.noOfChapters || course.courseOutput?.chapters?.length || 1;
    const completedCount = updatedEnrollment.completedChapters.length;
    const isCourseNewlyComplete =
      chapterIsNew && completedCount >= totalChapters;
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
    }

    const finalEnrollment = await Enrollment.findById(enrollmentId);
    const user = await User.findById(req.user._id);
    const updatedUser = await processEvent(user, XP_EVENTS.WORKSPACE_CHAPTER, {
      courseCompleted: isCourseNewlyComplete,
    });
    computeAndSave(req.user).catch(() => {});
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
  const updatedUser = await processEvent(user, XP_EVENTS.WORKSPACE_CHAPTER, {});
  computeAndSave(req.user).catch(() => {});
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

export const updateCourseMetadata = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { name, description, level, category, language, linkedPlayground } =
    req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (level !== undefined) updateFields.level = level;
  if (category !== undefined) updateFields.category = category;
  if (language !== undefined) updateFields.language = language;
  if (linkedPlayground !== undefined)
    updateFields.linkedPlayground = linkedPlayground || null;

  const course = await Course.findOneAndUpdate(
    { courseId },
    { $set: updateFields },
    { new: true },
  );
  if (!course) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, { course }));
});

export const aiEditTopic = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { chapterIndex, topicIndex, context } = req.body;

  const course = await Course.findOne({ courseId });
  if (!course) throw new ApiError(404, "Course not found");

  const chapter = course.courseOutput?.chapters?.[chapterIndex];
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const currentTopic = chapter.topics?.[topicIndex];
  if (!currentTopic) throw new ApiError(404, "Topic not found");

  const prompt = `Completely rewrite the following topic with fresh examples, explanations, and structure. Keep the same topic title but generate entirely new content.

    Course: ${context?.courseName || course.name}
    Chapter: ${context?.chapterName || chapter.chapterName}
    Level: ${context?.level || course.level}

    Current topic data:
    ${JSON.stringify(currentTopic)}

    Return JSON in this exact schema:
    {
      "topic": "string",
      "content": "string (html format)",
      "proTip": "string (a useful pro tip about the topic)",
      "keyConcepts": [
        { "title": "string", "description": "string", "icon": "string (material symbol name)" }
      ],
      "imagePrompt": "string",
      "diagram": "string (valid Mermaid.js graph TD syntax or empty string)"
    }
    Return ONLY raw JSON. No markdown. No backticks.`;

  const newTopicData = await callAiModel(prompt);
  newTopicData.videoId = currentTopic.videoId;

  return res.status(200).json(new ApiResponse(200, { topic: newTopicData }));
});

import { v4 as uuidv4 } from "uuid";
import { Course } from "../models/AiCourse.js";
import Enrollment from "../models/EnrollmentModel.js";
import { callAiModel, callAiModelChat } from "../config/aiProvider.js";

export const geminiCourseGenerator = async (req, res) => {
  try {
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

    const existingCourse = await Course.findOne({ courseId });
    if (existingCourse) {
      const existingChapter = existingCourse.courseOutput?.chapters?.[index];
      const existingTopics = existingChapter?.topics || [];
      if (existingTopics.length > 0 && typeof existingTopics[0] === "object") {
        return res.status(200).json({
          success: true,
          data: existingChapter,
          cached: true,
        });
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

    const course = await Course.findOne({
      courseId: updatedEnrollment.courseId,
    });
    if (course) {
      const totalChapters =
        course.noOfChapters || course.courseOutput?.chapters?.length || 1;
      const completedCount = updatedEnrollment.completedChapters.length;
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

export const getUserEnrollments = async (req, res) => {
  try {
    const { email } = req.query;

    const enrollments = await Enrollment.find({ userEmail: email });

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

    return res.status(200).json({
      success: true,
      enrolledCourses: filteredCourses,
    });
  } catch (error) {
    console.error("Fetch Enrollments Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

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

    return res.status(200).json({
      success: true,
      flashcards: parsed.flashcards || [],
    });
  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

    return res.status(200).json({
      success: true,
      reply: responseText,
    });
  } catch (error) {
    console.error("Mentor Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

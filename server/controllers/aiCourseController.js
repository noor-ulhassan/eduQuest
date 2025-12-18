import { Course } from "../models/course.model.js";
import { generateCourseLayout } from "../configs/AiModel.js"; // Your AI Gemini function
import { v4 as uuidv4 } from "uuid";

export const generateCourse = async (req, res) => {
  try {
    // 1. Get Course Data + User Data from the request body
    const {
      name,
      description,
      noOfChapters,
      includeVideo,
      level,
      category, // Course Data
      userEmail,
      userName,
      userProfileImage, // User Data (passed from frontend)
    } = req.body;

    // 2. Call AI to generate layout (Prompt logic)
    const courseLayout = await generateCourseLayout(
      name,
      level,
      noOfChapters,
      category,
      includeVideo
    );

    // 3. Prepare the Course Object
    const courseId = uuidv4();

    const course = new Course({
      courseId: courseId,
      name: name,
      description: description,
      noOfChapters: noOfChapters,
      includeVideo: includeVideo,
      level: level,
      category: category,
      courseOutput: courseLayout, // AI Result
      userEmail: userEmail, // Validated against your Schema
      userName: userName,
      userProfileImage: userProfileImage,
    });

    // 4. Save to Database
    const saveCourse = await course.save();

    res.status(200).json({
      success: true,
      data: { course: saveCourse },
    });
  } catch (error) {
    console.error("Error generating course:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

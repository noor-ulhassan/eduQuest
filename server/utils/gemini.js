import { GoogleGenAI } from "@google/genai";
// export const geminiCourseGenerator = async (
//   topic,
//   description,
//   category,
//   level,
//   chapterNumber
// ) => {
// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

//   async function main() {
//     const ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//     });
//     const tools = [
//       {
//         googleSearch: {},
//       },
//     ];
//     const config = {
//       thinkingConfig: {
//         thinkingBudget: -1,
//       },
//       tools,
//     };
//     const model = "gemini-flash-latest";
//     const contents = [
//       {
//         role: "user",
//         parts: [
//           {
//             text: `Genrate Learning Course depends on following details. In which Make sure to add ${topic}, ${description}. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format Chapter Name, , Topic under each chapters , Duration for each chapters etc, in JSON format only

// Schema:

// {
//   "course": {
//     "name": "string",
//     "description": "string",
//     "category": "string",
//     "level": "string",
//     "includeVideo": "boolean",
//     "noOfChapters": "number",

//     "chapters": [
//       {
//         "chapterName": "string",
//         "duration": "string",
//         "topics": [
//           "string"
//         ],

//       }
//     ]
//   }
// }

// , User Input:

// `,
//           },
//         ],
//       },
//     ];

//     const response = await ai.models.generateContentStream({
//       model,
//       config,
//       contents,
//     });
//     let fileIndex = 0;
//     for await (const chunk of response) {
//       console.log(chunk.text);
//     }
//   }

//   main();
// }

import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { Course } from "../models/AiCourse.js";

export const geminiCourseGenerator = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
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

    const aiResponse = JSON.parse(cleanedText);
    const courseId = uuidv4();

    const newCourse = await Course.create({
      courseId: courseId,
      name: name,
      description: description,
      noOfChapters: noOfChapters,
      level: level,
      category: category,

      courseOutput: aiResponse.course,
      userEmail: req.user.email,
      userName: req.user.name,
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Depends on Chapter name and Topic Generate content for each topic in HTML 
    and give response in JSON format. 
    Schema:{
    chapterName:<>,
    {
    topic:<>,
    content:<>
    }
    }
    : User Input: ${JSON.stringify(chapter)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const chapterContentData = JSON.parse(cleanedText);

    await Course.findOneAndUpdate(
      { courseId: courseId },
      {
        $set: { [`courseOutput.chapters.${index}`]: chapterContentData },
      }
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

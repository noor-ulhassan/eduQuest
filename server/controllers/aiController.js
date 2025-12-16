import { geminiCourseGenerator } from "../utils/gemini.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { GoogleGenAI } from "@google/genai";

export const generateCourse = async (req, res) => {
  const formData = req.body;
  const { name, description, category, level, noOfChapters } = formData;

  async function main() {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const tools = [
      {
        googleSearch: {},
      },
    ];
    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      tools,
    };
    const model = "gemini-flash-latest";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `Genrate Learning Course depends on following details. In which Make sure to add Course Name, Description. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format Chapter Name, , Topic under each chapters , Duration for each chapters etc, in JSON format only

Schema:

{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",

    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": [
          "string"
        ],
     
      }
    ]
  }
}

, User Input: 
 - Name: ${name}
- Description: ${description}
- Category: ${category}
- Level: ${level}
- No of Chapters: ${noOfChapters}
`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    // let fileIndex = 0;
    // for await (const chunk of response) {
    //   console.log(chunk.text);
    // }
    let fullText = "";

    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    // 🔹 CLEAN & PARSE JSON
    const cleanedText = fullText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedResult = JSON.parse(cleanedText);

    // 🔹 SEND TO POSTMAN
    return res.status(200).json({
      success: true,
      data: parsedResult,
    });
  }

  main();
};

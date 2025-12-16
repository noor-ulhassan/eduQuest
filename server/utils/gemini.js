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



// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest"
});

// 2. Controller
export const geminiCourseGenerator = async (req, res) => {
  try {
    const { name, description, category, level, noOfChapters } = req.body;

    if (!name || !description || !category || !level || !noOfChapters) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const prompt = `
You are an expert curriculum designer.

Create a course with:
- Topic: ${name}
- Level: ${level}
- Total Chapters: ${noOfChapters}
- Description: ${description}
- Category: ${category}

Generate a VALID JSON object with a "chapters" array.

Each chapter must contain:
- "title"
- "content" (at least 3 paragraphs, Markdown allowed)

Return ONLY raw JSON.
No markdown.
No backticks.
`;

    // 3. Gemini Call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Debug (optional)
    // console.log("RAW GEMINI RESPONSE:\n", text);

    // 4. Clean & Parse
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const courseData = JSON.parse(cleanedText);

    // 5. Send Response
    return res.status(200).json({
      success: true,
      generatedCourse: courseData
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate course",
      error: error.message
    });
  }
};



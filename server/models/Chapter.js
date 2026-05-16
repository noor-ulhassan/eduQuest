import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    expectedOutput: { type: String, default: "" },
  },
  { _id: false }
);

const blockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["text", "code", "youtube", "mermaid", "playground-task", "pro-tip", "concept-card"],
    },
    // text · mermaid · pro-tip
    content: { type: String },
    // code · playground-task
    language: { type: String },
    // code
    code: { type: String },
    // youtube
    url: { type: String },
    videoTitle: { type: String },
    // playground-task
    instruction: { type: String },
    starterCode: { type: String },
    testCases: { type: [testCaseSchema], default: undefined },
    // concept-card
    title: { type: String },
    subtitle: { type: String },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true },
    blocks: { type: [blockSchema], default: [] },
  },
  { timestamps: true }
);

export const Chapter = mongoose.model("Chapter", chapterSchema);

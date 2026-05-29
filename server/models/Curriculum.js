import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Expert"], required: true },
  xp: { type: Number, required: true },
  description: { type: String, required: true },
  hints: [{ type: String }],
  starterCode: { type: String },
  testFunction: { type: String }, // Optional depending on problem type
  baseHtml: { type: String }, // Optional (mainly for CSS problems)
  type: { type: String }, // Optional (e.g., "interactive")
  courseChapterLink: {
    courseId: { type: String, default: null },
    chapterIndex: { type: Number, default: null },
  },
});

const chapterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  totalXp: { type: Number },
  problems: [problemSchema],
});

const curriculumSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    executionMode: {
      type: String,
      enum: ["piston", "livepreview", "react"],
    },
    pistonLanguage: {
      type: String,
      default: null,
    },
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

export const Curriculum = mongoose.model("Curriculum", curriculumSchema);

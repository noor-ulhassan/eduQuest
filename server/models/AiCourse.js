import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    noOfChapters: {
      type: Number,
      required: true,
    },
    includeVideo: {
      type: Boolean,
      default: true,
    },
    level: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    courseOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    userProfileImage: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: "general",
    },
    linkedPlayground: {
      type: String,
      default: null,
    },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    status: {
      type: String,
      enum: ["outline", "draft", "published"],
      default: "outline",
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model("Course", courseSchema);

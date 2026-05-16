import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["revisit_lesson", "practice_now", "advance_flagged", "next_chapter"],
      required: true,
    },
    courseId: { type: String },
    chapterIndex: { type: Number },
    reason: { type: String },
    ctaLabel: { type: String },
    generatedAt: { type: Date, default: Date.now },
    actedOn: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Suggestion = mongoose.model("Suggestion", suggestionSchema);

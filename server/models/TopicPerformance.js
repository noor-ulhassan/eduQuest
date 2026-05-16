import mongoose from "mongoose";

const topicPerformanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId:     { type: String, required: true },
    chapterIndex: { type: Number, required: true },
    exerciseId:   { type: String, required: true },
    attemptCount: { type: Number, default: 1 },
    passed:       { type: Boolean, default: false },
    lastAttemptAt:{ type: Date, default: Date.now },
  },
  { timestamps: true },
);

// One document per user per exercise
topicPerformanceSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

// Fast lookup: all attempts by a user on a given course
topicPerformanceSchema.index({ userId: 1, courseId: 1 });

const TopicPerformance = mongoose.model("TopicPerformance", topicPerformanceSchema);
export default TopicPerformance;

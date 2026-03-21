import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
  },

  userEmail: {
    type: String,
    required: true,
  },

  completedChapters: {
    type: Array,
    default: [],
  },

  unlockedAchievements: {
    type: Array, // Strings of achievement titles unlocked
    default: [],
  },

  enrolledAt: {
    type: Date,
    default: Date.now,
  },
});

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);
export default Enrollment;

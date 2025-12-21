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

  enrolledAt: {
    type: Date,
    default: Date.now,
  },
});

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);
export default Enrollment;

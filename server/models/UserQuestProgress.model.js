import mongoose from "mongoose";

const questEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const userQuestProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["daily", "weekly"], required: true },
    periodStart: { type: Date, required: true },
    quests: [questEntrySchema],
  },
  { timestamps: true }
);

// One document per user per period type; old period replaced on rollover
userQuestProgressSchema.index({ userId: 1, type: 1 }, { unique: true });
userQuestProgressSchema.index({ periodStart: 1 });

export const UserQuestProgress = mongoose.model(
  "UserQuestProgress",
  userQuestProgressSchema
);

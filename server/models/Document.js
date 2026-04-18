import mongoose from "mongoose";
const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title for the document."],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    chunksStored: {
      type: Number,
      default: 0,
    },
    chapters: {
      type: [Number],
      default: [],
    },
    uploadDate: { type: Date, default: Date.now },
    lastAccess: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;

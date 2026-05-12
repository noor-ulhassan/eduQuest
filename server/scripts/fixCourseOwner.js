import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { Course } from "../models/AiCourse.js";

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Course.updateMany(
    { userEmail: "eduquest010@gmail.com" },
    { $set: { userEmail: "test@gmail.com", userName: "test" } }
  );
  console.log("Updated", result.modifiedCount, "courses to admin email test@gmail.com");
  await mongoose.disconnect();
}

fix();

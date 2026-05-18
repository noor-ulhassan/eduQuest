/**
 * One-time migration: stamp type:"code" on every playground problem that lacks a type field.
 * Run from project root: node --experimental-vm-modules server/scripts/migratePlaygroundTypes.js
 * Or: cd server && node scripts/migratePlaygroundTypes.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import { Curriculum } from "../models/Curriculum.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const curriculums = await Curriculum.find({});
  let totalFixed = 0;

  for (const curriculum of curriculums) {
    let modified = false;
    for (const chapter of curriculum.chapters) {
      for (const problem of chapter.problems) {
        if (!problem.type) {
          problem.type = "code";
          modified = true;
          totalFixed++;
        }
      }
    }
    if (modified) {
      curriculum.markModified("chapters");
      await curriculum.save();
      console.log(`Updated ${curriculum.language}: stamped missing type fields`);
    } else {
      console.log(`Skipped ${curriculum.language}: all problems already have a type`);
    }
  }

  console.log(`\nDone. Stamped ${totalFixed} problem(s) with type:"code".`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

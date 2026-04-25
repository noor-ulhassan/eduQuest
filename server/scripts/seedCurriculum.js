import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Curriculum } from '../models/Curriculum.js';

// Import all static client data
import { javascriptPlayground } from '../../client/src/data/playground/javascript.js';
import { htmlPlayground } from '../../client/src/data/playground/html.js';
import { cssPlayground } from '../../client/src/data/playground/css.js';
import { pythonPlayground } from '../../client/src/data/playground/python.js';
import { reactPlayground } from '../../client/src/data/playground/react.js';
import { dsaPlayground } from '../../client/src/data/playground/dsa.js';

const curriculums = [
  { language: 'javascript', data: javascriptPlayground },
  { language: 'html', data: htmlPlayground },
  { language: 'css', data: cssPlayground },
  { language: 'python', data: pythonPlayground },
  { language: 'react', data: reactPlayground },
  { language: 'dsa', data: dsaPlayground },
];

const seedCurriculum = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Optional: Clear existing curriculums if running again
    await Curriculum.deleteMany({});
    console.log('Cleared existing Curriculum documents.');

    for (const { language, data } of curriculums) {
      console.log(`Processing ${language}...`);
      
      // Clean up the data (e.g., removing the unused isCompleted field - Bug #19)
      const cleanChapters = data.chapters.map(chapter => {
        return {
          ...chapter,
          problems: chapter.problems.map(prob => {
            const cleanProb = { ...prob };
            delete cleanProb.isCompleted; // Fix Bug #19 right here in the migration
            return cleanProb;
          })
        };
      });

      const doc = new Curriculum({
        language,
        title: data.title,
        subtitle: data.subtitle,
        chapters: cleanChapters
      });

      await doc.save();
      console.log(`\u2705 Saved ${language} curriculum (${cleanChapters.length} chapters).`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

seedCurriculum();

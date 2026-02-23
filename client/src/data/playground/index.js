import { javascriptPlayground } from "./javascript";
import { htmlPlayground } from "./html";
import { cssPlayground } from "./css";
import { pythonPlayground } from "./python";

/**
 * Aggregated playground syllabus for all languages.
 * Each language is defined in its own file under data/playground/ for easier editing.
 */
export const PLAYGROUND_DATA = {
  javascript: javascriptPlayground,
  html: htmlPlayground,
  css: cssPlayground,
  python: pythonPlayground,
};

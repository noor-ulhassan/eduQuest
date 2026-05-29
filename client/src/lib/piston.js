// Code execution via server proxy → self-hosted Piston (Docker on port 2000)
// The server handles language name translation (e.g. "javascript" → "node").
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// Friendly language names used throughout the app.
// The server translates these to Piston runtime names.
const LANGUAGE_VERSIONS = {
  javascript:  { language: "javascript",  version: "*" },
  js:          { language: "javascript",  version: "*" },
  python:      { language: "python",      version: "*" },
  python3:     { language: "python",      version: "*" },
  py:          { language: "python",      version: "*" },
  typescript:  { language: "typescript",  version: "*" },
  ts:          { language: "typescript",  version: "*" },
  java:        { language: "java",        version: "*" },
  "c++":       { language: "c++",         version: "*" },
  cpp:         { language: "c++",         version: "*" },
  c:           { language: "c",           version: "*" },
  go:          { language: "go",          version: "*" },
  golang:      { language: "go",          version: "*" },
  rust:        { language: "rust",        version: "*" },
  rs:          { language: "rust",        version: "*" },
  kotlin:      { language: "kotlin",      version: "*" },
  kt:          { language: "kotlin",      version: "*" },
  swift:       { language: "swift",       version: "*" },
  ruby:        { language: "ruby",        version: "*" },
  rb:          { language: "ruby",        version: "*" },
  php:         { language: "php",         version: "*" },
  csharp:      { language: "csharp",      version: "*" },
  "c#":        { language: "csharp",      version: "*" },
  cs:          { language: "csharp",      version: "*" },
  dart:        { language: "dart",        version: "*" },
};

const FILE_EXTENSIONS = {
  javascript: "js",  js: "js",          typescript: "ts",  ts: "ts",
  python: "py",      python3: "py",     py: "py",
  java: "java",      "c++": "cpp",      cpp: "cpp",        c: "c",
  go: "go",          golang: "go",      rust: "rs",        rs: "rs",
  kotlin: "kt",      kt: "kt",          swift: "swift",
  ruby: "rb",        rb: "rb",          php: "php",
  csharp: "cs",      "c#": "cs",        cs: "cs",          dart: "dart",
};

// Monaco editor language identifiers (differ from Piston in a few cases)
const MONACO_LANG = {
  "c++": "cpp",      cpp: "cpp",
  "c#": "csharp",    cs: "csharp",
  golang: "go",
  python3: "python", py: "python",
  js: "javascript",
  ts: "typescript",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  shell: "shell",    bash: "shell",
};

export function getMonacoLanguage(lang) {
  return MONACO_LANG[lang?.toLowerCase()] || lang?.toLowerCase() || "plaintext";
}

export function isSupportedByPiston(lang) {
  return !!LANGUAGE_VERSIONS[lang?.toLowerCase()];
}

/**
 * @param {string} language - Piston language identifier (or alias)
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const key = language?.toLowerCase();
    const languageConfig = LANGUAGE_VERSIONS[key];

    if (!languageConfig) {
      return {
        success: false,
        error: `Unsupported language: ${language}. Add it to piston.js or set a Piston Language ID on the playground in Admin → Curriculum.`,
      };
    }

    const response = await fetch(`${API_BASE}/code/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [{ name: `main.${FILE_EXTENSIONS[key] || "txt"}`, content: code }],
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP error! status: ${response.status}` };
    }

    const data = await response.json();
    const output = data.run.output || "";
    const stderr = data.run.stderr || "";

    if (stderr && !output) {
      return { success: false, output, error: stderr };
    }

    return { success: true, output: output || "No output", error: stderr || null };
  } catch (error) {
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}

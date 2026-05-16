// Code execution via backend proxy (avoids CORS/cert issues with Piston directly)

// Canonical Piston language IDs + versions. Add more as needed.
const LANGUAGE_VERSIONS = {
  javascript:  { language: "javascript",  version: "18.15.0" },
  python:      { language: "python",      version: "3.10.0"  },
  java:        { language: "java",        version: "15.0.2"  },
  "c++":       { language: "c++",         version: "10.2.0"  },
  cpp:         { language: "c++",         version: "10.2.0"  },
  c:           { language: "c",           version: "10.2.0"  },
  typescript:  { language: "typescript",  version: "5.0.3"   },
  ts:          { language: "typescript",  version: "5.0.3"   },
  go:          { language: "go",          version: "1.16.2"  },
  golang:      { language: "go",          version: "1.16.2"  },
  rust:        { language: "rust",        version: "1.50.0"  },
  kotlin:      { language: "kotlin",      version: "1.8.20"  },
  swift:       { language: "swift",       version: "5.3.3"   },
  ruby:        { language: "ruby",        version: "3.0.1"   },
  rb:          { language: "ruby",        version: "3.0.1"   },
  php:         { language: "php",         version: "8.2.3"   },
  csharp:      { language: "csharp",      version: "6.12.0"  },
  "c#":        { language: "csharp",      version: "6.12.0"  },
  cs:          { language: "csharp",      version: "6.12.0"  },
  bash:        { language: "bash",        version: "5.2.0"   },
  shell:       { language: "bash",        version: "5.2.0"   },
  r:           { language: "r",           version: "4.1.1"   },
  lua:         { language: "lua",         version: "5.4.4"   },
  perl:        { language: "perl",        version: "5.36.0"  },
  haskell:     { language: "haskell",     version: "9.0.1"   },
  scala:       { language: "scala",       version: "3.2.2"   },
  dart:        { language: "dart",        version: "2.19.6"  },
  // DSA sub-languages (same entries, listed explicitly for clarity)
  dsa:         { language: "javascript",  version: "18.15.0" },
};

const FILE_EXTENSIONS = {
  javascript: "js",  typescript: "ts",  ts: "ts",
  python: "py",      java: "java",
  "c++": "cpp",      cpp: "cpp",        c: "c",
  go: "go",          golang: "go",      rust: "rs",
  kotlin: "kt",      swift: "swift",    ruby: "rb",    rb: "rb",
  php: "php",        csharp: "cs",      "c#": "cs",    cs: "cs",
  bash: "sh",        shell: "sh",       r: "r",        lua: "lua",
  perl: "pl",        haskell: "hs",     scala: "scala",dart: "dart",
  dsa: "js",
};

// Monaco editor language identifiers (differ from Piston in a few cases)
const MONACO_LANG = {
  "c++": "cpp",  cpp: "cpp",
  "c#": "csharp", cs: "csharp",
  golang: "go",
  rb: "ruby",    ts: "typescript",
  shell: "shell", bash: "shell",
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

    const response = await fetch("http://localhost:8080/api/v1/code/execute", {
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

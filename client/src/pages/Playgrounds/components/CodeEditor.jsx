import React from "react";
import Editor from "@monaco-editor/react";
import { FileCode2, RotateCcw, Play, Loader2, ChevronRight } from "lucide-react";

export default function CodeEditor({
  code,
  setCode,
  editorLang,
  fileName,
  isMobile,
  isRunning,
  testResult,
  executionMode,
  currentProblem,
  dsaLang,
  setDsaLang,
  setOutput,
  setTestResult,
  resetCode,
  handleRunCode,
  goToNextProblem,
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1a1a1a]/80">
        <div className="flex items-center gap-3 w-full">
          {isMobile ? (
            <>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="flex-1 text-right text-[11px] text-zinc-500 font-bold uppercase tracking-[0.15em] ml-auto">
                {fileName}
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                <FileCode2 className="w-4 h-4 text-zinc-400" />
                {fileName}
              </div>

              {(executionMode === "dsa" || typeof currentProblem?.starterCode === "object") && (
                <select
                  value={dsaLang}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setDsaLang(newLang);
                    setCode(currentProblem.starterCode[newLang] || "");
                    setOutput(null);
                    setTestResult(null);
                  }}
                  className="ml-4 bg-[#111111] border border-white/10 text-zinc-300 text-xs px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={resetCode}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <div className="flex gap-2">
                  {testResult?.success && (
                    <button
                      onClick={goToNextProblem}
                      className="flex items-center gap-2 bg-[#34d399] hover:bg-[#10b981] text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-lg shadow-[#2cf07d]"
                    >
                      Next Question <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || testResult?.success}
                    className="flex items-center gap-2 bg-[#2cf07d] hover:bg-[#2cf04d] disabled:opacity-50 text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-lg shadow-purple-500/20"
                  >
                    {isRunning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                    ) : (
                      <><Play className="w-4 h-4 fill-white text-black" /> Run Code</>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monaco editor */}
      <div className={isMobile ? "h-[220px]" : "h-[320px]"}>
        <Editor
          height="100%"
          language={editorLang}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            fontSize: isMobile ? 13 : 14,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            lineDecorationsWidth: 0,
            overviewRulerLanes: 0,
          }}
        />
      </div>
    </div>
  );
}

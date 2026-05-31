import React from "react";
import { Editor, loader } from "@monaco-editor/react";
import { FileCode2, RotateCcw, Play, Loader2, ChevronRight, Keyboard } from "lucide-react";
import { motion } from "framer-motion";

// Define the custom Monaco theme once, at module scope.
loader.init().then((monaco) => {
  monaco.editor.defineTheme("eduquest-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "4a4a5a", fontStyle: "italic" },
      { token: "keyword", foreground: "f87171" },
      { token: "string", foreground: "86efac" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "7dd3fc" },
    ],
    colors: {
      "editor.background": "#161616",
      "editor.foreground": "#e4e4e7",
      "editor.lineHighlightBackground": "#1f1f1f",
      "editor.selectionBackground": "#ef444430",
      "editorLineNumber.foreground": "#3a3a3a",
      "editorLineNumber.activeForeground": "#ef4444",
      "editor.inactiveSelectionBackground": "#ef444418",
      "scrollbarSlider.background": "#ffffff10",
      "scrollbarSlider.hoverBackground": "#ffffff18",
    },
  });
});

export default function CodeEditor({
  code,
  setCode,
  editorLang,
  fileName,
  isMobile,
  isRunning,
  testResult,
  currentProblem,
  setOutput,
  setTestResult,
  resetCode,
  handleRunCode,
  goToNextProblem,
}) {
  return (
    <div
      className="bg-[#161616] rounded-2xl border border-white/[0.12] overflow-hidden"
      style={{
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Toolbar */}
      <div className="relative flex items-center justify-between border-b border-white/10 bg-[#111111] h-10 px-4">
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
              {/* File tab */}
              <div className="flex items-stretch h-full -ml-4">
                <div
                  className="relative h-full px-4 flex items-center gap-2 text-[11px] font-medium"
                  style={{
                    background: "#161616",
                    borderBottom: "1px solid #161616",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                    }}
                  />
                  <FileCode2 className="w-3.5 h-3.5 text-red-400/70" />
                  <span className="font-mono text-zinc-300 tracking-tight">{fileName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <span
                  className="hidden md:flex items-center gap-1 text-[9px] text-zinc-600 font-mono px-1.5 py-0.5 rounded select-none"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Keyboard className="w-2.5 h-2.5" /> Ctrl+Enter
                </span>
                <button
                  onClick={resetCode}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg p-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <div className="flex gap-2">
                  {testResult?.success && (
                    <motion.button
                      onClick={goToNextProblem}
                      whileHover={{ scale: 1.04, y: -0.5 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-2 font-bold text-sm px-5 py-2 rounded-xl transition-colors"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(44,240,157,0.18), rgba(44,240,157,0.08))",
                        border: "1px solid rgba(44,240,157,0.40)",
                        color: "#2cf09d",
                      }}
                    >
                      Next Question <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleRunCode}
                    disabled={isRunning || testResult?.success}
                    whileHover={{ scale: 1.04, y: -0.5 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 disabled:opacity-50 text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-[0_2px_14px_rgba(44,240,157,0.25)]"
                    style={{
                      background:
                        !isRunning && !testResult?.success
                          ? "linear-gradient(135deg, #2cf09d 0%, #16b870 100%)"
                          : "#2cf07d",
                    }}
                  >
                    {isRunning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                    ) : (
                      <><Play className="w-4 h-4 fill-white text-black" /> Run Code</>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monaco editor */}
      <div className={isMobile ? "h-[220px]" : "h-[360px]"}>
        <Editor
          height="100%"
          language={editorLang}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="eduquest-dark"
          options={{
            fontSize: isMobile ? 13 : 14,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            cursorBlinking: "phase",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            lineDecorationsWidth: 0,
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: "visible",
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
            roundedSelection: true,
          }}
        />
      </div>
    </div>
  );
}

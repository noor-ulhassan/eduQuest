import React from "react";
import Editor from "@monaco-editor/react";
import { RotateCcw, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EditorPanel({
  code,
  setCode,
  editorLang,
  fileName,
  resetCode,
  handleRunCode,
  isRunning,
  isLivePreview,
  currentProblem
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
      {/* Tab bar */}
      <div className="h-10 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center h-full">
          <div className="h-full px-4 flex items-center gap-2 border-t-2 border-red-500 bg-[#0d0d0d] text-[11px] font-medium text-white tracking-wider">
            <span className="opacity-60">{fileName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetCode}
            className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {!isLivePreview && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-[0_2px_10px_rgba(220,38,38,0.2)]"
            >
              {isRunning ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>RUN</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative overflow-hidden group">
        <Editor
          height="100%"
          language={editorLang}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 20 },
            automaticLayout: true,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            roundedSelection: true,
            scrollbar: {
              vertical: "visible",
              verticalScrollbarSize: 10,
            },
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            wordWrap: "on"
          }}
        />
      </div>
    </div>
  );
}

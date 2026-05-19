import React from "react";
import Editor from "@monaco-editor/react";
import { RotateCcw, Play, Loader2, Keyboard, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditorPanel({
  code,
  setCode,
  editorLang,
  fileName,
  resetCode,
  handleRunCode,
  isRunning,
  isLivePreview,
  currentProblem,
}) {
  return (
    <div
      className="flex-1 flex flex-col min-w-0 relative"
      style={{ background: "#0d0d0d" }}
    >
      {/* Tab bar */}
      <div
        className="h-10 flex items-center justify-between pl-0 pr-3 shrink-0 relative"
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Active file tab */}
        <div className="flex items-stretch h-full">
          <div
            className="h-full px-4 flex items-center gap-2 text-[11px] font-medium text-white relative"
            style={{
              background: "#0d0d0d",
              borderBottom: "1px solid #0d0d0d",
            }}
          >
            {/* top accent */}
            <span
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
              }}
            />
            <Circle
              className="w-2 h-2 fill-current"
              style={{ color: "#ef4444" }}
            />
            <span className="font-mono text-zinc-300 tracking-tight">
              {fileName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {!isLivePreview && (
            <span
              className="hidden md:flex items-center gap-1 text-[9px] text-zinc-600 font-mono px-1.5 py-0.5 rounded select-none"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <Keyboard className="w-2.5 h-2.5" /> Ctrl + Enter
            </span>
          )}

          <button
            onClick={resetCode}
            title="Reset code"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {!isLivePreview && (
            <motion.button
              onClick={handleRunCode}
              disabled={isRunning}
              whileHover={{ scale: 1.04, y: -0.5 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 relative overflow-hidden"
              style={{
                background: isRunning
                  ? "rgba(239,68,68,0.4)"
                  : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                boxShadow: isRunning
                  ? "none"
                  : "0 2px 14px rgba(239,68,68,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              <AnimatePresence mode="wait">
                {isRunning ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="play"
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </motion.span>
                )}
              </AnimatePresence>
              {isRunning ? "Running" : "Run"}
            </motion.button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative overflow-hidden">
        {/* Soft top fade */}
        <div
          className="absolute top-0 left-0 right-0 h-3 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,13,13,0.6) 0%, transparent 100%)",
          }}
        />
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
            padding: { top: 20, bottom: 20 },
            automaticLayout: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            roundedSelection: true,
            scrollbar: {
              vertical: "visible",
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            wordWrap: "on",
            lineHeight: 22,
            renderLineHighlight: "gutter",
            bracketPairColorization: { enabled: true },
            overviewRulerLanes: 0,
          }}
        />
      </div>
    </div>
  );
}

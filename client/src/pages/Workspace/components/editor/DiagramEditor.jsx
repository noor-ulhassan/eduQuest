import React, { useState } from "react";
import MermaidDiagram from "../MermaidDiagram";

export default function DiagramEditor({ diagram, onChange, chapterIndex, topicIndex }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Mermaid Diagram
        </label>
        {diagram && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        )}
      </div>

      <textarea
        value={diagram || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder='graph TD; A[Start] --> B[End];'
        rows={4}
        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
      />

      {showPreview && diagram && (
        <div className="bg-zinc-900/60 border border-white/10 rounded-lg p-4">
          <MermaidDiagram
            diagram={diagram}
            id={`editor-diagram-${chapterIndex}-${topicIndex}`}
          />
        </div>
      )}
    </div>
  );
}

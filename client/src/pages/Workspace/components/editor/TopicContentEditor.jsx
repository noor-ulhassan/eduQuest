import React, { useState } from "react";

export default function TopicContentEditor({ content, onChange }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Content (HTML)
        </label>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="prose prose-zinc prose-invert max-w-none p-4 rounded-lg bg-black/30 border border-white/10 min-h-[120px]
          prose-p:text-sm prose-p:text-zinc-300
          prose-headings:text-white
          prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:rounded
          prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10">
          <div dangerouslySetInnerHTML={{ __html: content || "<p>No content</p>" }} />
        </div>
      ) : (
        <textarea
          value={content || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Topic content in HTML...</p>"
          rows={8}
          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
        />
      )}
    </div>
  );
}

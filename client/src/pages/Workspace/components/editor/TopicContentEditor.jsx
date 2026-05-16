import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TopicContentEditor({ content, onChange }) {
  const [tab, setTab] = useState("edit");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Content
        </label>
        <div className="flex gap-1">
          {["edit", "preview"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors capitalize ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "edit" ? (
        <textarea
          value={content || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write markdown content…"
          rows={8}
          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 resize-y"
        />
      ) : (
        <div className="prose prose-zinc prose-invert max-w-none p-4 rounded-lg bg-black/30 border border-white/10 min-h-[120px]
          prose-p:text-sm prose-p:text-zinc-300
          prose-headings:text-white prose-strong:text-white
          prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:rounded
          prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10
          prose-ul:text-zinc-300 prose-li:marker:text-indigo-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "_No content yet_"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

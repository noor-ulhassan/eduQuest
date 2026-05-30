import React, { useState } from "react";
import { Settings, Blocks, Sparkles, Loader2, Gamepad2 } from "lucide-react";
import CourseMetadataForm from "./CourseMetadataForm";
import BlockEditorArea from "./BlockEditorArea";
import ChapterPracticeLinker from "./ChapterPracticeLinker";

const TABS = [
  { key: "blocks", label: "Blocks", icon: Blocks },
  { key: "practice", label: "Practice", icon: Gamepad2 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function EditorMainArea({
  chapter,
  chapterIndex,
  courseId,
  course,
  onChapterChange,
  onMetadataChange,
  onGenerateChapter,
  generatingChapter,
  blockEditorRef,
  onDirty,
}) {
  const [activeTab, setActiveTab] = useState("blocks");

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Chapter name + generate — always visible above tabs */}
      <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-end gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Chapter Name</label>
          <input
            type="text"
            value={chapter?.chapterName || ""}
            onChange={(e) => onChapterChange({ ...chapter, chapterName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={onGenerateChapter}
          disabled={generatingChapter}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
        >
          {generatingChapter ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {generatingChapter ? "Generating…" : "Generate Content"}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 pt-2 pb-0 border-b border-white/10">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors rounded-t-lg border-b-2 ${
              activeTab === key
                ? "text-indigo-400 border-indigo-400 bg-white/5"
                : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "blocks" && (
          <div className="p-6">
            <BlockEditorArea ref={blockEditorRef} chapterIndex={chapterIndex} courseId={courseId} onDirty={onDirty} />
          </div>
        )}

        {activeTab === "practice" && (
          <ChapterPracticeLinker
            courseId={courseId}
            chapterIndex={chapterIndex}
            linkedPlayground={course?.linkedPlayground}
          />
        )}

        {activeTab === "settings" && (
          <CourseMetadataForm course={course} onChange={onMetadataChange} />
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { BookOpen, Settings, Blocks, Sparkles, Loader2, Gamepad2 } from "lucide-react";
import TopicEditor from "./TopicEditor";
import CourseMetadataForm from "./CourseMetadataForm";
import BlockEditorArea from "./BlockEditorArea";
import ChapterPracticeLinker from "./ChapterPracticeLinker";

const TABS = [
  { key: "content", label: "Content", icon: BookOpen },
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
}) {
  const [activeTab, setActiveTab] = useState("content");

  const handleTopicChange = (topicIndex, newTopic) => {
    const updatedTopics = [...(chapter.topics || [])];
    updatedTopics[topicIndex] = newTopic;
    onChapterChange({ ...chapter, topics: updatedTopics });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-white/10">
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

        <div className="flex-1" />
        <span className="text-xs text-zinc-600 pr-2">
          Chapter {chapterIndex + 1}: {chapter?.chapterName}
        </span>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "content" && (
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 mr-4">
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
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shrink-0 mt-5"
              >
                {generatingChapter ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {generatingChapter ? "Generating…" : "Generate Content"}
              </button>
            </div>

            {(chapter?.topics || []).map((topic, idx) => (
              <TopicEditor
                key={idx}
                topic={typeof topic === "object" ? topic : { topic: topic }}
                topicIndex={idx}
                chapterIndex={chapterIndex}
                courseId={courseId}
                courseName={course?.name}
                chapterName={chapter?.chapterName}
                courseLevel={course?.level}
                onTopicChange={(newTopic) => handleTopicChange(idx, newTopic)}
              />
            ))}
          </div>
        )}

        {activeTab === "blocks" && (
          <div className="p-6">
            <BlockEditorArea
              chapterIndex={chapterIndex}
              courseId={courseId}
            />
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
          <CourseMetadataForm
            course={course}
            onChange={onMetadataChange}
          />
        )}
      </div>
    </div>
  );
}

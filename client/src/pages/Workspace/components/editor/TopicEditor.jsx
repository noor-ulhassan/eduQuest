import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import TopicContentEditor from "./TopicContentEditor";
import KeyConceptsEditor from "./KeyConceptsEditor";
import DiagramEditor from "./DiagramEditor";
import YouTubeManager from "./YouTubeManager";
import AiActionBar from "./AiActionBar";

export default function TopicEditor({
  topic,
  topicIndex,
  chapterIndex,
  courseId,
  courseName,
  chapterName,
  courseLevel,
  onTopicChange,
}) {
  const [expanded, setExpanded] = useState(false);

  const update = (field, value) => {
    onTopicChange({ ...topic, [field]: value });
  };

  const handleAiUpdate = (newTopicData) => {
    onTopicChange({ ...topic, ...newTopicData });
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d0d0d]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        )}
        <span className="flex items-center justify-center w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-[10px] font-bold shrink-0">
          {topicIndex + 1}
        </span>
        <span className="text-sm font-medium text-white flex-1 truncate">
          {topic.topic || `Topic ${topicIndex + 1}`}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5">
          <div className="flex items-center justify-between pt-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI Actions</label>
            <AiActionBar
              courseId={courseId}
              chapterIndex={chapterIndex}
              topicIndex={topicIndex}
              context={{ courseName, chapterName, level: courseLevel }}
              onTopicUpdate={handleAiUpdate}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Topic Title</label>
            <input
              type="text"
              value={topic.topic || ""}
              onChange={(e) => update("topic", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <TopicContentEditor
            content={topic.content}
            onChange={(val) => update("content", val)}
          />

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Pro Tip</label>
            <textarea
              value={topic.proTip || ""}
              onChange={(e) => update("proTip", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <KeyConceptsEditor
            concepts={topic.keyConcepts || []}
            onChange={(val) => update("keyConcepts", val)}
          />

          <DiagramEditor
            diagram={topic.diagram}
            onChange={(val) => update("diagram", val)}
            chapterIndex={chapterIndex}
            topicIndex={topicIndex}
          />

          <YouTubeManager
            videoId={topic.videoId}
            onVideoIdChange={(val) => update("videoId", val)}
          />
        </div>
      )}
    </div>
  );
}

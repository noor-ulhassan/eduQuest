import React, { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { aiEditTopic } from "@/features/workspace/courseApi";
import { toast } from "sonner";

export default function AiActionBar({ courseId, chapterIndex, topicIndex, context, onTopicUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const newTopic = await aiEditTopic(courseId, {
        chapterIndex,
        topicIndex,
        context,
      });
      onTopicUpdate(newTopic);
      toast.success("Topic regenerated");
    } catch {
      toast.error("Failed to regenerate topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRegenerate}
      disabled={loading}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 border border-white/5"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <RefreshCw className="w-3 h-3" />
      )}
      Regenerate
    </button>
  );
}

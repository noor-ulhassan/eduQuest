import React, { useState } from "react";
import { Link, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

export default function YouTubeManager({ videoId, onVideoIdChange }) {
  const [pasteUrl, setPasteUrl] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  const handlePasteUrl = () => {
    const match = pasteUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match) {
      onVideoIdChange(match[1]);
      toast.success("Video URL applied");
    } else if (pasteUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
      onVideoIdChange(pasteUrl);
      toast.success("Video ID applied");
    } else {
      toast.error("Invalid YouTube URL or ID");
    }
    setShowPaste(false);
    setPasteUrl("");
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">YouTube Video</label>

      {videoId && (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
          />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-bold transition-colors border border-white/5"
        >
          <Link className="w-3 h-3" /> Paste URL
        </button>
        {videoId && (
          <button
            onClick={() => onVideoIdChange(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold transition-colors border border-red-500/20"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        )}
        {!videoId && !showPaste && (
          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
            <Video className="w-3 h-3" /> No video set
          </span>
        )}
      </div>

      {showPaste && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePasteUrl()}
            placeholder="Paste YouTube URL or video ID..."
            className="flex-1 px-3 py-1.5 rounded-md bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handlePasteUrl}
            className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-bold"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

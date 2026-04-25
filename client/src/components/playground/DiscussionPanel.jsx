import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import {
  getDiscussions,
  createDiscussion,
} from "../../features/playground/discussionApi";
import DiscussionCard from "./DiscussionCard";

const DiscussionPanel = ({ language, problemId, problemTitle }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("community"); // "community" | "mine"
  const [sort, setSort] = useState("latest"); // "latest" | "votes"
  const user = useSelector((state) => state.auth.user);

  const fetchDiscussions = useCallback(async () => {
    if (!language || !problemId) return;
    try {
      const res = await getDiscussions(language, problemId);
      if (res.success) {
        setDiscussions(res.discussions);
      }
    } catch (err) {
      console.error("Failed to load discussions:", err);
    } finally {
      setLoading(false);
    }
  }, [language, problemId]);

  useEffect(() => {
    setLoading(true);
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        language,
        problemId,
      });
      if (res.success) {
        setDiscussions((prev) => [res.discussion, ...prev]);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      console.error("Failed to create discussion:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDiscussions((prev) => prev.filter((d) => d._id !== id));
  };

  // Filter and sort
  let filtered = [...discussions];
  if (filter === "mine" && user) {
    filtered = filtered.filter(
      (d) => (d.author?._id || d.author) === user._id,
    );
  }
  if (sort === "votes") {
    filtered.sort(
      (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0),
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-white">Discussion</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-bold">
            {discussions.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Create form */}
        {user && (
          <form onSubmit={handleSubmit} className="p-4 border-b border-zinc-800">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your discussion a descriptive title..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors mb-2"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your solution, approach, or insights with the community..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold disabled:opacity-40 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Post
              </button>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter("community")}
              className={`text-xs font-bold transition-colors ${
                filter === "community"
                  ? "text-orange-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Community
            </button>
            {user && (
              <button
                onClick={() => setFilter("mine")}
                className={`text-xs font-bold transition-colors ${
                  filter === "mine"
                    ? "text-orange-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Mine
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-[11px] text-zinc-400 outline-none cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="votes">Most Voted</option>
          </select>
        </div>

        {/* Discussion list */}
        <div className="p-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-600">
                {filter === "mine"
                  ? "You haven't posted any discussions for this problem yet."
                  : "No discussions yet. Be the first to start one!"}
              </p>
            </div>
          ) : (
            filtered.map((d) => (
              <DiscussionCard
                key={d._id}
                discussion={d}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionPanel;

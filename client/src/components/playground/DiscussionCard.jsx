import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ChevronUp, MessageSquare, Trash2, Send } from "lucide-react";
import { voteDiscussion, replyToDiscussion, deleteDiscussion, deleteReply } from "../../features/playground/discussionApi";

const DiscussionCard = ({ discussion: initial, onDelete }) => {
  const [discussion, setDiscussion] = useState(initial);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const hasVoted = discussion.votes?.some(
    (v) => (typeof v === "string" ? v : v?._id || v) === user?._id,
  );

  const handleVote = async () => {
    if (!user) return;
    try {
      const res = await voteDiscussion(discussion._id);
      if (res.success) {
        setDiscussion((prev) => ({ ...prev, votes: res.votes }));
      }
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await replyToDiscussion(discussion._id, replyText.trim());
      if (res.success) {
        setDiscussion((prev) => ({
          ...prev,
          replies: [...prev.replies, res.reply],
        }));
        setReplyText("");
      }
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this discussion?")) return;
    try {
      const res = await deleteDiscussion(discussion._id);
      if (res.success && onDelete) {
        onDelete(discussion._id);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      const res = await deleteReply(discussion._id, replyId);
      if (res.success) {
        setDiscussion((prev) => ({
          ...prev,
          replies: prev.replies.filter((r) => r._id !== replyId),
        }));
      }
    } catch (err) {
      console.error("Delete reply failed:", err);
    }
  };

  const authorName = discussion.author?.name || "Anonymous";
  const authorAvatar = discussion.author?.avatarUrl;
  const timeAgo = formatTimeAgo(discussion.createdAt);

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={handleVote}
            className={`p-1 rounded transition-colors ${
              hasVoted
                ? "text-orange-400 bg-orange-500/10"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span
            className={`text-xs font-bold ${hasVoted ? "text-orange-400" : "text-zinc-500"}`}
          >
            {discussion.votes?.length || 0}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-6 h-6 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-zinc-200">
              {authorName}
            </span>
            <span className="text-xs text-zinc-600">{timeAgo}</span>
          </div>

          <h4 className="text-sm font-bold text-white mb-1 leading-snug">
            {discussion.title}
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap line-clamp-4">
            {discussion.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {discussion.replies?.length || 0}
            </button>
            {user?._id === (discussion.author?._id || discussion.author) && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="border-t border-zinc-800 bg-zinc-950/50">
          {discussion.replies?.length > 0 && (
            <div className="divide-y divide-zinc-800/50">
              {discussion.replies.map((reply) => (
                <div
                  key={reply._id}
                  className="px-4 py-2.5 flex items-start gap-2.5"
                >
                  {reply.user?.avatarUrl ? (
                    <img
                      src={reply.user.avatarUrl}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-zinc-700 mt-0.5"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-white mt-0.5">
                      {(reply.user?.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-300">
                        {reply.user?.name || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 whitespace-pre-wrap">
                      {reply.text}
                    </p>
                  </div>
                  {(user?._id === (reply.user?._id || reply.user) ||
                    user?._id ===
                      (discussion.author?._id || discussion.author)) && (
                    <button
                      onClick={() => handleDeleteReply(reply._id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors mt-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          {user && (
            <form
              onSubmit={handleReply}
              className="px-4 py-2.5 flex items-center gap-2 border-t border-zinc-800/50"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || submitting}
                className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 disabled:opacity-30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default DiscussionCard;

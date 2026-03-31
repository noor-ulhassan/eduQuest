import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageSquare,
  Share2,
  Repeat2,
  MoreHorizontal,
} from "lucide-react";
import { likePost, commentOnPost } from "../../features/social/socialApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const TweetCard = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const { user } = useSelector((state) => state.auth);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();

  const isLiked = post.likes.includes(user?._id);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await likePost(post._id);
      if (response.success) {
        setPost((prev) => ({ ...prev, likes: response.likes }));
      }
    } catch (error) {
      console.error("Failed to like post", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await commentOnPost(post._id, commentText);
      if (response.success) {
        setPost((prev) => ({
          ...prev,
          comments: [...prev.comments, response.comment],
        }));
        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to comment", error);
    }
  };

  const goToProfile = (e) => {
    e.stopPropagation();
    const isSelf = user?._id === post.author?._id;
    navigate(isSelf ? "/profile" : `/profile/${post.author._id}`);
  };

  return (
    <div className="w-full max-w-2xl bg-[#121214] border border-zinc-800/60 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:border-zinc-700 cursor-pointer p-3 sm:p-5 group">
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar Column */}
        <div className="flex-shrink-0">
          <Avatar
            className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-[#121214] bg-zinc-900 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={goToProfile}
          >
            <AvatarImage src={post.author?.avatarUrl} />
            <AvatarFallback className="bg-zinc-800 text-white font-bold">
              {post.author?.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <span
                className="font-bold text-sm sm:text-[15px] text-white truncate hover:underline cursor-pointer tracking-tight"
                onClick={goToProfile}
              >
                {post.author?.name}
              </span>
              <span className="hidden sm:inline text-xs sm:text-[14px] text-zinc-500 font-medium truncate">
                @{post.author?.username || "user"}
              </span>
              <span className="hidden sm:inline text-xs sm:text-[14px] text-zinc-700">·</span>
              <span className="text-xs sm:text-[14px] text-zinc-500 font-medium hover:underline truncate">
                {formatDistanceToNow(new Date(post.createdAt))}
              </span>
            </div>
            <button className="text-zinc-500 hover:text-white rounded-full p-1 sm:p-1.5 hover:bg-zinc-800/50 transition-colors flex-shrink-0">
              <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Body Text */}
          <div className="text-[15px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Image */}
          {post.image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-800/60 bg-black">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-3 sm:mt-4 max-w-md gap-2 sm:gap-0">
            {/* Comment */}
            <div
              className="flex items-center gap-1.5 group/comment cursor-pointer text-zinc-500 hover:text-blue-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
            >
              <div className="p-2 rounded-full group-hover/comment:bg-blue-500/10 transition-colors">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {post.comments.length || ""}
              </span>
            </div>

            {/* Repost (Visual only) */}
            <div className="flex items-center gap-1.5 group/repost cursor-pointer text-zinc-500 hover:text-emerald-400 transition-colors">
              <div className="p-2 rounded-full group-hover/repost:bg-emerald-500/10 transition-colors">
                <Repeat2 className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Like */}
            <div
              className={`flex items-center gap-1.5 group/like cursor-pointer ${
                isLiked ? "text-rose-500" : "text-zinc-500 hover:text-rose-500"
              } transition-colors`}
              onClick={handleLike}
            >
              <div className="p-2 rounded-full group-hover/like:bg-rose-500/10 transition-colors">
                <Heart
                  className={`w-4.5 h-4.5 ${isLiked ? "fill-current" : ""}`}
                />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {post.likes.length || ""}
              </span>
            </div>

            {/* Share */}
            <div className="flex items-center gap-1.5 group/share cursor-pointer text-zinc-500 hover:text-blue-400 transition-colors">
              <div className="p-2 rounded-full group-hover/share:bg-blue-500/10 transition-colors">
                <Share2 className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div
              className="mt-4 pt-4 border-t border-zinc-800/60 animate-in slide-in-from-top-2 fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatarUrl} />
                      <AvatarFallback className="text-xs bg-zinc-800 text-white font-bold">
                        {comment.user?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-zinc-900/40 border border-zinc-800/60 px-3 py-2 rounded-2xl rounded-tl-sm">
                      <span className="font-bold tracking-tight text-white block text-xs mb-0.5">
                        {comment.user?.name}
                      </span>
                      <span className="text-zinc-300">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleComment}
                className="flex gap-2 sm:gap-3 items-center"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs bg-zinc-800 text-white font-bold">
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder="Post your reply"
                  className="flex-1 bg-zinc-900/60 text-white placeholder:text-zinc-500 border border-zinc-800/60 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-zinc-600 focus:outline-none transition-all"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full bg-white text-black hover:bg-zinc-200 font-bold disabled:opacity-50 text-xs sm:text-sm px-4 flex-shrink-0"
                  disabled={!commentText.trim()}
                >
                  Reply
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;

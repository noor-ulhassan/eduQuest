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
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-black/5 rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer p-5 group">
      <div className="flex gap-4">
        {/* Avatar Column */}
        <div className="flex-shrink-0">
          <Avatar
            className="h-11 w-11 border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={goToProfile}
          >
            <AvatarImage src={post.author?.avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 font-bold">
              {post.author?.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="font-bold text-[15px] text-gray-900 truncate hover:underline cursor-pointer"
                onClick={goToProfile}
              >
                {post.author?.name}
              </span>
              <span className="text-[14px] text-gray-500 truncate">
                @{post.author?.username || "user"}
              </span>
              <span className="text-[14px] text-gray-300">·</span>
              <span className="text-[14px] text-gray-500 hover:underline">
                {formatDistanceToNow(new Date(post.createdAt))}
              </span>
            </div>
            <button className="text-gray-300 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Body Text */}
          <div className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Image */}
          {post.image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-black/5 bg-gray-50">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4 max-w-md">
            {/* Comment */}
            <div
              className="flex items-center gap-1.5 group/comment cursor-pointer text-gray-500 hover:text-blue-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
            >
              <div className="p-2 rounded-full group-hover/comment:bg-blue-50 transition-colors">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {post.comments.length || ""}
              </span>
            </div>

            {/* Repost (Visual only) */}
            <div className="flex items-center gap-1.5 group/repost cursor-pointer text-gray-500 hover:text-green-500 transition-colors">
              <div className="p-2 rounded-full group-hover/repost:bg-green-50 transition-colors">
                <Repeat2 className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Like */}
            <div
              className={`flex items-center gap-1.5 group/like cursor-pointer ${
                isLiked ? "text-rose-500" : "text-gray-500 hover:text-rose-500"
              } transition-colors`}
              onClick={handleLike}
            >
              <div className="p-2 rounded-full group-hover/like:bg-rose-50 transition-colors">
                <Heart
                  className={`w-4.5 h-4.5 ${isLiked ? "fill-current" : ""}`}
                />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {post.likes.length || ""}
              </span>
            </div>

            {/* Share */}
            <div className="flex items-center gap-1.5 group/share cursor-pointer text-gray-500 hover:text-blue-500 transition-colors">
              <div className="p-2 rounded-full group-hover/share:bg-blue-50 transition-colors">
                <Share2 className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div
              className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {comment.user?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-50 px-3 py-2 rounded-2xl rounded-tl-sm">
                      <span className="font-semibold text-gray-900 block text-xs mb-0.5">
                        {comment.user?.name}
                      </span>
                      <span className="text-gray-700">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleComment}
                className="flex gap-3 items-center"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder="Post your reply"
                  className="flex-1 bg-gray-50 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold disabled:opacity-50"
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

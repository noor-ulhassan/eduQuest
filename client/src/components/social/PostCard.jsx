import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Heart, MessageSquare, Share2, Send } from "lucide-react";
import { likePost, commentOnPost } from "../../features/social/socialApi";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";

const PostCard = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const { user } = useSelector((state) => state.auth);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = post.likes.includes(user?._id);

  const handleLike = async () => {
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

  return (
    <Card className="w-full bg-white mb-4 sm:mb-6 border-zinc-200 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 pb-0">
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-zinc-200 cursor-pointer flex-shrink-0">
          <AvatarImage src={post.author?.avatarUrl} />
          <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-semibold text-zinc-900 cursor-pointer hover:underline truncate">
            {post.author?.name}
          </span>
          <span className="text-xs text-zinc-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <p className="text-sm text-zinc-800 mb-3 whitespace-pre-wrap">
          {post.content}
        </p>

        {post.image && (
          <div className="rounded-xl overflow-hidden bg-zinc-100 max-h-[400px] flex items-center justify-center">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col p-3 sm:p-4 pt-0">
        <div className="flex items-center justify-between w-full border-t border-zinc-100 pt-2 sm:pt-3 gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 sm:gap-2 text-xs sm:text-sm ${isLiked ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50" : "text-zinc-500"}`}
            onClick={handleLike}
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{post.likes.length} Likes</span>
            <span className="sm:hidden">{post.likes.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-500"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{post.comments.length} Comments</span>
            <span className="sm:hidden">{post.comments.length}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-500">
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full mt-4 space-y-4">
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatarUrl} />
                    <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-50 p-3 rounded-2xl rounded-tl-none flex-1 text-xs">
                    <span className="font-bold block text-zinc-900 mb-1">
                      {comment.user?.name}
                    </span>
                    <span className="text-zinc-700">{comment.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="flex gap-2 items-center">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="rounded-full bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-500 text-xs sm:text-sm flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!commentText.trim()}
                className="rounded-full h-7 w-7 sm:h-8 sm:w-8 bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;

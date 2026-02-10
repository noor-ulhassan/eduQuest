import React, { useEffect, useState } from "react";
import {
  getTopPosts,
  sendFriendRequest,
} from "../../features/social/socialApi";
import {
  MessageSquare,
  Heart,
  TrendingUp,
  UserPlus,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const TopCommunityPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const response = await getTopPosts();
        if (response.success) {
          setPosts(response.posts);
        }
      } catch (error) {
        console.error("Failed to fetch top posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-[1240px] mx-auto mt-8 bg-zinc-50 border-zinc-200">
        <CardContent className="p-6">
          <div className="h-20 bg-zinc-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="w-full max-w-[1240px] mx-auto mt-8 bg-zinc-50 border-zinc-200 border-dashed">
        <CardContent className="p-8 text-center text-zinc-500">
          <p>No trending posts yet. Be the first to start a conversation!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[1240px] mx-auto mt-8 bg-white border-zinc-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Trending in Community
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Top discussions happening now
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-100">
          {posts.map((post) => (
            <PostRow key={post._id} post={post} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PostRow = ({ post }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [requestSent, setRequestSent] = useState(false);

  const handleAddFriend = async (e) => {
    e.stopPropagation();
    if (requestSent) return;

    try {
      const res = await sendFriendRequest(post.author._id);
      if (res.success) {
        setRequestSent(true);
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Error adding friend", error);
    }
  };

  const isSelf = user?._id === post.author?._id;

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(isSelf ? "/profile" : `/profile/${post.author._id}`);
  };

  return (
    <div className="p-5 hover:bg-zinc-50 transition-colors cursor-pointer block group">
      <div className="flex gap-4">
        {/* Author Avatar */}
        <Avatar
          className="h-10 w-10 border border-zinc-200 cursor-pointer"
          onClick={handleAuthorClick}
        >
          <AvatarImage src={post.author?.avatarUrl} />
          <AvatarFallback className="bg-zinc-100 text-zinc-500">
            {post.author?.name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header: Author + Time */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-sm font-semibold text-zinc-900 truncate flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={handleAuthorClick}
            >
              {post.author?.name || "Anonymous"}

              {!isSelf && (
                <button
                  onClick={handleAddFriend}
                  disabled={requestSent}
                  className={`
                    transition-all duration-200 p-1 rounded-full 
                    ${
                      requestSent
                        ? "bg-green-100 text-green-600 opacity-100"
                        : "bg-zinc-100 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100"
                    }
                  `}
                  title={requestSent ? "Request Sent" : "Add Friend"}
                >
                  {requestSent ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                </button>
              )}
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs text-zinc-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Content Preview */}
          <p className="text-sm text-zinc-600 line-clamp-2 mb-3">
            {post.content}
          </p>

          {/* Image Preview */}
          {post.image && (
            <div className="mb-3 rounded-lg overflow-hidden h-32 w-full max-w-xs relative bg-zinc-100">
              <img
                src={post.image}
                alt="Post attachment"
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Actions/Stats */}
          <div className="flex items-center gap-4 text-zinc-500 text-xs font-medium">
            <div className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span>{post.likes.length}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCommunityPosts;

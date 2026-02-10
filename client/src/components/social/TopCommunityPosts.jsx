import React, { useEffect, useState } from "react";
import { getTopPosts } from "../../features/social/socialApi";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TweetCard from "@/components/social/TweetCard";

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
    <Card className="w-full max-w-[1240px] mx-auto mt-8 bg-transparent border-none shadow-none">
      <CardHeader className="pb-4 px-0">
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
      <CardContent className="p-0 space-y-4">
        {posts.map((post) => (
          <TweetCard
            key={post._id}
            post={post}
            onDelete={(id) =>
              setPosts((prev) => prev.filter((p) => p._id !== id))
            }
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default TopCommunityPosts;

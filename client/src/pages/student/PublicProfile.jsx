import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPublicProfile,
  sendFriendRequest,
  getUserPosts,
} from "@/features/social/socialApi";
import PostCard from "@/components/social/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Check,
  Trophy,
  Flame,
  Zap,
  ArrowLeft,
  Users,
  FileText,
} from "lucide-react";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState("none"); // none | sent | friends

  // If viewing own profile, redirect
  useEffect(() => {
    if (currentUser && currentUser._id === userId) {
      navigate("/profile", { replace: true });
      return;
    }
  }, [currentUser, userId, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getPublicProfile(userId);
        if (res.success) {
          setProfile(res.user);
          setPosts(res.posts || []);

          // Check if already friends
          if (currentUser && res.user.friends) {
            const isFriend = res.user.friends.some(
              (f) => (typeof f === "string" ? f : f._id) === currentUser._id,
            );
            if (isFriend) setFriendStatus("friends");
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, currentUser]);

  const handleAddFriend = async () => {
    try {
      const res = await sendFriendRequest(userId);
      if (res.success) {
        setFriendStatus("sent");
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error("Error sending friend request", error);
    }
  };

  const getLeagueInfo = (xp) => {
    if (xp >= 20000)
      return { name: "Diamond", color: "text-cyan-400", bg: "bg-cyan-50" };
    if (xp >= 10000)
      return {
        name: "Platinum",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      };
    if (xp >= 5000)
      return { name: "Gold", color: "text-yellow-500", bg: "bg-yellow-50" };
    if (xp >= 1000)
      return { name: "Silver", color: "text-gray-400", bg: "bg-gray-50" };
    return { name: "Bronze", color: "text-amber-700", bg: "bg-amber-50" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-64 bg-white rounded-2xl animate-pulse" />
          <div className="h-40 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-lg">User not found.</p>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const league = getLeagueInfo(profile.xp || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile Card */}
        <Card className="overflow-hidden border-zinc-200">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <CardContent className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="-mt-16 mb-4 flex items-end justify-between">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                  {profile.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>

              {/* Friend Actions */}
              <div className="pb-2">
                {friendStatus === "friends" ? (
                  <Button
                    variant="outline"
                    className="gap-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                    disabled
                  >
                    <Check className="w-4 h-4" /> Friends
                  </Button>
                ) : friendStatus === "sent" ? (
                  <Button
                    variant="outline"
                    className="gap-2 border-indigo-200 text-indigo-600 bg-indigo-50"
                    disabled
                  >
                    <Check className="w-4 h-4" /> Request Sent
                  </Button>
                ) : (
                  <Button
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleAddFriend}
                  >
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </Button>
                )}
              </div>
            </div>

            {/* Name & Username */}
            <h1 className="text-2xl font-bold text-zinc-900">{profile.name}</h1>
            <p className="text-sm text-zinc-500">
              @
              {profile.username ||
                profile.name?.toLowerCase().replace(/\s+/g, "")}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <StatCard
                icon={<Zap className="w-5 h-5 text-yellow-500" />}
                label="XP"
                value={(profile.xp || 0).toLocaleString()}
              />
              <StatCard
                icon={<Trophy className={`w-5 h-5 ${league.color}`} />}
                label="League"
                value={league.name}
              />
              <StatCard
                icon={<Flame className="w-5 h-5 text-orange-500" />}
                label="Day Streak"
                value={profile.dayStreak || 0}
              />
              <StatCard
                icon={<Users className="w-5 h-5 text-indigo-500" />}
                label="Friends"
                value={profile.friendsCount || 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-800">
              Posts ({posts.length})
            </h2>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-zinc-200">
              <CardContent className="py-12 text-center text-zinc-400">
                This user hasn't posted anything yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex items-center gap-3">
    <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    <div>
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-zinc-900">{value}</p>
    </div>
  </div>
);

export default PublicProfile;

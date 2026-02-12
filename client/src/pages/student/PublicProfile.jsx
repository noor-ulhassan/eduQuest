import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import TweetCard from "@/components/social/TweetCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Check,
  Trophy,
  Flame,
  Zap,
  ArrowLeft,
  Users,
  MessageSquare,
  MapPin,
  Calendar,
  UserMinus,
} from "lucide-react";
import {
  getPublicProfile,
  sendFriendRequest,
  getUserPosts,
  unfriend,
} from "@/features/social/socialApi";

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

  const handleUnfriend = async () => {
    if (!window.confirm("Are you sure you want to unfriend this user?")) return;
    try {
      const res = await unfriend(userId);
      if (res.success) {
        setFriendStatus("none");
        setProfile((prev) => ({
          ...prev,
          friendsCount: Math.max(0, (prev.friendsCount || 1) - 1),
          friends: prev.friends.filter((f) => f._id !== currentUser._id), // unlikely to be needed as profile re-fetch might be cleaner, but works for immediate feedback
        }));
      }
    } catch (error) {
      console.error("Error unfriending", error);
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
    <div className="min-h-screen bg-gray-50/50 mt-12">
      {/* Hero / Banner Section */}
      <div className="relative h-80 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        {/* Navbar-like overlay */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white backdrop-blur-md border border-white/10 rounded-full px-4 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-10">
          <div className="p-8 pb-0 flex flex-col md:flex-row items-end gap-8">
            <div className="relative -mt-24 md:-mt-32 mx-auto md:mx-0">
              <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 shadow-xl">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-2xl">
                  <AvatarImage
                    src={profile.avatarUrl}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-black">
                    {profile.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-4 right-4 bg-green-500 w-6 h-6 rounded-full border-[3px] border-white shadow-md ring-1 ring-black/5" />
            </div>

            <div className="flex-1 min-w-0 pb-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  {profile.name}
                </h1>
                <Badge
                  variant="secondary"
                  className={`${league.bg} ${league.color} border-0 px-3 py-1 font-bold shadow-sm`}
                >
                  {league.name} League
                </Badge>
              </div>
              <p className="text-gray-500 font-medium text-lg mb-6">
                @{profile.username || "username"}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>Earth</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>
                    Joined{" "}
                    {new Date(
                      profile.createdAt || Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto pb-8 flex justify-center">
              {friendStatus === "friends" ? (
                <Button
                  className="w-40 gap-2 bg-emerald-500 hover:bg-red-500 hover:text-white text-white shadow-lg shadow-emerald-500/30 rounded-full font-bold transition-all hover:scale-105 group"
                  onClick={handleUnfriend}
                >
                  <span className="group-hover:hidden flex items-center gap-2">
                    <Check className="w-4 h-4" /> Friends
                  </span>
                  <span className="hidden group-hover:flex items-center gap-2">
                    <UserMinus className="w-4 h-4" /> Unfriend
                  </span>
                </Button>
              ) : friendStatus === "sent" ? (
                <Button
                  className="w-40 gap-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full font-bold"
                  disabled
                >
                  <Check className="w-4 h-4" /> Sent
                </Button>
              ) : (
                <Button
                  className="w-40 gap-2 bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/20 rounded-full font-bold transition-all hover:scale-105"
                  onClick={handleAddFriend}
                >
                  <UserPlus className="w-4 h-4" /> Connect
                </Button>
              )}
            </div>
          </div>

          {/* Glassy Stats Bar */}
          <div className="grid grid-cols-4 divide-x divide-gray-100 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100 mt-8">
            <StatBox
              label="Total XP"
              value={profile.xp?.toLocaleString()}
              icon={<Zap className="w-5 h-5 text-yellow-500 mb-2" />}
            />
            <StatBox
              label="Rank"
              value={`#${profile.rank || "N/A"}`}
              icon={<Trophy className="w-5 h-5 text-indigo-500 mb-2" />}
            />
            <StatBox
              label="Streak"
              value={`${profile.dayStreak || 0} Days`}
              icon={<Flame className="w-5 h-5 text-orange-500 mb-2" />}
            />
            <StatBox
              label="Friends"
              value={profile.friendsCount || 0}
              icon={<Users className="w-5 h-5 text-pink-500 mb-2" />}
            />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left Column: Posts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Posts
              </h2>
            </div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <TweetCard
                  key={post._id}
                  post={post}
                  onDelete={(id) =>
                    setPosts((prev) => prev.filter((p) => p._id !== id))
                  }
                />
              ))
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-gray-400" />
                </div>
                <p>No posts yet</p>
              </div>
            )}
          </div>

          {/* Right Column: Friends Preview (Clickable) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Friends
              </h3>
              {profile.friends && profile.friends.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {profile.friends.slice(0, 12).map((friend) => (
                    <div
                      key={friend._id}
                      className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/profile/${friend._id}`)}
                      title={friend.name}
                    >
                      <Avatar className="w-full h-full rounded-lg border border-gray-100">
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback className="rounded-lg text-xs">
                          {friend.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No friends yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon }) => (
  <div className="p-6 text-center hover:bg-white transition-colors cursor-default group">
    <div className="flex flex-col items-center">
      <div className="transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tight">
        {value}
      </p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  </div>
);

export default PublicProfile;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import TweetCard from "@/components/social/TweetCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Star,
} from "lucide-react";
import {
  getPublicProfile,
  sendFriendRequest,
  getUserPosts,
  unfriend,
} from "@/features/social/socialApi";

// Animation Variants
const fadeInFadeOut = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState("none"); // none | sent | friends

  // Redirect if viewing own profile
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
      if (res.success) setFriendStatus("sent");
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
          friends: prev.friends.filter((f) => f._id !== currentUser._id),
        }));
      }
    } catch (error) {
      console.error("Error unfriending", error);
    }
  };

  const getLeagueInfo = (xp) => {
    if (xp >= 20000)
      return {
        name: "Diamond",
        gradient: "from-cyan-400 to-blue-600",
        border: "border-cyan-400",
        shadow: "shadow-cyan-500/50",
      };
    if (xp >= 10000)
      return {
        name: "Platinum",
        gradient: "from-emerald-400 to-teal-600",
        border: "border-emerald-500",
        shadow: "shadow-emerald-500/50",
      };
    if (xp >= 5000)
      return {
        name: "Gold",
        gradient: "from-yellow-400 to-orange-500",
        border: "border-yellow-500",
        shadow: "shadow-yellow-500/50",
      };
    if (xp >= 1000)
      return {
        name: "Silver",
        gradient: "from-slate-300 to-slate-500",
        border: "border-slate-400",
        shadow: "shadow-slate-400/50",
      };
    return {
      name: "Bronze",
      gradient: "from-orange-700 to-amber-900",
      border: "border-amber-700",
      shadow: "shadow-amber-700/50",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] py-20 px-4 flex justify-center">
        <div className="w-full max-w-5xl space-y-6 animate-pulse">
          <div className="h-72 bg-zinc-900/50 rounded-3xl" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-white">
        <p className="text-zinc-500 text-xl font-medium mb-6 tracking-tight">
          User not found.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-white text-black hover:bg-zinc-200 rounded-full font-bold px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Orbit
        </Button>
      </div>
    );
  }

  const league = getLeagueInfo(profile.xp || 0);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-purple-500/30 font-sans pb-24">
      {/* ── HERO BANNER ── */}
      <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden">
        {profile.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-[#0A0A0B]" />
        )}

        {/* Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

        {/* Top Navbar */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex items-start z-20">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-zinc-300 hover:text-white hover:bg-white/10 backdrop-blur-md rounded-full px-5 py-2 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>

      {/* ── PROFILE HEADER & ACTIONS ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24 sm:-mt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInFadeOut}
          className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-12"
        >
          {/* Avatar Area */}
          <div className="relative group">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${league.gradient} rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
            ></div>
            <Avatar
              className={`h-32 w-32 sm:h-40 sm:w-40 border-[4px] border-[#0A0A0B] relative z-10 bg-zinc-900`}
            >
              <AvatarImage src={profile.avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-zinc-900 text-zinc-400 text-4xl sm:text-5xl font-black">
                {profile.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info Area */}
          <div className="flex-1 w-full text-center md:text-left pb-2 md:pb-6">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm">
                {profile.name}
              </h1>
              <Badge
                className={`bg-gradient-to-r ${league.gradient} border-0 text-white font-bold px-4 py-1.5 shadow-lg uppercase tracking-wider text-xs`}
              >
                {league.name} League
              </Badge>
            </div>
            <p className="text-zinc-400 font-medium text-lg sm:text-xl mb-4 sm:mb-5 tracking-wide">
              @{profile.username || "username"}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-zinc-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />{" "}
                Earth
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                Joined{" "}
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full md:w-auto pb-4 md:pb-6 flex justify-center mt-6 md:mt-0">
            {friendStatus === "friends" ? (
              <Button
                onClick={handleUnfriend}
                className="w-full md:w-48 bg-emerald-500/20 text-emerald-400 hover:bg-rose-500 hover:text-white border border-emerald-500/30 hover:border-rose-500 rounded-full font-bold shadow-lg transition-all h-12 uppercase tracking-wide group"
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
                disabled
                className="w-full md:w-48 bg-white/5 text-zinc-400 border border-white/10 rounded-full font-bold h-12 uppercase tracking-wide cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" /> Request Sent
              </Button>
            ) : (
              <Button
                onClick={handleAddFriend}
                className="w-full md:w-48 bg-white text-black hover:bg-zinc-200 rounded-full font-bold shadow-xl shadow-white/10 transition-transform hover:scale-105 h-12 uppercase tracking-wide"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Connect
              </Button>
            )}
          </div>
        </motion.div>

        {/* ── GAMIFIED STATS GRID ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
        >
          <StatCard
            label="Total XP"
            value={profile.xp?.toLocaleString()}
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            glowClass="group-hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]"
          />
          <StatCard
            label="Global Rank"
            value={`#${profile.rank || "N/A"}`}
            icon={<Trophy className="w-6 h-6 text-indigo-400" />}
            glowClass="group-hover:shadow-[0_0_30px_rgba(129,140,248,0.2)]"
          />
          <StatCard
            label="Day Streak"
            value={profile.dayStreak || 0}
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            glowClass="group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]"
          />
          <StatCard
            label="Connections"
            value={profile.friendsCount || 0}
            icon={<Users className="w-6 h-6 text-pink-400" />}
            glowClass="group-hover:shadow-[0_0_30px_rgba(244,114,182,0.2)]"
          />
        </motion.div>

        {/* ── MAIN CONTENT TABS ── */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-800 w-full justify-start rounded-none h-14 p-0 space-x-8 sm:space-x-12 mb-8 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="activity"
              className="text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-white h-full px-1 text-base font-bold uppercase tracking-wider transition-colors"
            >
              Recent Activity
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-white h-full px-1 text-base font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              Friends{" "}
              <Badge
                variant="secondary"
                className="bg-zinc-800 text-zinc-300 border-0"
              >
                {profile.friends?.length || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="activity"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
              {/* Timeline Feed */}
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <motion.div
                      key={post._id}
                      variants={fadeInFadeOut}
                      initial="hidden"
                      animate="visible"
                    >
                      <TweetCard post={post} />
                    </motion.div>
                  ))
                ) : (
                  <Card className="bg-[#121214] border-zinc-800 shadow-2xl overflow-hidden text-center py-20 px-6">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-2">
                        <MessageSquare className="w-8 h-8 text-zinc-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        No transmissions yet
                      </h3>
                      <p className="text-zinc-400 max-w-sm">
                        This explorer is currently focusing on their journey
                        through the cosmos.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Badges & Achievements Sidebar */}
              <div className="space-y-6">
                <Card className="bg-[#121214] border-zinc-800/60 shadow-xl overflow-hidden">
                  <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/20">
                    <h3 className="font-bold tracking-wide uppercase text-sm text-zinc-300 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Achievements
                    </h3>
                  </div>
                  <CardContent className="p-5">
                    {/* Placeholder content for badges */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex flex-col items-center gap-2 w-20">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px]">
                          <div className="w-full h-full bg-[#121214] rounded-full flex items-center justify-center">
                            <Zap className="w-7 h-7 text-indigo-400" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 text-center uppercase">
                          First Code
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-20">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-[2px]">
                          <div className="w-full h-full bg-[#121214] rounded-full flex items-center justify-center">
                            <Flame className="w-7 h-7 text-orange-400 opacity-50" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600 text-center uppercase">
                          7-Day Streak
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="friends"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <Card className="bg-[#121214] border-zinc-800/60 shadow-xl min-h-[400px]">
              <div className="p-6">
                {profile.friends && profile.friends.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {profile.friends.map((friend) => (
                      <motion.div
                        key={friend._id}
                        whileHover={{ y: -5, scale: 1.05 }}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                        onClick={() => navigate(`/profile/${friend._id}`)}
                      >
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-zinc-800 group-hover:border-zinc-500 transition-colors shadow-lg bg-zinc-900">
                          <AvatarImage
                            src={friend.avatarUrl}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-zinc-800 text-xl font-black text-zinc-400">
                            {friend.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors truncate w-full text-center">
                          {friend.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Users className="w-16 h-16 text-zinc-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Lone Wolf
                    </h3>
                    <p className="text-zinc-400">
                      This user is forging their path solo for now.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

/* Reusable Stat Card Component */
const StatCard = ({ label, value, icon, glowClass }) => (
  <motion.div variants={fadeInFadeOut}>
    <Card
      className={`bg-[#121214] border-zinc-800/50 overflow-hidden group transition-all duration-300 hover:border-zinc-700 ${glowClass}`}
    >
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-black tracking-tight text-white mb-1">
            {value}
          </p>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default PublicProfile;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Trophy } from "lucide-react";
import ProfileHeader from "./components/ProfileHeader";
import UserStats from "./components/UserStats";
import SectionCard from "./components/SectionCard";
import TabNav from "./components/TabNav";
import CompetitionStats from "@/pages/Homepage/components/CompetitionStats";
import EmptyState from "./components/EmptyState";
import EditProfileModal from "./components/EditProfileModal";
import SkillsDialog from "./components/SkillsDialog";
import Achievements from "./components/Achievements";
import api from "@/features/auth/authApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [skills, setSkills] = useState(user?.skills || []);
  const navigate = useNavigate();


  const addSkillsToBackend = async (newSkills) => {
    if (!user) return;
    try {
      const res = await api.post("/skills", {
        skills: newSkills,
      });
      setSkills(res.data.skills);
    } catch (err) {
      console.error("Error saving skills:", err);
    }
  };

  useEffect(() => {
    if (user?.skills) {
      setSkills(user.skills);
    }
  }, [user]);


  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-white">
        <EmptyState message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0B] text-white selection:bg-orange-500/30 font-sans min-h-screen py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ProfileHeader
          displayName={user.name}
          username={user.username || user.email?.split("@")[0]}
          joinedDate={new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
          followers={user.followers?.length || 0}
          following={user.following?.length || 0}
          onEdit={() => setIsEditModalOpen(true)}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 sm:gap-8 mt-8 sm:mt-12 lg:mt-16">
          <Tabs
            defaultValue="Overview"
            className="space-y-8"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-transparent border-b border-zinc-800 rounded-none w-full justify-start h-12 p-0 space-x-8">
              {["Overview", "Projects"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-bold uppercase tracking-wider text-sm text-zinc-500 data-[state=active]:text-white hover:text-zinc-300 transition-colors"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent
              value="Overview"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 outline-none"
            >
              <CompetitionStats />
            </TabsContent>

            <TabsContent
              value="Projects"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none"
            >
              <SectionCard title="Projects">
                <EmptyState
                  message="You don't have any projects yet."
                  actionText="Go to Project Showcase"
                  onAction={() => alert("Navigate to Project Showcase")}
                />
              </SectionCard>
            </TabsContent>


          </Tabs>

          <div className="space-y-8">
            <UserStats
              username={user.username || "newbie"}
              level={user.level || 1}
              totalXP={user.xp || 0}
              rank={user.league || "Bronze"}
              badges={user.badges?.length || 0}
              dayStreak={user.dayStreak || 0}
            />
            <SkillsDialog skills={skills} />
            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-950/30 to-[#111] border border-yellow-500/30 text-sm font-bold text-white hover:border-yellow-500/60 hover:from-yellow-950/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Leaderboard
              </span>
              <span className="text-yellow-500 text-sm">→</span>
            </button>

          </div>
        </div>
        {/* 🔹 Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
            displayName: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
          }}
        />
      </div>
    </div>
  );
};

export default Profile;

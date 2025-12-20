
import React, { useState } from "react";
import { useSelector } from "react-redux";

import ProfileHeader from "@/components/profile/ProfileHeader";
import UserStats from "@/components/profile/UserStats";
import SectionCard from "@/components/profile/SectionCard";
import TabNav from "@/components/profile/TabNav";
import EmptyState from "@/components/profile/EmptyState";
import EditProfileModal from "@/components/profile/EditProfileModal";


const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 
  const { user } = useSelector((state) => state.auth);

  // If user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 mt-16">
          {/* LEFT SIDE */}
          <div className="space-y-10">
            <TabNav
              tabs={["Overview", "Projects", "Posts"]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <SectionCard title="Projects">
              <EmptyState
                message="You don't have any projects yet."
                actionText="Go to Project Showcase"
                onAction={() => alert("Navigate to Project Showcase")}
              />
            </SectionCard>

            <SectionCard title="Posts">
              <EmptyState
                message="You haven't posted anything yet."
                actionText="Say hi in #introductions"
                onAction={() => alert("Navigate to introductions")}
              />
            </SectionCard>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">
            <UserStats
              username={user.username || "newbie"}
              level={user.level || 1}
              totalXP={user.xp || 0}
              rank={user.rank || "Bronze"}
              badges={user.badges?.length || 0}
              dayStreak={user.dayStreak || 0}
            />

            <SectionCard title="Achievements">
              <EmptyState
                message="Complete a course to earn your first badge!"
                actionText="Explore courses"
                onAction={() => alert("Navigate to courses")}
              />
            </SectionCard>

            <SectionCard title="Skills">
              <EmptyState
                message="You haven't added any skills yet."
                actionText="Add skills"
                onAction={() => alert("Open skill editor")}
              />
            </SectionCard>
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
          }}
        />
      </div>
    </div>
  );
};

export default Profile;

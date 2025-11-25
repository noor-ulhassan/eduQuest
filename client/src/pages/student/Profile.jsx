
import React, { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserStats from "@/components/profile/UserStats";
import SectionCard from "@/components/profile/SectionCard";
import TabNav from "@/components/profile/TabNav";
import EmptyState from "@/components/profile/EmptyState";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="bg-[#fdfbf7] min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <ProfileHeader
          displayName="Arisha Akbar"
          username="arishaaa"
          joinedDate="July 2025"
          followers={0}
          following={0}
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
              username="arishaaa"
              level={2}
              totalXP={100}
              rank="Bronze"
              badges={1}
              dayStreak={3}
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
      </div>
    </div>
  );
};

export default Profile;
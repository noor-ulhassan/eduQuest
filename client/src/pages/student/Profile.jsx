import React, { useState } from "react";
import { useSelector } from "react-redux";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserStats from "@/components/profile/UserStats";
import SectionCard from "@/components/profile/SectionCard";
import TabNav from "@/components/profile/TabNav";
import EmptyState from "@/components/profile/EmptyState";
import EditProfileModal from "@/components/profile/EditProfileModal";
import SkillsDialog from "@/components/profile/SkillsDialog";
import api from "@/features/auth/authApi";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const [skills, setSkills] = useState(user?.skills || []);

  const addSkillsToBackend = async (newSkills) => {
    if (!user) return;
    try {
      const res = await api.post("http://localhost:8080/api/skills", {
        skills: newSkills,
      });

      setSkills(res.data.skills);
    } catch (err) {
      console.error("Error saving skills:", err);
    }
  };

  React.useEffect(() => {
    if (user?.skills) {
      setSkills(user.skills);
    }
  }, [user]);

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

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 mt-16">
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

          <div className="space-y-8">
            <UserStats
              username={user.username || "newbie"}
              level={user.level || 1}
              totalXP={user.xp || 0}
              rank={user.rank || "Bronze"}
              badges={user.badges?.length || 0}
              dayStreak={user.dayStreak || 0}
            />
            <SectionCard title="Skills">
              {(skills || []).length === 0 ? (
                <EmptyState
                  message="You haven't added any skills yet."
                  actionText="Add skills"
                  onAction={() => setIsSkillsDialogOpen(true)}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {(skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsSkillsDialogOpen(true)}
                    className="mt-8 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition"
                  >
                    + Add Skill
                  </button>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Achievements">
              <EmptyState
                message="Complete a course to earn your first badge!"
                actionText="Explore courses"
                onAction={() => alert("Navigate to courses")}
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

        <SkillsDialog
          open={isSkillsDialogOpen}
          onOpenChange={setIsSkillsDialogOpen}
          onAddSkill={(skillsArray) => addSkillsToBackend(skillsArray)}
        />
      </div>
    </div>
  );
};

export default Profile;

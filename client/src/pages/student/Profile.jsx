import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserStats from "@/components/profile/UserStats";
import SectionCard from "@/components/profile/SectionCard";
import TabNav from "@/components/profile/TabNav";
import EmptyState from "@/components/profile/EmptyState";
import EditProfileModal from "@/components/profile/EditProfileModal";
import SkillsDialog from "@/components/profile/SkillsDialog";
import api from "@/features/auth/authApi";
import {
  getUserPosts,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
} from "@/features/social/socialApi";
import CreatePost from "@/components/social/CreatePost";
import PostCard from "@/components/social/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, UserPlus } from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [skills, setSkills] = useState(user?.skills || []);

  // Posts State
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Friends State
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Fetch posts when Posts tab is active
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const response = await getUserPosts(user._id);
        if (response.success) {
          setPosts(response.posts);
        }
      } catch (error) {
        console.error("Failed to fetch user posts", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchFriendsData = async () => {
      setLoadingFriends(true);
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          getFriends(),
          getFriendRequests(),
        ]);
        if (friendsRes.success) setFriends(friendsRes.friends);
        if (requestsRes.success) setRequests(requestsRes.requests);
      } catch (error) {
        console.error("Failed to fetch friends data", error);
      } finally {
        setLoadingFriends(false);
      }
    };

    if (activeTab === "Posts" && user) {
      fetchPosts();
    } else if (activeTab === "Friends" && user) {
      fetchFriendsData();
    }
  }, [activeTab, user]);

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

  useEffect(() => {
    if (user?.skills) {
      setSkills(user.skills);
    }
  }, [user]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await acceptFriendRequest(requestId);
      if (res.success) {
        // Refresh data or update local state
        const acceptedReq = requests.find((r) => r._id === requestId);
        setRequests(requests.filter((r) => r._id !== requestId));
        if (acceptedReq && acceptedReq.from) {
          setFriends([...friends, acceptedReq.from]);
        }
      }
    } catch (error) {
      console.error("Failed to accept request", error);
    }
  };

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
              tabs={["Overview", "Projects", "Posts", "Friends"]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {activeTab === "Overview" && (
              <>
                <SectionCard title="Projects">
                  <EmptyState
                    message="You don't have any projects yet."
                    actionText="Go to Project Showcase"
                    onAction={() => alert("Navigate to Project Showcase")}
                  />
                </SectionCard>
              </>
            )}

            {activeTab === "Projects" && (
              <SectionCard title="Projects">
                <EmptyState
                  message="You don't have any projects yet."
                  actionText="Go to Project Showcase"
                  onAction={() => alert("Navigate to Project Showcase")}
                />
              </SectionCard>
            )}

            {activeTab === "Posts" && (
              <div className="space-y-6">
                {/* Create Post Section */}
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                  <h3 className="text-lg font-semibold mb-4">Create a Post</h3>
                  <CreatePost onPostCreated={handlePostCreated} />
                </div>

                {/* Posts List */}
                <div>
                  {loadingPosts ? (
                    <div className="space-y-4">
                      <div className="h-40 bg-zinc-100 rounded-xl animate-pulse" />
                      <div className="h-40 bg-zinc-100 rounded-xl animate-pulse" />
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => <PostCard key={post._id} post={post} />)
                  ) : (
                    <SectionCard title="Posts">
                      <EmptyState
                        message="You haven't posted anything yet."
                        actionText="Create your first post!"
                        onAction={() => {}}
                      />
                    </SectionCard>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Friends" && (
              <div className="space-y-8">
                {/* Friend Requests */}
                {requests.length > 0 && (
                  <SectionCard title={`Friend Requests (${requests.length})`}>
                    <div className="space-y-4">
                      {requests.map((req) => (
                        <div
                          key={req._id}
                          className="flex items-center justify-between bg-zinc-50 p-3 rounded-lg border border-zinc-100"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={req.from?.avatarUrl} />
                              <AvatarFallback>
                                {req.from?.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">
                                {req.from?.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Sent you a friend request
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            onClick={() => handleAcceptRequest(req._id)}
                          >
                            <Check className="w-4 h-4" /> Accept
                          </Button>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Friends List */}
                <SectionCard title={`Friends (${friends.length})`}>
                  {friends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {friends.map((friend) => (
                        <div
                          key={friend._id}
                          className="flex items-center gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100"
                        >
                          <Avatar>
                            <AvatarImage src={friend.avatarUrl} />
                            <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {friend.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              @{friend.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      message="You haven't added any friends yet."
                      actionText="Find friends on Leaderboard"
                      onAction={() => {}}
                    />
                  )}
                </SectionCard>
              </div>
            )}
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

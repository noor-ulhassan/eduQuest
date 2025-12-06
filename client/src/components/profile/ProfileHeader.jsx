import React, { useState } from "react";
import EditProfileModal from "@/components/profile/EditProfileModal";

const ProfileHeader = ({
  displayName: initialDisplayName = "Arisha Akbar",
  username: initialUsername = "arishaaa",
  joinedDate = "July 2025",
  followers = 0,
  following = 0,
  avatarUrl = "/Avatar.png",
  bannerUrl = "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState({
    displayName: initialDisplayName,
    username: initialUsername,
    avatarUrl,
  });

  const handleSave = (updatedData) => {
    setProfile(updatedData);
    console.log("Profile updated:", updatedData);
  };

  // Helper for avatar initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <div className="relative w-full max-w-6xl mx-auto mt-6 rounded-lg overflow-hidden shadow-md bg-white">
        {/* Banner */}
        <div className="relative h-48 sm:h-60 md:h-72 w-full">
          <img
            src={bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative px-6 pb-6 pt-4">
          {" "}
          {/* 👈 Reduced pt from 20 to 4 */}
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="h-28 w-28 border-4 border-white rounded-full shadow-md overflow-hidden">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <div
                className="h-full w-full bg-purple-600 text-white text-xl flex items-center justify-center"
                style={{ display: "none" }}
              >
                {getInitials(profile.displayName)}
              </div>
            </div>
          </div>
          {/* User details */}
          <div className="ml-30 pt-10">
            {" "}
            {/* 👈 Added pt-4 for breathing room */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.displayName}
                </h1>
                <p className="text-gray-600 text-sm">@{profile.username}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Joined {joinedDate}
                </p>
                <div className="flex gap-6 mt-3 text-sm">
                  <span className="text-purple-600 font-semibold">
                    {followers} Followers
                  </span>
                  <span className="text-purple-600 font-semibold">
                    {following} Following
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="border border-purple-600 text-purple-700 hover:bg-purple-100 font-medium px-4 py-2 rounded-md"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        initialData={profile}
      />
    </>
  );
};

export default ProfileHeader;

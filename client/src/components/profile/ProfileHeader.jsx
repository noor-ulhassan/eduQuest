import React, { useState } from "react";
import { useSelector } from "react-redux";
import EditProfileModal from "@/components/profile/EditProfileModal";

const ProfileHeader = ({
  displayName: initialDisplayName = "Arisha Akbar",
  username: initialUsername = "arishaaa",
  joinedDate = "July 2025",
  avatarUrl = "/Avatar.png",
  bannerUrl = "/banner.png",
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({
    displayName: initialDisplayName,
    username: initialUsername,
    avatarUrl,
    bannerUrl,
  });

  React.useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.name || initialDisplayName,
        username: user.username || initialUsername,
        avatarUrl: user.avatarUrl || avatarUrl,
        bannerUrl: user.bannerUrl || bannerUrl,
      });
    }
  }, [user]);

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
      <div className="relative w-full max-w-6xl mx-auto mt-4 sm:mt-6 px-4 sm:px-6">
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#121214] border border-zinc-800">
          {/* Banner */}
          <div className="relative h-32 sm:h-48 md:h-60 lg:h-72 w-full bg-gradient-to-r from-yellow-400 to-orange-500">
            {profile.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Content */}
          <div className="relative px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4">
            <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 border-[4px] border-[#121214] rounded-full shadow-lg overflow-hidden bg-zinc-900">
                <img
                  src={profile.avatarUrl || "/Avatar.png"}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <div
                  className="h-full w-full bg-yellow-600 text-white text-base sm:text-lg md:text-xl flex items-center justify-center"
                  style={{ display: "none" }}
                >
                  {getInitials(profile.displayName)}
                </div>
              </div>
            </div>
            {/* User details */}
            <div className="pt-8 sm:pt-10 md:pt-12 pl-0 sm:pl-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white truncate drop-shadow-sm">
                    {profile.displayName}
                  </h1>
                  <p className="text-zinc-400 text-sm sm:text-base font-medium tracking-wide truncate">@{profile.username}</p>
                  <p className="text-zinc-500 text-xs sm:text-sm font-semibold mt-1">
                    Joined {joinedDate}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditOpen(true)}
                  className="w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black font-bold px-4 py-2 rounded-full text-sm sm:text-base uppercase tracking-wider transition-all"
                >
                  Edit Profile
                </button>
              </div>
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

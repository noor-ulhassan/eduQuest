// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux"; // 🔹 Added to dispatch updates
// import { authSuccess } from "@/features/auth/authSlice"; // 🔹 Added to update Redux

// const EditProfileModal = ({ isOpen, onClose, onSave, initialData }) => {
//   const [displayName, setDisplayName] = useState("");
//   const [username, setUsername] = useState("");
//   const [avatarPreview, setAvatarPreview] = useState("");
//    const [bannerPreview, setBannerPreview] = useState("");

//   const dispatch = useDispatch(); // 🔹 Added dispatch hook

//   // Sync form with initialData when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       setDisplayName(initialData.displayName || "");
//       setUsername(initialData.username || "");
//       setAvatarPreview(initialData.avatarUrl || "");
//       setBannerPreview(initialData.bannerUrl || "");
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen, initialData]);

//   const handleAvatarChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setAvatarPreview(url);
//     }
//   };
//   // 🔹 Handle banner change
//   const handleBannerChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setBannerPreview(url);
//     }
//   };
//   const handleSave = () => {
//     const updatedData = { displayName, username, avatarUrl: avatarPreview };

//     // 🔹 Update Redux immediately for Profile page to reflect changes
//     dispatch(
//       authSuccess({
//         user: {
//           ...initialData, // keep other fields intact
//           name: displayName,
//           username,
//           avatarUrl: avatarPreview,
//            bannerUrl: bannerPreview,
//         },
//         accessToken: localStorage.getItem("accessToken") || "mock-token",
//       })
//     );

//     // 🔹 Call parent onSave if needed (optional, e.g., backend API call)
//     if (onSave) onSave(updatedData);

//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//       <div
//         className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="px-6 py-4 border-b">
//           <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
//         </div>

//         {/* Body */}
//         <div className="p-6 space-y-5">
//            {/* 🔹 Banner Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Header / Banner
//             </label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleBannerChange}
//               className="text-sm text-gray-600 file:mr-2 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
//             />
//             {bannerPreview && (
//               <img
//                 src={bannerPreview}
//                 alt="Banner Preview"
//                 className="mt-2 h-24 w-full object-cover rounded-md"
//               />
//             )}
//           </div>
//           {/* Avatar Upload */}
//           <div className="flex flex-col items-center gap-3">
//             <div className="relative">
//               <img
//                 src={avatarPreview}
//                 alt="Preview"
//                 className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
//                 onError={(e) => {
//                   e.target.style.display = "none";
//                   e.target.nextSibling.style.display = "flex";
//                 }}
//               />
//               <div
//                 className="h-20 w-20 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium"
//                 style={{ display: "none" }}
//               >
//                 {displayName
//                   .split(" ")
//                   .map((n) => n[0])
//                   .join("")
//                   .substring(0, 2)
//                   .toUpperCase()}
//               </div>
//             </div>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleAvatarChange}
//               className="text-sm text-gray-600 file:mr-2 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
//             />
//           </div>

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Name
//             </label>
//             <input
//               type="text"
//               value={displayName}
//               onChange={(e) => setDisplayName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//           </div>

//           {/* Username */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Username
//             </label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSave}
//             className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
//           >
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { authSuccess } from "@/features/auth/authSlice";
import api from "@/features/auth/authApi";
import { toast } from "sonner";

const EditProfileModal = ({ isOpen, onClose, initialData }) => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const avatarBlobRef = useRef(null);
  const bannerBlobRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen && initialData) {
      setDisplayName(initialData.name || initialData.displayName || "");
      setUsername(initialData.username || "");
      setAvatarPreview(initialData.avatarUrl || "");
      setAvatarFile(null);
      setBannerPreview(initialData.bannerUrl || "");
      setBannerFile(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      // Clean up blob URLs to prevent memory leaks
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      if (bannerBlobRef.current) {
        URL.revokeObjectURL(bannerBlobRef.current);
        bannerBlobRef.current = null;
      }
    };
  }, [isOpen, initialData]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous blob URL if exists
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
      }
      const blobUrl = URL.createObjectURL(file);
      avatarBlobRef.current = blobUrl;
      setAvatarFile(file);
      setAvatarPreview(blobUrl);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous blob URL if exists
      if (bannerBlobRef.current) {
        URL.revokeObjectURL(bannerBlobRef.current);
      }
      const blobUrl = URL.createObjectURL(file);
      bannerBlobRef.current = blobUrl;
      setBannerFile(file);
      setBannerPreview(blobUrl);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      let updatedUser = { ...initialData, name: displayName, username };

      // Upload banner first if a new file was selected
      if (bannerFile) {
        try {
          const formData = new FormData();
          formData.append("banner", bannerFile);
          const bannerRes = await api.post("/user/banner", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (bannerRes.data?.success && bannerRes.data?.user) {
            updatedUser = bannerRes.data.user;
            dispatch(authSuccess({ user: bannerRes.data.user }));
          }
        } catch (bannerErr) {
          console.error("Banner upload error:", bannerErr);
          // Continue with profile update even if banner upload fails
          toast.error("Banner upload failed, but profile will still be updated");
        }
      }

      // Upload avatar if a new file was selected
      if (avatarFile) {
        try {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          const avatarRes = await api.post("/user/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (avatarRes.data?.success && avatarRes.data?.user) {
            updatedUser = avatarRes.data.user;
            dispatch(authSuccess({ user: avatarRes.data.user }));
          }
        } catch (avatarErr) {
          console.error("Avatar upload error:", avatarErr);
          // Continue with profile update even if avatar upload fails
          toast.error("Avatar upload failed, but profile will still be updated");
        }
      }

      // Update profile (name, username)
      const profileRes = await api.patch("/user/profile", {
        name: displayName.trim(),
        username: username.trim() || undefined,
      });
      
      if (profileRes.data?.success && profileRes.data?.user) {
        updatedUser = profileRes.data.user;
        dispatch(authSuccess({ user: profileRes.data.user }));
      toast.success("Profile updated successfully");
      if (typeof onSave === "function") {
        onSave({ 
          ...updatedUser, 
          name: displayName, 
          username, 
          avatarUrl: updatedUser?.avatarUrl,
          bannerUrl: updatedUser?.bannerUrl 
        });
      }
      onClose();
      } else {
        throw new Error("Profile update failed");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      let errorMsg = "Failed to update profile";
      
      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error") || err.message?.includes("ECONNREFUSED")) {
        errorMsg = "Connection error. Please check if the server is running on port 8080.";
      } else if (err.response?.status === 401) {
        errorMsg = "Unauthorized. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMsg = "Forbidden. You don't have permission to update this profile.";
      } else if (err.response?.status === 404) {
        errorMsg = "Profile endpoint not found. Please check server configuration.";
      } else if (err.response?.status === 405) {
        errorMsg = "Method not allowed. Server may not support PATCH requests.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header / Banner
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleBannerChange}
              className="text-sm text-gray-600 file:mr-2 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt="Banner Preview"
                className="mt-2 h-20 w-full object-cover rounded-md"
              />
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`h-20 w-20 rounded-full bg-yellow-600 text-white flex items-center justify-center text-sm font-medium ${avatarPreview ? "hidden" : ""}`}
              >
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="text-sm text-gray-600 file:mr-2 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-gray-50 flex justify-end gap-3 flex-shrink-0 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

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

// export default EditProfileModal;
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux"; // 🔹 Added to dispatch updates
import { authSuccess } from "@/features/auth/authSlice"; // 🔹 Added to update Redux

const EditProfileModal = ({ isOpen, onClose, initialData }) => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const dispatch = useDispatch(); // 🔹 Added dispatch hook

  // 🔹 Sync form with initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialData.name || "");
      setUsername(initialData.username || "");
      setAvatarPreview(initialData.avatarUrl || "");
      setBannerPreview(initialData.bannerUrl || "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialData]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleSave = () => {
    const updatedData = {
      ...initialData, // 🔹 Keep other fields intact
      name: displayName,
      username,
      avatarUrl: avatarPreview,
      bannerUrl: bannerPreview, // 🔹 Added bannerUrl update
    };

    // 🔹 Update Redux immediately for dynamic profile
    dispatch(authSuccess({ user: updatedData }));

    onClose(); // 🔹 Close modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header / Banner
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange} // 🔹 Handle banner change
              className="text-sm text-gray-600 file:mr-2 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt="Banner Preview"
                className="mt-2 h-24 w-full object-cover rounded-md"
              />
            )}
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={avatarPreview}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="h-20 w-20 rounded-full bg-yellow-600 text-white flex items-center justify-center text-sm font-medium"
                style={{ display: "none" }}
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
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-gray-600 file:mr-2 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
          </div>

          {/* Name */}
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

          {/* Username */}
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

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave} // 🔹 Save updates Redux directly
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

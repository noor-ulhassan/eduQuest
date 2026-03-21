import api from "@/features/auth/authApi";
import { updateUserStats } from "@/features/auth/authSlice";
import { toast } from "sonner";

/**
 * Helper to grant XP and sync with Redux & Backend
 * @param {Function} dispatch - Redux dispatch function
 * @param {Number} amount - Amount of XP to grant
 */
export const grantXP = async (dispatch, amount) => {
  try {
    const response = await api.post(
      "http://localhost:8080/api/v1/ai/update-user-xp",
      {
        xpAmount: amount,
      },
    );

    console.log("XP Update Response:", response.data); // Debug: Check the structure here

    if (response.data.success && response.data.user) {
      // 1. Update Redux immediately
      // Ensure the payload matches the User model fields (xp, level, rank)
      dispatch(updateUserStats(response.data.user));

      // 2. Visual Feedback
      if (response.data.message === "Level Up!") {
        toast.success(
          `🎉 Level Up! You reached Level ${response.data.user.level}`,
          {
            description: "New rank and rewards unlocked!",
            duration: 5000,
          },
        );
      } else {
        toast.success(`+${amount} XP Earned!`, {
          icon: "✨",
        });
      }

      return response.data.user; // Return data in case component needs it
    }
  } catch (error) {
    console.error("XP Update Failed:", error.response?.data || error.message);
    toast.error("Failed to sync XP progress");
  }
};

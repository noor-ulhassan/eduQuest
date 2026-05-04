import api from "@/features/auth/authApi";
import { updateUserStats } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { store } from "@/store/store";
import { emit } from "@/lib/gamificationBus";

export const grantXP = async (dispatch, amount) => {
  try {
    const prevUser = store.getState().auth.user;

    const response = await api.post(
      "http://localhost:8080/api/v1/ai/update-user-xp",
      { xpAmount: amount },
    );

    if (response.data.success && response.data.user) {
      dispatch(updateUserStats(response.data.user));

      emit({ type: "xp", amount });

      if (response.data.message === "Level Up!") {
        emit({ type: "levelUp", level: response.data.user.level });
      }

      if (response.data.user.rank !== prevUser?.rank) {
        emit({ type: "rankUp", rank: response.data.user.rank });
      }

      const prevBadges = prevUser?.badges || [];
      (response.data.user.badges || [])
        .filter((b) => !prevBadges.find((pb) => pb.title === b.title))
        .forEach((b) => emit({ type: "badge", ...b }));

      return response.data.user;
    }
  } catch (error) {
    console.error("XP Update Failed:", error.response?.data || error.message);
    toast.error("Failed to sync XP progress");
  }
};

import api from "@/features/auth/authApi";

export const fetchUserQuests = () => api.get("/quests");

export const claimQuestReward = (questId, period) =>
  api.post("/quests/claim", { questId, period });

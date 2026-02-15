import api from "../auth/authApi.js";

export const getGlobalLeaderboard = async () => {
  const response = await api.get("/leaderboard/global");
  return response.data;
};

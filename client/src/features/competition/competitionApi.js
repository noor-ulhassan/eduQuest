import api from "../auth/authApi";

export const getCompetitionStats = () => api.get("/competition/stats");

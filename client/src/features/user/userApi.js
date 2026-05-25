import api from "../auth/authApi";

export const getUserAnalytics = () => api.get("/user/analytics");

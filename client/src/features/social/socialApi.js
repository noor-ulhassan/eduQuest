import api from "../auth/authApi.js";

export const getPublicProfile = async (userId) => {
  const response = await api.get(`/user/profile/${userId}`);
  return response.data;
};

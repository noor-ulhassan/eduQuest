import api from "../auth/authApi.js";

export const getPublicProfile = async (userId) => {
  const response = await api.get(`/user/profile/${userId}`);
  return response.data;
};

export const sendFriendRequest = async (targetUserId) => {
  const response = await api.post("/user/friend-request", { targetUserId });
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.put("/user/friend-request/accept", { requestId });
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get("/user/friends");
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await api.get("/user/friend-requests");
  return response.data;
};

export const unfriend = async (targetUserId) => {
  const response = await api.post("/user/unfriend", { targetUserId });
  return response.data;
};

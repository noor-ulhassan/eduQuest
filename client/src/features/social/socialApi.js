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

export const createPost = async (postData) => {
  const response = await api.post("/posts", postData);
  return response.data;
};

export const getFeedPosts = async () => {
  const response = await api.get("/posts/feed");
  return response.data;
};

export const getTopPosts = async () => {
  const response = await api.get("/posts/top");
  return response.data;
};

export const getUserPosts = async (userId) => {
  const response = await api.get(`/posts/user/${userId}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.put(`/posts/${postId}/like`);
  return response.data;
};

export const commentOnPost = async (postId, text) => {
  const response = await api.post(`/posts/${postId}/comment`, { text });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
  return response.data;
};

export const unfriend = async (targetUserId) => {
  const response = await api.post("/user/unfriend", { targetUserId });
  return response.data;
};

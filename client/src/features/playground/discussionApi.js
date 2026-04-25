import api from "../auth/authApi.js";

export const getDiscussions = async (language, problemId) => {
  const response = await api.get(
    `/discussions?language=${language}&problemId=${problemId}`,
  );
  return response.data;
};

export const getUserDiscussions = async (userId) => {
  const response = await api.get(`/discussions/user/${userId}`);
  return response.data;
};

export const createDiscussion = async ({
  title,
  content,
  language,
  problemId,
}) => {
  const response = await api.post("/discussions", {
    title,
    content,
    language,
    problemId,
  });
  return response.data;
};

export const voteDiscussion = async (id) => {
  const response = await api.put(`/discussions/${id}/vote`);
  return response.data;
};

export const replyToDiscussion = async (id, text) => {
  const response = await api.post(`/discussions/${id}/reply`, { text });
  return response.data;
};

export const deleteDiscussion = async (id) => {
  const response = await api.delete(`/discussions/${id}`);
  return response.data;
};

export const deleteReply = async (discussionId, replyId) => {
  const response = await api.delete(
    `/discussions/${discussionId}/reply/${replyId}`,
  );
  return response.data;
};

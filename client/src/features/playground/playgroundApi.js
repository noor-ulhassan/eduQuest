import api from "../auth/authApi.js";

/**
 * Get all playground progress for the authenticated user
 */
export const getPlaygroundProgress = async () => {
  const response = await api.get("/playground/progress");
  return response.data;
};

/**
 * Enroll user in a playground language
 * @param {string} language - "html" | "css" | "javascript"
 */
export const enrollInPlayground = async (language) => {
  const response = await api.post("/playground/enroll", { language });
  return response.data;
};

/**
 * Mark a problem as complete and update user XP/rank
 * @param {string} language - playground language
 * @param {string} problemId - unique problem identifier
 * @param {number} xp - XP to award
 */
export const completeProblem = async (language, problemId, xp) => {
  const response = await api.post("/playground/complete", {
    language,
    problemId,
    xp,
  });
  return response.data;
};

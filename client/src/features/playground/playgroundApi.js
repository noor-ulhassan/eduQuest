import api from "../auth/authApi.js";

export const getPlaygroundProgress = async () => {
  const response = await api.get("/playground/progress");
  return response.data;
};

export const getLanguageProgress = async (language) => {
  const response = await api.get(`/playground/progress/${language}`);
  return response.data;
};

export const getCurriculum = async (language) => {
  const response = await api.get(`/curriculum/${language}`);
  return response.data;
};

export const getCurriculumsMetadata = async () => {
  const response = await api.get("/curriculum/metadata");
  return response.data;
};

// ==========================================
// ADMIN CURRICULUM ROUTES
// ==========================================

export const createCurriculum = async (data) => {
  const response = await api.post("/curriculum", data);
  return response.data;
};

export const updateCurriculumSettings = async (language, data) => {
  const response = await api.patch(`/curriculum/${language}/settings`, data);
  return response.data;
};

export const deleteCurriculum = async (language) => {
  const response = await api.delete(`/curriculum/${language}`);
  return response.data;
};

export const addChapter = async (language, data) => {
  const response = await api.post(`/curriculum/${language}/chapter`, data);
  return response.data;
};

export const updateChapter = async (language, chapterId, data) => {
  const response = await api.put(`/curriculum/${language}/chapter/${chapterId}`, data);
  return response.data;
};

export const deleteChapter = async (language, chapterId) => {
  const response = await api.delete(`/curriculum/${language}/chapter/${chapterId}`);
  return response.data;
};

export const addProblem = async (language, chapterId, problemData) => {
  const response = await api.post(`/curriculum/${language}/chapter/${chapterId}/problem`, problemData);
  return response.data;
};

export const updateProblem = async (language, problemId, problemData) => {
  const response = await api.put(`/curriculum/${language}/problem/${problemId}`, problemData);
  return response.data;
};

export const deleteProblem = async (language, problemId) => {
  const response = await api.delete(`/curriculum/${language}/problem/${problemId}`);
  return response.data;
};

export const generateProblems = async (language, chapterId, data) => {
  const response = await api.post(`/curriculum/${language}/chapter/${chapterId}/generate`, data);
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
 * Mark a problem as complete and update user XP/rank.
 * Server determines XP from its own problem registry.
 * @param {string} language - playground language
 * @param {string} problemId - unique problem identifier
 * @param {{ usedHints?: boolean, solveTimeMs?: number }} [opts]
 */
export const completeProblem = async (language, problemId, opts = {}) => {
  const response = await api.post("/playground/complete", {
    language,
    problemId,
    usedHints: opts.usedHints ?? false,
    solveTimeMs: opts.solveTimeMs ?? null,
  });
  return response.data;
};

export const trackLinkedAttempt = ({ exerciseId, courseId, chapterIndex, passed }) =>
  api.post("/playground/track-attempt", { exerciseId, courseId, chapterIndex, passed });

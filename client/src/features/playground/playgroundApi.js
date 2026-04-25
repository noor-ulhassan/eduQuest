import api from "../auth/authApi.js";

const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (key, fetcher) => {
  if (CACHE.has(key)) {
    const { data, timestamp } = CACHE.get(key);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  const data = await fetcher();
  CACHE.set(key, { data, timestamp: Date.now() });
  return data;
};

/**
 * Get all playground progress for the authenticated user
 */
export const getPlaygroundProgress = async () => {
  return fetchWithCache("progress_all", async () => {
    const response = await api.get("/playground/progress");
    return response.data;
  });
};

/**
 * Get progress for a specific language
 */
export const getLanguageProgress = async (language) => {
  return fetchWithCache(`progress_${language}`, async () => {
    const response = await api.get(`/playground/progress/${language}`);
    return response.data;
  });
};

/**
 * Fetch the problem curriculum for a specific language
 * @param {string} language - "html" | "css" | "javascript" etc.
 */
export const getCurriculum = async (language) => {
  return fetchWithCache(`curriculum_${language}`, async () => {
    const response = await api.get(`/curriculum/${language}`);
    return response.data;
  });
};

/**
 * Fetch curriculum metadata (total problems) for all languages
 */
export const getCurriculumsMetadata = async () => {
  return fetchWithCache("curriculum_metadata", async () => {
    const response = await api.get("/curriculum/metadata");
    return response.data;
  });
};

// ==========================================
// ADMIN CURRICULUM ROUTES
// ==========================================

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
 * Server determines XP from its own problem registry.
 * @param {string} language - playground language
 * @param {string} problemId - unique problem identifier
 */
export const completeProblem = async (language, problemId) => {
  const response = await api.post("/playground/complete", {
    language,
    problemId,
  });
  return response.data;
};

import api from "../auth/authApi.js";

// ── Student API ───────────────────────────────────────────

export const getPublishedCourses = async () => {
  const res = await api.get("/ai/courses");
  return res.data.courses;
};

export const enrollInCourse = async (courseId) => {
  const res = await api.post("/ai/enroll-course", { courseId });
  return res.data.enrollment;
};

export const getEnrollmentStatus = async (courseId) => {
  const res = await api.get(`/ai/enrollment-status?courseId=${courseId}`);
  return res.data.enrollment;
};

export const getUserEnrollments = async () => {
  const res = await api.get("/ai/user-enrollments");
  return res.data.enrolledCourses;
};

export const generateChapterContent = async (courseId, chapter, index) => {
  const res = await api.post("/ai/generate-chapter-content", { courseId, chapter, index });
  return res.data;
};

export const markChapterCompleted = async (enrollmentId, chapterName) => {
  const res = await api.post("/ai/mark-chapter-completed", { enrollmentId, chapterName });
  return res.data.enrollment;
};

export const generateFlashcards = async (courseId, chapterIndex) => {
  const res = await api.post("/ai/generate-flashcards", { courseId, chapterIndex });
  return res.data.flashcards;
};

export const courseMentorChat = async (courseId, chapterIndex, message, history) => {
  const res = await api.post("/ai/course-mentor-chat", { courseId, chapterIndex, message, history });
  return res.data.reply;
};

// ── Admin API ─────────────────────────────────────────────

export const getAdminCourses = async () => {
  const res = await api.get("/ai/courses");
  return res.data.courses;
};

export const generateCourse = async (formData) => {
  const res = await api.post("/ai/generate-course", formData);
  return res.data;
};

export const publishCourse = async (courseId) => {
  const res = await api.patch(`/ai/course/${courseId}/publish`);
  return res.data.course;
};

export const deleteCourse = async (courseId) => {
  await api.delete(`/ai/course/${courseId}`);
};

export const getCourseById = async (courseId) => {
  const res = await api.get(`/ai/get-course/${courseId}`);
  return res.data.course;
};

export const updateCourseChapter = async (courseId, index, chapterData) => {
  await api.put(`/ai/course/${courseId}/chapter`, { index, chapterData });
};

export const updateCourseMetadata = async (courseId, metadata) => {
  const res = await api.put(`/ai/course/${courseId}/metadata`, metadata);
  return res.data.course;
};

export const aiEditTopic = async (courseId, { chapterIndex, topicIndex, context }) => {
  const res = await api.post(`/ai/course/${courseId}/topic/ai-edit`, {
    chapterIndex, topicIndex, context,
  });
  return res.data.topic;
};

// ── Chapter Block API ─────────────────────────────────────

export const getChaptersByCourse = async (courseId) => {
  const res = await api.get(`/chapters/${courseId}`);
  return res.data.chapters;
};

export const updateChapter = async (chapterId, data) => {
  const res = await api.put(`/chapters/${chapterId}`, data);
  return res.data.chapter;
};

export const removeBlock = async (chapterId, blockId) => {
  const res = await api.delete(`/chapters/${chapterId}/blocks/${blockId}`);
  return res.data.chapter;
};

export const reorderBlocks = async (chapterId, blockIds) => {
  const res = await api.put(`/chapters/${chapterId}/reorder`, { blockIds });
  return res.data.chapter;
};


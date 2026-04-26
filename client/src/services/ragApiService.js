import api from "@/features/auth/authApi";

export const chatApi = {
  sendMessage: async ({ message, history = [], documentId }) => {
    const res = await api.post("/ai/rag/chat", {
      message,
      history,
      documentId,
    });
    return res.data;
  },
};

export const quizApi = {
  generate: async ({ topic, documentId } = {}) => {
    const res = await api.post("/ai/rag/quiz/generate", { topic, documentId });
    return res.data;
  },
};

export const explainApi = {
  explain: async ({ selectedText, page, documentId }) => {
    const res = await api.post("/ai/rag/explain", {
      selectedText,
      page,
      documentId,
    });
    return res.data;
  },
};

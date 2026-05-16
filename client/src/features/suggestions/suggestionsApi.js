import api from "../auth/authApi.js";

export const getSuggestion = (force = false) =>
  api.get(`/suggestions/current${force ? "?force=true" : ""}`);

export const markSuggestionActed = () => api.post("/suggestions/acted");

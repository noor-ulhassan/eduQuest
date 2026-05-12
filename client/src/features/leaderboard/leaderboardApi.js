import api from "../auth/authApi.js";

// Note: the axios instance already unwraps res.data via interceptor,
// so api.get() returns the parsed JSON body directly.

export const getGlobalLeaderboard = async () =>
  api.get("/leaderboard/global");

export const getPlaygroundLeaderboard = async () =>
  api.get("/leaderboard/playground");

export const getCompetitionLeaderboard = async () =>
  api.get("/leaderboard/competition");

export const getLearnerLeaderboard = async () =>
  api.get("/leaderboard/learner");

export const getWeeklyLeaderboard = async () =>
  api.get("/leaderboard/weekly");

// src/lib/tokenService.js
let accessToken = null;

export const tokenService = {
  get: () => accessToken,
  set: (token) => (accessToken = token),
  clear: () => (accessToken = null),
};

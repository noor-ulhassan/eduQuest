// src/features/api/authApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, // needed for refresh token in cookie
});


export default api;

// src/features/api/authApi.js
import axios from "axios";
import store from "@/store/store"; // your redux store
import { loginSuccess, logout } from "../auth/authSlice";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1/user",
  withCredentials: true, // needed for refresh token in cookie
});

// Add interceptor to handle expired access token
api.interceptors.response.use(
  response => response, // if success, just return
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite loop
      try {
        // Call refresh endpoint
        const res = await axios.get("http://localhost:8080/api/v1/user/refresh-token", {
          withCredentials: true,
        });

        // Update access token in redux
        store.dispatch(loginSuccess({
          user: store.getState().auth.user, // keep user same
          accessToken: res.data.accessToken,
        }));

        // Update access token in headers and retry original request
        originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // refresh failed → logout
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

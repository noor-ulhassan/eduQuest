// src/features/api/authApi.js
import axios from "axios";
import store from "@/store/store"; // your redux store
import { authSuccess, authLogout } from "../auth/authSlice";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, // needed for refresh token in cookie
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    // If token exists, attach it to headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// Add interceptor to handle expired access token
api.interceptors.response.use(
  (response) => response, // if success, just return
  async (error) => {
    const originalRequest = error.config;

    // ❌ If refresh itself failed, logout immediately
    // if (originalRequest.url.includes("/auth/refresh-token")) {
    //   store.dispatch(authLogout());
    //   return Promise.reject(error);
    // }

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/refresh-token")) {
      originalRequest._retry = true; // prevent infinite loop
      try {
        // Call refresh endpoint
        const res = await api.post("/auth/refresh-token");
        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        // Update access token in headers and retry original request
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // refresh failed → logout
        localStorage.removeItem("accessToken");
        store.dispatch(authLogout());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

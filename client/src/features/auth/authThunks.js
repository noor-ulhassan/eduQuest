import api from "./authApi.js";
import { authLoading, authSuccess, authLogout } from "./authSlice";

export const initializeAuth = () => async (dispatch) => {
  dispatch(authLoading());
  const token = localStorage.getItem("accessToken");

  if (!token) {
    dispatch(authLogout());
    return;
  }
  try {
    const res = await api.post("/user/getUser");
    console.log("initializeAuth:", res.data.user);
    dispatch(
      authSuccess({
        user: res.data.user,
      })
    );
    console.log("Auth initialized successfully");
  } catch {
    localStorage.removeItem("accessToken");
    dispatch(authLogout());
  }
};

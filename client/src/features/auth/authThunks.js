import api from "./authApi.js";
import { authLoading, authSuccess, authLogout } from "./authSlice";

export const initializeAuth = () => async (dispatch) => {
  dispatch(authLoading());

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
    console.log("Auth initialized: No session found");
    dispatch(authLogout());
  }
};

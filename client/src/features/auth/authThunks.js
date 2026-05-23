import api from "./authApi.js";
import {
  authLoading,
  authSuccess,
  authLogout,
  authNetworkError,
} from "./authSlice";

export const initializeAuth = () => async (dispatch) => {
  dispatch(authLoading());

  try {
    const res = await api.post("/user/getUser");
    dispatch(authSuccess({ user: res.data.user }));
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      dispatch(authLogout());
    } else {
      dispatch(authNetworkError());
    }
  }
};

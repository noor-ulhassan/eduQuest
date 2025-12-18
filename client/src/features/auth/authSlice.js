import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLoading: (state) => {
      state.status = "loading";
    },
    authSuccess: (state, action) => {
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    authLogout: (state) => {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { authLoading, authSuccess, authLogout } =
  authSlice.actions;

export default authSlice.reducer;

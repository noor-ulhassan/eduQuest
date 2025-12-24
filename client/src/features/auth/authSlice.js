// hi from old version

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
    updateUserStats: (state, action) => {
      if (state.user) {
        // This merges the new XP, Level, and Rank into your existing user state
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { authLoading, authSuccess, authLogout, updateUserStats } =
  authSlice.actions;

export default authSlice.reducer;

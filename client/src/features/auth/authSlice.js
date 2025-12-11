import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },

    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
    }
  }
});

export const { loginSuccess, logout, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;

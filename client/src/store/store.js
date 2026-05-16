import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import playgroundTaskReducer from "../features/playground/playgroundTaskSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    playgroundTask: playgroundTaskReducer,
  }
});

export default store;
window.store = store;
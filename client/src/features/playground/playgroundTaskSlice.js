import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTask: null,
  output: "",
  isRunning: false,
  testResults: [],
};

const playgroundTaskSlice = createSlice({
  name: "playgroundTask",
  initialState,
  reducers: {
    setPlaygroundTask(state, action) {
      state.activeTask = action.payload;
      state.output = "";
      state.isRunning = false;
      state.testResults = [];
    },
    clearTask(state) {
      state.activeTask = null;
      state.output = "";
      state.isRunning = false;
      state.testResults = [];
    },
    setOutput(state, action) {
      state.output = action.payload;
    },
    setIsRunning(state, action) {
      state.isRunning = action.payload;
    },
    setTestResults(state, action) {
      state.testResults = action.payload;
    },
  },
});

export const { setPlaygroundTask, clearTask, setOutput, setIsRunning, setTestResults } =
  playgroundTaskSlice.actions;

export default playgroundTaskSlice.reducer;

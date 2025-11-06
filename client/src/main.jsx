import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import "./index.css";
import { appStore } from "./app/store.js";
import { Toaster } from "sonner";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={appStore}>
      <App />
      <Toaster />
    </Provider>
  </React.StrictMode>
);

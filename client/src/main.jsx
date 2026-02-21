import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import "./index.css";
import store from "./store/store.js";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="eduquest-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);

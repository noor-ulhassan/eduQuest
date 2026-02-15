import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { status, user } = useSelector((state) => state.auth);

  // While initializeAuth is running, show the spinner
  if (status === "loading" || status === "idle") {
    return <AuthLoading />;
  }
  // Hardcoded redirect path if user is not logged in
  if (status !== "authenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

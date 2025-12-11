import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Hardcoded redirect path if user is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

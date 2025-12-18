import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { status, user } = useSelector((state) => state.auth);

  // Hardcoded redirect path if user is not logged in
  if (status !== "authenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

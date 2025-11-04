import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ roles = [], children }) => {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated || !hasRole(...roles)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RoleRoute;

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ roles = [], children }) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // No autenticado: llevar a login y recordar desde dónde venía
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(...roles)) {
    // Autenticado pero sin permiso: redirigir al inicio (o productos) con marca de prohibido
    return <Navigate to="/" replace state={{ forbidden: true, from: location.pathname }} />;
  }

  return children;
};

export default RoleRoute;

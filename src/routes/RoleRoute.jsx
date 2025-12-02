import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// RoleRoute: envuelve rutas que requieren un rol específico.
// Uso en App.jsx:
// <Route path="add" element={<RoleRoute roles={["admin"]}><AddPage/></RoleRoute>} />
const RoleRoute = ({ roles = [], children }) => {
  const { user, isAuthenticated } = useAuth() || {};

  // No autenticado → al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si no se piden roles, permitir acceso
  if (!roles || roles.length === 0) return children;

  // Soporta varias formas de representar rol en el `user`
  const isAdminFlag = Boolean(user?.isAdmin || user?.admin || user?.is_admin);
  const userRole = user?.role || user?.rol || user?.userRole;

  // Regla simple para 'admin'
  if (roles.includes('admin') && isAdminFlag) return children;

  // Coincidencia por nombre de rol
  if (userRole && roles.includes(userRole)) return children;

  // Denegado → a home
  return <Navigate to="/" replace />;
};

export default RoleRoute;

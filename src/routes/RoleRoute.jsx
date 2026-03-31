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

  // Normalizar rol: admitir 'admin', 'vendedor' y 'cliente'
  const isAdminFlag = Boolean(user?.isAdmin || user?.admin || user?.is_admin);
  const rawRole = user?.role || user?.rol || user?.userRole || null;
  const normalizedRole = isAdminFlag ? 'admin' : (rawRole ? String(rawRole).toLowerCase() : 'cliente');

  // Permitir si el rol normalizado está dentro de los roles requeridos
  const wanted = roles.map(r => String(r).toLowerCase());
  if (wanted.includes(normalizedRole)) return children;

  // Denegado → a home
  return <Navigate to="/" replace />;
};

export default RoleRoute;

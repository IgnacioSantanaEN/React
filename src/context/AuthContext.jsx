import { createContext, useState, useContext } from "react";
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Rehidratar desde localStorage al cargar la app
  const [authToken, setAuthToken] = useState(() => {
    const t = localStorage.getItem("authToken") || null;
    if (t) {
      // configurar axios para enviar el header Authorization por defecto
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    }
    return t;
  });
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = (token, userData) => {
    setAuthToken(token);
    setUser(userData);
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    // establecer header por defecto para todas las solicitudes axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // quitar header por defecto
    delete axios.defaults.headers.common['Authorization'];
  };

  {/*Si usuario inicia sesion su authToken sera true*/}
  const isAuthenticated = !!authToken;

  {/*Verifica si el usuario tiene alguno de los roles especificados*/}
  const hasRole = (...roles) => (user ? roles.includes(user.role) : false);

  {/*Verifica si el usuario es admin*/}
  const isAdmin = user?.role === "admin";

  {/*Proveer el contexto de autenticación a los componentes hijos*/}
  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Rehidratar desde localStorage al cargar la app
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
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
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
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
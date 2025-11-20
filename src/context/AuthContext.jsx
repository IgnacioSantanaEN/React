import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  {/* Rehidratar desde localStorage al cargar la app */}
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
  });

  {/* Rehidratar usuario desde localStorage al cargar la app */}
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
  {/*Verifica si el usuario tiene alguno de los roles especificados.
      Asumimos que el backend (Xano) ya devuelve `role` normalizado (minusculas y sin espacios).
      Aquí sólo normalizamos ligeramente los roles pasados como argumento para la comparación. */}
  const hasRole = (...roles) => {
    if (!user?.role) return false;
    const allowed = roles.map((r) => String(r).toLowerCase().trim());
    return allowed.includes(String(user.role));
  };

  {/*Verifica si el usuario es admin (comparación directa con el valor que devuelve el backend)*/}
  const isAdmin = String(user?.role) === "admin";

  {/*Proveer el contexto de autenticación a los componentes hijos*/}
  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
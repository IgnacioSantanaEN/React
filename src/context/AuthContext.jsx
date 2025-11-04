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

  // Helpers de estado/rol para usar en UI y rutas
  const isAuthenticated = !!authToken;
  const getNormalizedRole = () => (user?.role ? String(user.role).toLowerCase().trim() : "");
  const hasRole = (...roles) => {
    const current = getNormalizedRole();
    const normalizedTargets = roles.map(r => String(r).toLowerCase().trim());
    return normalizedTargets.includes(current);
  };
  // Admitimos sinónimos comunes por si el backend usa otro idioma/etiqueta
  const isAdmin = (() => {
    const r = getNormalizedRole();
    return r === "admin" || r === "administrator" || r === "administrador";
  })();

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
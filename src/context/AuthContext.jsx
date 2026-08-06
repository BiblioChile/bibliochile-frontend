import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api.js";
import { peekAnonymousUuid } from "../utils/anonymousId";

const AuthContext = createContext(null);

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = async (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    // Si el lector tenía progreso guardado como anónimo, se migra a su
    // cuenta recién iniciada. Best-effort: si falla, no bloquea el login.
    // El token ya quedó en localStorage arriba, así que el interceptor de
    // `api` lo manda solo en el header Authorization.
    const anonymousUuid = peekAnonymousUuid();
    if (anonymousUuid) {
      try {
        await api.post("/progress/sync", { anonymousUuid });
      } catch {
        // La sincronización es best-effort: el login ya se completó igual.
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isAuthenticated: !!token, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
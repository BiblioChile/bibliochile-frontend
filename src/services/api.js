import axios from "axios";

// Instancia central de axios: todas las peticiones al backend pasan por acá
// en vez de armar `${import.meta.env.VITE_API_URL}/api/...` y el header
// Authorization a mano en cada vista.
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Adjunta el token a cada request si hay sesión iniciada. Lee directo de
// localStorage (en vez de depender de AuthContext) para que también
// funcione fuera de componentes React, sin crear una dependencia circular.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

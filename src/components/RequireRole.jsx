import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Gatea una vista a un rol específico. El backend igual rechaza con 403,
// pero la UI no debería ni mostrar el intento (ver env/prompt-frontend-sprint3.md).
// Mientras se resuelve la sesión no renderiza nada, para evitar el parpadeo
// del contenido protegido antes de redirigir.
const RequireRole = ({ role, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== role) {
      navigate("/");
    }
  }, [loading, isAuthenticated, user, role]);

  if (loading || !isAuthenticated || user?.role !== role) return null;

  return children;
};

export default RequireRole;

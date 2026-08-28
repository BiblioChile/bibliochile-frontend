import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LogoutIcon } from "./icons.jsx";

// Sub-navegación compartida entre AdminPanel.jsx y AdminAutores.jsx — antes
// eran dos islas sin ninguna conexión entre sí, solo alcanzables escribiendo
// la URL a mano.
const ADMIN_LINKS = [
  { label: "Catálogo y QR", path: "/admin/panel" },
  { label: "Autores pendientes", path: "/admin/autores" },
];

const AdminSubNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <div className="d-flex justify-content-between align-items-center px-3 pt-2">
      <div className="d-flex gap-2">
        {ADMIN_LINKS.map(({ label, path }) => (
          <button
            key={path}
            className={pathname === path ? "bc-btn-primary" : "bc-btn-secondary"}
            style={{ fontSize: "0.78rem", padding: "0.4rem 0.9rem" }}
            onClick={() => navigate(path)}
            disabled={pathname === path}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        className="bc-logout-link"
        onClick={() => {
          // Admin no tenía ninguna forma de cerrar sesión (env/prompt_batch_ux.md,
          // punto 1) — los demás roles sí. Mismo orden navigate-luego-logout que
          // DashboardAutor.jsx: navega primero para que este componente (bajo
          // RequireRole) se desmonte antes de que logout() ponga isAuthenticated
          // en false, si no el useEffect de RequireRole todavía montado redirige
          // a /login, pisando esta navegación.
          navigate("/");
          setTimeout(logout, 0);
        }}
      >
        <LogoutIcon />
        Cerrar sesión
      </button>
    </div>
  );
};

export default AdminSubNav;

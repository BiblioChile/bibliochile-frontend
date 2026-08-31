import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { LogoutIcon } from "../components/icons.jsx";

const initials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

// Landing propia para el rol "autor" — antes no existía ningún punto de
// entrada visible hacia SubirObra.jsx/EstadisticasAutor.jsx, solo llegando
// a mano por URL. Vista separada de DashboardPasajero (no ramas por rol
// ahí) para no mezclar conceptos de pasajero (suscripción, historial de
// lectura) con los de autor.
const DashboardAutor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <RequireRole role="autor">
      <div className="bc-page">
        <AppNavbar />

        <Container fluid className="px-3 py-3">
          <div className="bc-profile-header">
            <div className="bc-avatar">{initials(user?.name)}</div>
            <div className="flex-grow-1">
              <h2 className="bc-section-title mb-0">Mi dashboard</h2>
              <p className="bc-books-label mb-0">Hola, {user?.name}</p>
            </div>
            <button
              className="bc-logout-link"
              onClick={() => {
                // navigate("/") primero para que la ruta cambie y este
                // componente (envuelto en RequireRole) se desmonte antes de
                // que logout() ponga isAuthenticated en false — si no, el
                // useEffect de RequireRole todavía montado ve la sesión
                // caída y redirige a /login, pisando esta navegación.
                navigate("/");
                setTimeout(logout, 0);
              }}
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>

          <h3 className="bc-section-title" style={{ fontSize: "0.9rem" }}>Gestión de autor</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              className="bc-card p-3"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/autor/subir-obra")}
            >
              <div className="bc-card-title">Subir obra</div>
              <div className="bc-card-subtitle">Publica una nueva obra para revisión</div>
            </div>

            <div
              className="bc-card p-3"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/autor/estadisticas")}
            >
              <div className="bc-card-title">Mis estadísticas</div>
              <div className="bc-card-subtitle">Lectores, progreso promedio y arriendos</div>
            </div>
          </div>
        </Container>

        <BottomNav />
      </div>
    </RequireRole>
  );
};

export default DashboardAutor;

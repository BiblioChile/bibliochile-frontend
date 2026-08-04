import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container } from "react-bootstrap";

const DashboardPasajero = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="bc-page">
      <div className="bc-navbar px-3 py-2">
        <span className="bc-navbar-brand">BiblioChile</span>
      </div>

      <Container fluid className="px-3 py-3">
        <h2 className="bc-section-title">Mi Dashboard</h2>
        <p className="bc-books-label">Hola, {user?.name}</p>

        <button
          className="bc-btn-primary w-100 mb-2"
          onClick={() => navigate("/subscription")}
        >
          Mi suscripción
        </button>

        <button
          className="bc-btn-secondary w-100"
          onClick={() => { logout(); navigate("/"); }}
        >
          Cerrar sesión
        </button>
      </Container>

      <div className="bc-bottom-nav d-flex justify-content-around">
        <div className="bc-nav-item" onClick={() => navigate("/")}>Inicio</div>
        <div className="bc-nav-item active">Perfil</div>
      </div>
    </div>
  );
};

export default DashboardPasajero;
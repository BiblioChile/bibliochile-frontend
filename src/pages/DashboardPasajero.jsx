import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Spinner } from "react-bootstrap";
import BookCard from "../components/BookCard.jsx";
import { fetchContinueReading } from "../utils/progress.js";

const DashboardPasajero = () => {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const loadHistory = async () => {
      try {
        const data = await fetchContinueReading(token);
        setHistory(data);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [token]);

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

      <Container fluid className="px-3 pb-4">
        <h2 className="bc-section-title">Historial de lectura</h2>

        {historyLoading && (
          <div className="bc-loading">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando historial...
          </div>
        )}

        {!historyLoading && history.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--ivory-dim)" }}>
            Todavía no tienes libros con progreso guardado.
          </p>
        )}

        {!historyLoading && history.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {history.map((item) => (
              <BookCard
                key={item.bookId}
                book={item.book}
                progress={item.progressPercentage}
                onClick={() => navigate(`/reader/${item.bookId}`)}
              />
            ))}
          </div>
        )}
      </Container>

      <div className="bc-bottom-nav d-flex justify-content-around">
        <div className="bc-nav-item" onClick={() => navigate("/")}>Inicio</div>
        <div className="bc-nav-item active">Perfil</div>
      </div>
    </div>
  );
};

export default DashboardPasajero;
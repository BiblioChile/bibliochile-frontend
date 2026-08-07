import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Card, Badge, Spinner, ProgressBar } from "react-bootstrap";
import BookCard from "../components/BookCard.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { LogoutIcon } from "../components/icons.jsx";
import api from "../services/api.js";
import { fetchContinueReading } from "../utils/progress.js";

const planLabel = (name) => (name === "mensual" ? "Plan Mensual" : "Plan Anual");
const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
const initials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const DashboardPasajero = () => {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  // Distingue un logout explícito (botón "Cerrar sesión") de quedar sin sesión
  // por otra vía (token expirado, acceso directo a /dashboard). Sin esta bandera,
  // el guard de abajo ve isAuthenticated en false en el mismo render batcheado
  // por logout() y redirige a /login, pisando el navigate("/") del botón.
  const [loggingOut, setLoggingOut] = useState(false);

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

  useEffect(() => {
    if (!token) return;

    const loadSubscription = async () => {
      try {
        const response = await api.get("/subscriptions/me");
        setSubscription(response.data);
      } catch {
        setSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };
    loadSubscription();
  }, [token]);

  if (!authLoading && !isAuthenticated && !loggingOut) {
    navigate("/login");
    return null;
  }

  return (
    <div className="bc-page">
      <AppNavbar />

      <Container fluid className="px-3 py-3">
        <div className="bc-profile-header">
          <div className="bc-avatar">{initials(user?.name)}</div>
          <div className="flex-grow-1">
            <h2 className="bc-section-title mb-0">Mi Dashboard</h2>
            <p className="bc-books-label mb-0">Hola, {user?.name}</p>
          </div>
          <button
            className="bc-logout-link"
            onClick={() => { setLoggingOut(true); logout(); navigate("/"); }}
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>

        <h3 className="bc-section-title" style={{ fontSize: "0.9rem" }}>Mi suscripción</h3>

        {subscriptionLoading && (
          <div className="bc-loading mb-2">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando...
          </div>
        )}

        {!subscriptionLoading && subscription?.active && (
          <Card className="bc-status-card border-0 mb-3">
            <div className="bc-status-row">
              <div className="bc-status-name">{planLabel(subscription.plan_name)}</div>
              <Badge className="bc-badge-active">ACTIVA</Badge>
            </div>
            <div className="bc-books-label">Vence el {formatDate(subscription.end_date)}</div>
            <div className="bc-books-label">
              Libros usados: {subscription.rentals_used} de {subscription.max_rentals}
            </div>
            <ProgressBar
              className="bc-progress"
              now={(subscription.rentals_used / subscription.max_rentals) * 100}
            />
          </Card>
        )}

        {!subscriptionLoading && !subscription?.active && (
          <div className="mb-3">
            <p style={{ fontSize: "0.85rem", color: "var(--ivory-dim)" }}>
              No tienes una suscripción activa.
            </p>
            <button
              className="bc-btn-primary w-100"
              onClick={() => navigate("/subscription")}
            >
              Elegir un plan
            </button>
          </div>
        )}
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

      <BottomNav />
    </div>
  );
};

export default DashboardPasajero;
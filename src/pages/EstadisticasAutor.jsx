import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import api from "../services/api.js";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const formatProgress = (value) => `${Math.round(value ?? 0)}%`;

// GET /authors/me/stats devuelve { totalBooks, totalReaders,
// avgProgressPercentage, totalRentals } — sin desglose por obra (el mockup
// lo mostraba, pero el backend no lo expone hoy).
const EstadisticasAutor = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // RequireRole ya redirige sin sesión/rol, pero el fetch se dispara desde
    // este mismo componente: hay que esperar a que la sesión esté resuelta
    // para no pegarle al backend antes de saber si corresponde.
    if (authLoading || !isAuthenticated || user?.role !== "autor") return;

    const fetchStats = async () => {
      try {
        const response = await api.get("/authors/me/stats");
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message ?? "Error al cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authLoading, isAuthenticated, user]);

  return (
    <RequireRole role="autor">
      <div className="bc-page">
        <AppNavbar />

        <div className="px-3 py-3">
          <h2 className="bc-section-title">Mis estadísticas</h2>

          {loading && (
            <div className="bc-loading">
              <Spinner animation="border" size="sm" className="me-2" />
              Cargando...
            </div>
          )}

          {error && <div className="bc-error">{error}</div>}

          {!loading && !error && stats && (
            <div className="bc-metrics-grid">
              <div className="bc-metric-card bc-metric-wine">
                <div className="bc-metric-val">{stats.totalReaders ?? 0}</div>
                <div className="bc-metric-label">Lectores únicos</div>
              </div>
              <div className="bc-metric-card">
                <div className="bc-metric-val">{formatProgress(stats.avgProgressPercentage)}</div>
                <div className="bc-metric-label">Progreso promedio de lectura</div>
              </div>
              <div className="bc-metric-card">
                <div className="bc-metric-val">{stats.totalRentals ?? 0}</div>
                <div className="bc-metric-label">Arriendos vía suscripción</div>
              </div>
              <div className="bc-metric-card">
                <div className="bc-metric-val">{stats.totalBooks ?? 0}</div>
                <div className="bc-metric-label">Obras publicadas</div>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </RequireRole>
  );
};

export default EstadisticasAutor;

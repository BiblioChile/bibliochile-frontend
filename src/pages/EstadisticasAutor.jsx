import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api.js";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const formatProgress = (value) => `${Math.round(value ?? 0)}%`;

// Tooltip propio en vez del default de recharts, para que respete la
// paleta del sitio (fondo --surface, texto --ivory) en vez del blanco
// default, que desentona contra el resto de bc-page.
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(247,244,236,0.15)",
        borderRadius: "8px",
        padding: "0.5rem 0.75rem",
        fontSize: "0.78rem",
        color: "var(--ivory)",
      }}
    >
      {name}: <strong>{value}</strong>
    </div>
  );
};

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

          {/* Complementa (no reemplaza) los números de arriba con un
              gráfico de barras simple — sugerencia del profesor
              (env/prompt_frontend_ajustes.md, punto 3). Solo lectores y
              arriendos, no los 3 valores literales del pedido original:
              mezclar conteos (personas, arriendos) con un porcentaje
              (progreso promedio) en el mismo eje habría sido engañoso —
              la barra de progreso ya se lee bien como número solo, arriba. */}
          {!loading && !error && stats && (
            <div className="mt-4">
              <h3 className="bc-section-title" style={{ fontSize: "0.85rem" }}>
                Lectores y arriendos
              </h3>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { name: "Lectores únicos", value: stats.totalReaders ?? 0 },
                      { name: "Arriendos vía suscripción", value: stats.totalRentals ?? 0 },
                    ]}
                    margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid vertical={false} stroke="rgba(247,244,236,0.12)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--ivory-dim)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(247,244,236,0.12)" }}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(247,244,236,0.06)" }} />
                    <Bar dataKey="value" fill="var(--wine)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
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

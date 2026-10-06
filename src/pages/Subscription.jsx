import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";
import { Container, Card, Button, Badge, Spinner, Alert, ProgressBar } from "react-bootstrap";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";

const Subscription = () => {
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, plansRes] = await Promise.all([
        api.get("/subscriptions/me"),
        api.get("/subscriptions/plans"),
      ]);

      setActiveSubscription(subRes.data);
      setPlans(plansRes.data);
    } catch {
      setError("Error al cargar la información de suscripción");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [authLoading, isAuthenticated]);

  const hasActiveSubscription = !!activeSubscription?.active;

  const handlePago = async () => {
    if (!selectedPlanId) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Con una suscripción activa, "contratar" es en realidad "cambiar de
      // plan": PATCH /subscriptions cancela la vigente y activa la nueva de
      // inmediato, sin prorrateo (env/prompt_cambio_plan_suscripcion.md).
      // Único error a manejar aparte del genérico: 404 "Plan no encontrado"
      // (plan eliminado entre que se cargó la lista y el clic) — el mensaje
      // real del backend ya cubre ese caso, no hace falta un mensaje aparte.
      if (hasActiveSubscription) {
        await api.patch("/subscriptions", { planId: selectedPlanId });
      } else {
        await api.post("/subscriptions", { planId: selectedPlanId });
      }
      setSelectedPlanId(null);
      await fetchData(); // refresca el estado actual tras contratar/cambiar
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ??
          (hasActiveSubscription ? "Error al cambiar de plan" : "Error al procesar el pago")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const planLabel = (name) => (name === "mensual" ? "Plan Mensual" : "Plan Anual");
  const formatPrice = (price) => `$${Number(price).toLocaleString("es-CL")}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="bc-page">

      {/* Header */}
      <AppNavbar />

      <Container fluid className="px-3 py-3">
        <h2 className="bc-section-title">Suscripción</h2>

        {loading && (
          <div className="bc-loading">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando...
          </div>
        )}

        {error && <div className="bc-error">{error}</div>}

        {!loading && !error && (
          <>
            {/* Estado actual */}
            {activeSubscription?.active && (
              <div className="mb-4">
                <h3 className="bc-section-title" style={{ fontSize: "0.9rem" }}>Estado actual</h3>
                <Card className="bc-status-card border-0">
                  <div className="bc-status-row">
                    <div className="bc-status-name">{planLabel(activeSubscription.plan_name)}</div>
                    <Badge className="bc-badge-active">ACTIVA</Badge>
                  </div>
                  <div className="bc-books-label">
                    Vence el {formatDate(activeSubscription.end_date)}
                  </div>
                  <div className="bc-books-label">
                    Libros usados: {activeSubscription.rentals_used} de {activeSubscription.max_rentals}
                  </div>
                  <ProgressBar
                    className="bc-progress"
                    now={(activeSubscription.rentals_used / activeSubscription.max_rentals) * 100}
                  />
                </Card>
              </div>
            )}

            {/* Con una suscripción activa, el selector reaparece como
                "Cambiar de plan" — antes esta sección desaparecía por
                completo mientras hubiera una activa, así que no había forma
                de pasar de mensual a anual (o viceversa) sin esperar a que
                venciera (env/prompt_frontend_ajustes.md, punto 4). El plan
                actual se excluye de las opciones: no tiene sentido
                "cambiar" al mismo plan que ya se tiene. */}
            {(() => {
              const selectablePlans = hasActiveSubscription
                ? plans.filter((plan) => plan.name !== activeSubscription.plan_name)
                : plans;

              return (
                <>
                  <div className="mb-3">
                    <h3 className="bc-section-title" style={{ fontSize: "0.9rem" }}>
                      {hasActiveSubscription ? "Cambiar de plan" : "Elige tu plan"}
                    </h3>
                    {hasActiveSubscription && (
                      <p style={{ fontSize: "0.78rem", color: "var(--ivory-dim)" }}>
                        Al cambiar, tu plan actual se cancela y el nuevo queda activo de
                        inmediato — no se prorratean los días restantes.
                      </p>
                    )}
                    <div className="bc-plans-list">
                      {selectablePlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`bc-plan-card ${selectedPlanId === plan.id ? "selected" : ""}`}
                          onClick={() => setSelectedPlanId(plan.id)}
                        >
                          <div>
                            <div className="bc-plan-name">{planLabel(plan.name)}</div>
                            <div className="bc-plan-detail">
                              Hasta {plan.max_rentals} libros · {plan.duration_days} días
                            </div>
                          </div>
                          <div className="bc-plan-price">
                            {formatPrice(plan.price)}{" "}
                            <span>{plan.name === "mensual" ? "/mes" : "/año"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {submitError && <Alert variant="danger" style={{ fontSize: "0.82rem" }}>{submitError}</Alert>}

                  <Button
                    className="bc-btn-primary w-100 mb-2"
                    disabled={!selectedPlanId || submitting}
                    onClick={handlePago}
                  >
                    {submitting
                      ? "Procesando..."
                      : hasActiveSubscription
                        ? "Cambiar de plan"
                        : "Pago"}
                  </Button>
                </>
              );
            })()}
          </>
        )}
      </Container>

      <BottomNav />
    </div>
  );
};

export default Subscription;
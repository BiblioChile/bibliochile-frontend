import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { Container, Spinner } from "react-bootstrap";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/subscriptions/plans");
        setPlans(response.data);
      } catch {
        setError("Error al cargar los planes");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const planLabel = (name) => (name === "mensual" ? "Plan Mensual" : "Plan Anual");
  const formatPrice = (price) => `$${Number(price).toLocaleString("es-CL")}`;

  return (
    <div className="bc-page">
      <div className="bc-navbar px-3 py-2">
        <span className="bc-navbar-brand">BiblioChile</span>
      </div>

      <Container fluid className="px-3 py-3">
        <h2 className="bc-section-title">Nuestros planes</h2>

        {loading && (
          <div className="bc-loading">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando...
          </div>
        )}

        {error && <div className="bc-error">{error}</div>}

        {!loading && !error && (
          <div className="bc-plans-list mb-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bc-plan-card">
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
        )}

        <button className="bc-btn-primary w-100" onClick={() => navigate("/login")}>
          Iniciar sesión para suscribirte
        </button>
      </Container>

      <div className="bc-bottom-nav d-flex justify-content-around">
        <div className="bc-nav-item" onClick={() => navigate("/")}>Inicio</div>
        <div className="bc-nav-item active">Planes</div>
      </div>
    </div>
  );
};

export default Plans;
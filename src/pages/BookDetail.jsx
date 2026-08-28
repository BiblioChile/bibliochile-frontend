import { useState, useEffect } from "react";
import api from "../services/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [renting, setRenting] = useState(false);
  const [rentalError, setRentalError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data);
      } catch {
        setError("Libro no encontrado");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Solo importa la suscripción cuando el libro no es gratis — evita una
  // petición innecesaria para el catálogo de dominio público.
  useEffect(() => {
    if (authLoading || !book || book.is_free) return;
    if (!isAuthenticated) {
      setHasActiveSubscription(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await api.get("/subscriptions/me");
        setHasActiveSubscription(!!response.data?.active);
      } catch {
        setHasActiveSubscription(false);
      }
    };
    fetchSubscription();
  }, [authLoading, isAuthenticated, book]);

  const handleLeer = async () => {
    if (!book.is_free && !hasActiveSubscription) {
      navigate("/plans", {
        state: { reason: "Necesitas una suscripción activa para leer este libro." },
      });
      return;
    }

    if (book.is_free) {
      navigate(`/reader/${id}`);
      return;
    }

    setRentalError(null);
    setRenting(true);
    try {
      // El backend valida bookId con Zod como number; useParams siempre
      // entrega string, así que hay que convertirlo antes de enviarlo.
      await api.post("/rentals", { bookId: Number(id) });
      navigate(`/reader/${id}`);
    } catch (err) {
      setRentalError(err.response?.data?.message ?? "No se pudo iniciar la lectura");
    } finally {
      setRenting(false);
    }
  };

  if (loading) return (
    <div className="bc-page">
      <AppNavbar />
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--ivory-dim)" }}>
        Cargando...
      </div>
      <BottomNav />
    </div>
  );

  if (error) return (
    <div className="bc-page">
      <AppNavbar />
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--wine)" }}>
        {error}
      </div>
      <BottomNav />
    </div>
  );

  const puedeLeer = book.is_free || hasActiveSubscription;

  return (
    <div className="bc-page">
      <AppNavbar />
      <div
        onClick={() => navigate(-1)}
        style={{ padding: "1rem 1.25rem", fontSize: "0.8rem", color: "var(--ivory-dim)", cursor: "pointer" }}
      >
        Volver al catálogo
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1.25rem 1.5rem", gap: "1rem" }}>
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt={book.title}
            style={{ width: "150px", height: "210px", borderRadius: "12px", objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          />
        )}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.2 }}>
            {book.title}
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--ivory-dim)", marginTop: "0.3rem" }}>
            {book.author}
          </p>
          {book.is_free ? (
            <span className="bc-badge-free" style={{ display: "inline-block", marginTop: "0.6rem" }}>
              GRATIS
            </span>
          ) : (
            <span className="bc-badge-active" style={{ display: "inline-block", marginTop: "0.6rem" }}>
              SUSCRIPCIÓN
            </span>
          )}
        </div>
      </div>

      {book.description && (
        <div style={{ padding: "0 1.25rem 1.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ivory-dim)", marginBottom: "0.5rem" }}>
            Descripcion
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "rgba(247,244,236,0.85)" }}>
            {book.description}
          </p>
        </div>
      )}

      {book.content_url && (
        <div style={{ padding: "0 1.25rem 2rem" }}>
          {!puedeLeer && (
            <p style={{ fontSize: "0.8rem", color: "var(--gold)", marginBottom: "0.6rem", textAlign: "center" }}>
              Este libro requiere una suscripción activa.
            </p>
          )}

          {rentalError && (
            <p style={{ fontSize: "0.8rem", color: "var(--wine)", marginBottom: "0.6rem", textAlign: "center" }}>
              {rentalError}
            </p>
          )}

          <button
            onClick={handleLeer}
            disabled={renting}
            style={{
              display: "block",
              width: "100%",
              padding: "1rem",
              background: "var(--wine)",
              color: "var(--ivory)",
              border: "none",
              borderRadius: "10px",
              fontFamily: "var(--font-ui)",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: renting ? "default" : "pointer",
              opacity: renting ? 0.7 : 1,
            }}
          >
            {renting ? "Procesando..." : puedeLeer ? "Comenzar a leer" : "Suscribirme para leer"}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default BookDetail;

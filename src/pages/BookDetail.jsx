import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books/${id}`);
        setBook(response.data);
      } catch {
        setError("Libro no encontrado");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--ivory-dim)" }}>
      Cargando...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--wine)" }}>
      {error}
    </div>
  );

  return (
    <div style={{ maxWidth: "430px", margin: "0 auto", minHeight: "100vh" }}>
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
          <span style={{
            display: "inline-block",
            marginTop: "0.6rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "50px",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "var(--gold)",
            border: "1px solid var(--gold)",
            background: "rgba(201,169,110,0.15)"
          }}>
            GRATIS
          </span>
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
          <a
            href={book.content_url}
            target="_blank"
            rel="noopener noreferrer"
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
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Comenzar a leer
          </a>
        </div>
      )}
    </div>
  );
};

export default BookDetail;

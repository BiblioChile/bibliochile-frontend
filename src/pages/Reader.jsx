import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/books/${id}`
        );
        setBook(response.data);
      } catch {
        setError("No se pudo cargar el libro");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--ivory-dim)" }}>
      Cargando libro...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--wine)" }}>
      {error}
    </div>
  );

  return (
    <div style={{ maxWidth: "430px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        background: "var(--surface)",
        padding: "1rem 1.25rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <span
          onClick={() => navigate(-1)}
          style={{ fontSize: "0.8rem", color: "var(--ivory-dim)", cursor: "pointer" }}
        >
          ← Volver
        </span>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.95rem",
          fontWeight: 600,
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {book.title}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--ivory-dim)" }}>
          {book.author}
        </span>
      </div>

      {/* Contenido del libro — iframe de Gutenberg */}
      {book.content_url ? (
        <iframe
          src={book.content_url}
          style={{
            flex: 1,
            border: "none",
            width: "100%",
            minHeight: "calc(100vh - 120px)",
            background: "var(--ivory)",
          }}
          title={book.title}
        />
      ) : (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ivory-dim)",
          fontSize: "0.85rem",
          padding: "2rem",
          textAlign: "center",
        }}>
          Este libro no tiene contenido disponible en línea.
          <br /><br />
          <a
            href={`https://www.gutenberg.org/ebooks/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--gold)", textDecoration: "none" }}
          >
            Ver en Project Gutenberg →
          </a>
        </div>
      )}

      {/* Barra de progreso inferior */}
      <div style={{
        background: "var(--surface)",
        padding: "0.75rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        position: "sticky",
        bottom: 0,
      }}>
        <div style={{
          flex: 1,
          height: "3px",
          background: "rgba(247,244,236,0.15)",
          borderRadius: "3px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: "0%",
            background: "var(--wine)",
            borderRadius: "3px",
          }} />
        </div>
        <span style={{ fontSize: "0.72rem", color: "var(--ivory-dim)", flexShrink: 0 }}>
          0%
        </span>
      </div>
    </div>
  );
};

export default Reader;
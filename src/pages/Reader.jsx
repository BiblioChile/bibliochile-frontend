import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";
import { getAnonymousUuid } from "../utils/anonymousId";

// El content_url apunta a Gutenberg (un solo documento, sin paginación real),
// así que el progreso se aproxima por tiempo transcurrido dentro del lector.
// 20 minutos como estimación MVP de "libro completo" — ajustable a futuro.
const ESTIMATED_READING_SECONDS = 20 * 60;
const PROGRESS_SAVE_INTERVAL_MS = 15000;

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef(Date.now());
  const progressRef = useRef(0);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data);
      } catch {
        setError("No se pudo cargar el libro");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    const saveProgress = async (currentProgress) => {
      try {
        await api.post("/progress", {
          // useParams() siempre da string — el schema Zod de POST /progress
          // exige bookId numérico y no coacciona strings, así que sin este
          // Number() cada guardado fallaba con 422 en silencio (el catch de
          // abajo lo trata como best-effort) y el progreso nunca se guardaba
          // (env/prompt_investigar_regresiones.md, punto 1; mismo fix que ya
          // usa BookDetail.jsx al llamar a POST /rentals).
          bookId: Number(id),
          progressPercentage: currentProgress,
          lastPosition: `${currentProgress}%`,
          ...(!token && { anonymousUuid: getAnonymousUuid() }),
        });
      } catch {
        // El guardado de progreso es best-effort: si falla, no interrumpe la lectura.
      }
    };

    if (!book) return;

    const tickInterval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const nextProgress = Math.min(
        100,
        Math.round((elapsedSeconds / ESTIMATED_READING_SECONDS) * 100)
      );
      progressRef.current = nextProgress;
      setProgress(nextProgress);
    }, 1000);

    const saveInterval = setInterval(() => {
      saveProgress(progressRef.current);
    }, PROGRESS_SAVE_INTERVAL_MS);

    return () => {
      clearInterval(tickInterval);
      clearInterval(saveInterval);
      saveProgress(progressRef.current);
    };
  }, [book, id, token]);

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
            width: `${progress}%`,
            background: "var(--wine)",
            borderRadius: "3px",
            transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: "0.72rem", color: "var(--ivory-dim)", flexShrink: 0 }}>
          {progress}%
        </span>
      </div>
    </div>
  );
};

export default Reader;
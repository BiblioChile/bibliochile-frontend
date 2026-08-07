import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";

const QRRedirect = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanQR = async () => {
      try {
        const response = await api.get(`/qr/${code}`);
        // QR válido — redirige al libro
        navigate(`/books/${response.data.gutendex_id}`, { replace: true });
      } catch (err) {
        if (err.response?.status === 404) {
          setError(err.response.data.message);
        } else {
          setError("Error al procesar el código QR");
        }
      }
    };

    scanQR();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="bc-page" style={{ display: "flex", flexDirection: "column" }}>
        <AppNavbar />

        {/* Error */}
        <div style={{ flex: 1, padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>

          <div style={{
            background: "rgba(123,16,35,0.12)",
            border: "1.5px solid rgba(123,16,35,0.35)",
            borderRadius: "16px",
            padding: "2rem 1.5rem",
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}>
            <div style={{
              width: "56px", height: "56px",
              background: "rgba(123,16,35,0.2)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem",
            }}>✕</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
              Código QR inválido
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--ivory-dim)", lineHeight: 1.6 }}>
              {error === "QR inactivo"
                ? "Este código QR está temporalmente inactivo."
                : "El código QR escaneado no corresponde a ningún libro registrado."}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%", padding: "1rem",
              background: "var(--wine)", color: "var(--ivory)",
              border: "none", borderRadius: "10px",
              fontFamily: "var(--font-ui)", fontSize: "0.88rem",
              fontWeight: 700, cursor: "pointer",
            }}
          >
            Explorar catálogo
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              width: "100%", padding: "0.85rem",
              background: "transparent", color: "var(--ivory-dim)",
              border: "1.5px solid rgba(247,244,236,0.2)", borderRadius: "10px",
              fontFamily: "var(--font-ui)", fontSize: "0.82rem", cursor: "pointer",
            }}
          >
            Volver al inicio
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Mientras redirige
  return (
    <div className="bc-page">
      <AppNavbar />
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--ivory-dim)" }}>
        Cargando libro...
      </div>
      <BottomNav />
    </div>
  );
};

export default QRRedirect;
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      maxWidth: "430px",
      margin: "0 auto",
    }}>
      <div style={{ padding: "3.5rem 2rem 2rem" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "3rem",
          fontWeight: 400,
          fontStyle: "italic",
          lineHeight: 1.15,
        }}>
          Bienvenido a BiblioChile
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--ivory-dim)", marginTop: "0.5rem" }}>
          Inicia sesión para continuar leyendo
        </p>
      </div>

      <div style={{
        background: "var(--ivory)",
        borderRadius: "28px 28px 0 0",
        flex: 1,
        padding: "2.5rem 2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              style={{
                padding: "0.82rem 1rem",
                border: "1.5px solid #d0ccc4",
                borderRadius: "10px",
                fontFamily: "var(--font-ui)",
                fontSize: "0.88rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: "0.82rem 1rem",
                border: "1.5px solid #d0ccc4",
                borderRadius: "10px",
                fontFamily: "var(--font-ui)",
                fontSize: "0.88rem",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: "0.82rem", color: "var(--wine)", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "1rem",
              background: loading ? "#ccc" : "var(--wine)",
              color: "var(--ivory)",
              border: "none",
              borderRadius: "10px",
              fontFamily: "var(--font-ui)",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.82rem", color: "#4a4a6a" }}>
          ¿No tienes cuenta?{" "}
          <a href="/registro" style={{ color: "var(--wine)", fontWeight: 600, textDecoration: "none" }}>
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
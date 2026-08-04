import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx"


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );
      //localStorage.setItem("token", response.data.token);
      //localStorage.setItem("user", JSON.stringify(response.data.user));
      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bc-page">

      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.8rem",
          fontWeight: 400,
          fontStyle: "italic",
          lineHeight: 1.15,
          color: "var(--ivory)",
        }}>
          Bienvenido a BiblioChile
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--ivory-dim)", marginTop: "0.5rem" }}>
          Inicia sesión para continuar leyendo
        </p>
      </div>

      {/* Formulario */}
      <div style={{
        background: "var(--ivory)",
        borderRadius: "28px 28px 0 0",
        minHeight: "calc(100vh - 180px)",
        padding: "2rem 1.5rem",
      }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Correo electrónico
            </Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              style={{ borderRadius: "10px", fontSize: "0.88rem", padding: "0.82rem 1rem" }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contraseña
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ borderRadius: "10px", fontSize: "0.88rem", padding: "0.82rem 1rem" }}
            />
          </Form.Group>

          {error && <Alert variant="danger" style={{ fontSize: "0.82rem" }}>{error}</Alert>}

          <Button
            type="submit"
            disabled={loading}
            className="bc-btn-primary w-100 py-3 mt-2"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </Form>

        <div style={{ textAlign: "center", fontSize: "0.82rem", color: "#4a4a6a", marginTop: "1.5rem" }}>
          ¿No tienes cuenta?{" "}
          <span
            onClick={() => navigate("/registro")}
            style={{ color: "var(--wine)", fontWeight: 600, cursor: "pointer" }}
          >
            Regístrate
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
import { useState, useEffect } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx";
import BottomNav from "../components/BottomNav.jsx";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
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
      await api.post("/auth/register", {
        name,
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al crear la cuenta");
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
          Crea tu cuenta
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--ivory-dim)", marginTop: "0.5rem" }}>
          Guarda tu progreso de lectura y accede desde cualquier dispositivo
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
          <Form.Group className="mb-3" controlId="registerName">
            <Form.Label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Nombre
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              minLength={2}
              style={{ borderRadius: "10px", fontSize: "0.88rem", padding: "0.82rem 1rem" }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
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

          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contraseña
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              style={{ borderRadius: "10px", fontSize: "0.88rem", padding: "0.82rem 1rem" }}
            />
          </Form.Group>

          {error && <Alert variant="danger" style={{ fontSize: "0.82rem" }}>{error}</Alert>}

          <Button
            type="submit"
            disabled={loading}
            className="bc-btn-primary w-100 py-3 mt-2"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </Form>

        <div style={{ textAlign: "center", fontSize: "0.82rem", color: "#4a4a6a", marginTop: "1.5rem" }}>
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "var(--wine)", fontWeight: 600, cursor: "pointer" }}
          >
            Inicia sesión
          </span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Register;

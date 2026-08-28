import { useState, useEffect } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";

// Valida formato "12.345.678-9" y el dígito verificador (módulo 11) —
// mismo algoritmo que usa el backend en author.schema.js.
const isValidRut = (rut) => {
  const clean = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expected = 11 - (sum % 11);
  const expectedDv = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);

  return dv === expectedDv;
};

// POST /authors/register requiere sesión iniciada (verifyToken) — no es un
// registro de cuenta nuevo, es una solicitud para que una cuenta pasajero ya
// existente pase a ser autor. El body solo lleva { rut, bio, declarationAccepted },
// nada de name/email/password (eso ya lo tiene la cuenta).
const RegistroAutor = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rut, setRut] = useState("");
  const [bio, setBio] = useState("");
  const [declaracionAceptada, setDeclaracionAceptada] = useState(false);
  const [error, setError] = useState(null);
  const [rutError, setRutError] = useState(null);
  const [declaracionError, setDeclaracionError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  const handleRutBlur = () => {
    if (rut && !isValidRut(rut)) {
      setRutError("RUT inválido. Ingresa tu RUT con puntos y guión (ej: 12.345.678-9)");
    } else {
      setRutError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidRut(rut)) {
      setRutError("RUT inválido. Ingresa tu RUT con puntos y guión (ej: 12.345.678-9)");
      return;
    }

    // Antes, el botón simplemente quedaba disabled sin explicar por qué —
    // el formulario "no avanzaba" sin ningún mensaje visible (env/prompt_batch_ux.md,
    // punto 3). Ahora el botón siempre es clickeable y esto da el motivo.
    if (!declaracionAceptada) {
      setDeclaracionError("Debes aceptar la declaración jurada para continuar.");
      return;
    }
    setDeclaracionError(null);

    setLoading(true);
    try {
      await api.post("/authors/register", {
        rut,
        bio: bio || undefined,
        declarationAccepted: declaracionAceptada,
      });
      navigate("/dashboard", { state: { message: "Tu solicitud será revisada por un administrador." } });
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al enviar la solicitud de registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bc-page">
      <AppNavbar />

      <div className="px-3 py-3">
        <h2 className="bc-section-title">Registro autor nacional</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--ivory-dim)", marginBottom: "1rem" }}>
          Tu solicitud será revisada por un administrador antes de activarse
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="autorRut">
            <Form.Label>RUT *</Form.Label>
            <Form.Control
              className="bc-input"
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              onBlur={handleRutBlur}
              placeholder="12.345.678-9"
              required
              isInvalid={!!rutError}
            />
            <div className="bc-disclaimer mt-1">Ingresa tu RUT con puntos y guión</div>
            {rutError && (
              <Form.Control.Feedback type="invalid">{rutError}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="autorBio">
            <Form.Label>Biografía</Form.Label>
            <Form.Control
              className="bc-input"
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Breve descripción de tu obra y trayectoria"
            />
          </Form.Group>

          <div className="bc-dj-box mb-3">
            <div className="bc-dj-title">Declaración jurada digital</div>
            <div className="bc-dj-text">
              Declaro que soy el/la legítimo/a autor/a de las obras que publicaré en
              BiblioChile, que dichas obras son originales y no infringen derechos de
              terceros, y que autorizo a BiblioChile a distribuirlas bajo las
              condiciones de la plataforma.
            </div>
            <Form.Group controlId="autorDeclaracion" className="bc-dj-check-row">
              <Form.Check
                type="checkbox"
                checked={declaracionAceptada}
                onChange={(e) => {
                  setDeclaracionAceptada(e.target.checked);
                  if (e.target.checked) setDeclaracionError(null);
                }}
                label="Acepto y firmo digitalmente esta declaración jurada de autoría *"
                isInvalid={!!declaracionError}
              />
            </Form.Group>
            {declaracionError && (
              <div className="bc-dj-error">{declaracionError}</div>
            )}
            <div className="bc-dj-meta">Se registrará: RUT · Nombre · Fecha y hora de firma</div>
          </div>

          {error && <Alert variant="danger" style={{ fontSize: "0.82rem" }}>{error}</Alert>}

          <button
            type="submit"
            disabled={loading}
            className="bc-btn-primary w-100 py-3 mt-2"
          >
            {loading ? "Enviando..." : "Enviar solicitud de registro"}
          </button>
        </Form>
      </div>

      <BottomNav />
    </div>
  );
};

export default RegistroAutor;

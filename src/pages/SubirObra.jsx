import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import api from "../services/api.js";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import RequireRole from "../components/RequireRole.jsx";

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// POST /authors/books no recibe un archivo binario (no hay middleware de
// upload en el backend) — recibe { title, contentUrl, coverUrl?, description? }
// donde contentUrl es el link a donde ya está alojada la obra. No hay
// endpoint de catálogo de géneros todavía, así que genreIds no se envía.
const SubirObra = () => {
  const [title, setTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [description, setDescription] = useState("");
  const [urlError, setUrlError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContentUrlBlur = () => {
    if (contentUrl && !isValidUrl(contentUrl)) {
      setUrlError("Debe ser una URL válida (ej: https://...)");
    } else {
      setUrlError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidUrl(contentUrl)) {
      setUrlError("Debe ser una URL válida (ej: https://...)");
      return;
    }

    setLoading(true);
    try {
      await api.post("/authors/books", {
        title,
        contentUrl,
        coverUrl: coverUrl || undefined,
        description: description || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al enviar la obra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireRole role="autor">
      <div className="bc-page">
        <AppNavbar />

        <div className="px-3 py-3">
          <h2 className="bc-section-title">Subir obra</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="obraTitulo">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                className="bc-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de tu obra"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="obraContentUrl">
              <Form.Label>Enlace a la obra *</Form.Label>
              <Form.Control
                className="bc-input"
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                onBlur={handleContentUrlBlur}
                placeholder="https://..."
                required
                isInvalid={!!urlError}
              />
              <div className="bc-disclaimer mt-1">
                Enlace donde ya está alojado el contenido de tu obra (PDF, EPUB o TXT)
              </div>
              {urlError && <Form.Control.Feedback type="invalid">{urlError}</Form.Control.Feedback>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="obraCoverUrl">
              <Form.Label>Portada</Form.Label>
              <Form.Control
                className="bc-input"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... (opcional)"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="obraDescripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                className="bc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve sinopsis de la obra"
              />
            </Form.Group>

            {error && <Alert variant="danger" style={{ fontSize: "0.82rem" }}>{error}</Alert>}

            <button type="submit" disabled={loading} className="bc-btn-primary w-100 py-3 mt-2">
              {loading ? "Enviando..." : "Enviar obra para revisión"}
            </button>
          </Form>
        </div>

        <BottomNav />
      </div>
    </RequireRole>
  );
};

export default SubirObra;

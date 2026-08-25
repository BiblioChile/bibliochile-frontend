import { useState, useEffect } from "react";
import { Spinner, Form, Alert } from "react-bootstrap";
import api from "../services/api.js";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const AdminPanel = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [books, setBooks] = useState([]);
  const [qrcodes, setQrcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [showNewQr, setShowNewQr] = useState(false);
  const [newStation, setNewStation] = useState("");
  const [newGutendexId, setNewGutendexId] = useState("");
  const [creatingQr, setCreatingQr] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, qrRes] = await Promise.all([
        api.get("/admin/books"),
        api.get("/admin/qrcodes"),
      ]);
      setBooks(booksRes.data);
      setQrcodes(qrRes.data);
    } catch {
      setError("Error al cargar el panel de administración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // RequireRole ya redirige sin sesión/rol correcto, pero el fetch lo
    // dispara este mismo componente: hay que esperar a que se sepa que
    // corresponde antes de pegarle al backend.
    if (authLoading || !isAuthenticated || user?.role !== "admin") return;
    fetchData();
  }, [authLoading, isAuthenticated, user]);

  const handleToggleQr = async (qr) => {
    setActionError(null);
    try {
      // El backend simplemente invierte is_active — no lee body.
      await api.patch(`/admin/qrcodes/${qr.id}`);
      await fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Error al actualizar el código QR");
    }
  };

  const handleCreateQr = async (e) => {
    e.preventDefault();
    setActionError(null);
    setCreatingQr(true);
    try {
      await api.post("/admin/qrcodes", {
        locationName: newStation,
        gutendexId: Number(newGutendexId),
      });
      setShowNewQr(false);
      setNewStation("");
      setNewGutendexId("");
      await fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Error al generar el código QR");
    } finally {
      setCreatingQr(false);
    }
  };

  return (
    <RequireRole role="admin">
      <div className="bc-page">
        <AppNavbar />

        <div className="px-3 py-3">
          <h2 className="bc-section-title">Panel de administración</h2>

          {loading && (
            <div className="bc-loading">
              <Spinner animation="border" size="sm" className="me-2" />
              Cargando...
            </div>
          )}

          {error && <div className="bc-error">{error}</div>}
          {actionError && <Alert variant="danger" style={{ fontSize: "0.82rem" }}>{actionError}</Alert>}

          {!loading && !error && (
            <>
              <div className="mb-4">
                <h3 className="bc-section-title" style={{ fontSize: "0.85rem" }}>Obras en catálogo</h3>
                <div className="bc-catalog-list">
                  {books.map((book) => (
                    <div key={book.id} className="bc-catalog-item">
                      <div>
                        <div className="bc-obra-stat-title" style={{ fontSize: "0.95rem" }}>{book.title}</div>
                        <div className="bc-log-key">
                          {book.author?.user?.name ?? "Dominio público"} · {book.is_free ? "Gratis" : "Suscripción"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {books.length === 0 && (
                    <p style={{ fontSize: "0.82rem", color: "var(--ivory-dim)" }}>No hay obras en el catálogo.</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="bc-section-title" style={{ fontSize: "0.85rem" }}>Códigos QR por estación</h3>
                <div className="bc-qr-list">
                  {qrcodes.map((qr) => (
                    <div key={qr.id} className="bc-qr-item">
                      <div>
                        <div className="bc-obra-stat-title" style={{ fontSize: "0.95rem" }}>{qr.location_name}</div>
                        <div className="bc-log-key">{qr.code} · Gutendex #{qr.gutendex_id}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={qr.is_active ? "bc-badge-active" : "bc-badge-pending"}>
                          {qr.is_active ? "ACTIVO" : "INACTIVO"}
                        </span>
                        <button className="bc-btn-sm" onClick={() => handleToggleQr(qr)}>
                          {qr.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {qrcodes.length === 0 && (
                    <p style={{ fontSize: "0.82rem", color: "var(--ivory-dim)" }}>No hay códigos QR generados.</p>
                  )}
                </div>

                {showNewQr ? (
                  <Form onSubmit={handleCreateQr} className="mt-3" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Form.Group controlId="qrStation">
                      <Form.Label style={{ fontSize: "0.72rem" }}>Estación</Form.Label>
                      <Form.Control
                        className="bc-input"
                        type="text"
                        value={newStation}
                        onChange={(e) => setNewStation(e.target.value)}
                        placeholder="Estación Baquedano"
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="qrGutendexId">
                      <Form.Label style={{ fontSize: "0.72rem" }}>ID de Gutendex</Form.Label>
                      <Form.Control
                        className="bc-input"
                        type="text"
                        value={newGutendexId}
                        onChange={(e) => setNewGutendexId(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="submit" className="bc-btn-primary" disabled={creatingQr} style={{ padding: "0.5rem 1rem" }}>
                        {creatingQr ? "Generando..." : "Generar"}
                      </button>
                      <button type="button" className="bc-btn-sm" onClick={() => setShowNewQr(false)}>
                        Cancelar
                      </button>
                    </div>
                  </Form>
                ) : (
                  <button className="bc-btn-primary w-100 mt-3" onClick={() => setShowNewQr(true)}>
                    + Generar nuevo código QR
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </RequireRole>
  );
};

export default AdminPanel;

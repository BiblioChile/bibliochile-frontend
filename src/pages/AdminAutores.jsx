import { useState, useEffect } from "react";
import { Spinner, Form, Alert } from "react-bootstrap";
import api from "../services/api.js";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import RequireRole from "../components/RequireRole.jsx";
import AdminSubNav from "../components/AdminSubNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const RECHAZO_MOTIVOS = [
  { value: "problema_sistema", label: "Problema con el sistema" },
  { value: "otro", label: "Otro" },
];

const AdminAutores = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("problema_sistema");
  const [rejectNote, setRejectNote] = useState("");
  const [actionError, setActionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/authors/pending");
      setPending(response.data);
    } catch {
      setError("Error al cargar los autores pendientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // RequireRole ya redirige sin sesión/rol correcto, pero el fetch lo
    // dispara este mismo componente: hay que esperar a que se sepa que
    // corresponde antes de pegarle al backend.
    if (authLoading || !isAuthenticated || user?.role !== "admin") return;
    fetchPending();
  }, [authLoading, isAuthenticated, user]);

  const handleAprobar = async (id) => {
    setActionError(null);
    try {
      await api.patch(`/admin/authors/${id}/approve`);
      await fetchPending();
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Error al aprobar el autor");
    }
  };

  const openRechazo = (id) => {
    setRejectingId(id);
    setRejectReason("problema_sistema");
    setRejectNote("");
    setActionError(null);
  };

  const closeRechazo = () => setRejectingId(null);

  const handleRechazar = async (e) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    try {
      await api.patch(`/admin/authors/${rejectingId}/reject`, {
        reason: rejectReason,
        ...(rejectReason === "otro" ? { note: rejectNote } : {}),
      });
      setRejectingId(null);
      await fetchPending();
    } catch (err) {
      setActionError(err.response?.data?.message ?? "Error al rechazar el autor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireRole role="admin">
      <div className="bc-page">
        <AppNavbar />
        <AdminSubNav />

        <div className="px-3 py-3">
          <h2 className="bc-section-title">Aprobar autores</h2>

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
              <h3 className="bc-section-title" style={{ fontSize: "0.85rem" }}>
                Solicitudes pendientes ({pending.length})
              </h3>

              {pending.length === 0 && (
                <p style={{ fontSize: "0.85rem", color: "var(--ivory-dim)" }}>
                  No hay solicitudes pendientes.
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {pending.map((author) => (
                  <div key={author.id} className="bc-author-card">
                    <div className="bc-author-header">
                      <div>
                        <div className="bc-author-name">{author.user?.name}</div>
                        <div className="bc-author-rut">RUT: {author.rut}</div>
                      </div>
                      <span className="bc-badge-pending">PENDIENTE</span>
                    </div>
                    <div className="bc-author-meta-row">Correo: {author.user?.email}</div>
                    {author.created_at && (
                      <div className="bc-author-meta-row">Solicitud: {author.created_at}</div>
                    )}

                    {rejectingId === author.id ? (
                      <Form onSubmit={handleRechazar} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {RECHAZO_MOTIVOS.map((motivo) => (
                          <Form.Check
                            key={motivo.value}
                            type="radio"
                            name={`rechazo-${author.id}`}
                            id={`rechazo-${author.id}-${motivo.value}`}
                            label={motivo.label}
                            checked={rejectReason === motivo.value}
                            onChange={() => setRejectReason(motivo.value)}
                          />
                        ))}

                        {rejectReason === "otro" && (
                          <Form.Group controlId={`rechazo-nota-${author.id}`}>
                            <Form.Label style={{ fontSize: "0.72rem" }}>Nota</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              required
                              className="bc-input"
                            />
                          </Form.Group>
                        )}

                        <div className="bc-author-actions">
                          <button
                            type="submit"
                            className="bc-btn-sm bc-danger"
                            disabled={submitting || (rejectReason === "otro" && !rejectNote)}
                          >
                            Confirmar rechazo
                          </button>
                          <button type="button" className="bc-btn-sm" onClick={closeRechazo}>
                            Cancelar
                          </button>
                        </div>
                      </Form>
                    ) : (
                      <div className="bc-author-actions">
                        <button className="bc-btn-sm bc-approve" onClick={() => handleAprobar(author.id)}>
                          ✓ Aprobar
                        </button>
                        <button className="bc-btn-sm bc-danger" onClick={() => openRechazo(author.id)}>
                          ✕ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </RequireRole>
  );
};

export default AdminAutores;

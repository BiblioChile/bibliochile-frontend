import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import AdminAutores from "./AdminAutores";
import { AuthProvider } from "../context/AuthContext.jsx";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const loginAsAdmin = () => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Admin", role: "admin" }));
};

// Shape real de GET /admin/authors/pending (admin.service.js#listPendingAuthors):
// filas de Author con user: { name, email } anidado, no campos planos.
const pending = [
  {
    id: 1,
    rut: "16.234.567-8",
    created_at: "2026-07-09 15:42",
    user: { name: "Valentina Reyes Mora", email: "v.reyes@correo.cl" },
  },
  {
    id: 2,
    rut: "14.876.543-2",
    created_at: "2026-07-08 10:15",
    user: { name: "Rodrigo Fuentes Díaz", email: "r.fuentes@mail.com" },
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/admin/autores"]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/autores" element={<AdminAutores />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("AdminAutores", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirige a / si el usuario no es admin", async () => {
    localStorage.setItem("token", futureToken());
    localStorage.setItem("user", JSON.stringify({ name: "Sebastián", role: "pasajero" }));

    renderPage();

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("carga las solicitudes pendientes con GET /admin/authors/pending", async () => {
    loginAsAdmin();
    api.get.mockResolvedValue({ data: pending });

    renderPage();

    expect(await screen.findByText("Valentina Reyes Mora")).toBeInTheDocument();
    expect(screen.getByText("Rodrigo Fuentes Díaz")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/admin/authors/pending");
  });

  it("aprueba un autor con PATCH /admin/authors/:id/approve", async () => {
    loginAsAdmin();
    api.get.mockResolvedValue({ data: pending });
    api.patch.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    renderPage();
    await screen.findByText("Valentina Reyes Mora");
    await user.click(screen.getAllByRole("button", { name: /aprobar/i })[0]);

    expect(api.patch).toHaveBeenCalledWith("/admin/authors/1/approve");
  });

  it("rechazar exige elegir un motivo y envía nota solo si es 'otro'", async () => {
    loginAsAdmin();
    api.get.mockResolvedValue({ data: pending });
    api.patch.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    renderPage();
    await screen.findByText("Valentina Reyes Mora");
    await user.click(screen.getAllByRole("button", { name: /rechazar/i })[0]);

    // Motivo por defecto: problema_sistema, sin nota
    await user.click(screen.getByRole("button", { name: /confirmar rechazo/i }));
    expect(api.patch).toHaveBeenCalledWith("/admin/authors/1/reject", { reason: "problema_sistema" });
  });

  it("rechazar con motivo 'otro' requiere nota antes de habilitar el envío", async () => {
    loginAsAdmin();
    api.get.mockResolvedValue({ data: pending });
    api.patch.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    renderPage();
    await screen.findByText("Valentina Reyes Mora");
    await user.click(screen.getAllByRole("button", { name: /rechazar/i })[0]);
    await user.click(screen.getByLabelText("Otro"));

    expect(screen.getByRole("button", { name: /confirmar rechazo/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/nota/i), "Datos incompletos");
    await user.click(screen.getByRole("button", { name: /confirmar rechazo/i }));

    expect(api.patch).toHaveBeenCalledWith("/admin/authors/1/reject", {
      reason: "otro",
      note: "Datos incompletos",
    });
  });
});

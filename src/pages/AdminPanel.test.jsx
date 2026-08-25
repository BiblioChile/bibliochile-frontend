import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import AdminPanel from "./AdminPanel";
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

// Shape real de GET /admin/books (admin.service.js#listManagedBooks) — filas
// de Book crudas con author.user.name anidado (no book.author/book.genre planos).
const books = [
  { id: 1, title: "Altazor", is_free: true, author: null },
  { id: 2, title: "El último tren del sur", is_free: false, author: { user: { name: "J. Martínez" } } },
];

// Shape real de GET /admin/qrcodes (admin.service.js#listQRCodes) — filas
// crudas de QRCode: location_name, gutendex_id, is_active, code.
const qrcodes = [
  { id: 1, code: "BCH-001", location_name: "Estación Baquedano", gutendex_id: 2000, is_active: true },
  { id: 2, code: "BCH-003", location_name: "Estación Tobalaba", gutendex_id: 67979, is_active: false },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/admin/panel"]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("AdminPanel", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirige a /login si no hay sesión iniciada", async () => {
    renderPage();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("carga catálogo y códigos QR con GET /admin/books y GET /admin/qrcodes", async () => {
    loginAsAdmin();
    api.get.mockImplementation((url) =>
      url === "/admin/books" ? Promise.resolve({ data: books }) : Promise.resolve({ data: qrcodes })
    );

    renderPage();

    expect(await screen.findByText("Altazor")).toBeInTheDocument();
    expect(screen.getByText("J. Martínez", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Estación Baquedano")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/admin/books");
    expect(api.get).toHaveBeenCalledWith("/admin/qrcodes");
  });

  it("activa/desactiva un QR con PATCH /admin/qrcodes/:id (sin body — el backend solo invierte is_active)", async () => {
    loginAsAdmin();
    api.get.mockImplementation((url) =>
      url === "/admin/books" ? Promise.resolve({ data: books }) : Promise.resolve({ data: qrcodes })
    );
    api.patch.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    renderPage();
    await screen.findByText("Estación Baquedano");
    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(api.patch).toHaveBeenCalledWith("/admin/qrcodes/1");
  });

  it("genera un nuevo QR con POST /admin/qrcodes y { locationName, gutendexId }", async () => {
    loginAsAdmin();
    api.get.mockImplementation((url) =>
      url === "/admin/books" ? Promise.resolve({ data: books }) : Promise.resolve({ data: qrcodes })
    );
    api.post.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    renderPage();
    await screen.findByText("Estación Baquedano");
    await user.click(screen.getByRole("button", { name: /generar nuevo código qr/i }));
    await user.type(screen.getByLabelText(/estación/i), "Estación Escuela Militar");
    await user.type(screen.getByLabelText(/id de gutendex/i), "3000");
    await user.click(screen.getByRole("button", { name: /^generar$/i }));

    expect(api.post).toHaveBeenCalledWith("/admin/qrcodes", {
      locationName: "Estación Escuela Militar",
      gutendexId: 3000,
    });
  });
});

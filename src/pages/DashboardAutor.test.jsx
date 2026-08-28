import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DashboardAutor from "./DashboardAutor";
import { AuthProvider } from "../context/AuthContext.jsx";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const loginAsAutor = () => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Valentina", role: "autor" }));
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/autor/dashboard"]}>
      <AuthProvider>
        <Routes>
          <Route path="/autor/dashboard" element={<DashboardAutor />} />
          <Route path="/autor/subir-obra" element={<div>Vista de subir obra</div>} />
          <Route path="/autor/estadisticas" element={<div>Vista de estadísticas</div>} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("DashboardAutor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirige a /login si no hay sesión iniciada", async () => {
    renderPage();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
  });

  it("redirige a / si el usuario no tiene rol autor", async () => {
    localStorage.setItem("token", futureToken());
    localStorage.setItem("user", JSON.stringify({ name: "Sebastián", role: "pasajero" }));

    renderPage();

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
  });

  it("muestra el saludo con el nombre del autor", async () => {
    loginAsAutor();

    renderPage();

    expect(await screen.findByText("Hola, Valentina")).toBeInTheDocument();
  });

  it("navega a 'Subir obra' al hacer clic en esa opción", async () => {
    loginAsAutor();
    const user = userEvent.setup();

    renderPage();
    await user.click(await screen.findByText("Subir obra"));

    expect(await screen.findByText("Vista de subir obra")).toBeInTheDocument();
  });

  it("navega a 'Mis estadísticas' al hacer clic en esa opción", async () => {
    loginAsAutor();
    const user = userEvent.setup();

    renderPage();
    await user.click(await screen.findByText("Mis estadísticas"));

    expect(await screen.findByText("Vista de estadísticas")).toBeInTheDocument();
  });

  it("cierra sesión y navega al catálogo al hacer clic en 'Cerrar sesión'", async () => {
    loginAsAutor();
    const user = userEvent.setup();

    renderPage();
    await user.click(await screen.findByText("Cerrar sesión"));

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });
});

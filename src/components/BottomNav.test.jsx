import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./BottomNav";
import { AuthProvider } from "../context/AuthContext";

// Mismo helper que AuthContext.test.jsx para armar un JWT "falso" válido
// para jwt-decode (no verifica firma, solo decodifica el payload).
const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const login = (role) => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify(role ? { name: "Sebastián", role } : { name: "Sebastián" }));
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path={path} element={<BottomNav />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("BottomNav", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra los tres ítems: Inicio, Planes y Perfil", () => {
    renderAt("/");

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Planes")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });

  it("marca 'Inicio' como activo en la ruta /", () => {
    renderAt("/");

    expect(screen.getByText("Inicio").closest(".bc-nav-item")).toHaveClass("active");
    expect(screen.getByText("Planes").closest(".bc-nav-item")).not.toHaveClass("active");
  });

  it("marca 'Planes' como activo en /plans", () => {
    renderAt("/plans");

    expect(screen.getByText("Planes").closest(".bc-nav-item")).toHaveClass("active");
  });

  it("marca 'Perfil' como activo en /dashboard con sesión de rol pasajero", () => {
    login("pasajero");
    renderAt("/dashboard");

    expect(screen.getByText("Perfil").closest(".bc-nav-item")).toHaveClass("active");
  });

  it("lleva 'Perfil' a /login sin sesión iniciada", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BottomNav />} />
            <Route path="/login" element={<div>Vista de login</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByText("Perfil"));

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
  });

  it("lleva 'Perfil' a /dashboard con sesión iniciada", async () => {
    login();
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BottomNav />} />
            <Route path="/dashboard" element={<div>Vista de dashboard</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByText("Perfil"));

    expect(await screen.findByText("Vista de dashboard")).toBeInTheDocument();
  });

  it("marca 'Perfil' como activo en /autor/dashboard con rol autor", () => {
    login("autor");
    renderAt("/autor/dashboard");

    expect(screen.getByText("Perfil").closest(".bc-nav-item")).toHaveClass("active");
  });

  it("marca 'Perfil' como activo en /admin/panel con rol admin", () => {
    login("admin");
    renderAt("/admin/panel");

    expect(screen.getByText("Perfil").closest(".bc-nav-item")).toHaveClass("active");
  });

  it("lleva 'Perfil' a /autor/dashboard con sesión de rol autor", async () => {
    login("autor");
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BottomNav />} />
            <Route path="/autor/dashboard" element={<div>Vista de dashboard autor</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByText("Perfil"));

    expect(await screen.findByText("Vista de dashboard autor")).toBeInTheDocument();
  });

  it("lleva 'Perfil' a /admin/panel con sesión de rol admin", async () => {
    login("admin");
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BottomNav />} />
            <Route path="/admin/panel" element={<div>Vista de panel admin</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByText("Perfil"));

    expect(await screen.findByText("Vista de panel admin")).toBeInTheDocument();
  });

  it("navega a Planes al hacer clic", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BottomNav />} />
            <Route path="/plans" element={<div>Vista de planes</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByText("Planes"));

    expect(await screen.findByText("Vista de planes")).toBeInTheDocument();
  });
});

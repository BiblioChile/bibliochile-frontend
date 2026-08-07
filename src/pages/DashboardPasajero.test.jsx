import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import DashboardPasajero from "./DashboardPasajero";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

// Mismo helper que AuthContext.test.jsx para armar un JWT "falso" válido
// para jwt-decode (no verifica firma, solo decodifica el payload).
const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const login = () => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Sebastián" }));
};

const historyItem = {
  bookId: 2,
  progressPercentage: 40,
  book: { id: 2, title: "Los Sinsabores del Verdadero Policía", author: "Blest Gana" },
};

const inactiveSub = { active: false };
const activeSub = {
  active: true,
  plan_name: "mensual",
  end_date: "2026-09-06",
  rentals_used: 2,
  max_rentals: 5,
};

// Responde según la URL: /progress trae el historial, /subscriptions/me el estado
// de suscripción. Sin esto, un único mockResolvedValue no puede distinguirlas.
const mockEndpoints = ({ history = [], subscription = inactiveSub } = {}) => {
  api.get.mockImplementation((url) =>
    url === "/subscriptions/me"
      ? Promise.resolve({ data: subscription })
      : Promise.resolve({ data: history })
  );
};

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<DashboardPasajero />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
          <Route path="/subscription" element={<div>Vista de suscripción</div>} />
          <Route path="/reader/:id" element={<div>Vista de lectura</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("DashboardPasajero", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirige a /login si no hay sesión iniciada", async () => {
    renderDashboard();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("muestra el saludo con el nombre del usuario", async () => {
    login();
    mockEndpoints();

    renderDashboard();

    expect(await screen.findByText("Hola, Sebastián")).toBeInTheDocument();
  });

  it("carga el historial con GET /progress", async () => {
    login();
    mockEndpoints({ history: [historyItem] });

    renderDashboard();

    expect(await screen.findByText("Los Sinsabores del Verdadero Policía")).toBeInTheDocument();
    expect(screen.getByText("Blest Gana")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/progress", undefined);
  });

  it("muestra un mensaje si no hay libros con progreso guardado", async () => {
    login();
    mockEndpoints();

    renderDashboard();

    expect(
      await screen.findByText("Todavía no tienes libros con progreso guardado.")
    ).toBeInTheDocument();
  });

  it("no rompe el dashboard si falla la carga del historial", async () => {
    login();
    api.get.mockRejectedValue(new Error("network error"));

    renderDashboard();

    expect(await screen.findByText("Hola, Sebastián")).toBeInTheDocument();
    expect(
      await screen.findByText("Todavía no tienes libros con progreso guardado.")
    ).toBeInTheDocument();
  });

  it("navega al lector al hacer clic en un libro del historial", async () => {
    login();
    const user = userEvent.setup();
    mockEndpoints({ history: [historyItem] });

    renderDashboard();

    await user.click(await screen.findByText("Los Sinsabores del Verdadero Policía"));

    expect(await screen.findByText("Vista de lectura")).toBeInTheDocument();
  });

  it("muestra la suscripción activa directamente en el dashboard, sin un paso extra", async () => {
    login();
    mockEndpoints({ subscription: activeSub });

    renderDashboard();

    expect(await screen.findByText("ACTIVA")).toBeInTheDocument();
    expect(screen.getByText("Plan Mensual")).toBeInTheDocument();
    expect(screen.getByText("Libros usados: 2 de 5")).toBeInTheDocument();
    // No debe pedir un clic extra para ver el estado — no hay botón "Mi suscripción",
    // solo el título de la sección con el estado ya renderizado debajo.
    expect(screen.queryByRole("button", { name: "Mi suscripción" })).not.toBeInTheDocument();
  });

  it("ofrece 'Elegir un plan' y navega a /subscription si no hay una suscripción activa", async () => {
    login();
    const user = userEvent.setup();
    mockEndpoints({ subscription: inactiveSub });

    renderDashboard();

    await user.click(await screen.findByText("Elegir un plan"));

    expect(await screen.findByText("Vista de suscripción")).toBeInTheDocument();
  });

  it("cierra sesión y navega al catálogo al hacer clic en 'Cerrar sesión'", async () => {
    login();
    const user = userEvent.setup();
    mockEndpoints();

    renderDashboard();

    await user.click(await screen.findByText("Cerrar sesión"));

    // El navigate("/") debe ejecutarse antes de logout(): si el orden se invierte,
    // el guard de autenticación del propio componente ve isAuthenticated en false en
    // el re-render y pisa esta navegación redirigiendo a /login en vez del catálogo.
    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("navega al catálogo al hacer clic en 'Inicio'", async () => {
    login();
    const user = userEvent.setup();
    mockEndpoints();

    renderDashboard();

    await screen.findByText("Hola, Sebastián");
    await user.click(screen.getByText("Inicio"));

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
  });
});

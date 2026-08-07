import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import Plans from "./Plans";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const plans = [
  { id: 1, name: "mensual", price: 4990, max_rentals: 5, duration_days: 30 },
  { id: 2, name: "anual", price: 49990, max_rentals: 5, duration_days: 365 },
];

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

const renderPlans = () =>
  render(
    <MemoryRouter initialEntries={["/plans"]}>
      <AuthProvider>
        <Routes>
          <Route path="/plans" element={<Plans />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
          <Route path="/subscription" element={<div>Vista de suscripción</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("Plans", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("carga los planes con GET /subscriptions/plans", async () => {
    api.get.mockResolvedValue({ data: plans });

    renderPlans();

    expect(await screen.findByText("Plan Mensual")).toBeInTheDocument();
    expect(screen.getByText("Plan Anual")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/plans");
  });

  it("muestra el precio formateado y el detalle de cada plan", async () => {
    api.get.mockResolvedValue({ data: plans });

    renderPlans();

    await screen.findByText("Plan Mensual");
    expect(screen.getByText("Hasta 5 libros · 30 días")).toBeInTheDocument();
    expect(screen.getByText("$4.990")).toBeInTheDocument();
    expect(screen.getByText("$49.990")).toBeInTheDocument();
  });

  it("muestra el mensaje de error si la petición falla", async () => {
    api.get.mockRejectedValue(new Error("network error"));

    renderPlans();

    expect(await screen.findByText("Error al cargar los planes")).toBeInTheDocument();
  });

  it("navega a /login al hacer clic en 'Iniciar sesión para suscribirte'", async () => {
    api.get.mockResolvedValue({ data: plans });
    const user = userEvent.setup();

    renderPlans();
    await user.click(await screen.findByRole("button", { name: /iniciar sesión para suscribirte/i }));

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
  });

  it("navega al catálogo al hacer clic en 'Inicio'", async () => {
    api.get.mockResolvedValue({ data: plans });
    const user = userEvent.setup();

    renderPlans();
    await screen.findByText("Plan Mensual");
    await user.click(screen.getByText("Inicio"));

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
  });

  it("no muestra 'Iniciar sesión para suscribirte' con sesión iniciada", async () => {
    login();
    api.get.mockResolvedValue({ data: plans });

    renderPlans();

    await screen.findByText("Plan Mensual");
    expect(
      screen.queryByRole("button", { name: /iniciar sesión para suscribirte/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Suscribirme" })).toBeInTheDocument();
  });

  it("navega a /subscription al hacer clic en 'Suscribirme' con sesión iniciada", async () => {
    login();
    const user = userEvent.setup();
    api.get.mockResolvedValue({ data: plans });

    renderPlans();
    await user.click(await screen.findByRole("button", { name: "Suscribirme" }));

    expect(await screen.findByText("Vista de suscripción")).toBeInTheDocument();
  });
});

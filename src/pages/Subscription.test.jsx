import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import Subscription from "./Subscription";
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

const plans = [
  { id: 1, name: "mensual", price: 4990, max_rentals: 5, duration_days: 30 },
  { id: 2, name: "anual", price: 49990, max_rentals: 5, duration_days: 365 },
];

const inactiveSub = { active: false };
const activeSub = {
  active: true,
  plan_name: "mensual",
  end_date: "2026-09-06",
  rentals_used: 2,
  max_rentals: 5,
};

const renderSubscription = () =>
  render(
    <MemoryRouter initialEntries={["/subscription"]}>
      <AuthProvider>
        <Routes>
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("Subscription", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirige a /login si no hay sesión iniciada", async () => {
    renderSubscription();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("carga la suscripción y los planes con sesión iniciada", async () => {
    login();
    api.get.mockImplementation((url) =>
      url === "/subscriptions/me"
        ? Promise.resolve({ data: inactiveSub })
        : Promise.resolve({ data: plans })
    );

    renderSubscription();

    expect(await screen.findByText("Plan Mensual")).toBeInTheDocument();
    expect(screen.getByText("Plan Anual")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/me");
    expect(api.get).toHaveBeenCalledWith("/subscriptions/plans");
  });

  it("muestra el estado actual si ya tiene una suscripción activa", async () => {
    login();
    api.get.mockImplementation((url) =>
      url === "/subscriptions/me"
        ? Promise.resolve({ data: activeSub })
        : Promise.resolve({ data: plans })
    );

    renderSubscription();

    expect(await screen.findByText("ACTIVA")).toBeInTheDocument();
    expect(screen.getByText("Libros usados: 2 de 5")).toBeInTheDocument();
    expect(screen.getByText(/Vence el/)).toBeInTheDocument();
    // No debería mostrar el selector de planes si ya hay una activa
    expect(screen.queryByText("Elige tu plan")).not.toBeInTheDocument();
  });

  it("muestra el mensaje de error si la petición falla", async () => {
    login();
    api.get.mockRejectedValue(new Error("network error"));

    renderSubscription();

    expect(
      await screen.findByText("Error al cargar la información de suscripción")
    ).toBeInTheDocument();
  });

  it("contrata un plan con POST /subscriptions al seleccionarlo y pagar", async () => {
    login();
    const user = userEvent.setup();
    api.get.mockImplementation((url) =>
      url === "/subscriptions/me"
        ? Promise.resolve({ data: inactiveSub })
        : Promise.resolve({ data: plans })
    );
    api.post.mockResolvedValue({ data: {} });

    renderSubscription();

    await user.click(await screen.findByText("Plan Mensual"));
    await user.click(screen.getByRole("button", { name: "Pago" }));

    expect(api.post).toHaveBeenCalledWith("/subscriptions", { planId: 1 });
  });

  it("muestra el error del backend si ya tiene una suscripción activa (409)", async () => {
    login();
    const user = userEvent.setup();
    api.get.mockImplementation((url) =>
      url === "/subscriptions/me"
        ? Promise.resolve({ data: inactiveSub })
        : Promise.resolve({ data: plans })
    );
    api.post.mockRejectedValue({
      response: { data: { message: "Ya tienes una suscripción activa" } },
    });

    renderSubscription();

    await user.click(await screen.findByText("Plan Mensual"));
    await user.click(screen.getByRole("button", { name: "Pago" }));

    expect(await screen.findByText("Ya tienes una suscripción activa")).toBeInTheDocument();
  });

  it("el botón de pago está deshabilitado sin un plan seleccionado", async () => {
    login();
    api.get.mockImplementation((url) =>
      url === "/subscriptions/me"
        ? Promise.resolve({ data: inactiveSub })
        : Promise.resolve({ data: plans })
    );

    renderSubscription();

    expect(await screen.findByRole("button", { name: "Pago" })).toBeDisabled();
  });

  it("navega al catálogo al hacer clic en 'Inicio'", async () => {
    login();
    const user = userEvent.setup();
    api.get.mockImplementation((url) =>
      url === "/subscriptions/me"
        ? Promise.resolve({ data: inactiveSub })
        : Promise.resolve({ data: plans })
    );

    renderSubscription();

    await screen.findByText("Plan Mensual");
    await user.click(screen.getByText("Inicio"));

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
  });
});

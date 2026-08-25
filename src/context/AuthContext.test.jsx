import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "../services/api.js";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

// Construye un JWT "falso" válido para jwt-decode: éste no verifica firma,
// solo decodifica el payload en base64url, así que alcanza con armar la
// estructura header.payload.signature a mano.
const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const makeToken = (exp) =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp })}.signature`;

const futureToken = () => makeToken(Math.floor(Date.now() / 1000) + 3600);
const expiredToken = () => makeToken(Math.floor(Date.now() / 1000) - 3600);

// Consumidor mínimo para ejercitar el contexto desde afuera.
const Consumer = () => {
  const { user, token, isAuthenticated, loading, login, logout } = useAuth();

  if (loading) return <div>cargando</div>;

  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? "logueado" : "anonimo"}</div>
      <div data-testid="user-name">{user?.name ?? "sin usuario"}</div>
      <button onClick={() => login(futureToken(), { name: "Sebastián" })}>login</button>
      <button onClick={logout}>logout</button>
      <div data-testid="token">{token ?? "sin token"}</div>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("arranca como anónimo si no hay token en localStorage", async () => {
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonimo"));
  });

  it("restaura la sesión si hay un token válido en localStorage", async () => {
    localStorage.setItem("token", futureToken());
    localStorage.setItem("user", JSON.stringify({ name: "Sebastián" }));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("logueado"));
    expect(screen.getByTestId("user-name")).toHaveTextContent("Sebastián");
  });

  it("restaura el role del usuario (no solo el nombre) desde localStorage al montar — simula un refresh de página", async () => {
    // localStorage sobrevive a un F5; el mount de AuthProvider en una página
    // recién cargada es exactamente este mismo efecto leyendo lo persistido.
    localStorage.setItem("token", futureToken());
    localStorage.setItem("user", JSON.stringify({ name: "Valentina", role: "autor" }));

    const RoleConsumer = () => {
      const { user, loading } = useAuth();
      if (loading) return <div>cargando</div>;
      return <div data-testid="user-role">{user?.role ?? "sin role"}</div>;
    };

    render(
      <AuthProvider>
        <RoleConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("user-role")).toHaveTextContent("autor"));
  });

  it("descarta un token expirado al iniciar", async () => {
    localStorage.setItem("token", expiredToken());
    localStorage.setItem("user", JSON.stringify({ name: "Sebastián" }));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonimo"));
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("login() guarda el token y el usuario, y actualiza el estado", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonimo"));
    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("logueado"));
    expect(localStorage.getItem("token")).not.toBeNull();
    expect(JSON.parse(localStorage.getItem("user")).name).toBe("Sebastián");
  });

  it("login() sincroniza el progreso anónimo si existía un UUID guardado", async () => {
    localStorage.setItem("bc_anonymous_uuid", "uuid-anonimo-123");
    api.post.mockResolvedValue({ data: {} });

    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByText("login"));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/progress/sync", { anonymousUuid: "uuid-anonimo-123" })
    );
  });

  it("login() no llama a /progress/sync si nunca hubo lectura anónima", async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("logueado"));
    expect(api.post).not.toHaveBeenCalled();
  });

  it("login() completa la sesión aunque /progress/sync falle (best-effort)", async () => {
    localStorage.setItem("bc_anonymous_uuid", "uuid-anonimo-123");
    api.post.mockRejectedValue(new Error("network error"));

    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("logueado"));
  });

  it("logout() limpia el token, el usuario y localStorage", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("logueado"));

    await user.click(screen.getByText("logout"));

    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonimo");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

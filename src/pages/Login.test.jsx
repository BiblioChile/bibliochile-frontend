import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import api from "../services/api.js";
import Login from "./Login";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("envía email y password a POST /auth/login", async () => {
    api.post.mockResolvedValue({
      data: { token: "fake-token", user: { name: "Sebastián" } },
    });
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByLabelText(/correo electrónico/i), "sebastian@bibliochile.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "clave123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "sebastian@bibliochile.cl",
        password: "clave123",
      })
    );
  });

  it("muestra el mensaje de error del backend si el login falla", async () => {
    api.post.mockRejectedValue({
      response: { data: { message: "Credenciales inválidas" } },
    });
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByLabelText(/correo electrónico/i), "sebastian@bibliochile.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "clave-mala");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
  });

  it("muestra un mensaje genérico si el error no trae mensaje del backend", async () => {
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByLabelText(/correo electrónico/i), "sebastian@bibliochile.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "clave123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Error al iniciar sesión")).toBeInTheDocument();
  });
});

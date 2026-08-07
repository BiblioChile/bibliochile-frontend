import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import api from "../services/api.js";
import Register from "./Register";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const renderRegister = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );

describe("Register", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("envía nombre, email y password a POST /auth/register cuando los datos son válidos", async () => {
    api.post.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    renderRegister();

    await user.type(screen.getByLabelText(/nombre/i), "Sebastián Lara");
    await user.type(screen.getByLabelText(/correo electrónico/i), "sebastian@bibliochile.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "clave12345");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        name: "Sebastián Lara",
        email: "sebastian@bibliochile.cl",
        password: "clave12345",
      })
    );
  });

  it("muestra el mensaje de error del backend si el registro falla (ej: correo ya en uso)", async () => {
    api.post.mockRejectedValue({
      response: { data: { message: "El correo ya está registrado" } },
    });
    const user = userEvent.setup();

    renderRegister();

    await user.type(screen.getByLabelText(/nombre/i), "Sebastián Lara");
    await user.type(screen.getByLabelText(/correo electrónico/i), "existente@bibliochile.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "clave12345");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("El correo ya está registrado")).toBeInTheDocument();
  });

  it("muestra un mensaje genérico si el error no trae mensaje del backend", async () => {
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();

    renderRegister();

    await user.type(screen.getByLabelText(/nombre/i), "Sebastián Lara");
    await user.type(screen.getByLabelText(/correo electrónico/i), "sebastian@bibliochile.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "clave12345");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("Error al crear la cuenta")).toBeInTheDocument();
  });

  it("no envía el formulario si quedan campos obligatorios vacíos (validación nativa del navegador)", async () => {
    const user = userEvent.setup();

    renderRegister();

    // Deja "Correo electrónico" y "Contraseña" vacíos.
    await user.type(screen.getByLabelText(/nombre/i), "Sebastián Lara");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(api.post).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import Register from "./Register";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const renderRegister = () =>
  render(
    <MemoryRouter initialEntries={["/registro"]}>
      <AuthProvider>
        <Routes>
          <Route path="/registro" element={<Register />} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

const fillAndSubmit = async (user, { email = "sebastian@bibliochile.cl" } = {}) => {
  await user.type(screen.getByLabelText(/nombre/i), "Sebastián Lara");
  await user.type(screen.getByLabelText(/correo electrónico/i), email);
  await user.type(screen.getByLabelText(/contraseña/i), "clave12345");
  await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
};

describe("Register", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("envía nombre, email y password a POST /auth/register cuando los datos son válidos", async () => {
    api.post.mockImplementation((url) =>
      url === "/auth/register"
        ? Promise.resolve({ data: { id: 1, name: "Sebastián Lara", email: "sebastian@bibliochile.cl", role: "pasajero" } })
        : Promise.resolve({ data: { token: "fake-token", user: { name: "Sebastián Lara", role: "pasajero" } } })
    );
    const user = userEvent.setup();

    renderRegister();
    await fillAndSubmit(user);

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        name: "Sebastián Lara",
        email: "sebastian@bibliochile.cl",
        password: "clave12345",
      })
    );
  });

  it("queda logueado y navega al catálogo tras un registro exitoso (bug: antes mandaba a Login sin sesión)", async () => {
    // POST /auth/register no devuelve token — solo POST /auth/login lo hace.
    api.post.mockImplementation((url) =>
      url === "/auth/register"
        ? Promise.resolve({ data: { id: 1, name: "Sebastián Lara", email: "sebastian@bibliochile.cl", role: "pasajero" } })
        : Promise.resolve({
            data: { token: "fake-token", user: { name: "Sebastián Lara", role: "pasajero" } },
          })
    );
    const user = userEvent.setup();

    renderRegister();
    await fillAndSubmit(user);

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "sebastian@bibliochile.cl",
      password: "clave12345",
    });
    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBe("fake-token");
  });

  it("muestra el mensaje de error del backend si el registro falla (ej: correo ya en uso)", async () => {
    api.post.mockRejectedValue({
      response: { data: { message: "El correo ya está registrado" } },
    });
    const user = userEvent.setup();

    renderRegister();
    await fillAndSubmit(user, { email: "existente@bibliochile.cl" });

    expect(await screen.findByText("El correo ya está registrado")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("muestra un mensaje genérico si el error no trae mensaje del backend", async () => {
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();

    renderRegister();
    await fillAndSubmit(user);

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

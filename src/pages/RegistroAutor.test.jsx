import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import RegistroAutor from "./RegistroAutor";
import { AuthProvider } from "../context/AuthContext.jsx";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const login = () => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Sebastián", role: "pasajero" }));
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/autor/registro"]}>
      <AuthProvider>
        <Routes>
          <Route path="/autor/registro" element={<RegistroAutor />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/dashboard" element={<div>Vista de dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("RegistroAutor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirige a /login si no hay sesión iniciada — POST /authors/register requiere token", async () => {
    renderPage();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
  });

  it("el botón de enviar está deshabilitado hasta aceptar la declaración jurada", async () => {
    login();
    renderPage();

    expect(await screen.findByRole("button", { name: /enviar solicitud de registro/i })).toBeDisabled();

    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));

    expect(screen.getByRole("button", { name: /enviar solicitud de registro/i })).toBeEnabled();
  });

  it("muestra error si el RUT es inválido y no envía el formulario", async () => {
    login();
    const user = userEvent.setup();
    renderPage();

    await user.type(await screen.findByLabelText(/^rut/i), "12.345.678-9");
    await user.click(screen.getByRole("checkbox"));
    await user.tab();
    await user.click(screen.getByRole("button", { name: /enviar solicitud de registro/i }));

    expect(await screen.findByText(/rut inválido/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("envía { rut, bio, declarationAccepted } con POST /authors/register y navega al dashboard", async () => {
    login();
    api.post.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    renderPage();

    await user.type(await screen.findByLabelText(/^rut/i), "12.345.678-5");
    await user.type(screen.getByLabelText(/biografía/i), "Escritora chilena");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /enviar solicitud de registro/i }));

    expect(api.post).toHaveBeenCalledWith("/authors/register", {
      rut: "12.345.678-5",
      bio: "Escritora chilena",
      declarationAccepted: true,
    });
    expect(await screen.findByText("Vista de dashboard")).toBeInTheDocument();
  });

  it("muestra el error del backend si la solicitud falla", async () => {
    login();
    api.post.mockRejectedValue({ response: { data: { message: "El RUT ya está registrado" } } });
    const user = userEvent.setup();
    renderPage();

    await user.type(await screen.findByLabelText(/^rut/i), "12.345.678-5");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /enviar solicitud de registro/i }));

    expect(await screen.findByText("El RUT ya está registrado")).toBeInTheDocument();
  });
});

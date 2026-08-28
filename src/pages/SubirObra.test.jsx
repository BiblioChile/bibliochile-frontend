import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import SubirObra from "./SubirObra";
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
    <MemoryRouter initialEntries={["/autor/subir-obra"]}>
      <AuthProvider>
        <Routes>
          <Route path="/autor/subir-obra" element={<SubirObra />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/dashboard" element={<div>Vista de dashboard</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("SubirObra", () => {
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

  it("valida que el enlace a la obra sea una URL antes de enviar", async () => {
    loginAsAutor();
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Subir obra");
    await user.type(screen.getByLabelText(/título/i), "Mi obra");
    await user.type(screen.getByLabelText(/enlace a la obra/i), "no-es-una-url");
    await user.click(screen.getByRole("button", { name: /enviar obra para revisión/i }));

    expect(await screen.findByText(/debe ser una url válida/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("envía { title, contentUrl, coverUrl, description } con POST /authors/books y navega al dashboard", async () => {
    loginAsAutor();
    api.post.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Subir obra");
    await user.type(screen.getByLabelText(/título/i), "Mi obra");
    await user.type(screen.getByLabelText(/enlace a la obra/i), "https://ejemplo.cl/obra.pdf");
    await user.type(screen.getByLabelText(/portada/i), "https://ejemplo.cl/portada.jpg");
    await user.type(screen.getByLabelText(/descripción/i), "Una sinopsis");
    await user.click(screen.getByRole("button", { name: /enviar obra para revisión/i }));

    expect(api.post).toHaveBeenCalledWith("/authors/books", {
      title: "Mi obra",
      contentUrl: "https://ejemplo.cl/obra.pdf",
      coverUrl: "https://ejemplo.cl/portada.jpg",
      description: "Una sinopsis",
    });
    expect(await screen.findByText("Vista de dashboard")).toBeInTheDocument();
  });

  it("muestra el error del backend si la obra es rechazada (autor no aprobado)", async () => {
    loginAsAutor();
    api.post.mockRejectedValue({
      response: { data: { message: "Tu cuenta de autor aún no ha sido aprobada" } },
    });
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Subir obra");
    await user.type(screen.getByLabelText(/título/i), "Mi obra");
    await user.type(screen.getByLabelText(/enlace a la obra/i), "https://ejemplo.cl/obra.pdf");
    await user.click(screen.getByRole("button", { name: /enviar obra para revisión/i }));

    expect(await screen.findByText("Tu cuenta de autor aún no ha sido aprobada")).toBeInTheDocument();
  });
});

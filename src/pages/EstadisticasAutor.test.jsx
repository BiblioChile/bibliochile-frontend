import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import EstadisticasAutor from "./EstadisticasAutor";
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

// Shape real de GET /authors/me/stats (author.service.js#getMyStats).
const stats = {
  totalBooks: 3,
  totalReaders: 1284,
  avgProgressPercentage: 47.5,
  totalRentals: 312,
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/autor/estadisticas"]}>
      <AuthProvider>
        <Routes>
          <Route path="/autor/estadisticas" element={<EstadisticasAutor />} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("EstadisticasAutor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirige a /login si no hay sesión iniciada", async () => {
    renderPage();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("carga y muestra las estadísticas con GET /authors/me/stats, con progreso promedio (no tiempo)", async () => {
    loginAsAutor();
    api.get.mockResolvedValue({ data: stats });

    renderPage();

    expect(await screen.findByText("1284")).toBeInTheDocument();
    expect(screen.getByText("Progreso promedio de lectura")).toBeInTheDocument();
    expect(screen.getByText("48%")).toBeInTheDocument(); // Math.round(47.5)
    expect(screen.getByText("312")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText(/tiempo promedio/i)).not.toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/authors/me/stats");
  });

  it("complementa los 4 números con un gráfico de barras de lectores y arriendos", async () => {
    loginAsAutor();
    api.get.mockResolvedValue({ data: stats });

    renderPage();

    // Los 4 números siguen ahí (el gráfico complementa, no reemplaza) —
    // ya cubierto en el test de arriba. Acá solo se confirma que el
    // gráfico nuevo se agregó, sin la métrica de progreso (% no es
    // comparable con conteos en el mismo eje).
    expect(await screen.findByText("Lectores y arriendos")).toBeInTheDocument();
  });

  it("muestra un mensaje de error si la petición falla", async () => {
    loginAsAutor();
    api.get.mockRejectedValue(new Error("network error"));

    renderPage();

    expect(await screen.findByText("Error al cargar las estadísticas")).toBeInTheDocument();
  });
});

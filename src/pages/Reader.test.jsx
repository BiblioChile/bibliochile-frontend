import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import Reader from "./Reader";
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

const book = {
  id: 7,
  title: "Martín Rivas",
  author: "Alberto Blest Gana",
  content_url: "https://www.gutenberg.org/files/1/1.txt",
};

const renderReader = ({ entries = ["/reader/7"], index = 0 } = {}) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <AuthProvider>
        <Routes>
          <Route path="/books/:id" element={<div>Detalle del libro</div>} />
          <Route path="/reader/:id" element={<Reader />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("Reader", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra 'Cargando libro...' mientras espera la respuesta", async () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    renderReader();

    expect(screen.getByText("Cargando libro...")).toBeInTheDocument();
  });

  it("carga el libro con GET /books/:id y lo muestra en un iframe", async () => {
    api.get.mockResolvedValue({ data: book });

    renderReader();

    expect(await screen.findByText("Martín Rivas")).toBeInTheDocument();
    expect(screen.getByText("Alberto Blest Gana")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/books/7");

    const iframe = screen.getByTitle("Martín Rivas");
    expect(iframe).toHaveAttribute("src", book.content_url);
  });

  it("muestra un mensaje de error si el libro no se pudo cargar", async () => {
    api.get.mockRejectedValue(new Error("network error"));

    renderReader();

    expect(await screen.findByText("No se pudo cargar el libro")).toBeInTheDocument();
  });

  it("muestra un enlace a Project Gutenberg si el libro no tiene content_url", async () => {
    api.get.mockResolvedValue({ data: { ...book, content_url: undefined } });

    renderReader();

    expect(
      await screen.findByText(/este libro no tiene contenido disponible en línea/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver en project gutenberg/i })).toHaveAttribute(
      "href",
      "https://www.gutenberg.org/ebooks/7"
    );
  });

  it("guarda el progreso en POST /progress cada 15s con el UUID anónimo si no hay sesión", async () => {
    vi.useFakeTimers();
    api.get.mockResolvedValue({ data: book });
    api.post.mockResolvedValue({ data: {} });

    renderReader();
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByText("Martín Rivas")).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(15000));

    expect(api.post).toHaveBeenCalledWith(
      "/progress",
      expect.objectContaining({
        bookId: "7",
        progressPercentage: expect.any(Number),
        lastPosition: expect.stringMatching(/%$/),
        anonymousUuid: expect.any(String),
      })
    );
  });

  it("guarda el progreso sin anonymousUuid cuando hay sesión iniciada", async () => {
    localStorage.setItem("token", futureToken());
    localStorage.setItem("user", JSON.stringify({ name: "Sebastián" }));
    vi.useFakeTimers();
    api.get.mockResolvedValue({ data: book });
    api.post.mockResolvedValue({ data: {} });

    renderReader();
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByText("Martín Rivas")).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(15000));

    expect(api.post).toHaveBeenCalledWith(
      "/progress",
      expect.not.objectContaining({ anonymousUuid: expect.anything() })
    );
  });

  it("guarda el progreso al desmontar el lector", async () => {
    vi.useFakeTimers();
    api.get.mockResolvedValue({ data: book });
    api.post.mockResolvedValue({ data: {} });

    const { unmount } = renderReader();
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByText("Martín Rivas")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(5000));

    unmount();

    expect(api.post).toHaveBeenCalledWith("/progress", expect.any(Object));
  });

  it("vuelve a la vista anterior al hacer clic en 'Volver'", async () => {
    api.get.mockResolvedValue({ data: book });

    renderReader({ entries: ["/books/7", "/reader/7"], index: 1 });
    await screen.findByText("Martín Rivas");

    fireEvent.click(screen.getByText("← Volver"));

    expect(await screen.findByText("Detalle del libro")).toBeInTheDocument();
  });
});

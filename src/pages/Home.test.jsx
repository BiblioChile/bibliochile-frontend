import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import Home from "./Home";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const book = {
  id: 1,
  title: "Martín Rivas",
  author: "Alberto Blest Gana",
};

const continueReadingItem = {
  bookId: 2,
  progressPercentage: 40,
  book: { id: 2, title: "Los Sinsabores...", author: "Blest Gana" },
};

// Por defecto, sin progreso guardado (así no aparece "Continuar leyendo"
// salvo que el test lo pida explícitamente).
const mockApiGet = ({ books = [book], continueReading = [] } = {}) => {
  api.get.mockImplementation((url) => {
    if (url.startsWith("/books")) {
      return Promise.resolve({ data: { results: books } });
    }
    if (url === "/progress") {
      return Promise.resolve({ data: continueReading });
    }
    return Promise.resolve({ data: {} });
  });
};

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<div>Detalle del libro</div>} />
          <Route path="/reader/:id" element={<div>Lector</div>} />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/plans" element={<div>Vista de planes</div>} />
          <Route path="/dashboard" element={<div>Vista de dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("carga el catálogo con GET /books al montar", async () => {
    mockApiGet();

    renderHome();

    expect(await screen.findByText("Martín Rivas")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/books");
  });

  it("muestra el error de catálogo si la petición falla", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/books")) {
        return Promise.reject(new Error("network error"));
      }
      return Promise.resolve({ data: [] });
    });

    renderHome();

    expect(await screen.findByText("Error al cargar el catálogo")).toBeInTheDocument();
  });

  it("busca en el catálogo al enviar el formulario de búsqueda", async () => {
    mockApiGet();
    const user = userEvent.setup();

    renderHome();
    await screen.findByText("Martín Rivas");

    await user.type(screen.getByPlaceholderText(/buscar libros, autores/i), "rivas");
    await user.click(screen.getByRole("button", { name: /buscar/i }));

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/books?search=rivas"));
  });

  it("no muestra 'Continuar leyendo' si no hay progreso guardado", async () => {
    mockApiGet();

    renderHome();

    await screen.findByText("Martín Rivas");
    expect(screen.queryByText("Continuar leyendo")).not.toBeInTheDocument();
  });

  it("muestra 'Continuar leyendo' cuando GET /progress devuelve libros en curso", async () => {
    mockApiGet({ continueReading: [continueReadingItem] });

    renderHome();

    expect(await screen.findByText("Continuar leyendo")).toBeInTheDocument();
    expect(screen.getByText("Los Sinsabores...")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("navega al detalle del libro al hacer clic en una card del catálogo", async () => {
    mockApiGet();
    const user = userEvent.setup();

    renderHome();
    await user.click(await screen.findByText("Martín Rivas"));

    expect(await screen.findByText("Detalle del libro")).toBeInTheDocument();
  });

  it("muestra el botón 'Ingresar' cuando no hay sesión iniciada", async () => {
    mockApiGet();

    renderHome();

    expect(await screen.findByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });
});

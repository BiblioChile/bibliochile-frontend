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

const paidBook = {
  id: 51,
  title: "Obra de un autor nacional",
  author: "Valentina Reyes",
  is_free: false,
};

// Por defecto, sin progreso guardado ni libros de pago (así no aparecen
// "Continuar leyendo" ni "Autores nacionales" salvo que el test lo pida
// explícitamente). "/books/paid" se revisa antes que el "/books" genérico
// (search incluido) porque ambos empiezan con el mismo prefijo.
const mockApiGet = ({ books = [book], continueReading = [], paidBooks = [] } = {}) => {
  api.get.mockImplementation((url) => {
    if (url === "/books/paid") {
      return Promise.resolve({ data: { count: paidBooks.length, results: paidBooks } });
    }
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
          <Route path="/registro" element={<div>Vista de registro</div>} />
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

  it("muestra el botón 'Crear cuenta' cuando no hay sesión iniciada, y navega a /registro", async () => {
    mockApiGet();
    const user = userEvent.setup();

    renderHome();

    const crearCuenta = await screen.findByRole("button", { name: /crear cuenta/i });
    expect(crearCuenta).toBeInTheDocument();

    await user.click(crearCuenta);
    expect(await screen.findByText("Vista de registro")).toBeInTheDocument();
  });

  it("no muestra 'Ingresar' ni 'Crear cuenta' cuando hay sesión iniciada", async () => {
    const base64url = (obj) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const futureToken = () =>
      `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;
    localStorage.setItem("token", futureToken());
    localStorage.setItem("user", JSON.stringify({ name: "Sebastián" }));
    mockApiGet();

    renderHome();

    await screen.findByText("Martín Rivas");
    expect(screen.queryByRole("button", { name: /ingresar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /crear cuenta/i })).not.toBeInTheDocument();
  });

  it("no muestra 'Autores nacionales' si GET /books/paid no trae resultados", async () => {
    mockApiGet();

    renderHome();

    await screen.findByText("Martín Rivas");
    expect(screen.queryByText("Autores nacionales")).not.toBeInTheDocument();
  });

  it("muestra 'Autores nacionales' con los libros de GET /books/paid", async () => {
    mockApiGet({ paidBooks: [paidBook] });

    renderHome();

    expect(await screen.findByText("Autores nacionales")).toBeInTheDocument();
    expect(screen.getByText("Obra de un autor nacional")).toBeInTheDocument();
    expect(screen.getByText("Valentina Reyes")).toBeInTheDocument();
    expect(screen.getByText("SUSCRIPCIÓN")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/books/paid");
  });

  it("navega al detalle correcto al hacer clic en un libro de 'Autores nacionales'", async () => {
    mockApiGet({ paidBooks: [paidBook] });
    const user = userEvent.setup();

    renderHome();
    await user.click(await screen.findByText("Obra de un autor nacional"));

    expect(await screen.findByText("Detalle del libro")).toBeInTheDocument();
  });
});

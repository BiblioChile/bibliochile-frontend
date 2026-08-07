import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import BookDetail from "./BookDetail";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const book = {
  id: 7,
  title: "Martín Rivas",
  author: "Alberto Blest Gana",
  description: "Una novela costumbrista sobre la sociedad chilena del siglo XIX.",
  content_url: "https://www.gutenberg.org/files/1/1.txt",
};

const renderAt = (id) =>
  render(
    <MemoryRouter initialEntries={[`/books/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/reader/:id" element={<div>Vista de lectura</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("BookDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga el detalle del libro con GET /books/:id", async () => {
    api.get.mockResolvedValue({ data: book });

    renderAt(7);

    expect(await screen.findByText("Martín Rivas")).toBeInTheDocument();
    expect(screen.getByText("Alberto Blest Gana")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/books/7");
  });

  it("muestra la descripción cuando el libro la trae", async () => {
    api.get.mockResolvedValue({ data: book });

    renderAt(7);

    expect(await screen.findByText(book.description)).toBeInTheDocument();
  });

  it("no muestra la sección de descripción si el libro no trae una", async () => {
    api.get.mockResolvedValue({ data: { ...book, description: undefined } });

    renderAt(7);

    await screen.findByText("Martín Rivas");
    expect(screen.queryByText(/descripcion/i)).not.toBeInTheDocument();
  });

  it("muestra el mensaje de error si el libro no existe", async () => {
    api.get.mockRejectedValue(new Error("not found"));

    renderAt(999);

    expect(await screen.findByText("Libro no encontrado")).toBeInTheDocument();
  });

  it("navega al lector al hacer clic en 'Comenzar a leer'", async () => {
    api.get.mockResolvedValue({ data: book });
    const user = userEvent.setup();

    renderAt(7);
    await user.click(await screen.findByRole("button", { name: /comenzar a leer/i }));

    expect(await screen.findByText("Vista de lectura")).toBeInTheDocument();
  });

  it("no muestra el botón de lectura si el libro no trae content_url", async () => {
    api.get.mockResolvedValue({ data: { ...book, content_url: undefined } });

    renderAt(7);

    await screen.findByText("Martín Rivas");
    expect(screen.queryByRole("button", { name: /comenzar a leer/i })).not.toBeInTheDocument();
  });
});

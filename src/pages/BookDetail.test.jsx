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

// Mismo helper que AuthContext.test.jsx/Subscription.test.jsx para armar un
// JWT "falso" válido para jwt-decode (no verifica firma, solo el payload).
const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const login = () => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Sebastián" }));
};

const freeBook = {
  id: 7,
  title: "Martín Rivas",
  author: "Alberto Blest Gana",
  description: "Una novela costumbrista sobre la sociedad chilena del siglo XIX.",
  content_url: "https://www.gutenberg.org/files/1/1.txt",
  is_free: true,
};

const paidBook = { ...freeBook, id: 9, title: "Obra en suscripción", is_free: false };

const renderAt = (id) =>
  render(
    <MemoryRouter initialEntries={[`/books/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/reader/:id" element={<div>Vista de lectura</div>} />
          <Route path="/plans" element={<div>Vista de planes</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("BookDetail", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("carga el detalle del libro con GET /books/:id", async () => {
    api.get.mockResolvedValue({ data: freeBook });

    renderAt(7);

    expect(await screen.findByText("Martín Rivas")).toBeInTheDocument();
    expect(screen.getByText("Alberto Blest Gana")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/books/7");
  });

  it("muestra la descripción cuando el libro la trae", async () => {
    api.get.mockResolvedValue({ data: freeBook });

    renderAt(7);

    expect(await screen.findByText(freeBook.description)).toBeInTheDocument();
  });

  it("no muestra la sección de descripción si el libro no trae una", async () => {
    api.get.mockResolvedValue({ data: { ...freeBook, description: undefined } });

    renderAt(7);

    await screen.findByText("Martín Rivas");
    expect(screen.queryByText(/descripcion/i)).not.toBeInTheDocument();
  });

  it("muestra el mensaje de error si el libro no existe", async () => {
    api.get.mockRejectedValue(new Error("not found"));

    renderAt(999);

    expect(await screen.findByText("Libro no encontrado")).toBeInTheDocument();
  });

  it("no muestra el botón de lectura si el libro no trae content_url", async () => {
    api.get.mockResolvedValue({ data: { ...freeBook, content_url: undefined } });

    renderAt(7);

    await screen.findByText("Martín Rivas");
    expect(screen.queryByRole("button", { name: /comenzar a leer|suscribirme/i })).not.toBeInTheDocument();
  });

  describe("libro gratis", () => {
    it("muestra el badge GRATIS y navega directo al lector, sin llamar a /rentals", async () => {
      api.get.mockResolvedValue({ data: freeBook });
      const user = userEvent.setup();

      renderAt(7);
      expect(await screen.findByText("GRATIS")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /comenzar a leer/i }));

      expect(await screen.findByText("Vista de lectura")).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe("libro de pago", () => {
    it("sin sesión iniciada, redirige a /plans al intentar leer sin llamar a /rentals", async () => {
      api.get.mockResolvedValue({ data: paidBook });
      const user = userEvent.setup();

      renderAt(9);
      await user.click(await screen.findByRole("button", { name: /suscribirme para leer/i }));

      expect(await screen.findByText("Vista de planes")).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it("con sesión pero sin suscripción activa, redirige a /plans", async () => {
      login();
      api.get.mockImplementation((url) =>
        url === "/subscriptions/me"
          ? Promise.resolve({ data: { active: false } })
          : Promise.resolve({ data: paidBook })
      );
      const user = userEvent.setup();

      renderAt(9);
      await user.click(await screen.findByRole("button", { name: /suscribirme para leer/i }));

      expect(await screen.findByText("Vista de planes")).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it("con suscripción activa, llama a POST /rentals y luego navega al lector", async () => {
      login();
      api.get.mockImplementation((url) =>
        url === "/subscriptions/me"
          ? Promise.resolve({ data: { active: true } })
          : Promise.resolve({ data: paidBook })
      );
      api.post.mockResolvedValue({ data: {} });
      const user = userEvent.setup();

      renderAt(9);
      await user.click(await screen.findByRole("button", { name: /comenzar a leer/i }));

      expect(api.post).toHaveBeenCalledWith("/rentals", { bookId: 9 });
      expect(await screen.findByText("Vista de lectura")).toBeInTheDocument();
    });

    it("muestra el mensaje del backend si se alcanzó el cupo de arriendos y no navega", async () => {
      login();
      api.get.mockImplementation((url) =>
        url === "/subscriptions/me"
          ? Promise.resolve({ data: { active: true } })
          : Promise.resolve({ data: paidBook })
      );
      api.post.mockRejectedValue({
        response: { data: { message: "Alcanzaste el cupo de arriendos de tu plan" } },
      });
      const user = userEvent.setup();

      renderAt(9);
      await user.click(await screen.findByRole("button", { name: /comenzar a leer/i }));

      expect(
        await screen.findByText("Alcanzaste el cupo de arriendos de tu plan")
      ).toBeInTheDocument();
      expect(screen.queryByText("Vista de lectura")).not.toBeInTheDocument();
    });
  });
});

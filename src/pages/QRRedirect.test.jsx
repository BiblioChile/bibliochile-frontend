import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import api from "../services/api.js";
import QRRedirect from "./QRRedirect";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const renderAt = (code) =>
  render(
    <MemoryRouter initialEntries={[`/qr/${code}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/qr/:code" element={<QRRedirect />} />
          <Route path="/books/:id" element={<div>Detalle del libro</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("QRRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige a /books/:id cuando el QR es válido", async () => {
    api.get.mockResolvedValue({ data: { gutendex_id: 42, redirect_to: "/books/42" } });

    renderAt("QR-VALIDO");

    expect(await screen.findByText("Detalle del libro")).toBeInTheDocument();
  });

  it("muestra el error de QR inactivo cuando el backend devuelve 404 con ese mensaje", async () => {
    api.get.mockRejectedValue({
      response: { status: 404, data: { message: "QR inactivo" } },
    });

    renderAt("QR-INACTIVO");

    expect(await screen.findByText(/temporalmente inactivo/i)).toBeInTheDocument();
  });

  it("muestra el error de QR no encontrado para otros mensajes 404", async () => {
    api.get.mockRejectedValue({
      response: { status: 404, data: { message: "QR no encontrado" } },
    });

    renderAt("QR-INEXISTENTE");

    expect(await screen.findByText(/no corresponde a ningún libro registrado/i)).toBeInTheDocument();
  });

  it("muestra un error genérico si la petición falla sin 404", async () => {
    api.get.mockRejectedValue(new Error("network error"));

    renderAt("QR-LO-QUE-SEA");

    expect(await screen.findByText(/no corresponde a ningún libro registrado/i)).toBeInTheDocument();
  });
});

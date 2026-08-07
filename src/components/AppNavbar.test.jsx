import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./AppNavbar";

const renderNavbar = (children) =>
  render(
    <MemoryRouter initialEntries={["/books/7"]}>
      <Routes>
        <Route path="/books/7" element={<AppNavbar>{children}</AppNavbar>} />
        <Route path="/" element={<div>Catálogo</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("AppNavbar", () => {
  it("muestra la marca BiblioChile", () => {
    renderNavbar();

    expect(screen.getByText("BiblioChile")).toBeInTheDocument();
  });

  it("navega al catálogo al hacer clic en la marca", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByText("BiblioChile"));

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
  });

  it("renderiza el contenido adicional pasado como children", () => {
    renderNavbar(<button>Ingresar</button>);

    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });
});

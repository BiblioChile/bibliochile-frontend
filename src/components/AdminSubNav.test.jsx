import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminSubNav from "./AdminSubNav";
import { AuthProvider } from "../context/AuthContext";

// Mismo helper que BottomNav.test.jsx para armar un JWT "falso" válido para
// jwt-decode (no verifica firma, solo decodifica el payload).
const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const loginAsAdmin = () => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Admin", role: "admin" }));
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path={path} element={<AdminSubNav />} />
          <Route path="/" element={<div>Vista de inicio</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("AdminSubNav", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra el botón 'Cerrar sesión' — antes el admin no tenía ninguna forma de salir", () => {
    loginAsAdmin();
    renderAt("/admin/panel");

    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("al hacer clic en 'Cerrar sesión', limpia la sesión y navega a inicio", async () => {
    loginAsAdmin();
    const user = userEvent.setup();
    renderAt("/admin/panel");

    await user.click(screen.getByText("Cerrar sesión"));

    expect(await screen.findByText("Vista de inicio")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });
});

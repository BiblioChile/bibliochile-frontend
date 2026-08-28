import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import RequireRole from "./RequireRole";

const base64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const futureToken = () =>
  `${base64url({ alg: "HS256" })}.${base64url({ exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

const loginAs = (role) => {
  localStorage.setItem("token", futureToken());
  localStorage.setItem("user", JSON.stringify({ name: "Sebastián", role }));
};

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={["/admin/panel"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/panel"
            element={
              <RequireRole role="admin">
                <div>Panel de administración</div>
              </RequireRole>
            }
          />
          <Route path="/login" element={<div>Vista de login</div>} />
          <Route path="/" element={<div>Catálogo</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe("RequireRole", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirige a /login si no hay sesión iniciada", async () => {
    renderProtected();

    expect(await screen.findByText("Vista de login")).toBeInTheDocument();
  });

  it("redirige a / si el usuario tiene sesión pero no el rol requerido", async () => {
    loginAs("pasajero");

    renderProtected();

    expect(await screen.findByText("Catálogo")).toBeInTheDocument();
  });

  it("renderiza el contenido si el usuario tiene el rol requerido", async () => {
    loginAs("admin");

    renderProtected();

    expect(await screen.findByText("Panel de administración")).toBeInTheDocument();
  });
});

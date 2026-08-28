import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HomeIcon, PlansIcon, ProfileIcon } from "./icons.jsx";

// Destino y rutas "activas" de "Perfil" según sesión + rol. Antes era un
// binario (logueado -> /dashboard, no logueado -> /login) que no distinguía
// autor/admin de pasajero, así que un autor o admin que tocaba "Perfil"
// terminaba en el dashboard de pasajero igual que cualquiera.
const getProfileNav = (isAuthenticated, role) => {
  if (!isAuthenticated) {
    return { path: "/login", activePaths: ["/login", "/registro"] };
  }
  if (role === "autor") {
    return {
      path: "/autor/dashboard",
      activePaths: ["/autor/dashboard", "/autor/subir-obra", "/autor/estadisticas"],
    };
  }
  if (role === "admin") {
    return { path: "/admin/panel", activePaths: ["/admin/panel", "/admin/autores"] };
  }
  return { path: "/dashboard", activePaths: ["/dashboard", "/registro", "/subscription"] };
};

// Barra de navegación inferior, compartida por todas las vistas salvo Reader
// (que es inmersiva y solo usa "← Volver"). Antes vivía duplicada y hardcodeada
// en cada página — acá centraliza el ítem activo por ruta real (useLocation) y
// el destino de "Perfil" según sesión + rol, en vez de repetirlo en cada vista.
const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();

  const { path: profilePath, activePaths } = getProfileNav(isAuthenticated, user?.role);

  const items = [
    { label: "Inicio", path: "/", Icon: HomeIcon, active: pathname === "/" },
    { label: "Planes", path: "/plans", Icon: PlansIcon, active: pathname === "/plans" },
    {
      label: "Perfil",
      path: profilePath,
      Icon: ProfileIcon,
      active: activePaths.includes(pathname),
    },
  ];

  return (
    <nav className="bc-bottom-nav d-flex justify-content-around">
      {items.map(({ label, path, Icon, active }) => (
        <div
          key={label}
          className={`bc-nav-item ${active ? "active" : ""}`}
          onClick={() => navigate(path)}
        >
          <Icon />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;

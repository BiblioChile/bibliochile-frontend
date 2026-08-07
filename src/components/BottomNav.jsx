import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HomeIcon, PlansIcon, ProfileIcon } from "./icons.jsx";

// Rutas que cuentan como "Perfil" activo, aunque no sean /dashboard exactamente
// (login/registro/suscripción son parte del mismo flujo de cuenta).
const PROFILE_PATHS = ["/dashboard", "/login", "/registro", "/subscription"];

// Barra de navegación inferior, compartida por todas las vistas salvo Reader
// (que es inmersiva y solo usa "← Volver"). Antes vivía duplicada y hardcodeada
// en cada página — acá centraliza el ítem activo por ruta real (useLocation) y
// el destino de "Perfil" según sesión, en vez de repetirlo en cada vista.
const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const items = [
    { label: "Inicio", path: "/", Icon: HomeIcon, active: pathname === "/" },
    { label: "Planes", path: "/plans", Icon: PlansIcon, active: pathname === "/plans" },
    {
      label: "Perfil",
      path: isAuthenticated ? "/dashboard" : "/login",
      Icon: ProfileIcon,
      active: PROFILE_PATHS.includes(pathname),
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

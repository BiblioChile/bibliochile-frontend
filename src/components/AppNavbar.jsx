import { useNavigate } from "react-router-dom";
import { Navbar, Container } from "react-bootstrap";

// Navbar superior compartida. El logo/marca siempre vuelve al catálogo (antes
// no tenía onClick en ninguna vista y dejaba al usuario sin forma de "salir").
// `children` es el slot para acciones a la derecha (ej. botón "Ingresar" en Home).
const AppNavbar = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Navbar className="bc-navbar">
      <Container fluid className="px-3">
        <Navbar.Brand
          className="bc-navbar-brand"
          role="button"
          onClick={() => navigate("/")}
        >
          BiblioChile
        </Navbar.Brand>
        {children}
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

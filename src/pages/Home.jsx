import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Navbar, Container, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import BookCard from "../components/BookCard.jsx";
import { fetchContinueReading } from "../utils/progress.js";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [continueReading, setContinueReading] = useState([]);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const fetchBooks = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = query ? `?search=${query}` : "";
      const response = await api.get(`/books${params}`);
      setBooks(response.data.results);
    } catch {
      setError("Error al cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const loadContinueReading = async () => {
      try {
        const data = await fetchContinueReading(token);
        setContinueReading(data);
      } catch {
        // Sección opcional: si falla, simplemente no se muestra.
        setContinueReading([]);
      }
    };
    loadContinueReading();
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  return (
    <div className="bc-page">

      {/* Navbar */}
      <Navbar className="bc-navbar">
        <Container fluid className="px-3">
          <Navbar.Brand className="bc-navbar-brand">BiblioChile</Navbar.Brand>
          {!isAuthenticated && (
          <Button
            size="sm"
            variant="outline-light"
            onClick={() => navigate("/login")}
          >
            Ingresar
          </Button>
          )}
        </Container>
      </Navbar>

      {/* Búsqueda */}
      <Container fluid className="px-3 py-3">
        <Form onSubmit={handleSearch}>
          <InputGroup>
            <Form.Control
              className="bc-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar libros, autores..."
            />
            <Button type="submit" className="bc-btn-primary ms-2 rounded-pill px-3">
              Buscar
            </Button>
          </InputGroup>
        </Form>
      </Container>

      {/* Continuar leyendo */}
      {continueReading.length > 0 && (
        <Container fluid className="px-3 pb-2">
          <h2 className="bc-section-title">Continuar leyendo</h2>
          <div className="d-flex flex-column gap-3">
            {continueReading.map((item) => (
              <BookCard
                key={item.bookId}
                book={item.book}
                progress={item.progressPercentage}
                onClick={() => navigate(`/reader/${item.bookId}`)}
              />
            ))}
          </div>
        </Container>
      )}

      {/* Catálogo */}
      <Container fluid className="px-3 pb-4">
        <h2 className="bc-section-title">Catálogo</h2>

        {loading && (
          <div className="bc-loading">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando libros...
          </div>
        )}

        {error && <div className="bc-error">{error}</div>}

        {!loading && !error && (
          <div className="d-flex flex-column gap-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </div>
        )}
      </Container>

      {/* Bottom Nav */}
      <div className="bc-bottom-nav d-flex justify-content-around">
        <div className="bc-nav-item active">Inicio</div>
        {!isAuthenticated && (
          <div className="bc-nav-item" onClick={() => navigate("/plans")}>
            Planes
          </div>
        )}
        <div
          className="bc-nav-item"
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
        >
          Perfil
        </div>
      </div>
    </div>
  );
};


export default Home;
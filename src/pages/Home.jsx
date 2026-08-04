import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { Navbar, Container, Button, Form, InputGroup, Card, Badge, Spinner, Row, Col } from "react-bootstrap";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchBooks = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = query ? `?search=${query}` : "";
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books${params}`);
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
              <Card
                key={book.id}
                className="bc-card"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <Card.Body className="p-3">
                  <Row className="align-items-center g-2">
                    {book.cover_url && (
                      <Col xs="auto">
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          style={{
                            width: "48px",
                            height: "64px",
                            borderRadius: "6px",
                            objectFit: "cover",
                          }}
                        />
                      </Col>
                    )}
                    <Col>
                      <div className="bc-card-title">{book.title}</div>
                      <div className="bc-card-subtitle">{book.author}</div>
                      <Badge className="bc-badge-free mt-1">GRATIS</Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
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
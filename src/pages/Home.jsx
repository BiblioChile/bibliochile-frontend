import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Container, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import BookCard from "../components/BookCard.jsx";
import AppNavbar from "../components/AppNavbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { fetchContinueReading } from "../utils/progress.js";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [continueReading, setContinueReading] = useState([]);
  const [paidBooks, setPaidBooks] = useState([]);
  const [paidLoading, setPaidLoading] = useState(true);
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
    const loadPaidBooks = async () => {
      try {
        const response = await api.get("/books/paid");
        setPaidBooks(response.data.results);
      } catch {
        // Sección opcional (autores nacionales): si falla, simplemente no
        // se muestra, sin romper el resto del catálogo gratuito.
        setPaidBooks([]);
      } finally {
        setPaidLoading(false);
      }
    };
    loadPaidBooks();
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
      <AppNavbar>
        {!isAuthenticated && (
          <div className="d-flex align-items-center gap-2">
            <Button
              size="sm"
              variant="link"
              className="text-light text-decoration-none p-0"
              onClick={() => navigate("/registro")}
            >
              Crear cuenta
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              onClick={() => navigate("/login")}
            >
              Ingresar
            </Button>
          </div>
        )}
      </AppNavbar>

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
          <div className="bc-catalog-scroll">
            {continueReading.map((item) => (
              <div className="bc-catalog-item" key={item.bookId}>
                <BookCard
                  book={item.book}
                  progress={item.progressPercentage}
                  onClick={() => navigate(`/reader/${item.bookId}`)}
                />
              </div>
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
          <div className="bc-catalog-scroll">
            {books.map((book) => (
              <div className="bc-catalog-item" key={book.id}>
                <BookCard
                  book={book}
                  onClick={() => navigate(`/books/${book.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </Container>

      {/* Autores nacionales — catálogo de pago, GET /books/paid */}
      {!paidLoading && paidBooks.length > 0 && (
        <Container fluid className="px-3 pb-4">
          <h2 className="bc-section-title">Autores nacionales</h2>
          <div className="bc-catalog-scroll">
            {paidBooks.map((book) => (
              <div className="bc-catalog-item" key={book.id}>
                <BookCard book={book} onClick={() => navigate(`/books/${book.id}`)} />
              </div>
            ))}
          </div>
        </Container>
      )}

      <BottomNav />
    </div>
  );
};


export default Home;
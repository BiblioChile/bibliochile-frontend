import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchBooks = async (query = "") => {
    setLoading(true);
    try {
      const params = query ? `?search=${query}` : "";
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books/${params}`);
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
    <div style={{ maxWidth: "430px", margin: "0 auto", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "var(--wine)",
        padding: "1rem 1.25rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>
          BiblioChile
        </span>
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "transparent",
            border: "1px solid var(--ivory)",
            color: "var(--ivory)",
            padding: "0.3rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            cursor: "pointer",
            fontFamily: "var(--font-ui)"
          }}
        >
          Ingresar
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ padding: "1.25rem" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar libros, autores..."
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              borderRadius: "50px",
              border: "none",
              background: "var(--surface)",
              color: "var(--ivory)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.25rem",
              background: "var(--wine)",
              color: "var(--ivory)",
              border: "none",
              borderRadius: "50px",
              fontFamily: "var(--font-ui)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Contenido */}
      <div style={{ padding: "0 1.25rem 2rem" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "1rem"
        }}>
          Catálogo
        </h2>

        {loading && (
          <div style={{ textAlign: "center", color: "var(--ivory-dim)", padding: "2rem" }}>
            Cargando libros...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", color: "var(--wine)", padding: "2rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                style={{
                  background: "var(--surface)",
                  borderRadius: "12px",
                  padding: "1rem",
                  display: "flex",
                  gap: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {book.cover_url && (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    style={{
                      width: "48px",
                      height: "64px",
                      borderRadius: "6px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}>
                    {book.title}
                  </div>
                  <div style={{
                    fontSize: "0.72rem",
                    color: "var(--ivory-dim)",
                    marginTop: "0.25rem"
                  }}>
                    {book.author}
                  </div>
                  <div style={{
                    fontSize: "0.65rem",
                    color: "var(--gold)",
                    marginTop: "0.35rem",
                    fontWeight: 600,
                  }}>
                    GRATIS
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
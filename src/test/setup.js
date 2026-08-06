import "@testing-library/jest-dom/vitest";

// Vite expone import.meta.env.VITE_API_URL en runtime; en el entorno de test
// (Node vía Vitest) no hay .env cargado, así que se define acá para que
// axios arme URLs válidas en las llamadas mockeadas.
import.meta.env.VITE_API_URL = "http://localhost:3000";

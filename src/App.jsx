import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import QRRedirect from "./pages/QRRedirect";
import Subscription from "./pages/Subscription";
import { AuthProvider } from "./context/AuthContext.jsx";
import Plans from "./pages/Plans.jsx";
import DashboardPasajero from "./pages/DashboardPasajero.jsx";
import RegistroAutor from "./pages/RegistroAutor.jsx";
import SubirObra from "./pages/SubirObra.jsx";
import EstadisticasAutor from "./pages/EstadisticasAutor.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminAutores from "./pages/AdminAutores.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/reader/:id" element={<Reader />} />
          <Route path="/qr/:code" element={<QRRedirect />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/dashboard" element={<DashboardPasajero />} />
          <Route path="/autor/registro" element={<RegistroAutor />} />
          <Route path="/autor/subir-obra" element={<SubirObra />} />
          <Route path="/autor/estadisticas" element={<EstadisticasAutor />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/autores" element={<AdminAutores />} />
        </Routes>
      </AuthProvider>  
    </BrowserRouter>
  );
};

export default App;
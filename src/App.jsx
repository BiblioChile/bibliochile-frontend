import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import QRRedirect from "./pages/QRRedirect";
import Subscription from "./pages/Subscription";
import { AuthProvider } from "./context/AuthContext.jsx";
import Plans from "./pages/Plans.jsx";
import DashboardPasajero from "./pages/DashboardPasajero.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/reader/:id" element={<Reader />} />
          <Route path="/qr/:code" element={<QRRedirect />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/dashboard" element={<DashboardPasajero />} />
        </Routes>
      </AuthProvider>  
    </BrowserRouter>
  );
};

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/reader/:id" element={<Reader />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
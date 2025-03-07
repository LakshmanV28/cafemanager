import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import "bootstrap/dist/css/bootstrap.min.css";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Reciepe from "./pages/Reciepe";
import { useState } from "react";
import Closing from "./pages/Closing";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="*" element={token ? <Products /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
        <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={token ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/closing" element={token ? <Closing /> : <Navigate to="/login" />} />
        <Route path="/reciepe" element={token ? <Reciepe /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}


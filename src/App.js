import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import "bootstrap/dist/css/bootstrap.min.css";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Reciepe from "./pages/Reciepe";
import { useState, useEffect } from "react";
import Closing from "./pages/Closing";
import Captain from "./pages/Captain";
import Chef from "./pages/Chef";
import EditOrder from "./pages/EditOrders";
import BillCounter from "./pages/BillCounter";

// Separate component to handle routes and location
function AppRoutes({ token, email, setToken }) {
  const location = useLocation(); // Now correctly used inside Router
  const isLoginPage = location.pathname === "/";

  const getRedirectPath = (email) => {
    switch (email.toLowerCase()) {
      case "admin@cafe.com":
        return "/dashboard";
      case "captain@cafe.com":
        return "/captain";
      case "chef@cafe.com":
        return "/chef";
      default:
        return "/";
    }
  };

  return (
    <>
      {!isLoginPage && token && <NavigationBar />}
      <Routes>
        {/* Login Route */}
        <Route
          path="/"
          element={token ? <Navigate to={getRedirectPath(email)} replace /> : <Login setToken={setToken} />}
        />

        {/* Admin Routes */}
        {email.toLowerCase() === "admin@cafe.com" && token && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/closing" element={<Closing />} />
            <Route path="/reciepe" element={<Reciepe />} />
            <Route path="/billcounter" element={<BillCounter />} />
            <Route path="/inventory" element={<Inventory />} />
          </>
        )}

        {/* Captain Routes */}
        {email.toLowerCase() === "captain@cafe.com" && token && (
          <>
            <Route path="/captain" element={<Captain />} />
            <Route path="/editorders" element={<EditOrder />} />
          </>
        )}

        {/* Chef Routes */}
        {email.toLowerCase() === "chef@cafe.com" && token && (
          <>
            <Route path="/chef" element={<Chef />} />
          </>
        )}

        {/* Catch-all for unauthorized or unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "");
    setToken(localStorage.getItem("token"));
  }, [token]);

  return (
    <Router>
      <AppRoutes token={token} email={email} setToken={setToken} />
    </Router>
  );
}

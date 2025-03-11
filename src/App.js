import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import axios from "axios";
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

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post("https://cashman-node.onrender.com/api/auth/login", { email, password });
      const { token, role, name } = response.data;

      localStorage.setItem("user", JSON.stringify({ token, role, name }));
      setUser({ token, role, name });
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <NavigationBar user={user} onLogout={handleLogout} />
      <div className="container d-flex flex-column justify-content-center align-items-center mt-5">
        {user ? (
          <Routes>
            {/* Admin Routes */}
            {user.role === "admin" && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/closing" element={<Closing />} />
                <Route path="/billcounter" element={<BillCounter />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            )}

            {/* Captain Routes */}
            {user.role === "captain" && (
              <>
                <Route path="/captain" element={<Captain />} />
                <Route path="/editorders" element={<EditOrder />} />
                <Route path="*" element={<Navigate to="/captain" />} />
              </>
            )}

            {/* Chef Routes */}
            {user.role === "chef" && (
              <>
                <Route path="/chef" element={<Chef />} />
                <Route path="/reciepe" element={<Reciepe />} />
                <Route path="*" element={<Navigate to="/chef" />} />
              </>
            )}
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>

    </Router>
  );
};

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, [token]);

  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="*" element={<Login setToken={setToken} />} />

        {/* Routes for Bill Counter */}
        {role === "Admin" && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/closing" element={<Closing />} />
            <Route path="/reciepe" element={<Reciepe />} />
            <Route path="/billcounter" element={<BillCounter />} />
            <Route path="/inventory" element={<Inventory />} />
          </>
        )}

        {/* Routes for Captain */}
        {role === "Captain" && (
          <>
            <Route path="/captain" element={<Captain />} />
            <Route path="/editorders" element={<EditOrder />} />
          </>
        )}

        {/* Routes for Chef */}
        {role === "Chef" && (
          <>
            <Route path="/chef" element={<Chef />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

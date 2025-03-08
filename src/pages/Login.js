import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://cashman-node.onrender.com/api/auth/login", { email, password });
      const { token } = res.data;

      localStorage.setItem("token", token); // Store JWT
      setToken(token);
      navigate("/products"); 
    } catch (err) {
      alert("Invalid credentials!");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Card style={{ width: "400px", padding: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <Card.Body>
          <h2 className="text-center">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Button variant="primary" className="w-100" onClick={handleLogin}>Login</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
